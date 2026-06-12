import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VendorStore } from '../../../store';
import { Vendor } from '../../../models';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vendor-detail.component.html',
  styleUrl: './vendor-detail.component.scss'
})
export class VendorDetailComponent implements OnInit{
  //@Input() vendor!: Vendor;

  vendor!: Vendor | undefined;

  store = inject(VendorStore);
  private readonly route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly notify = inject(NotificationService);

  get initials(): string | undefined {
    return this.vendor?.vendorName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  contactInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  get statusBadgeClass(): string {
    switch (this.vendor?.status) {
      case 'active':    return 'badge badge-success';
      case 'pending':   return 'badge badge-warning';
      case 'suspended': return 'badge badge-danger';
      default:          return 'badge badge-info';
    }
  }

  ngOnInit(): void {
     const id = this.route.snapshot.paramMap.get('id');
    if (id) {
       this.vendor = this.store.getVendorById(id);
      if (!this.vendor) {
        this.notify.error('Vendor not found');
        this.router.navigate(['/vendors']);
      }
    }
  }

  onEdit(): void {
    this.router.navigate(['/vendors', this.vendor?.id, 'edit']);
  }

  onDelete(): void {
    if (confirm(`Delete "${this.vendor?.vendorName}"?`)) {
      this.store.deleteVendor(this.vendor?.id+"");
    }
  }
}
