import { Component, ElementRef, inject, output, viewChild } from '@angular/core';
import { UserStore, VendorStore } from '../../../store';

@Component({
  selector: 'app-vendor-selector',
  standalone: true,
  imports: [],
  templateUrl: './vendor-selector.component.html',
  styleUrl: './vendor-selector.component.css',
})
export class VendorSelectorComponent {
  readonly vendorStore   = inject(VendorStore);
  readonly userStore = inject(UserStore);

    /** Emitted when the user picks a different vendor from the dropdown */
  readonly vendorChange = output<string>();

  /** Reference to the native select element */
  readonly selectRef = viewChild<ElementRef>('vendorSelect');
 
  onVendorChange(vendorId: string): void {
    this.vendorChange.emit(vendorId);
  }

  /** Reset the select element back to the store's current value (called on cancel) */
  revertSelection(): void {
    const el = this.selectRef()?.nativeElement as HTMLSelectElement | undefined;
    if (el) {
      el.value = this.vendorStore.selectedVendorId() ?? '';
    }
  }
}
