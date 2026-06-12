import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductSearchStore } from '../../../store';
import { Product } from '../../../models';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.scss',
})
export class ProductSearchComponent {
  readonly store = inject(ProductSearchStore);
  readonly productSelected = output<Product>();
  readonly dropdownOpen = signal(false);

  selectProduct(product: Product): void {
    this.productSelected.emit(product);
    this.store.clearSearch();
    this.dropdownOpen.set(false);
  }

  onBlur(): void {
    setTimeout(() => this.dropdownOpen.set(false), 200);
  }
}
