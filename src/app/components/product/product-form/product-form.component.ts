import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProductStore } from '../../../store';
import { NotificationService } from '../../../services/notification.service';
import {
  Product,
  ProductFormData,
  UNIT_OF_MEASURE_OPTIONS,
} from '../../../models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productStore = inject(ProductStore);
  private readonly notify = inject(NotificationService);

  readonly uomOptions = UNIT_OF_MEASURE_OPTIONS;
  readonly isEditMode = signal(false);
  readonly productId = signal<string | null>(null);
  readonly saving = signal(false);

  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Edit Product' : 'Add New Product'
  );

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const product = this.productStore.getProductById(id);
      if (product) {
        this.isEditMode.set(true);
        this.productId.set(id);
        this.patchForm(product);
      } else {
        this.notify.error('Product not found');
        this.router.navigate(['/products']);
      }
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      productCode: ['', [Validators.required, Validators.maxLength(30)]],
      productName: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(500)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      purchasingPrice: [0, [Validators.required, Validators.min(0)]],
      unitsAvailable: [0, [Validators.required, Validators.min(0)]],
      barcodeValue: ['', [Validators.maxLength(50)]],
      unitOfMeasure: [''],
      manufacturedBy: ['', [Validators.maxLength(100)]],
      manufacturedOn: [''],
      expiryDate: [''],
      shelfLifeDays: [null, [Validators.min(0)]],
      batchNumber: ['', [Validators.maxLength(50)]],
      reorderLevel: [null, [Validators.min(0)]],
      maxStockLevel: [null, [Validators.min(0)]],
    });
  }

  private patchForm(product: Product): void {
    this.form.patchValue({
      productCode: product.productCode,
      productName: product.productName,
      description: product.description,
      unitPrice: product.unitPrice,
      sellingPrice: product.sellingPrice,
      purchasingPrice: product.purchasingPrice,
      unitsAvailable: product.unitsAvailable,
      barcodeValue: product.barcodeValue,
      unitOfMeasure: product.unitOfMeasure,
      manufacturedBy: product.manufacturedBy,
      manufacturedOn: product.manufacturedOn,
      expiryDate: product.expiryDate,
      shelfLifeDays: product.shelfLifeDays,
      batchNumber: product.batchNumber,
      reorderLevel: product.reorderLevel,
      maxStockLevel: product.maxStockLevel,
    });
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error('Please fix the validation errors');
      return;
    }

    this.saving.set(true);
    const data: ProductFormData = this.form.value;

    // Simulate a small async delay
    setTimeout(() => {
      if (this.isEditMode()) {
        const success = this.productStore.updateProduct(
          this.productId()!,
          data
        );
        if (success) {
          this.notify.success(`"${data.productName}" updated successfully`);
          this.router.navigate(['/products']);
        } else {
          this.notify.error('Failed to update product');
        }
      } else {
        const newProduct = this.productStore.addProduct(data);
        this.notify.success(`"${newProduct.productName}" added successfully`);
        this.router.navigate(['/products']);
      }
      this.saving.set(false);
    }, 400);
  }

  onReset(): void {
    if (this.isEditMode()) {
      const product = this.productStore.getProductById(this.productId()!);
      if (product) this.patchForm(product);
    } else {
      this.form.reset({
        unitPrice: 0,
        sellingPrice: 0,
        purchasingPrice: 0,
        unitsAvailable: 0,
      });
    }
  }

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) this.productStore.closeForm();
  }
}
