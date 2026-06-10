export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock_quantity: number;
  category_id?: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}
