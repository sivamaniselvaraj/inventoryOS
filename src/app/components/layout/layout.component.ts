import { Component, signal, computed, inject, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { VendorStore, ProductStore } from '../../store';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly productStore = inject(ProductStore);
  private readonly vendorStore = inject(VendorStore);
  readonly notificationService = inject(NotificationService);
  readonly authStore = inject(AuthStore);

  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly isMobile = signal(window.innerWidth < 769);
  readonly totalVendors = this.vendorStore.stats().total;
  readonly totalProducts = this.productStore.totalProducts;
  readonly lowStockCount = computed(() => this.productStore.lowStockProducts().length);

  /** Effective sidebar width CSS class for main area offset */
  readonly sidebarState = computed(() => {
    if (this.isMobile()) return 'mobile';
    return this.sidebarCollapsed() ? 'collapsed' : 'expanded';
  });

  readonly showLogoutConfirm = signal(false);

  ngOnInit(): void {
    // Restore collapsed preference from localStorage
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') {
      this.sidebarCollapsed.set(true);
    }
  }

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

  toggleCollapse(): void {
    this.sidebarCollapsed.update((v) => !v);
    localStorage.setItem('sidebar_collapsed', String(this.sidebarCollapsed()));
  }

  closeSidebar(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  promptLogout(): void {
    this.showLogoutConfirm.set(true);
  }

  cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }

  confirmLogout(): void {
    this.authStore.logout();
    this.showLogoutConfirm.set(false);
    this.notificationService.success('You have been logged out');
    // In a real app: this.router.navigate(['/login']);
  }
}
