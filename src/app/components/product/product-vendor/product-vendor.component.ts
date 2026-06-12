import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductStore, VendorStore } from '../../../store';
import { NotificationService } from '../../../services/notification.service';
import { Product, Vendor } from '../../../models';

@Component({
  selector: 'app-product-vendor',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './product-vendor.component.html',
  styleUrl: './product-vendor.component.css',
})
export class ProductVendorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productStore = inject(ProductStore);
  readonly vendorStore = inject(VendorStore);
  private readonly notify = inject(NotificationService);

  readonly product = signal<Product | null>(null);
  readonly searchTerm = signal('');
  readonly showAddPanel = signal(false);

  // Vendors currently linked to this product
  readonly linkedVendors = computed(() => {
    const p = this.product();
    if (!p) return [];
    return p.vendorIds
      .map((id) => this.vendorStore.getVendorById(id))
      .filter((v): v is Vendor => v !== undefined);
  });

  // Available vendors not yet linked
  readonly availableVendors = computed(() => {
    const p = this.product();
    if (!p) return [];
    const linked = new Set(p.vendorIds);
    const term = this.searchTerm().toLowerCase().trim();
    return this.vendorStore.activeVendors().filter((v) => {
      if (linked.has(v.id)) return false;
      if (!term) return true;
      return (
        v.vendorName.toLowerCase().includes(term) ||
        v.vendorCode.toLowerCase().includes(term) //||
        //v.contactPerson.toLowerCase().includes(term)
      );
    });
  });

  readonly preferredVendorId = computed(() => {
    return this.product()?.preferredVendorId ?? null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/products']);
      return;
    }
    this.refreshProduct(id);
    if (!this.product()) {
      this.notify.error('Product not found');
      this.router.navigate(['/products']);
    }
  }

  private refreshProduct(id: string): void {
    const p = this.productStore.getProductById(id);
    this.product.set(p ?? null);
  }

  addVendor(vendorId: string): void {
    const p = this.product();
    if (!p) return;
    this.productStore.addVendorToProduct(p.id, vendorId);
    this.refreshProduct(p.id);
    const vendor = this.vendorStore.getVendorById(vendorId);
    this.notify.success(`${vendor?.vendorName} linked to product`);
  }

  removeVendor(vendorId: string): void {
    const p = this.product();
    if (!p) return;
    const vendor = this.vendorStore.getVendorById(vendorId);
    this.productStore.removeVendorFromProduct(p.id, vendorId);
    this.refreshProduct(p.id);
    this.notify.success(`${vendor?.vendorName} removed`);
  }

  setPreferred(vendorId: string): void {
    const p = this.product();
    if (!p) return;
    const newPreferred = p.preferredVendorId === vendorId ? null : vendorId;
    this.productStore.setPreferredVendor(p.id, newPreferred);
    this.refreshProduct(p.id);
    if (newPreferred) {
      const vendor = this.vendorStore.getVendorById(vendorId);
      this.notify.success(`${vendor?.vendorName} set as preferred vendor`);
    }
  }

  isPreferred(vendorId: string): boolean {
    return this.product()?.preferredVendorId === vendorId;
  }

  toggleAddPanel(): void {
    this.showAddPanel.update((v) => !v);
    this.searchTerm.set('');
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }
}
