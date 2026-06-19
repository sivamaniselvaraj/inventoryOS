import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../../../store';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './location-selector.component.html',
  styleUrl: './location-selector.component.css',
})
export class LocationSelectorComponent {
  readonly store = inject(UserStore);
}
