import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { Router, RouterLink } from '@angular/router';
import {
  ColDef,
  GridReadyEvent,
  GridApi,
  ICellRendererParams,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
  SizeColumnsToContentStrategy,
} from 'ag-grid-community';
import { VendorStore } from '../../../store';
import { Vendor } from '../../../models';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular, RouterLink],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.scss',
})
export class VendorListComponent implements OnInit {
  store = inject(VendorStore);
  notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly isMobileView = signal(window.innerWidth < 769);

  readonly showDeleteConfirm = signal<string | null>(null);

  readonly paginationPageSize = 15;
  readonly paginationPageSizeSelector = [10, 15, 25, 50];

  private gridApi!: GridApi;
  //gridTheme = themeQuartz;

  /** Used by the @placeholder skeleton */
  readonly skeletonRows = Array.from({ length: 9 }, (_, i) => i);

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

  colDefs: ColDef<Vendor>[] = [
    {
      field: 'vendorName',
      headerName: 'Vendor Name',
      flex: 2,
      minWidth: 180,
      //pinned: this.isMobileView() ? undefined : 'left',
    },
    { headerName: 'Contacts', flex: 0.7, minWidth: 85,
      valueGetter: (p: any) => p.data.contacts.length,
      cellRenderer: (p: any) =>
        `<span style="background:var(--color-accent-muted);color:var(--color-accent);padding:2px 8px;border-radius:20px;font-size:12px;font-weight:600">${p.value}</span>` },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 120,
      cellRenderer: (p: any) =>
        `<span style="background:var(--color-accent-muted);color:var(--color-accent);padding:2px 8px;border-radius:6px;font-size:12px;font-weight:600;text-transform:capitalize">${p.value}</span>`,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 110,
      cellRenderer: (p: any) => {
        const c: any = {
          active: '#22c55e',
          inactive: '#94a3b8',
          pending: '#f59e0b',
          suspended: '#ef4444',
        };
        const b: any = {
          active: 'rgba(34,197,94,0.15)',
          inactive: 'rgba(148,163,184,0.15)',
          pending: 'rgba(245,158,11,0.15)',
          suspended: 'rgba(239,68,68,0.15)',
        };
        return `<span style="background:${b[p.value]};color:${c[p.value]};padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize">${p.value}</span>`;
      },
    },
    {
      field: 'contractValue',
      headerName: 'Contract Value',
      flex: 1.2,
      minWidth: 140,
      type: 'numericColumn',
      valueFormatter: (p) => (p.value ? `₹${(p.value as number).toLocaleString('en-IN')}` : '—'),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      flex: 0.8,
      minWidth: 90,
      type: 'numericColumn',
      cellRenderer: (p: any) =>
        `<span>${Number(p.value).toFixed(1)}</span>`,
    },
    {
      headerName: 'Actions',
      flex: 1,
      minWidth: 130,
      sortable: false,
      filter: false,

       cellRenderer: (params: ICellRendererParams<Vendor>) => {
              const container = document.createElement('div');
              container.className = 'action-cell';

              const viewBtn = document.createElement('button');
              viewBtn.className = 'btn btn-ghost btn-sm';
              viewBtn.title = 'View';
              viewBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px">visibility</span>';
              viewBtn.addEventListener('click', () => this.viewVendor(params.data!.id));

              const editBtn = document.createElement('button');
              editBtn.className = 'btn btn-ghost btn-sm';
              editBtn.title = 'Edit';
              editBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px">edit</span>';
              editBtn.addEventListener('click', () => this.editVendor(params.data!.id));
  
              const deleteBtn = document.createElement('button');
              deleteBtn.className = 'btn btn-ghost btn-sm';
              deleteBtn.title = 'Delete';
              deleteBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px;color:var(--color-danger)">delete_outline</span>';
              deleteBtn.addEventListener('click', () => this.showDeleteConfirm.set(params.data!.id));
      
              container.appendChild(viewBtn);
              container.appendChild(editBtn);
              container.appendChild(deleteBtn);
              return container;
            },
    },
  ];

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
  }
  onRowClicked(e: any) {
    if (!(e.event?.target as HTMLElement)?.tagName?.match(/BUTTON/i))
      this.store.selectVendor(e.data);
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this.isMobileView.set(window.innerWidth < 769);
    });
  }

  confirmDelete(): void {
    const id = this.showDeleteConfirm();
    if (!id) return;
    const vendor = this.store.getVendorById(id);
    if (vendor && this.store.deleteVendor(id)) {
      this.notify.success(`"${vendor.vendorName}" deleted`);
    }
    this.showDeleteConfirm.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(null);
  }

  getDeleteVendorName(): string {
    const id = this.showDeleteConfirm();
    if (!id) return '';
    return this.store.getVendorById(id)?.vendorName ?? '';
  }

  formatCurrency(value: number): string {
    return `₹${value.toLocaleString('en-IN')}`;
  }

  onCardClick(vendor: Vendor) {
    this.store.selectVendor(vendor);
  }

  onCardEdit(event: MouseEvent, vendor: Vendor) {
    event.stopPropagation();
    this.store.openEditForm(vendor);
  }
  onCardView(event: MouseEvent, vendor: Vendor) {
    event.stopPropagation();
    //this.store.selectVendor(vendor);
    this.viewVendor(vendor.id);
  }

  onCardDelete(event: MouseEvent, vendor: Vendor) {
    event.stopPropagation();
    if (confirm(`Delete "${vendor.vendorName}"?`)) this.store.deleteVendor(vendor.id);
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  editVendor(id: string): void {
    this.router.navigate(['/vendors', id, 'edit']);
  }
  viewVendor(id: string): void {
    this.router.navigate(['/vendors', id]);
  }

    /** Helper: get primary contact from a vendor */
  private primaryContact(v: Vendor) {
    return v.contacts.find(c => c.isPrimary) || v.contacts[0];
  }

  primaryName(vendor: Vendor): string {
    const c = this.primaryContact(vendor);
    return c?.name || '—';
  }

  primaryEmail(vendor: Vendor): string {
    const c = this.primaryContact(vendor);
    return c?.email || '—';
  }

  contactCount(vendor: Vendor): number {
    return vendor.contacts.length;
  }

}
