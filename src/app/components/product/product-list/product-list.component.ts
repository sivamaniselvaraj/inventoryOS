import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
  SizeColumnsToContentStrategy,
} from 'ag-grid-community';
import { ProductStore, VendorStore } from '../../../store';
import { NotificationService } from '../../../services/notification.service';
import { Product } from '../../../models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [AgGridModule, FormsModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly router = inject(Router);
  readonly productStore = inject(ProductStore);
  private readonly vendorStore = inject(VendorStore);
  private readonly notify = inject(NotificationService);

  private gridApi!: GridApi<Product>;
  readonly searchValue = signal('');
  readonly isMobileView = signal(window.innerWidth < 769);
  readonly showDeleteConfirm = signal<string | null>(null);

  // ── Stats ──
  readonly totalInventoryValue = this.productStore.totalInventoryValue;
  readonly lowStockProducts = this.productStore.lowStockProducts;

  // ── Grid Config ──
  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    minWidth: 100,
  };

  readonly autoSizeStrategy:
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy = {
    type: 'fitGridWidth',
    defaultMinWidth: 100,
  };

  readonly columnDefs: ColDef<Product>[] = [
    {
      headerName: 'Code',
      field: 'productCode',
      width: 120,
      pinned: this.isMobileView() ? undefined : 'left',
      cellClass: 'cell-code',
    },
    {
      headerName: 'Product Name',
      field: 'productName',
      flex: 2,
      minWidth: 180,
    },
    {
      headerName: 'Unit Price',
      field: 'unitPrice',
      width: 120,
      type: 'numericColumn',
      valueFormatter: (p) => p.value != null ? `₹${p.value.toLocaleString('en-IN')}` : '',
    },
    {
      headerName: 'Selling Price',
      field: 'sellingPrice',
      width: 130,
      type: 'numericColumn',
      valueFormatter: (p) => p.value != null ? `₹${p.value.toLocaleString('en-IN')}` : '',
    },
    {
      headerName: 'Stock',
      field: 'unitsAvailable',
      width: 100,
      type: 'numericColumn',
      cellClass: (params) => {
        const product = params.data;
        if (!product) return '';
        if (product.reorderLevel && product.unitsAvailable <= product.reorderLevel) return 'cell-low-stock';
        return '';
      },
    },
    {
      headerName: 'UoM',
      field: 'unitOfMeasure',
      width: 100,
    },
    {
      headerName: 'Batch',
      field: 'batchNumber',
      width: 140,
      cellClass: 'cell-code',
    },
    {
      headerName: 'Manufacturer',
      field: 'manufacturedBy',
      flex: 1,
      minWidth: 140,
    },
    {
      headerName: 'Actions',
      field: 'id',
      width: 150,
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: (params: ICellRendererParams<Product>) => {
        const container = document.createElement('div');
        container.className = 'action-cell';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-ghost btn-sm';
        editBtn.title = 'Edit';
        editBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px">edit</span>';
        editBtn.addEventListener('click', () => this.editProduct(params.data!.id));

        const vendorBtn = document.createElement('button');
        vendorBtn.className = 'btn btn-ghost btn-sm';
        vendorBtn.title = 'Vendors';
        vendorBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px">group</span>';
        vendorBtn.addEventListener('click', () => this.manageVendors(params.data!.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-ghost btn-sm';
        deleteBtn.title = 'Delete';
        deleteBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px;color:var(--color-danger)">delete_outline</span>';
        deleteBtn.addEventListener('click', () => this.showDeleteConfirm.set(params.data!.id));

        container.appendChild(editBtn);
        container.appendChild(vendorBtn);
        container.appendChild(deleteBtn);
        return container;
      },
    },
  ];

  readonly paginationPageSize = 15;
  readonly paginationPageSizeSelector = [10, 15, 25, 50];

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this.isMobileView.set(window.innerWidth < 769);
    });
  }

  onGridReady(event: GridReadyEvent<Product>): void {
    this.gridApi = event.api;
  }

  onSearchChange(term: string): void {
    this.searchValue.set(term);
    this.productStore.setSearchTerm(term);
  }

  editProduct(id: string): void {
    this.router.navigate(['/products', id, 'edit']);
  }

  manageVendors(id: string): void {
    this.router.navigate(['/products', id, 'vendors']);
  }

  confirmDelete(): void {
    const id = this.showDeleteConfirm();
    if (!id) return;
    const product = this.productStore.getProductById(id);
    if (product && this.productStore.deleteProduct(id)) {
      this.notify.success(`"${product.productName}" deleted`);
    }
    this.showDeleteConfirm.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(null);
  }

  getDeleteProductName(): string {
    const id = this.showDeleteConfirm();
    if (!id) return '';
    return this.productStore.getProductById(id)?.productName ?? '';
  }

  formatCurrency(value: number): string {
    return `₹${value.toLocaleString('en-IN')}`;
  }
}
