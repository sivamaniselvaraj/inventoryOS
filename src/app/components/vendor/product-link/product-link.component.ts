import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { VendorStore, ProductStore, ProductVendorStore } from  '../../../store';
import { Vendor, Product, ProductVendorLink } from '../../../models';

@Component({
  selector: 'app-product-link',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-link.component.html',
  styleUrl: './product-link.component.scss',
})
export class ProductLinkComponent implements OnInit {
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  vendorStore  = inject(VendorStore);
  productStore = inject(ProductStore);
  pvStore      = inject(ProductVendorStore);

  vendor = signal<Vendor | null>(null);
  linkedProducts = signal<ProductVendorLink[]>([]);

  /** Search / filter for available products */
  search = signal('');
  categoryFilter = signal('');

  /** Inline editing state */
  editingCode = signal<string | null>(null);
  editForm = { unitPrice: 0, moq: 1, leadTimeDays: 7, isPreferred: false };

  /** Link form for a selected product */
  linkingProduct = signal<Product | null>(null);
  linkForm = { unitPrice: 0, moq: 1, leadTimeDays: 7, isPreferred: false };

  /** Derived: product codes already linked to this vendor */
  linkedCodes = computed(() => new Set(this.linkedProducts().map(l => l.productCode)));

  /** Derived: available (unlinked) products filtered by search/category */
  availableProducts = computed(() => {
    const codes = this.linkedCodes();
    const term = this.search().toLowerCase();
    const cat = this.categoryFilter();
    return this.productStore.products().filter(p =>
      !codes.has(p.productCode)
      && (!term || p.productName.toLowerCase().includes(term) || p.productCode.toLowerCase().includes(term))
      //&& (!cat || p.category === cat)
    );
  });

  /** Derived: linked products enriched with catalog info */
  linkedEnriched = computed(() => {
    return this.linkedProducts().map(link => ({
      ...link,
      product: this.productStore.getProductByCode(link.productCode),
    }));
  });

  readonly categories = this.productStore.categories;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/vendors']); return; }
    const v = this.vendorStore.getVendorById(id);
    if (!v)  { this.router.navigate(['/vendors']); return; }
    this.vendor.set(v);
    this.refreshLinks();
  }

  private refreshLinks() {
    const v = this.vendor();
    if (v) this.linkedProducts.set(this.pvStore.getLinksForVendor(v.id));
  }

  /* ── Link a product ──────────────────── */
  startLink(product: Product) {
    this.linkingProduct.set(product);
    this.linkForm = { unitPrice: product.unitPrice, moq: 1, leadTimeDays: 7, isPreferred: false };
  }

  cancelLink() {
    this.linkingProduct.set(null);
  }

  confirmLink() {
    const product = this.linkingProduct();
    const vendor = this.vendor();
    if (!product || !vendor || this.linkForm.unitPrice <= 0) return;

    // this.pvStore.addLink({
    //   productCode: product.productCode,
    //   productName: product.productName,
    //   vendorId: vendor.id,
    //   isPreferred: this.linkForm.isPreferred,
    //   unitPrice: this.linkForm.unitPrice,
    //   currency: 'INR',
    //   moq: this.linkForm.moq,
    //   leadTimeDays: this.linkForm.leadTimeDays,
    // });
    this.linkingProduct.set(null);
    this.refreshLinks();
  }

  /* ── Unlink ──────────────────────────── */
  unlinkProduct(link: ProductVendorLink) {
    if (confirm(`Remove "${link.productName}" from this vendor?`)) {
      this.pvStore.removeLink(link.productCode, link.vendorId);
      this.refreshLinks();
    }
  }

  /* ── Toggle preferred ────────────────── */
  togglePreferred(link: ProductVendorLink) {
    //this.pvStore.togglePreferred(link.productCode, link.vendorId);
    this.refreshLinks();
  }

  /* ── Inline edit ─────────────────────── */
  startEdit(link: ProductVendorLink) {
    this.editingCode.set(link.productCode);
    this.editForm = { unitPrice: link.unitPrice, moq: link.moq as number, leadTimeDays: link.leadTimeDays as number, isPreferred: link.isPreferred as boolean };
  }

  cancelEdit() { this.editingCode.set(null); }

  saveEdit(link: ProductVendorLink) {
    if (this.editForm.unitPrice <= 0) return;
    this.pvStore.removeLink(link.productCode, link.vendorId);
    // this.pvStore.addLink(
    //   unitPrice: this.editForm.unitPrice,
    //   moq: this.editForm.moq,
    // );
    this.editingCode.set(null);
    this.refreshLinks();
  }

  /* ── Helpers ─────────────────────────── */
  categoryLabel(cat: string): string {
    return cat.replace('-', ' ');
  }

  goBack() {
    this.router.navigate(['/vendors']);
  }
}
