import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard',
  },
  /* Vendors Router */
  {
    path: 'vendors',
    loadComponent: () =>
      import('./components/vendor/vendor-list/vendor-list.component').then(
        (m) => m.VendorListComponent,
      ),
    title: 'Vendors',
  },
  {
    path: 'vendors/new',
    loadComponent: () =>
      import('./components/vendor/vendor-form/vendor-form.component').then(
        (m) => m.VendorFormComponent,
      ),
    title: 'Add Vendor',
  },
  {
    path: 'vendors/:id',
    loadComponent: () =>
      import('./components/vendor/vendor-detail/vendor-detail.component').then(
        (m) => m.VendorDetailComponent,
      ),
    title: 'Vendors Details',
  },
  {
    path: 'vendors/:id/edit',
    loadComponent: () =>
      import('./components/vendor/vendor-form/vendor-form.component').then(
        (m) => m.VendorFormComponent,
      ),
    title: 'Edit Vendor',
  },
  {
    path: 'vendors/:id/products',
    loadComponent: () =>
      import('./components/vendor/product-link/product-link.component').then(
        (m) => m.ProductLinkComponent,
      ),
  },
  /* Products Router */
  {
    path: 'products',
    loadComponent: () =>
      import('./components/product/product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
    title: 'Products',
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./components/product/product-form/product-form.component').then(
        (m) => m.ProductFormComponent,
      ),
    title: 'Add Product',
  },
  {
    path: 'products/:code',
    loadComponent: () =>
      import('./components/product/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent,
      ),
    title: 'Product Details',
  },
  {
    path: 'products/:code/edit',
    loadComponent: () =>
      import('./components/product/product-form/product-form.component').then(
        (m) => m.ProductFormComponent,
      ),
    title: 'Edit Product',
  },
  {
    path: 'products/:code/vendors',
    loadComponent: () =>
      import('./components/product/product-vendor/product-vendor.component').then(
        (m) => m.ProductVendorComponent,
      ),
    title: 'Product Vendors',
  },
  /* Order Router */
  {
    path: 'orders',
    loadComponent: () =>
      import('./components/order/order-create/order-create.component').then(
        (m) => m.OrderCreateComponent,
      ),
    title: 'Orders',
  },
  /* Purchase Order Router */
  {
    path: 'purchaseorders',
    loadComponent: () =>
      import('./components/order/purchase-order/po-create.component').then(
        (m) => m.PoCreateComponent,
      ),
    title: 'Purchase Orders',
  },
  { path: '**', redirectTo: 'dashboard' },
];
