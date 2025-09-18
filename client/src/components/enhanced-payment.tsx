// Enhanced Payment Component with Malaysian Payment Options
// client/src/components/enhanced-payment.tsx

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QrCode, CreditCard, Wallet, Building, Smartphone } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'card' | 'wallet' | 'banking' | 'qr';
  fee?: string;
  processingTime: string;
  gateway: string;
}

const paymentMethods: PaymentMethod[] = [
  // Stripe Methods
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: <CreditCard className="h-6 w-6" />,
    category: 'card',
    fee: '2.9% + RM0.50',
    processingTime: 'Instant',
    gateway: 'stripe'
  },
  {
    id: 'alipay',
    name: 'Alipay',
    description: 'Pay with your Alipay account',
    icon: <Wallet className="h-6 w-6 text-blue-500" />,
    category: 'wallet',
    fee: '3.4%',
    processingTime: 'Instant',
    gateway: 'stripe'
  },
  {
    id: 'wechat_pay',
    name: 'WeChat Pay',
    description: 'Pay with your WeChat wallet',
    icon: <Smartphone className="h-6 w-6 text-green-500" />,
    category: 'wallet',
    fee: '3.4%',
    processingTime: 'Instant',
    gateway: 'stripe'
  },
  
  // Razer Pay Methods (Malaysian)
  {
    id: 'tngd',
    name: 'Touch n Go eWallet',
    description: 'Pay with your TnG eWallet balance',
    icon: <Wallet className="h-6 w-6 text-blue-600" />,
    category: 'wallet',
    fee: 'RM1.00',
    processingTime: 'Instant',
    gateway: 'razerpay'
  },
  {
    id: 'grabpay',
    name: 'GrabPay',
    description: 'Pay with your Grab wallet',
    icon: <Smartphone className="h-6 w-6 text-green-600" />,
    category: 'wallet',
    fee: 'RM1.50',
    processingTime: 'Instant',
    gateway: 'razerpay'
  },
  {
    id: 'boost',
    name: 'Boost',
    description: 'Pay with Boost wallet',
    icon: <Wallet className="h-6 w-6 text-orange-600" />,
    category: 'wallet',
    fee: 'RM1.00',
    processingTime: 'Instant',
    gateway: 'razerpay'
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    description: 'Pay with ShopeePay wallet',
    icon: <Wallet className="h-6 w-6 text-orange-500" />,
    category: 'wallet',
    fee: 'RM1.00',
    processingTime: 'Instant',
    gateway: 'razerpay'
  },
  {
    id: 'fpx',
    name: 'Online Banking (FPX)',
    description: 'Maybank, CIMB, Public Bank, and more',
    icon: <Building className="h-6 w-6 text-blue-800" />,
    category: 'banking',
    fee: 'RM2.00',
    processingTime: '5-10 minutes',
    gateway: 'razerpay'
  },
  {
    id: 'duitnow_qr',
    name: 'DuitNow QR',
    description: 'Scan QR code with any participating bank app',
    icon: <QrCode className="h-6 w-6 text-purple-600" />,
    category: 'qr',
    fee: 'RM1.00',
    processingTime: 'Instant',
    gateway: 'razerpay'
  },
  {
    id: 'maybank_qr',
    name: 'Maybank QR',
    description: 'Scan QR code with Maybank app',
    icon: <QrCode className="h-6 w-6 text-yellow-600" />,
    category: 'qr',
    fee: 'RM1.00',
    processingTime: 'Instant',
    gateway: 'razerpay'
  }
];

interface EnhancedPaymentProps {
  totalAmount: number;
  currency: string;
  onPaymentMethodChange: (method: string) => void;
  onProcessPayment: (method: string) => void;
  availableMethods?: PaymentMethod[];
  isLoading?: boolean;
}

export default function EnhancedPayment({ 
  totalAmount, 
  currency, 
  onPaymentMethodChange, 
  onProcessPayment,
  availableMethods = paymentMethods,
  isLoading = false
}: EnhancedPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    onPaymentMethodChange(method);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      await onProcessPayment(selectedMethod);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'card': return <CreditCard className="h-5 w-5" />;
      case 'wallet': return <Wallet className="h-5 w-5" />;
      case 'banking': return <Building className="h-5 w-5" />;
      case 'qr': return <QrCode className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'card': return 'Card Payments';
      case 'wallet': return 'E-Wallet Options';
      case 'banking': return 'Online Banking';
      case 'qr': return 'QR Code Payments';
      default: return 'Payment Options';
    }
  };

  const groupedMethods = availableMethods.reduce((acc, method) => {
    if (!acc[method.category]) {
      acc[method.category] = [];
    }
    acc[method.category].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  const selectedMethodDetails = availableMethods.find(m => m.id === selectedMethod);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Choose Payment Method
          </CardTitle>
          <CardDescription>
            Select your preferred payment option for Malaysia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading payment methods...</span>
            </div>
          ) : (
            <RadioGroup value={selectedMethod} onValueChange={handleMethodChange}>
              {Object.entries(groupedMethods).map(([category, methods]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                    {getCategoryIcon(category)}
                    {getCategoryTitle(category)}
                  </div>
                  
                  {methods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="flex items-start gap-3 cursor-pointer">
                          <div className="flex-shrink-0 mt-1">
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{method.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {method.gateway}
                              </Badge>
                              {method.fee && (
                                <Badge variant="secondary" className="text-xs">
                                  Fee: {method.fee}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Processing: {method.processingTime}
                            </p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Amount</span>
              <span className="font-medium">
                {currency} {totalAmount.toFixed(2)}
              </span>
            </div>
            {selectedMethodDetails && (
              <>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Payment Method</span>
                  <span>{selectedMethodDetails.name}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Gateway</span>
                  <span className="capitalize">{selectedMethodDetails.gateway}</span>
                </div>
                {selectedMethodDetails.fee && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing Fee</span>
                    <span>{selectedMethodDetails.fee}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handlePayment} 
        disabled={isProcessing || !selectedMethod || isLoading}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Processing Payment...
          </>
        ) : (
          `Pay ${currency} ${totalAmount.toFixed(2)}`
        )}
      </Button>

      {selectedMethodDetails?.category === 'qr' && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <QrCode className="h-8 w-8 mx-auto mb-2" />
              <p>QR code will be displayed after clicking "Pay"</p>
              <p>Use your bank app or e-wallet to scan and complete payment</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
