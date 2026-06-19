import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { POLineItem, PurchaseOrder, Vendor, Product, VendorProduct } from '../models';
import { UserStore } from './user.store';
import { VendorStore } from './vendor.store';

const STORAGE_KEY = 'ng_purchase_orders';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderStore {
  private readonly userStore = inject(UserStore);
  private readonly vendorStore   = inject(VendorStore);

  // ── Current PO being built ────────────────────────────────────
  readonly currentItems = signal<POLineItem[]>([]);
  readonly editingId    = signal<string | null>(null);

  // ── Saved POs ─────────────────────────────────────────────────
  readonly orders = signal<PurchaseOrder[]>([]);

  // ── UI state ──────────────────────────────────────────────────
  readonly activeView    = signal<'create' | 'orders' | 'detail'>('create');
  readonly selectedOrder = signal<PurchaseOrder | null>(null);
  readonly toastMessage  = signal<{ text: string; type: 'success' | 'warn' } | null>(null);

  // ── Computed: current PO totals ───────────────────────────────
  readonly subtotal = computed(() =>
    this.currentItems().reduce((s, i) => s + (i.unitPrice * i.quantity), 0)
  );

  readonly totalGst = computed(() =>
    this.currentItems().reduce((s, i) => s + i.gstAmount, 0)
  );

  readonly totalDiscount = computed(() =>
    this.currentItems().reduce((s, i) => s + i.discountAmount, 0)
  );

  readonly grandTotal = computed(() =>
    this.subtotal() + this.totalGst() - this.totalDiscount()
  );

  readonly itemCount = computed(() => this.currentItems().length);
  readonly hasItems  = computed(() => this.currentItems().length > 0);

  // ── Computed: order lists ─────────────────────────────────────
  readonly draftOrders     = computed(() => this.orders().filter(o => o.status === 'draft'));
  readonly submittedOrders = computed(() => this.orders().filter(o => o.status === 'submitted'));
  readonly totalOrders     = computed(() => this.orders().length);

  constructor() {
    this.loadFromStorage();
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders()));
    });
  }

  // ── Add product as line item ──────────────────────────────────
  addProduct(product: VendorProduct): boolean {
    if (this.currentItems().find(i => i.code === product.productCode)) {
      this.showToast('Already in order — adjust quantity below', 'warn');
      return false;
    }

    const base = product.unitPrice;
    const gstAmt = product.gstPercent ? base * product.gstPercent / 100 : 0;

    const item: POLineItem = {
      code: product.productCode,
      name: product.productName,
      unitPrice: product.unitPrice,
      quantity: 1,
      gstPercent: product.gstPercent,
      gstAmount: gstAmt,
      discountPercent: 0,
      discountAmount: 0,
      lineTotal: base + gstAmt,
    };

    this.currentItems.update(items => [...items, item]);
    return true;
  }

  // ── Update a line item field ──────────────────────────────────
  updateItem(code: string, field: 'quantity' | 'discountPercent', value: number): void {
    this.currentItems.update(items =>
      items.map(item => {
        if (item.code !== code) return item;
        const updated = { ...item, [field]: value };
        return this.recalcLine(updated);
      })
    );
  }

  // ── Remove item ───────────────────────────────────────────────
  removeItem(code: string): void {
    this.currentItems.update(items => items.filter(i => i.code !== code));
  }

  // ── Add all vendor products at once ───────────────────────────
  addAllProducts(products: VendorProduct[]): void {
    let added = 0;
    products.forEach(p => {
      if (!this.currentItems().find(i => i.code === p.productCode)) {
        this.addProduct(p);
        added++;
      }
    });
    if (added > 0) this.showToast(`${added} product${added > 1 ? 's' : ''} added`);
    else this.showToast('All products already added', 'warn');
  }

  // ── Save as Draft ─────────────────────────────────────────────
  saveDraft(): boolean {
    if (!this.hasItems()) {
      this.showToast('Add at least one product', 'warn');
      return false;
    }

    const loc = this.userStore.selectedLocation();
    const vendor = this.vendorStore.selectedVendor();
    if (!loc || !vendor) {
      this.showToast('Select location and vendor first', 'warn');
      return false;
    }

    const now = new Date();
    const po: PurchaseOrder = {
      id: this.editingId() ?? this.generateId(),
      locationId: loc.id,
      locationName: `${loc.name} (${loc.city})`,
      vendorId: vendor.id,
      vendorName: vendor.vendorName,
      items: [...this.currentItems()],
      subtotal: this.subtotal(),
      totalGst: this.totalGst(),
      totalDiscount: this.totalDiscount(),
      grandTotal: this.grandTotal(),
      status: 'draft',
      createdAt: this.editingId()
        ? (this.orders().find(o => o.id === this.editingId())?.createdAt ?? now)
        : now,
      updatedAt: now,
    };

    if (this.editingId()) {
      this.orders.update(list => list.map(o => o.id === po.id ? po : o));
    } else {
      this.orders.update(list => [po, ...list]);
    }

    this.resetCurrent();
    this.showToast('Draft saved');
    return true;
  }

  // ── Submit ────────────────────────────────────────────────────
  submitOrder(orderId?: string): void {
    if (orderId) {
      this.orders.update(list =>
        list.map(o => o.id === orderId
          ? { ...o, status: 'submitted' as const, updatedAt: new Date() }
          : o
        )
      );
      const sel = this.selectedOrder();
      if (sel?.id === orderId) {
        this.selectedOrder.set({ ...sel, status: 'submitted' });
      }
      this.showToast('PO submitted');
    } else {
      if (!this.hasItems()) { this.showToast('Add products first', 'warn'); return; }
      const saved = this.saveDraft();
      if (saved) {
        const latest = this.orders()[0];
        if (latest?.status === 'draft') this.submitOrder(latest.id);
      }
    }
  }

  editDraft(po: PurchaseOrder): void {
    const vendorDetails: Vendor | undefined = this.vendorStore.getVendorById(po.vendorId);
    this.userStore.selectLocation(po.locationId);
    this.vendorStore.selectVendor(vendorDetails??null);
    this.currentItems.set([...po.items]);
    this.editingId.set(po.id);
    this.activeView.set('create');
  }

  deleteDraft(orderId: string): void {
    this.orders.update(list => list.filter(o => o.id !== orderId));
    if (this.selectedOrder()?.id === orderId) {
      this.selectedOrder.set(null);
      this.activeView.set('orders');
    }
    this.showToast('Draft deleted');
  }

  // ── Navigation ────────────────────────────────────────────────
  navigateTo(view: 'create' | 'orders' | 'detail'): void { this.activeView.set(view); }
  viewDetail(po: PurchaseOrder): void { this.selectedOrder.set(po); this.activeView.set('detail'); }
  backToList(): void { this.selectedOrder.set(null); this.activeView.set('orders'); }

  showToast(text: string, type: 'success' | 'warn' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 2500);
  }

  // ── Private helpers ───────────────────────────────────────────
  private recalcLine(item: POLineItem): POLineItem {
    const base = item.unitPrice * item.quantity;
    const gstRate = item.gstPercent ? base * item.gstPercent / 100 : 0;
    item.gstAmount = Math.round(gstRate);
    item.discountAmount = Math.round(base * item.discountPercent / 100 * 100) / 100;
    item.lineTotal = base + item.gstAmount - item.discountAmount;
    return item;
  }

  private resetCurrent(): void {
    this.currentItems.set([]);
    this.editingId.set(null);
  }

  private generateId(): string {
    return 'PO-' + Date.now().toString(36).toUpperCase();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PurchaseOrder[] = JSON.parse(raw);
        parsed.forEach(o => { o.createdAt = new Date(o.createdAt); o.updatedAt = new Date(o.updatedAt); });
        this.orders.set(parsed);
      }
    } catch { this.orders.set([]); }
  }
}