export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tenantId?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  images: string[];
  categoryId: number;
  category: Category | null;
  tenantId: number;
  ratings: number | null;
  createdAt: string;
}

export interface CartItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
}

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'PAYPAL'
  | 'BANK_TRANSFER'
  | 'CASH_ON_DELIVERY';

export interface OrderPayment {
  id: number;
  method: PaymentMethod;
  status: string;
  amount: number;
  createdAt: string;
}

export interface Order {
  id: number;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  shippingAddress?: ShippingAddress | null;
  payments?: OrderPayment[];
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  user: User | null;
  product?: { id: number; name: string } | null;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  tenantId?: number;
  createdAt?: string;
}
