import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
//import { DatePipe, JsonPipe } from '@angular/common';
import { ProductStore, VendorStore, ProductVendorStore } from '../../../store';
import { NotificationService } from '../../../services/notification.service';
import { Product, Vendor, GST_RATE_OPTIONS, ProductVendorLink } from '../../../models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productStore = inject(ProductStore);
  private readonly vendorStore = inject(VendorStore);
  private readonly productVendorStore = inject(ProductVendorStore);
  private readonly notify = inject(NotificationService);

  readonly product = signal<Product | null>(null);
  readonly showDeleteConfirm = signal(false);

  // ── Derived Data ──
  readonly linkedVendors = computed(() => {
    const p = this.product();
    if (!p) return [];
      return this.productVendorStore.getLinksForProduct(p.productCode).map((link) => ({
        link, 
        vendor: this.vendorStore.getVendorById(link.vendorId),
      })).filter((item): item is {link: ProductVendorLink; vendor: Vendor} => !!item.vendor)
  });

  readonly stockStatus = computed(() => {
    const p = this.product();
    if (!p) return { label: '—', type: '' };
    if (p.reorderLevel !== null && p.unitsAvailable <= p.reorderLevel) {
      return { label: 'Low Stock', type: 'danger' };
    }
    if (p.maxStockLevel !== null && p.unitsAvailable >= p.maxStockLevel) {
      return { label: 'Max Capacity', type: 'warning' };
    }
    return { label: 'In Stock', type: 'success' };
  });

  readonly profitMargin = computed(() => {
    return null;
    // const p = this.product();
    // if (!p || p.purchasingPrice === 0) return null;
    // const margin = ((p.sellingPrice - p.purchasingPrice) / p.purchasingPrice) * 100;
    // return Math.round(margin * 100) / 100;
  });

    readonly gstAmount = computed(() => {
    const p = this.product();
    if (!p?.gstApplicable || p.gstRate == null) return 0;
    return Math.round((p.sellingPrice * p.gstRate) / 100 * 100) / 100;
  });

  readonly sellingPriceIncGst = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return p.sellingPrice + this.gstAmount();
  });

  readonly gstRateDescription = computed(() => {
    const p = this.product();
    if (!p?.gstApplicable || p.gstRate == null) return '';
    const option = GST_RATE_OPTIONS.find((o) => o.value === p.gstRate);
    return option?.description ?? '';
  });

  readonly stockPercentage = computed(() => {
    const p = this.product();
    if (!p || !p.maxStockLevel || p.maxStockLevel === 0) return null;
    return Math.min(100, Math.round((p.unitsAvailable / p.maxStockLevel) * 100));
  });

  readonly isExpired = computed(() => {
    const p = this.product();
    if (!p?.expiryDate) return false;
    return new Date(p.expiryDate) < new Date();
  });

  readonly daysUntilExpiry = computed(() => {
    const p = this.product();
    if (!p?.expiryDate) return null;
    const diff = new Date(p.expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/products']);
      return;
    }
    const product = this.productStore.getProductByCode(code);
    if (product) {
      this.product.set(product);
    } else {
      this.notify.error('Product not found');
      this.router.navigate(['/products']);
    }
  }

  formatCurrency(value: number): string {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  promptDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  confirmDelete(): void {
    const p = this.product();
    if (!p) return;
    if (this.productStore.deleteProduct(p.id)) {
      this.notify.success(`"${p.productName}" deleted`);
      this.router.navigate(['/products']);
    }
    this.showDeleteConfirm.set(false);
  }

   /** Helper: get primary contact from a vendor */
  private primaryContact(v: Vendor) {
    return v.contacts.find(c => c.isPrimary) || v.contacts[0];
  }

  primaryName(vendor: Vendor): string {
    const c = this.primaryContact(vendor);
    return c?.name || '—';
  }

  primaryEmail(vendor: Vendor): string {
    const c = this.primaryContact(vendor);
    return c?.email || '—';
  }
}
