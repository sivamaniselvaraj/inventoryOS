import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './components';
import { VendorStore } from './store/vendor.store';

@Component({
  selector: 'app-root',
   imports: [CommonModule, LayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  store = inject(VendorStore);
}
