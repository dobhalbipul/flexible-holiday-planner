# Multi-Gateway Payment Setup Guide

This guide will help you set up the multi-gateway payment system with support for both international (Stripe) and Malaysian (Razer Pay) payment methods.

## 🚀 Quick Setup

### 1. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys in the `.env` file (see sections below)

### 2. Install Dependencies

The following dependencies are required for the multi-gateway system:

```bash
npm install stripe crypto  # Core payment processing
```

## 🎯 Gateway Setup Instructions

### Stripe Setup (International Payments)

1. **Create Stripe Account:**
   - Visit [stripe.com](https://stripe.com)
   - Sign up for a developer account
   - Navigate to Dashboard → Developers → API keys

2. **Get API Keys:**
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   VITE_STRIPE_PUBLIC_KEY=pk_test_...  # Same as STRIPE_PUBLISHABLE_KEY
   ```

3. **Configure Webhooks (Optional):**
   - In Stripe Dashboard: Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/payment/callback`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Razer Pay Setup (Malaysian Payments)

1. **Create Razer Pay Account:**
   - Visit [pay.razer.com](https://pay.razer.com)
   - Register as a merchant
   - Complete KYC verification process

2. **Get Merchant Credentials:**
   ```env
   RAZER_MERCHANT_ID=your_merchant_id
   RAZER_VERIFY_KEY=your_verify_key
   RAZER_SECRET_KEY=your_secret_key
   RAZER_SANDBOX=true  # Use false for production
   ```

3. **Available Payment Methods:**
   - **FPX**: Malaysian online banking (all major banks)
   - **TnG eWallet**: Touch 'n Go digital wallet
   - **GrabPay**: Grab's payment service
   - **Boost**: Boost digital wallet
   - **ShopeePay**: Shopee's payment service
   - **QR Codes**: DuitNow QR, Maybank QR, etc.

## 💳 Payment Method Configuration

### Enabled Methods by Default

The system automatically detects configured gateways and enables appropriate payment methods:

**Stripe Methods:**
- Credit/Debit Cards (Visa, Mastercard, Amex)
- Alipay
- WeChat Pay

**Razer Pay Methods:**
- Online Banking (FPX)
- Touch 'n Go eWallet
- GrabPay
- Boost
- ShopeePay
- QR Code payments (DuitNow, Maybank QR)

### Custom Method Configuration

To customize available methods, edit `server/payment-service.ts`:

```typescript
// Disable specific methods
export class RazerPayGateway implements PaymentGateway {
  supportedMethods = [
    'fpx',           // Keep online banking
    'tngd',          // Keep Touch 'n Go
    // 'boost',      // Disable Boost
    // 'shopeepay',  // Disable ShopeePay
    'duitnow_qr',    // Keep QR codes
  ];
}
```

## 🔒 Security Configuration

### Required Security Settings

```env
# Generate a strong secret for webhooks
PAYMENT_WEBHOOK_SECRET=your_256_bit_secret_here

# Session security
SESSION_SECRET=your_session_secret_here
```

### Generate Secure Secrets

```bash
# Generate webhook secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🌐 Production Deployment

### Environment Variables for Production

```env
# Production settings
NODE_ENV=production
APP_URL=https://yourdomain.com
RAZER_SANDBOX=false

# Use production API keys
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
RAZER_MERCHANT_ID=live_merchant_id
```

### SSL Certificate Required

Both Stripe and Razer Pay require HTTPS in production:
- Ensure your domain has a valid SSL certificate
- Update webhook URLs to use HTTPS
- Test payment flows thoroughly

## 🧪 Testing

### Test Cards (Stripe)

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Declined: 4000 0000 0000 0002
```

### Test Banking (Razer Pay Sandbox)

- Use sandbox FPX for online banking tests
- Test with small amounts (RM 1.00 - RM 10.00)
- Razer Pay provides test credentials in sandbox

## 📱 Mobile Optimization

### QR Code Display

The system automatically generates QR codes for:
- DuitNow QR payments
- Maybank QR payments
- Bank-specific QR codes

### Mobile Wallet Redirects

For mobile wallets (TnG, GrabPay, Boost):
- Mobile users are redirected to wallet apps
- Desktop users see QR codes to scan
- Automatic fallback handling

## 🔧 Troubleshooting

### Common Issues

1. **"Gateway not found" Error:**
   - Check environment variables are set correctly
   - Verify API keys are valid
   - Ensure `.env` file is loaded

2. **Payment Method Not Showing:**
   - Check if gateway is configured (`isConfigured()` returns true)
   - Verify supportedMethods array includes the method
   - Check frontend payment method loading

3. **Webhook Failures:**
   - Verify webhook URL is accessible
   - Check webhook secret matches
   - Review server logs for errors

### Debug Mode

Enable detailed logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Health Check Endpoints

Test gateway configuration:

```bash
# Check available payment methods
curl http://localhost:5000/api/payment-methods

# Check specific payment status
curl http://localhost:5000/api/payment/status/{paymentId}/{gateway}
```

## 📞 Support

### Stripe Support
- Documentation: [stripe.com/docs](https://stripe.com/docs)
- Support: Available in Stripe Dashboard

### Razer Pay Support
- Documentation: Available in merchant portal
- Support: Contact through Razer Pay merchant dashboard
- Email: Usually provided during merchant onboarding

### Application Support
- Check application logs in `server/` directory
- Review payment-service.ts for gateway-specific issues
- Use browser developer tools for frontend debugging

## 🎉 Next Steps

1. **Set up your payment gateways** using the instructions above
2. **Configure your environment variables** in `.env`
3. **Test the payment flow** with small amounts
4. **Deploy to production** with production API keys
5. **Monitor payments** through gateway dashboards

Your multi-gateway payment system is now ready to handle both international and Malaysian payments!
