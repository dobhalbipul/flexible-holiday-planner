// Multi-Gateway Payment Service Architecture
// server/payment-service.ts

import crypto from 'crypto';

export interface PaymentResponse {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed';
  qrCode?: string;
  redirectUrl?: string;
  clientSecret?: string;
  gateway: string;
  metadata?: Record<string, any>;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: string;
  bookingDetails: any;
  callbackUrl?: string;
  successUrl?: string;
  failureUrl?: string;
}

export interface PaymentGateway {
  name: string;
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  confirmPayment(paymentId: string): Promise<PaymentResponse>;
  supportedMethods: string[];
  isConfigured(): boolean;
}

// Stripe Gateway Implementation
export class StripeGateway implements PaymentGateway {
  name = 'stripe';
  supportedMethods = [
    'card', 
    'alipay', 
    'wechat_pay', 
    'grabpay_stripe',  // Stripe's GrabPay integration
    'fpx_stripe'       // Stripe's FPX integration
  ];
  
  isConfigured(): boolean {
    return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20' as any
    });

    // Map payment methods to Stripe's format
    const stripePaymentMethods = this.mapToStripeMethod(request.method);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100), // Convert to cents
      currency: request.currency.toLowerCase(),
      payment_method_types: stripePaymentMethods,
      metadata: {
        gateway: 'stripe',
        original_method: request.method,
        booking_reference: request.bookingDetails?.reference || '',
        created_at: new Date().toISOString()
      },
      description: `Travel booking - ${request.bookingDetails?.destination || 'Unknown destination'}`
    });

    return {
      paymentId: paymentIntent.id,
      status: 'pending',
      clientSecret: paymentIntent.client_secret!,
      gateway: 'stripe',
      metadata: {
        stripePaymentIntentId: paymentIntent.id,
        supportedMethods: stripePaymentMethods
      }
    };
  }

  async confirmPayment(paymentId: string): Promise<PaymentResponse> {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20' as any
    });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    return {
      paymentId,
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
      gateway: 'stripe',
      metadata: {
        stripeStatus: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    };
  }

  private mapToStripeMethod(method: string): string[] {
    const methodMap: Record<string, string[]> = {
      'card': ['card'],
      'alipay': ['alipay'],
      'wechat_pay': ['wechat_pay'],
      'grabpay_stripe': ['grabpay'],
      'fpx_stripe': ['fpx']
    };
    
    return methodMap[method] || ['card'];
  }
}

// Razer Pay Gateway Implementation (Malaysian Payment Gateway)
export class RazerPayGateway implements PaymentGateway {
  name = 'razerpay';
  supportedMethods = [
    'fpx',           // Malaysian Online Banking
    'tngd',          // Touch 'n Go eWallet
    'boost',         // Boost wallet
    'grabpay',       // GrabPay Malaysia
    'shopeepay',     // ShopeePay
    'maybank_qr',    // Maybank QR
    'duitnow_qr',    // DuitNow QR
    'bigpay',        // BigPay
    'vcash',         // vcash
    'razer_pay'      // Razer Pay wallet
  ];

  isConfigured(): boolean {
    return !!(process.env.RAZER_MERCHANT_ID && process.env.RAZER_VERIFY_KEY);
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amount = (request.amount * 100).toString(); // Convert to cents
    
    // Razer Pay API endpoint
    const apiUrl = process.env.RAZER_SANDBOX === 'true' 
      ? 'https://sandbox-pay.razer.com/RMS/pay/'
      : 'https://pay.razer.com/RMS/pay/';

    // Generate verification hash
    const vcode = this.generateVCode(
      process.env.RAZER_MERCHANT_ID!,
      orderId,
      amount,
      request.currency
    );

    const paymentData = {
      merchant_id: process.env.RAZER_MERCHANT_ID!,
      orderid: orderId,
      amount: amount,
      currency: request.currency,
      channel: this.mapToRazerChannel(request.method),
      point: request.method.includes('qr') ? 'true' : 'false', // Enable QR for QR methods
      vcode: vcode,
      return_url: request.successUrl || `${process.env.APP_URL}/payment/success`,
      callback_url: request.callbackUrl || `${process.env.APP_URL}/api/payment/callback/razerpay`,
      cancel_url: request.failureUrl || `${process.env.APP_URL}/payment/cancel`,
      bill_name: request.bookingDetails?.customerName || 'Travel Booking',
      bill_email: request.bookingDetails?.customerEmail || '',
      bill_mobile: request.bookingDetails?.customerPhone || '',
      bill_desc: `Travel booking to ${request.bookingDetails?.destination || 'destination'}`,
      country: 'MY'
    };

    // For QR code methods, we need to get the QR code
    if (request.method.includes('qr')) {
      const qrResponse = await this.generateQRCode(paymentData);
      return {
        paymentId: orderId,
        status: 'pending',
        qrCode: qrResponse.qr_code,
        gateway: 'razerpay',
        metadata: {
          razerOrderId: orderId,
          qrExpiryTime: qrResponse.expiry_time,
          paymentMethod: request.method
        }
      };
    }

    // For redirect methods (FPX, e-wallets)
    const redirectUrl = `${apiUrl}${process.env.RAZER_MERCHANT_ID}?` + 
      new URLSearchParams(paymentData).toString();

    return {
      paymentId: orderId,
      status: 'pending',
      redirectUrl: redirectUrl,
      gateway: 'razerpay',
      metadata: {
        razerOrderId: orderId,
        paymentMethod: request.method,
        redirectRequired: true
      }
    };
  }

  async confirmPayment(paymentId: string): Promise<PaymentResponse> {
    // Query Razer Pay for payment status
    const queryData = {
      merchant_id: process.env.RAZER_MERCHANT_ID!,
      orderid: paymentId,
      skey: this.generateSKey(process.env.RAZER_MERCHANT_ID!, paymentId)
    };

    const apiUrl = process.env.RAZER_SANDBOX === 'true'
      ? 'https://sandbox-pay.razer.com/RMS/query_status.php'
      : 'https://pay.razer.com/RMS/query_status.php';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(queryData)
    });

    const result = await response.text();
    const status = this.parseRazerResponse(result);

    return {
      paymentId,
      status: status.status_code === '00' ? 'completed' : 'pending',
      gateway: 'razerpay',
      metadata: {
        razerStatus: status.status_code,
        razerMessage: status.status_message,
        transactionId: status.tranID
      }
    };
  }

  private mapToRazerChannel(method: string): string {
    const channelMap: Record<string, string> = {
      'fpx': 'fpx',
      'tngd': 'tngd',
      'boost': 'boost',
      'grabpay': 'grabpay',
      'shopeepay': 'shopeepay',
      'maybank_qr': 'maybank2u',
      'duitnow_qr': 'duitnow',
      'bigpay': 'bigpay',
      'vcash': 'vcash',
      'razer_pay': 'razerpay'
    };
    
    return channelMap[method] || 'fpx';
  }

  private generateVCode(merchantId: string, orderId: string, amount: string, currency: string): string {
    const verifyKey = process.env.RAZER_VERIFY_KEY!;
    const dataString = `${verifyKey}${merchantId}${orderId}${amount}${currency}`;
    return crypto.createHash('md5').update(dataString).digest('hex');
  }

  private generateSKey(merchantId: string, orderId: string): string {
    const verifyKey = process.env.RAZER_VERIFY_KEY!;
    const dataString = `${verifyKey}${merchantId}${orderId}`;
    return crypto.createHash('md5').update(dataString).digest('hex');
  }

  private async generateQRCode(paymentData: any): Promise<{ qr_code: string; expiry_time: string }> {
    // This is a mock implementation - actual Razer Pay QR API may differ
    // You'll need to implement based on Razer Pay's actual QR API documentation
    const qrApiUrl = process.env.RAZER_SANDBOX === 'true'
      ? 'https://sandbox-pay.razer.com/RMS/qr_pay.php'
      : 'https://pay.razer.com/RMS/qr_pay.php';

    const response = await fetch(qrApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(paymentData)
    });

    const result = await response.json();
    
    return {
      qr_code: result.qr_code_url || `data:image/png;base64,mock_qr_code_${paymentData.orderid}`,
      expiry_time: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
    };
  }

  private parseRazerResponse(responseText: string): any {
    // Parse Razer Pay response format
    // This is a simplified parser - implement based on actual Razer Pay response format
    const lines = responseText.split('\n');
    const result: any = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key.trim()] = value.trim();
      }
    });
    
    return result;
  }
}

// Payment Gateway Manager
export class PaymentGatewayManager {
  private gateways: Map<string, PaymentGateway> = new Map();

  constructor() {
    // Initialize available gateways
    this.registerGateway(new StripeGateway());
    this.registerGateway(new RazerPayGateway());
  }

  registerGateway(gateway: PaymentGateway): void {
    this.gateways.set(gateway.name, gateway);
  }

  getGatewayForMethod(method: string): PaymentGateway {
    // Route payment methods to appropriate gateways
    const razerMethods = [
      'fpx', 'tngd', 'boost', 'grabpay', 'shopeepay', 
      'maybank_qr', 'duitnow_qr', 'bigpay', 'vcash', 'razer_pay'
    ];

    const stripeMethods = [
      'card', 'alipay', 'wechat_pay', 'grabpay_stripe', 'fpx_stripe'
    ];

    if (razerMethods.includes(method)) {
      const razerGateway = this.gateways.get('razerpay');
      if (razerGateway?.isConfigured()) {
        return razerGateway;
      }
    }

    if (stripeMethods.includes(method)) {
      const stripeGateway = this.gateways.get('stripe');
      if (stripeGateway?.isConfigured()) {
        return stripeGateway;
      }
    }

    // Default to Stripe if available
    const defaultGateway = this.gateways.get('stripe');
    if (defaultGateway?.isConfigured()) {
      return defaultGateway;
    }

    throw new Error(`No configured gateway found for payment method: ${method}`);
  }

  getAvailablePaymentMethods(): Array<{
    method: string;
    gateway: string;
    name: string;
    category: string;
  }> {
    const methods: Array<{
      method: string;
      gateway: string;
      name: string;
      category: string;
    }> = [];

    // Payment method definitions with metadata
    const paymentMethodsData = {
      // Stripe methods
      'card': { name: 'Credit/Debit Card', category: 'card', gateway: 'stripe' },
      'alipay': { name: 'Alipay', category: 'wallet', gateway: 'stripe' },
      'wechat_pay': { name: 'WeChat Pay', category: 'wallet', gateway: 'stripe' },
      
      // Razer Pay methods (Malaysian)
      'fpx': { name: 'Online Banking (FPX)', category: 'banking', gateway: 'razerpay' },
      'tngd': { name: 'Touch n Go eWallet', category: 'wallet', gateway: 'razerpay' },
      'boost': { name: 'Boost', category: 'wallet', gateway: 'razerpay' },
      'grabpay': { name: 'GrabPay', category: 'wallet', gateway: 'razerpay' },
      'shopeepay': { name: 'ShopeePay', category: 'wallet', gateway: 'razerpay' },
      'maybank_qr': { name: 'Maybank QR', category: 'qr', gateway: 'razerpay' },
      'duitnow_qr': { name: 'DuitNow QR', category: 'qr', gateway: 'razerpay' },
      'bigpay': { name: 'BigPay', category: 'wallet', gateway: 'razerpay' },
    };

    // Check each gateway and add supported methods
    for (const [gatewayName, gateway] of this.gateways) {
      if (gateway.isConfigured()) {
        for (const method of gateway.supportedMethods) {
          const methodData = paymentMethodsData[method as keyof typeof paymentMethodsData];
          if (methodData) {
            methods.push({
              method,
              gateway: gatewayName,
              name: methodData.name,
              category: methodData.category
            });
          }
        }
      }
    }

    return methods;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const gateway = this.getGatewayForMethod(request.method);
    return await gateway.createPayment(request);
  }

  async confirmPayment(paymentId: string, gateway: string): Promise<PaymentResponse> {
    const gatewayInstance = this.gateways.get(gateway);
    if (!gatewayInstance) {
      throw new Error(`Gateway not found: ${gateway}`);
    }
    return await gatewayInstance.confirmPayment(paymentId);
  }
}

// Export singleton instance
export const paymentGatewayManager = new PaymentGatewayManager();
