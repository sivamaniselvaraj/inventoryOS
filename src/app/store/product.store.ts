import { Injectable, signal, computed } from '@angular/core';
import { Product, ProductFormData } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductStore {
  // ── State ──
  private readonly _products = signal<Product[]>([
    {
      id: 'p-001',
      productCode: 'PRD-1001',
      productName: 'Wireless Bluetooth Headphones',
      description: 'Noise-cancelling over-ear headphones with 30hr battery life',
      unitPrice: 2500,
      sellingPrice: 3499,
      purchasingPrice: 2000,
      unitsAvailable: 150,
      barcodeValue: '8901234567890',
      unitOfMeasure: 'Piece',
      manufacturedBy: 'SoundMax Electronics',
      manufacturedOn: '2025-08-15',
      expiryDate: '',
      shelfLifeDays: null,
      batchNumber: 'BT-2025-0815',
      reorderLevel: 20,
      maxStockLevel: 500,
      vendorIds: ['v-001', 'v-002'],
      preferredVendorId: 'v-001',
      createdAt: '2025-09-01T10:00:00Z',
      updatedAt: '2025-12-10T14:30:00Z',
    },
    {
      id: 'p-002',
      productCode: 'PRD-1002',
      productName: 'Organic Green Tea (250g)',
      description: 'Premium Darjeeling green tea leaves, organically grown',
      unitPrice: 350,
      sellingPrice: 499,
      purchasingPrice: 280,
      unitsAvailable: 420,
      barcodeValue: '8901234567906',
      unitOfMeasure: 'Pack',
      manufacturedBy: 'HillFresh Beverages',
      manufacturedOn: '2026-01-10',
      expiryDate: '2027-01-10',
      shelfLifeDays: 365,
      batchNumber: 'GT-2026-0110',
      reorderLevel: 50,
      maxStockLevel: 1000,
      vendorIds: ['v-003', 'v-005'],
      preferredVendorId: 'v-003',
      createdAt: '2026-01-15T08:00:00Z',
      updatedAt: '2026-03-20T11:00:00Z',
    },
    {
      id: 'p-003',
      productCode: 'PRD-1003',
      productName: 'Stainless Steel Water Bottle (750ml)',
      description: 'Double-walled vacuum insulated, keeps drinks cold 24h / hot 12h',
      unitPrice: 600,
      sellingPrice: 899,
      purchasingPrice: 450,
      unitsAvailable: 85,
      barcodeValue: '8901234567913',
      unitOfMeasure: 'Piece',
      manufacturedBy: 'MetalWorks Industries',
      manufacturedOn: '2025-11-20',
      expiryDate: '',
      shelfLifeDays: null,
      batchNumber: 'WB-2025-1120',
      reorderLevel: 15,
      maxStockLevel: 300,
      vendorIds: ['v-006'],
      preferredVendorId: 'v-006',
      createdAt: '2025-12-01T09:00:00Z',
      updatedAt: '2026-02-15T16:45:00Z',
    },
    {
      id: 'p-004',
      productCode: 'PRD-1004',
      productName: 'USB-C Fast Charger 65W',
      description: 'GaN technology, supports PD 3.0 & QC 4.0, compact foldable plug',
      unitPrice: 1200,
      sellingPrice: 1799,
      purchasingPrice: 950,
      unitsAvailable: 320,
      barcodeValue: '8901234567920',
      unitOfMeasure: 'Piece',
      manufacturedBy: 'ChargeTech Solutions',
      manufacturedOn: '2026-02-01',
      expiryDate: '',
      shelfLifeDays: null,
      batchNumber: 'CH-2026-0201',
      reorderLevel: 30,
      maxStockLevel: 800,
      vendorIds: ['v-001', 'v-002', 'v-004'],
      preferredVendorId: 'v-002',
      createdAt: '2026-02-10T12:00:00Z',
      updatedAt: '2026-04-05T09:15:00Z',
    },
    {
      id: 'p-005',
      productCode: 'PRD-1005',
      productName: 'Bamboo Desk Organizer',
      description: 'Multi-compartment organizer with phone holder slot, eco-friendly bamboo',
      unitPrice: 800,
      sellingPrice: 1199,
      purchasingPrice: 600,
      unitsAvailable: 5,
      barcodeValue: '8901234567937',
      unitOfMeasure: 'Piece',
      manufacturedBy: 'GreenCraft Home',
      manufacturedOn: '2025-10-05',
      expiryDate: '',
      shelfLifeDays: null,
      batchNumber: 'DO-2025-1005',
      reorderLevel: 10,
      maxStockLevel: 200,
      vendorIds: ['v-003'],
      preferredVendorId: null,
      createdAt: '2025-10-20T07:00:00Z',
      updatedAt: '2026-01-18T13:30:00Z',
    },
  ]);
  private readonly _formMode = signal<'add' | 'edit' | null>(null);
  private readonly _loading = signal(false);
  private readonly _searchTerm = signal('');

  // ── Public Selectors ──
  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();

  readonly filteredProducts = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    if (!term) return this._products();
    return this._products().filter(
      (p) =>
        p.productCode.toLowerCase().includes(term) ||
        p.productName.toLowerCase().includes(term) ||
        p.barcodeValue.toLowerCase().includes(term) ||
        p.manufacturedBy.toLowerCase().includes(term) ||
        p.batchNumber.toLowerCase().includes(term)
    );
  });

  readonly totalProducts = computed(() => this._products().length);

  readonly lowStockProducts = computed(() =>
    this._products().filter(
      (p) => p.reorderLevel !== null && p.unitsAvailable <= p.reorderLevel
    )
  );

  readonly totalInventoryValue = computed(() =>
    this._products().reduce((sum, p) => sum + p.unitPrice * p.unitsAvailable, 0)
  );

  // ── Actions ──
  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  getProductById(id: string): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  addProduct(data: ProductFormData): Product {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id: `p-${Date.now().toString(36)}`,
      vendorIds: [],
      preferredVendorId: null,
      createdAt: now,
      updatedAt: now,
    };
    this._products.update((list) => [newProduct, ...list]);
    return newProduct;
  }

  updateProduct(id: string, data: Partial<ProductFormData>): boolean {
    const index = this._products().findIndex((p) => p.id === id);
    if (index === -1) return false;
    this._products.update((list) => {
      const updated = [...list];
      updated[index] = {
        ...updated[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
    return true;
  }

  deleteProduct(id: string): boolean {
    const before = this._products().length;
    this._products.update((list) => list.filter((p) => p.id !== id));
    return this._products().length < before;
  }

  // ── Vendor Link Actions ──
  addVendorToProduct(productId: string, vendorId: string): void {
    this._products.update((list) =>
      list.map((p) => {
        if (p.id !== productId) return p;
        if (p.vendorIds.includes(vendorId)) return p;
        return {
          ...p,
          vendorIds: [...p.vendorIds, vendorId],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  removeVendorFromProduct(productId: string, vendorId: string): void {
    this._products.update((list) =>
      list.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          vendorIds: p.vendorIds.filter((v) => v !== vendorId),
          preferredVendorId:
            p.preferredVendorId === vendorId ? null : p.preferredVendorId,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  setPreferredVendor(productId: string, vendorId: string | null): void {
    this._products.update((list) =>
      list.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          preferredVendorId: vendorId,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  closeForm() { this._formMode.set(null); }
}
