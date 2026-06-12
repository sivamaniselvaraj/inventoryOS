import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { VendorStore } from '../../../store';
import { Vendor, VendorContact, ContactRole } from '../../../models';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-vendor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vendor-form.component.html',
  styleUrl: './vendor-form.component.scss',
})
export class VendorFormComponent implements OnInit {
  readonly vendorStore = inject(VendorStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotificationService);

  readonly isEditMode = signal(false);
  readonly vendorId = signal<string | null>(null);
  readonly saving = signal(false);

  submitted = false;

  form!: FormGroup;

  createContactGroup(contact?: Partial<VendorContact>): FormGroup {
    return this.fb.group({
      //id:        [contact?.id    ?? this.uid()],
      name: [contact?.name ?? '', Validators.required],
      email: [contact?.email ?? '', [Validators.required, Validators.email]],
      phone: [contact?.phone ?? '', Validators.required],
      role: [contact?.role ?? 'other'],
      isPrimary: [contact?.isPrimary ?? false],
    });
  }

   readonly roleOptions: { value: ContactRole; label: string }[] = [
    { value: 'primary',    label: 'Primary' },
    { value: 'billing',    label: 'Billing' },
    { value: 'technical',  label: 'Technical' },
    { value: 'operations', label: 'Operations' },
    { value: 'management', label: 'Management' },
    { value: 'other',      label: 'Other' },
  ];

  // formVendor: Partial<Vendor> = {
  //   vendorName: '', contactPerson: '', email: '', phone: '', address: '',
  //   city: '', country: 'India', status: 'active', category: undefined,
  //   contractValue: 0, rating: 4.0, joinedDate: '', lastActivity: '',
  //   taxId: '', website: '', notes: ''
  // };

  readonly pageTitle = computed(() => (this.isEditMode() ? 'Edit Vendor' : 'Add New Vendor'));

  ngOnInit() {
    this.initForm();
    const vendor_id = this.route.snapshot.paramMap.get('id');
    if (vendor_id) {
      const vendor = this.vendorStore.getVendorById(vendor_id);
      if (vendor) {
        this.isEditMode.set(true);
        this.vendorId.set(vendor_id);
        this.patchForm(vendor);
      } else {
        this.notify.error('Vendor not found');
        this.router.navigate(['/vendors']);
      }
    } else {
      // New vendor starts with one empty primary contact
      this.addContact(true);
    }
  }

  private initForm(): void {
    console.log('in');
    this.form = this.fb.group({
      vendorCode: ['', [Validators.required, Validators.maxLength(30)]],
      vendorName: ['', [Validators.required, Validators.maxLength(150)]],
      //contacts form array
      contacts: this.fb.array<FormGroup>([], Validators.minLength(1)),
      website: ['', [Validators.maxLength(500)]],
      taxId: ['', [Validators.required, Validators.minLength(20)]],
      address: ['', [Validators.maxLength(50)]],
      city: [''],
      country: ['', [Validators.maxLength(100)]],
      category: ['', [Validators.required]],
      status: [''],
      contractValue: [null, [Validators.min(0)]],
      rating: [0],
      joinedDate: [''],
      lastActivity: [''],
      notes: ['', [Validators.maxLength(500)]],
    });
  }

  private patchForm(vendor: Vendor): void {
    this.form.patchValue({
      vendorCode: vendor.vendorCode,
      vendorName: vendor.vendorName,
      website: vendor.website,
      taxId: vendor.taxId,
      address: vendor.address,
      city: vendor.city,
      country: vendor.country,
      category: vendor.category,
      status: vendor.status,
      contractValue: vendor.contractValue,
      rating: vendor.rating,
      joinedDate: vendor.joinedDate,
      lastActivity: vendor.lastActivity,
      notes: vendor.notes,
    });

    // Clear default contacts and rebuild from vendor data
    this.contacts.clear();
    vendor.contacts.forEach((c) => this.contacts.push(this.createContactGroup(c)));
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'This field is required';
    if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
    if (control.errors['maxlength'])
      return `Maximum ${control.errors['maxlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error('Please fix the validation errors');
      return;
    }

    this.saving.set(true);
  }

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop'))
      this.vendorStore.closeForm();
  }

  newContact(isPrimary = false): VendorContact {
    return {
      id: 'ct_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      name: '',
      email: '',
      phone: '',
      role: isPrimary ? 'primary' : 'other',
      isPrimary,
    };
  }

  addContact(isPrimary = false): void {
    const group = this.createContactGroup({ isPrimary });
    this.contacts.push(group);
  }

  removeContact(index: number): void {
    if (this.contacts.length <= 1) return;
    const wasPrimary = this.contacts.at(index).get('isPrimary')?.value;
    this.contacts.removeAt(index);
    // Promote first contact to primary if the removed one was primary
    if (wasPrimary && this.contacts.length > 0) {
      this.contacts.at(0).get('isPrimary')?.setValue(true);
    }
  }

  setPrimary(index: number): void {
    this.contacts.controls.forEach((g, i) => {
      g.get('isPrimary')?.setValue(i === index);
    });
  }

  get contacts(): FormArray<FormGroup> {
    return this.form.get('contacts') as FormArray<FormGroup>;
  }

    /* ─── Field-level error helpers (used in template) ───────── */
  isInvalid(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }
}
