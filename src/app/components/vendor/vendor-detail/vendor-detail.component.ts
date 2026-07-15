import { Component, inject, Input, OnInit, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VendorStore, ProductVendorStore } from '../../../store';
import { Vendor, ProductVendorLink } from '../../../models';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vendor-detail.component.html',
  styleUrl: './vendor-detail.component.scss'
})
export class VendorDetailComponent implements OnInit, OnChanges{
  //@Input() vendor!: Vendor;

  vendor!: Vendor | undefined;

  store = inject(VendorStore);
  private readonly route = inject(ActivatedRoute);
  pvStore = inject(ProductVendorStore);
  private router = inject(Router);
  private readonly notify = inject(NotificationService);

  showAddProduct = signal(false);

   /** Product links for the current vendor — reactive */
  vendorProducts = signal<ProductVendorLink[]>([]);

   /** New product form fields */
  newProduct = {
    productCode: '', productName: '', unitPrice: 0,
    moq: 1, leadTimeDays: 7, isPreferred: false
  };

  get initials(): string | undefined {
    return this.vendor?.vendorName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vendor'] && this.vendor) {
      this.vendorProducts.set(this.pvStore.getLinksForVendor(this.vendor.id));
    }
  }
 
  private refreshProducts(): void {
    if(this.vendor)
    this.vendorProducts.set(this.pvStore.getLinksForVendor(this.vendor.id));
  }
 

  contactInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  get statusBadgeClass(): string {
    switch (this.vendor?.status) {
      case 'active':    return 'badge badge-success';
      case 'pending':   return 'badge badge-warning';
      case 'suspended': return 'badge badge-danger';
      default:          return 'badge badge-info';
    }
  }

  ngOnInit(): void {
     const id = this.route.snapshot.paramMap.get('id');
    if (id) {
       this.vendor = this.store.getVendorById(id);
       this.vendorProducts.set(this.pvStore.getLinksForVendor(id));
      if (!this.vendor) {
        this.notify.error('Vendor not found');
        this.router.navigate(['/vendors']);
      }
    }
  }

  onEdit(): void {
    this.router.navigate(['/vendors', this.vendor?.id, 'edit']);
  }

  onDelete(): void {
    if (confirm(`Delete "${this.vendor?.vendorName}"?`)) {
      this.store.deleteVendor(this.vendor?.id+"");
    }
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

   
  /* ── Product actions ─────────────────────────── */
  togglePreferred(p: ProductVendorLink): void {
    this.pvStore.setPreferred(p.productCode, p.vendorId);
    this.refreshProducts();
  }
 
  removeProduct(p: ProductVendorLink): void {
    if (confirm(`Remove "${p.productCode}" from this vendor?`)) {
      this.pvStore.removeLink(p.productCode, p.vendorId);
      this.refreshProducts();
    }
  }
 
  openAddProduct(): void {
    this.newProduct = { productCode: '', productName: '', unitPrice: 0, moq: 1, leadTimeDays: 7, isPreferred: false };
    this.showAddProduct.set(true);
  }
 
  cancelAddProduct(): void {
    this.showAddProduct.set(false);
  }
 
  saveProduct(): void {
    if (!this.newProduct.productCode || !this.newProduct.productName || this.newProduct.unitPrice <= 0) return;
    this.pvStore.addLink(
      this.newProduct.productName,
      this.newProduct.productCode,
      this.vendor?.id as string,
      this.newProduct.unitPrice,
    );
    this.showAddProduct.set(false);
    this.refreshProducts();
  }
}
