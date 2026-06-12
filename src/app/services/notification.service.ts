import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this._add(message, 'success');
  }

  error(message: string): void {
    this._add(message, 'error');
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private _add(message: string, type: Toast['type']): void {
    const id = ++this._counter;
    this.toasts.update((list) => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
