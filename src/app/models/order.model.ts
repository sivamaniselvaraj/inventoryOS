export interface ProductDetails {
  code: string;
  name: string;
  unitPrice: number;
}

export interface OrderItem {
  code: string;
  name: string;
  unitPrice: number;
  sellingPrice: number;
  quantity: number;
  totalByItem: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  gstRate: number;
  total: number;
  status: 'draft' | 'submitted';
  createdAt: Date;
  updatedAt: Date;
}
