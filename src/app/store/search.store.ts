import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../models';
import { ProductStore } from './product.store';

@Injectable({ providedIn: 'root' })
export class ProductSearchStore {
  productStore = inject(ProductStore);

   //product_list: Partial<Product> = { productCode: 'ELC-001', productName: 'Wireless Earbuds Pro', unitPrice: 2499, sellingPrice:0 }

   readonly products = this.productStore.products;
   //= this.productStore.products;

  // // ── Signal: master product catalog ────────────────────────────────
  // readonly products = signal<Product[]>([
  //   { code: 'ELC-001', name: 'Wireless Earbuds Pro',        unitPrice: 2499 },
  //   { code: 'ELC-002', name: 'USB-C Fast Charger 65W',      unitPrice: 1899 },
  //   { code: 'ELC-003', name: 'Bluetooth Speaker Mini',       unitPrice: 3499 },
  //   { code: 'ELC-004', name: 'Smart Watch Band',             unitPrice: 799  },
  //   { code: 'ELC-005', name: 'Laptop Stand Aluminium',       unitPrice: 4599 },
  //   { code: 'ELC-006', name: 'Mechanical Keyboard TKL',      unitPrice: 6999 },
  //   { code: 'ELC-007', name: 'Webcam 1080p HD',              unitPrice: 3299 },
  //   { code: 'ELC-008', name: 'Power Bank 20000mAh',          unitPrice: 1599 },
  //   { code: 'ELC-009', name: 'HDMI Cable 2m Braided',        unitPrice: 499  },
  //   { code: 'ELC-010', name: 'Mouse Pad XL Stitched',        unitPrice: 699  },
  //   { code: 'ELC-011', name: 'Noise Cancelling Headphones',  unitPrice: 8999 },
  //   { code: 'ELC-012', name: 'Portable SSD 500GB',           unitPrice: 5499 },
  //   { code: 'ELC-013', name: 'LED Desk Lamp Dimmable',       unitPrice: 2199 },
  //   { code: 'ELC-014', name: 'Wireless Mouse Ergonomic',     unitPrice: 1299 },
  //   { code: 'ELC-015', name: 'Phone Grip Ring Holder',       unitPrice: 299  },
  // ]);

  // ── Signal: current search query ─────────────────────────────────
  readonly searchQuery = signal('');

  // ── Computed: filtered results react to query changes ────────────
  readonly filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return this.products().filter(
      p => p.productName.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q)
    );
  });

  // ── Computed: whether the search dropdown should show ────────────
  readonly hasResults = computed(() => this.filteredProducts().length > 0);
  readonly hasQuery   = computed(() => this.searchQuery().trim().length > 0);

  updateSearch(query: string): void {
    this.searchQuery.set(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  getProductByCode(code: string): Product | undefined {
    return this.products().find(p => p.productCode === code);
  }
}
