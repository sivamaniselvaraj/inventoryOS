import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductStore, VendorStore, ProductVendorStore } from '../../../store';
import { NotificationService } from '../../../services/notification.service';
import { Product, Vendor, ProductVendorLink } from '../../../models';

@Component({
  selector: 'app-product-vendor',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './product-vendor.component.html',
  styleUrl: './product-vendor.component.scss',
})
export class ProductVendorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productStore = inject(ProductStore);
  private readonly vendorStore = inject(VendorStore);
  private readonly pvStore = inject(ProductVendorStore);
  private readonly notify = inject(NotificationService);

  readonly product = signal<Product | null>(null);
  readonly searchTerm = signal('');
  readonly showAddPanel = signal(false);
  readonly newUnitPrice = signal(0);
  readonly refreshTrigger = signal(0);

  // Vendors currently linked to this product
  readonly linkedVendors = computed(() => {
    const p = this.product();
    if (!p) return [];
    return this.pvStore.getLinksForProduct(p.productCode)
      .map((link) => ({ link, vendor: this.vendorStore.getVendorById(link.vendorId) }))
      .filter((item): item is { link: ProductVendorLink; vendor: Vendor } => !!item.vendor);
  });

  // Available vendors not yet linked
  readonly availableVendors = computed(() => {
    const p = this.product();
    if (!p) return [];
    const linkedIds = new Set(this.pvStore.getVendorIdsForProduct(p.productCode));
    const term = this.searchTerm().toLowerCase().trim();
    return this.vendorStore.activeVendors().filter((v) => {
      if (linkedIds.has(v.id)) return false;
      if (!term) return true;
      const primary = v.contacts.find((c) => c.isPrimary);
      return v.vendorName.toLowerCase().includes(term) ||
        v.vendorCode.toLowerCase().includes(term) ||
        v.city.toLowerCase().includes(term) ||
        (primary?.name.toLowerCase().includes(term) ?? false);
    });
  });

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['/products']);
      return;
    }
    this.refreshProduct(code);
    if (!this.product()) {
      this.notify.error('Product not found');
      this.router.navigate(['/products']);
    }
  }

  private refresh(): void { this.refreshTrigger.update((v) => v + 1); }

  private refreshProduct(code: string): void {
    const p = this.productStore.getProductByCode(code);
    this.product.set(p ?? null);
  }

  addVendor(vendorId: string): void {
    const p = this.product();
    if (!p) return;
    const price = this.newUnitPrice() || p.unitPrice;
    this.pvStore.addLink(p.productCode, p.productName, vendorId, price);
    this.refresh();
    const vendor = this.vendorStore.getVendorById(vendorId);
    this.notify.success(`${vendor?.vendorName} linked`);
    this.newUnitPrice.set(0);
    this.notify.success(`${vendor?.vendorName} linked to product`);
  }

  removeVendor(vendorId: string): void {
    const p = this.product();
    if (!p) return;
    const vendor = this.vendorStore.getVendorById(vendorId);
    this.pvStore.removeLink(p.productCode, vendorId);
    this.refresh();
    this.notify.success(`${vendor?.vendorName} removed`);
  }

  setPreferred(vendorId: string): void {
    const p = this.product();
    if (!p) return;
    const currentPreferred = this.pvStore.getPreferredLink(p.productCode);
    const newPref = currentPreferred?.vendorId === vendorId ? null : vendorId;
    this.pvStore.setPreferred(p.productCode, newPref);
    this.productStore.setPreferredVendor(p.id, newPref);
    this.refresh();
    if (newPref) {
      const vendor = this.vendorStore.getVendorById(vendorId);
      this.notify.success(`${vendor?.vendorName} set as preferred`);
    }
  }

  updateLinkPrice(vendorId: string, price: number): void {
    const p = this.product();
    if (!p) return;
    this.pvStore.updateUnitPrice(p.productCode, vendorId, price);
    this.refresh();
  }

  isPreferred(vendorId: string): boolean {
    const p = this.product();
    if (!p) return false;
    return this.pvStore.getPreferredLink(p.productCode)?.vendorId === vendorId;
  }

  toggleAddPanel(): void {
    this.showAddPanel.update((v) => !v);
    this.searchTerm.set('');
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

   getPrimaryContactName(vendor: Vendor): string {
    const c = vendor.contacts.find((ct) => ct.isPrimary) ?? vendor.contacts[0];
    return c?.name ?? '—';
  }
    getPrimaryContactPhone(vendor: Vendor): string {
    const c = vendor.contacts.find((ct) => ct.isPrimary) ?? vendor.contacts[0];
    return c?.phone ?? '—';
  }
}
