import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductSearchComponent } from '../product-search/product-search.component';
import { WhatsappService } from '../../../services/whatsapp.service';
import { OrderStore } from '../../../store';
import { Product } from '../../../models';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [FormsModule, DecimalPipe, ProductSearchComponent],
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.scss',
})
export class OrderCreateComponent {
  readonly store = inject(OrderStore);
  readonly whatsapp = inject(WhatsappService);
  readonly Math = Math;

  onProductSelected(product: Product): void {
    this.store.addProduct(product);
  }

  onSaveDraft(): void {
    if (this.store.saveDraft()) {
      this.store.navigateTo('orders');
    }
  }

  onSubmit(): void {
    this.store.submitOrder();
    console.log(this.store.orders()[0]);
    this.whatsapp.send(this.store.orders()[0]);
    this.store.navigateTo('orders');
  }
}
