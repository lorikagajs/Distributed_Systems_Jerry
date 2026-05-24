import type { PaymentMethod } from '../types';

export const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    value: 'CREDIT_CARD',
    label: 'Credit card',
    description: 'Visa, Mastercard, Amex',
  },
  {
    value: 'DEBIT_CARD',
    label: 'Debit card',
    description: 'Pay directly from your bank account',
  },
  {
    value: 'PAYPAL',
    label: 'PayPal',
    description: 'Redirect to PayPal to complete payment',
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Bank transfer',
    description: 'Transfer details sent after placing the order',
  },
  {
    value: 'CASH_ON_DELIVERY',
    label: 'Cash on delivery',
    description: 'Pay when your order arrives',
  },
];

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

export function requiresCardDetails(method: PaymentMethod): boolean {
  return method === 'CREDIT_CARD' || method === 'DEBIT_CARD';
}
