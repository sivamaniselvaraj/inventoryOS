import { Injectable, signal, computed } from '@angular/core';
import { ProductVendorLink } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductVendorStore {
  private readonly _links = signal<ProductVendorLink[]>([
    { productCode: 'PRD-1001', vendorId: 'v001', isPreferred: true, unitPrice: 2000, productName: 'Wireless Bluetooth Headphones' },
    { productCode: 'PRD-1001', vendorId: 'v002', isPreferred: false, unitPrice: 2100, productName: 'Wireless Bluetooth Headphones' },
    { productCode: 'PRD-1002', vendorId: 'v003', isPreferred: true, unitPrice: 280, productName: 'Organic Green Tea (250g)' },
    { productCode: 'PRD-1002', vendorId: 'v005', isPreferred: false, unitPrice: 300, productName: 'Organic Green Tea (250g)' },
    { productCode: 'PRD-1003', vendorId: 'v006', isPreferred: true, unitPrice: 450, productName: 'Stainless Steel Water Bottle (750ml)' },
    { productCode: 'PRD-1004', vendorId: 'v001', isPreferred: false, unitPrice: 980, productName: 'USB-C Fast Charger 65W' },
    { productCode: 'PRD-1004', vendorId: 'v002', isPreferred: true, unitPrice: 950, productName: 'USB-C Fast Charger 65W' },
    { productCode: 'PRD-1004', vendorId: 'v004', isPreferred: false, unitPrice: 1000, productName: 'USB-C Fast Charger 65W' },
    { productCode: 'PRD-1004', vendorId: 'v007', isPreferred: false, unitPrice: 999, productName: 'USB-C Fast Charger 65W' },
  ]);

  readonly links = this._links.asReadonly();

  /** All links for a specific product */
  getLinksForProduct(productCode: string): ProductVendorLink[] {
    return this._links().filter((l) => l.productCode === productCode);
  }

  /** All links for a specific vendor */
  getLinksForVendor(vendorId: string): ProductVendorLink[] {
    return this._links().filter((l) => l.vendorId === vendorId);
  }

  /** Vendor IDs linked to a product */
  getVendorIdsForProduct(productCode: string): string[] {
    return this.getLinksForProduct(productCode).map((l) => l.vendorId);
  }

  /** Get the preferred link for a product */
  getPreferredLink(productCode: string): ProductVendorLink | undefined {
    return this._links().find((l) => l.productCode === productCode && l.isPreferred);
  }


  /** Add a vendor link */
  addLink(productCode: string, productName: string, vendorId: string, unitPrice: number): void {
    const exists = this._links().some((l) => l.productCode === productCode && l.vendorId === vendorId);
    if (exists) return;
    const isFirst = this.getLinksForProduct(productCode).length === 0;
    this._links.update((list) => [
      ...list,
      { productCode, productName, vendorId, isPreferred: isFirst, unitPrice },
    ]);
  }

  /** Remove a vendor link */
  removeLink(productCode: string, vendorId: string): void {
    const wasPreferred = this._links().find(
      (l) => l.productCode === productCode && l.vendorId === vendorId
    )?.isPreferred;

    this._links.update((list) =>
      list.filter((l) => !(l.productCode === productCode && l.vendorId === vendorId))
    );

    // If removed link was preferred, promote the first remaining
    if (wasPreferred) {
      const remaining = this.getLinksForProduct(productCode);
      if (remaining.length > 0) {
        this.setPreferred(productCode, remaining[0].vendorId);
      }
    }
  }

  /** Set a vendor as preferred for a product */
  setPreferred(productCode: string, vendorId: string | null): void {
    this._links.update((list) =>
      list.map((l) => {
        if (l.productCode !== productCode) return l;
        return { ...l, isPreferred: l.vendorId === vendorId };
      })
    );
  }

  /** Update the unit price for a link */
  updateUnitPrice(productCode: string, vendorId: string, unitPrice: number): void {
    this._links.update((list) =>
      list.map((l) => {
        if (l.productCode !== productCode || l.vendorId !== vendorId) return l;
        return { ...l, unitPrice };
      })
    );
  }
}