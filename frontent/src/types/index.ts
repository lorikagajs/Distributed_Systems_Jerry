export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
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

export interface Order {
  id: number;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  user: User | null;
  createdAt: string;
}
