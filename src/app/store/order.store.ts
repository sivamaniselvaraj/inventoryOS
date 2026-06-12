import { Injectable, signal, computed, effect } from '@angular/core';
import { Product, OrderItem, Order } from '../models';

const GST_RATE = 0.18;
const STORAGE_KEY = 'ng_orders';

@Injectable({ providedIn: 'root' })
export class OrderStore {

  // ── Signals: current order being built ────────────────────────────
  readonly currentItems  = signal<OrderItem[]>([]);
  readonly editingId     = signal<string | null>(null);

  // ── Signals: saved orders ─────────────────────────────────────────
  readonly orders        = signal<Order[]>([]);

  // ── Signals: UI state ─────────────────────────────────────────────
  readonly activeView    = signal<'create' | 'orders' | 'detail'>('create');
  readonly selectedOrder = signal<Order | null>(null);
  readonly _notification = signal<{ message: string; type: 'success' | 'error' | 'info' | 'warn' } | null>(null);

  // ── Computed: order totals react to item changes ──────────────────
  readonly subtotal = computed(() =>
    this.currentItems().reduce((sum, item) => sum + item.totalByItem, 0)
  );

  readonly gstAmount = computed(() => this.subtotal() * GST_RATE);

  readonly orderTotal = computed(() => this.subtotal() + this.gstAmount());

  readonly gstRate = GST_RATE;

  readonly itemCount = computed(() => this.currentItems().length);

  readonly hasItems = computed(() => this.currentItems().length > 0);

  readonly notification = this._notification.asReadonly();

  // ── Computed: order list helpers ──────────────────────────────────
  readonly draftOrders = computed(() =>
    this.orders().filter(o => o.status === 'draft')
  );

  readonly submittedOrders = computed(() =>
    this.orders().filter(o => o.status === 'submitted')
  );

  readonly totalOrders = computed(() => this.orders().length);

  constructor() {
    // Hydrate from localStorage
    this.loadFromStorage();

    // Auto-persist on every change
    effect(() => {
      const data = this.orders();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    });
  }

  // ── Product → Order Item ──────────────────────────────────────────
  addProduct(product: Product): boolean {
    const exists = this.currentItems().find(i => i.code === product.productCode);
    if (exists) {
      this.showNotification('Already in order — adjust quantity below', 'warn');
      return false;
    }

    const item: OrderItem = {
      code: product.productCode,
      name: product.productName,
      unitPrice: product.unitPrice,
      sellingPrice: product.unitPrice,
      quantity: 1,
      totalByItem: product.unitPrice,
    };

    this.currentItems.update(items => [...items, item]);
    return true;
  }

  // ── Update a single item field ────────────────────────────────────
  updateItem(code: string, field: 'sellingPrice' | 'quantity', value: number): void {
    this.currentItems.update(items =>
      items.map(item => {
        if (item.code !== code) return item;

        const updated = { ...item, [field]: value };
        updated.totalByItem = updated.quantity * updated.sellingPrice;
        return updated;
      })
    );
  }

  // ── Remove item ───────────────────────────────────────────────────
  removeItem(code: string): void {
    this.currentItems.update(items => items.filter(i => i.code !== code));
  }

  // ── Save as Draft ─────────────────────────────────────────────────
  saveDraft(): boolean {
    if (!this.hasItems()) {
      this.showNotification('Add at least one product', 'warn');
      return false;
    }

    const now = new Date();
    const order: Order = {
      id: this.editingId() ?? this.generateId(),
      items: [...this.currentItems()],
      subtotal: this.subtotal(),
      gst: this.gstAmount(),
      gstRate: GST_RATE,
      total: this.orderTotal(),
      status: 'draft',
      createdAt: this.editingId()
        ? (this.orders().find(o => o.id === this.editingId())?.createdAt ?? now)
        : now,
      updatedAt: now,
    };

    if (this.editingId()) {
      this.orders.update(list => list.map(o => o.id === order.id ? order : o));
    } else {
      this.orders.update(list => [order, ...list]);
    }

    this.resetCurrent();
    this.showNotification('Draft saved');
    return true;
  }

  // ── Submit an order (from draft or directly) ──────────────────────
  submitOrder(orderId?: string): void {
    if (orderId) {
      // Submit existing draft
      this.orders.update(list =>
        list.map(o => o.id === orderId
          ? { ...o, status: 'submitted' as const, updatedAt: new Date() }
          : o
        )
      );
      // Update detail view if open
      const sel = this.selectedOrder();
      if (sel?.id === orderId) {
        this.selectedOrder.set({ ...sel, status: 'submitted' });
      }
      this.showNotification('Order submitted');
    } else {
      // Save current items and submit immediately
      if (!this.hasItems()) {
        this.showNotification('Add at least one product', 'warn');
        return;
      }
      const saved = this.saveDraft();
      if (saved) {
        const latest = this.orders()[0];
        if (latest?.status === 'draft') {
          this.submitOrder(latest.id);
        }
      }
    }
  }

  // ── Edit a draft ──────────────────────────────────────────────────
  editDraft(order: Order): void {
    this.currentItems.set([...order.items]);
    this.editingId.set(order.id);
    this.activeView.set('create');
  }

  // ── Delete a draft ────────────────────────────────────────────────
  deleteDraft(orderId: string): void {
    this.orders.update(list => list.filter(o => o.id !== orderId));
    if (this.selectedOrder()?.id === orderId) {
      this.selectedOrder.set(null);
      this.activeView.set('orders');
    }
    this.showNotification('Draft deleted');
  }

  // ── Navigation ────────────────────────────────────────────────────
  navigateTo(view: 'create' | 'orders' | 'detail'): void {
    this.activeView.set(view);
  }

  viewOrderDetail(order: Order): void {
    this.selectedOrder.set(order);
    this.activeView.set('detail');
  }

  backToList(): void {
    this.selectedOrder.set(null);
    this.activeView.set('orders');
  }

  // ── Toast ─────────────────────────────────────────────────────────
  showNotification(message: string, type: 'success' | 'error' | 'info' | 'warn' = 'success') {
    this._notification.set({ message, type });
    setTimeout(() => this._notification.set(null), 3500);
  }

  // ── Private helpers ───────────────────────────────────────────────
  private resetCurrent(): void {
    this.currentItems.set([]);
    this.editingId.set(null);
  }

  private generateId(): string {
    return 'ORD-' + Date.now().toString(36).toUpperCase();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Order[] = JSON.parse(raw);
        // Rehydrate dates
        parsed.forEach(o => {
          o.createdAt = new Date(o.createdAt);
          o.updatedAt = new Date(o.updatedAt);
        });
        this.orders.set(parsed);
      }
    } catch {
      this.orders.set([]);
    }
  }
}
