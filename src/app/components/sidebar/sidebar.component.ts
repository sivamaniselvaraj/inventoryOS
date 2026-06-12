import { Component, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { VendorStore, ProductStore } from '../../store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  productStore = inject(ProductStore); 
  store = inject(VendorStore); 
  readonly sidebarOpen = signal(false);
  readonly isMobile = signal(window.innerWidth < 769);
  readonly totalProducts = this.productStore.totalProducts;
  readonly lowStockCount = computed(() => this.productStore.lowStockProducts().length);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 769);
    if (!this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

   toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }
}
