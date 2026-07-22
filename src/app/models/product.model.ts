/* ── Product master catalog ─────────────────────────────── */
export type ProductCategory = 'infrastructure' | 'software' | 'raw-material' | 'logistics' | 'consumables' | 'equipment' | 'services';

export interface Product {
  id: string;
  productCode: string;
  productName: string;
  description: string;
  unitPrice: number;
  sellingPrice: number;
  category:ProductCategory;
  currency:string
  unitsAvailable: number;
  barcodeValue: string;
  unitOfMeasure: string;
  manufacturedBy: string;
  manufacturedOn: string;
  expiryDate: string;
  shelfLifeDays: number | null;
  batchNumber: string;
  reorderLevel: number | null;
  maxStockLevel: number | null;
  //preferredVendorId: string | null;
  createdAt: string;
  updatedAt: string;
  gstApplicable: boolean;
  gstRate: number | null;
}

export type ProductFormData = Omit<
  Product,
  'id' | 'createdAt' | 'updatedAt' | 'vendorIds' | 'preferredVendorId'
>;

export function createEmptyProduct(): ProductFormData {
  return {
    productCode: '',
    productName: '',
    description: '',
    category:'services',
    currency:'INR',
    unitPrice: 0,
    sellingPrice: 0,
    unitsAvailable: 0,
    barcodeValue: '',
    unitOfMeasure: '',
    manufacturedBy: '',
    manufacturedOn: '',
    expiryDate: '',
    shelfLifeDays: null,
    batchNumber: '',
    reorderLevel: null,
    maxStockLevel: null,
    gstApplicable: false,
    gstRate: null,
  };
}

export const UNIT_OF_MEASURE_OPTIONS: string[] = [
  'Piece',
  'Kilogram',
  'Gram',
  'Litre',
  'Millilitre',
  'Metre',
  'Centimetre',
  'Box',
  'Pack',
  'Dozen',
  'Pair',
  'Set',
  'Roll',
  'Bottle',
  'Bag',
  'Carton',
];
