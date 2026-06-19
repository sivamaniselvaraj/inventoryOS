import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { PurchaseOrderStore, VendorStore, UserStore } from '../../../store';
import { VendorProduct } from '../../../models';
import { LocationSelectorComponent } from '../../selectors/location-selector/location-selector.component';
import { VendorSelectorComponent } from '../../selectors/vendor-selector/vendor-selector.component';

@Component({
  selector: 'app-po-create',
  standalone: true,
  imports: [FormsModule, DecimalPipe, LocationSelectorComponent, VendorSelectorComponent],
  templateUrl: './po-create.component.html',
  styleUrl: './po-create.component.scss',
})
export class PoCreateComponent {
  readonly poStore       = inject(PurchaseOrderStore);
  readonly vendorStore   = inject(VendorStore);
  readonly userStore = inject(UserStore);
  readonly Math = Math;

  readonly productFilter    = signal('');
  readonly catalogCollapsed = signal(false);

  // ── Vendor switch confirmation ────────────────────────────────
  readonly showConfirm    = signal(false);
  readonly pendingVendorId = signal<string | null>(null);

    /** Reference to vendor-selector for reverting the dropdown on cancel */
  readonly vendorSelector = viewChild(VendorSelectorComponent);

   /** Called when the vendor-selector emits a change */
  onVendorChange(vendorId: string): void {
    // No items or same vendor → switch directly
    if (!this.poStore.hasItems() || vendorId === this.vendorStore.selectedVendorId()) {
      this.switchVendor(vendorId);
      return;
    }
 
    // Items exist → ask user what to do
    this.pendingVendorId.set(vendorId);
    //this.oldVendorId.set(this.vendorStore.selectedVendorId());
    this.showConfirm.set(true);
  }
 
  /** User chose "Save Draft & Switch" */
  confirmSaveAndSwitch(): void {
    const vid = this.pendingVendorId();
    this.poStore.saveDraft();
    this.closeConfirm();
    if (vid) this.switchVendor(vid);
  }
 
  /** User chose "Discard & Switch" */
  confirmDiscardAndSwitch(): void {
    const vid = this.pendingVendorId();
    this.poStore.currentItems.set([]);
    this.poStore.editingId.set(null);
    this.closeConfirm();
    if (vid) this.switchVendor(vid);
  }
 
  /** User chose "Cancel" → stay with current vendor */
  confirmCancel(): void {
    this.closeConfirm();
    // Reset the native select back to the store's current value
    this.vendorSelector()?.revertSelection();
  }

  // ── Product helpers ───────────────────────────────────────────


  onAddProduct(product: VendorProduct): void {
    this.poStore.addProduct(product);
  }

  onAddAll(): void {
    this.poStore.addAllProducts(this.vendorStore.productsForVendor());
  }

  onSaveDraft(): void {
    if (this.poStore.saveDraft()) {
      this.poStore.navigateTo('orders');
    }
  }

  onSubmit(): void {
    this.poStore.submitOrder();
    this.poStore.navigateTo('orders');
  }

  isProductAdded(code: string): boolean {
    return this.poStore.currentItems().some(i => i.code === code);
  }

  get filteredCatalog(): VendorProduct[] {
    const q = this.productFilter().toLowerCase().trim();
    const all = this.vendorStore.productsForVendor();
    if (!q) return all;
    return all.filter(p => p.productName.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q));
  }
    // ── Private ───────────────────────────────────────────────────
  private switchVendor(vendorId: string): void {
    this.vendorStore.vendorSelected(vendorId);
    this.productFilter.set('');
    this.catalogCollapsed.set(false);
  }
 
  private closeConfirm(): void {
    this.showConfirm.set(false);
    this.pendingVendorId.set(null);
  }
}