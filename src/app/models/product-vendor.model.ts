export interface ProductVendorLink {
  productCode: string;
  vendorId: string;
  isPreferred?: boolean;
  unitPrice: number;
  moq?: number;           // minimum order quantity
  leadTimeDays?: number;
}


/* ── Resolved view: product + vendor-specific price ─────────────── */
/*    (computed at runtime by joining Product + VendorProductLink)   */

export interface VendorProduct {
  productCode: string;
  productName: string;
  unitPrice: number;        // from VendorProductLink
  gstPercent: number|null;       // from Product master
  vendorId: string;
  vendorCount?: number;      // how many vendors carry this product
}