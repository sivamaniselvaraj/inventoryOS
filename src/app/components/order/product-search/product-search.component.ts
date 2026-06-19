import { Component, inject, output, signal, ElementRef, viewChild } from '@angular/core';
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

  // ── Keyboard navigation signal ────────────────────────────────
  readonly activeIndex = signal(-1);

  // Ref to the dropdown list for scroll-into-view
  readonly dropdownRef = viewChild<ElementRef>('dropdownList');


  selectProduct(product: Product): void {
    this.productSelected.emit(product);
    this.store.clearSearch();
    this.dropdownOpen.set(false);
    this.activeIndex.set(-1);
  }

   onBlur(): void {
    setTimeout(() => {
      this.dropdownOpen.set(false);
      this.activeIndex.set(-1);
    }, 200);
  }

  onFocus(): void {
    this.dropdownOpen.set(true);
    this.activeIndex.set(-1);
  }

  /** Reset active index whenever search query changes */
  onQueryChange(value: string): void {
    this.store.updateSearch(value);
    this.activeIndex.set(-1);
    this.dropdownOpen.set(true);
  }

  /** Handle keyboard navigation in the dropdown */
  onKeydown(event: KeyboardEvent): void {
    
    const results = this.store.filteredProducts();
    const isOpen = this.dropdownOpen() && this.store.hasQuery() && results.length > 0;

    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(i => (i + 1) % results.length);
        this.scrollActiveIntoView();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => (i <= 0 ? results.length - 1 : i - 1));
        this.scrollActiveIntoView();
        break;

      case 'Enter':
        event.preventDefault();
        const idx = this.activeIndex();
        if (idx >= 0 && idx < results.length) {
          this.selectProduct(results[idx]);
        }
        break;

      case 'Escape':
        this.dropdownOpen.set(false);
        this.activeIndex.set(-1);
        break;
    }
  }

  /** Scroll the highlighted item into view within the dropdown */
  private scrollActiveIntoView(): void {
    // Small delay so the DOM updates first
    requestAnimationFrame(() => {
      const list = this.dropdownRef()?.nativeElement as HTMLElement | undefined;
      if (!list) return;
      const active = list.querySelector('.item-active') as HTMLElement | null;
      active?.scrollIntoView({ block: 'nearest' });
    });
  }


}
