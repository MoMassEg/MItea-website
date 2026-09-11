'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useMemo,
} from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  ExpressCheckoutElement,
} from '@stripe/react-stripe-js';
import { ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

// Initialize Stripe once outside components
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export interface StripePaymentFormRef {
  validate: () => Promise<boolean>;
  confirm: (orderId: string, orderNumber: string) => Promise<{ success: boolean; error?: string }>;
}

interface StripePaymentFormProps {
  amount: number; // in dollars
  paymentMethod: 'card' | 'express';
  customerEmail?: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

/**
 * Inner component that has access to useStripe() and useElements()
 */
const StripePaymentFormInner = forwardRef<
  StripePaymentFormRef,
  {
    amount: number;
    paymentMethod: 'card' | 'express';
    customerEmail?: string;
    onPaymentSuccess?: () => void;
    onPaymentError?: (error: string) => void;
  }
>(function StripePaymentFormInner(
  { amount, paymentMethod, customerEmail, onPaymentSuccess, onPaymentError },
  ref
) {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isElementReady, setIsElementReady] = useState(false);
  const [expressAvailable, setExpressAvailable] = useState<boolean | null>(null);

  // Expose validate and confirm to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      validate: async () => {
        setErrorMessage(null);
        if (!stripe || !elements) {
          setErrorMessage('Payment service is still loading. Please try again in a moment.');
          return false;
        }

        const { error: submitError } = await elements.submit();
        if (submitError) {
          const msg = submitError.message || 'Please check your card details.';
          setErrorMessage(msg);
          if (onPaymentError) onPaymentError(msg);
          return false;
        }
        return true;
      },

      confirm: async (orderId: string, orderNumber: string) => {
        setErrorMessage(null);
        setIsProcessing(true);

        if (!stripe || !elements) {
          const msg = 'Payment service is unavailable.';
          setErrorMessage(msg);
          setIsProcessing(false);
          return { success: false, error: msg };
        }

        try {
          // 1. Request PaymentIntent from backend
          const intentData = await apiClient.createPaymentIntent(orderId);

          if (!intentData.clientSecret) {
            throw new Error('Failed to obtain payment client secret from server.');
          }

          // In demo mode when keys are dummy/not configured
          if (intentData.demo) {
            setIsProcessing(false);
            if (onPaymentSuccess) onPaymentSuccess();
            return { success: true };
          }

          // 2. Confirm payment with Stripe using the submitted elements
          const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
          const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret: intentData.clientSecret,
            redirect: 'if_required',
            confirmParams: {
              return_url: `${appUrl}/order-confirmation?orderId=${encodeURIComponent(orderNumber)}`,
              receipt_email: customerEmail || undefined,
            },
          });

          if (confirmError) {
            const msg = confirmError.message || 'Payment confirmation failed.';
            setErrorMessage(msg);
            setIsProcessing(false);
            if (onPaymentError) onPaymentError(msg);
            return { success: false, error: msg };
          }

          if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
            setIsProcessing(false);
            if (onPaymentSuccess) onPaymentSuccess();
            return { success: true };
          }

          // In case status is requires_action but redirect didn't trigger
          setIsProcessing(false);
          return { success: true };
        } catch (err: any) {
          const msg = err.message || 'An unexpected error occurred during payment.';
          setErrorMessage(msg);
          setIsProcessing(false);
          if (onPaymentError) onPaymentError(msg);
          return { success: false, error: msg };
        }
      },
    }),
    [stripe, elements, customerEmail, onPaymentSuccess, onPaymentError]
  );

  return (
    <div className="space-y-3">
      {/* Test Mode Card Hint Pill */}
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-900">
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Stripe Test Mode active</span>
        </div>
        <div className="text-[11px] text-amber-700 font-mono">
          Card: <span className="font-bold select-all">4242 •••• 4242</span>
        </div>
      </div>

      {paymentMethod === 'express' && (
        <div className="bg-warm-50 border border-warm-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87 0-.02 0-.05-.01-.07-.97.04-2.15.65-2.85 1.48-.56.65-.99 1.68-.96 2.73.01.02.01.05.02.07 1.09.08 2.18-.59 2.79-1.34z" />
            </svg>
            <span className="font-heading font-bold text-sm text-gray-900">Apple Pay & Express Wallets</span>
          </div>

          <p className="text-xs text-gray-600">
            When available on your browser (Safari on iOS/macOS), the 1-click Apple Pay sheet will be used. You can also use credit card below.
          </p>

          <ExpressCheckoutElement
            onReady={({ availablePaymentMethods }) => {
              const hasMethods = Boolean(
                availablePaymentMethods &&
                  (availablePaymentMethods.applePay ||
                    availablePaymentMethods.googlePay ||
                    availablePaymentMethods.link)
              );
              setExpressAvailable(hasMethods);
            }}
            onConfirm={async (event) => {
              // Express checkout triggers payment immediately
            }}
            options={{
              buttonType: {
                applePay: 'order',
                googlePay: 'order',
              },
              buttonTheme: {
                applePay: 'black',
                googlePay: 'black',
              },
              buttonHeight: 44,
            }}
          />

          {expressAvailable === false && (
            <div className="bg-warm-100 rounded-xl p-3 text-[11px] text-gray-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warm-600 shrink-0 mt-0.5" />
              <span>
                Apple Pay is supported on Safari on Apple devices. You can use the <strong>Credit Card</strong> tab above to complete your order right now.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stripe Payment Element (Card, Apple Pay, Google Pay) */}
      <div className={`transition-opacity duration-200 ${isElementReady ? 'opacity-100' : 'opacity-60'}`}>
        <PaymentElement
          id="stripe-payment-element"
          onReady={() => setIsElementReady(true)}
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>

      {/* Inline Stripe Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Payment Error: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-gray-500 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>256-bit encrypted & processed directly by Stripe</span>
      </div>
    </div>
  );
});

/**
 * Main Exported Component
 * Wraps Stripe Elements provider around the inner form
 */
export const StripePaymentForm = forwardRef<StripePaymentFormRef, StripePaymentFormProps>(
  function StripePaymentForm({ amount, paymentMethod, customerEmail, onPaymentSuccess, onPaymentError }, ref) {
    // Memoize Elements options so it doesn't cause unnecessary remounts
    const elementsOptions: StripeElementsOptions = useMemo(() => {
      const amountInCents = Math.max(50, Math.round(amount * 100));
      return {
        mode: 'payment',
        amount: amountInCents,
        currency: 'usd',
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#B34B36', // MiTea brand color
            colorBackground: '#FFFFFF',
            colorText: '#1A1A1A',
            colorDanger: '#DC2626',
            fontFamily: 'Outfit, system-ui, -apple-system, sans-serif',
            fontSizeBase: '14px',
            spacingUnit: '4px',
            borderRadius: '12px',
          },
          rules: {
            '.Input': {
              border: '1px solid #E5DFD7',
              boxShadow: 'none',
              padding: '10px 14px',
            },
            '.Input:focus': {
              borderColor: '#B34B36',
              boxShadow: '0 0 0 1px #B34B36',
            },
            '.Tab': {
              border: '1px solid #E5DFD7',
              backgroundColor: '#FAF7F2',
              boxShadow: 'none',
            },
            '.Tab:hover': {
              borderColor: '#B34B36',
            },
            '.Tab--selected': {
              borderColor: '#B34B36',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            },
          },
        },
      };
    }, [amount]);

    if (!publishableKey || !stripePromise) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Stripe Publishable Key Missing
          </p>
          <p>
            Please set <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in <code>.env.local</code> to enable real Stripe payments.
          </p>
        </div>
      );
    }

    return (
      <Elements stripe={stripePromise} options={elementsOptions}>
        <StripePaymentFormInner
          ref={ref}
          amount={amount}
          paymentMethod={paymentMethod}
          customerEmail={customerEmail}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
      </Elements>
    );
  }
);
