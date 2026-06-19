/* ── PO Line Item ───────────────────────────────────────────────── */

export interface POLineItem {
  code: string;
  name: string;
  unitPrice: number;
  quantity: number;
  gstPercent: number|null;
  gstAmount: number; // unitPrice * quantity * gstPercent / 100
  discountPercent: number;
  discountAmount: number; // unitPrice * quantity * discountPercent / 100
  lineTotal: number; // (unitPrice * quantity) + gstAmount - discountAmount
}

/* ── Purchase Order ─────────────────────────────────────────────── */

export interface PurchaseOrder {
  id: string;
  locationId: string;
  locationName: string;
  vendorId: string;
  vendorName: string;
  items: POLineItem[];
  subtotal: number;
  totalGst: number;
  totalDiscount: number;
  grandTotal: number;
  status: 'draft' | 'submitted' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
