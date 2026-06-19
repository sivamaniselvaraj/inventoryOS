import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, Location } from '../models';

@Injectable({ providedIn: 'root' })
export class UserStore {

  // ── Simulated logged-in user with multiple locations ──────────
  readonly userProfile = signal<UserProfile | null>({
    id: 'USR-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@company.com',
    fullName: 'Rajesh Kumar Kannan',
    avatarInitials: 'RK',
    role: ['Inventory Manager'],
    locations: [
      { id: 'LOC-BLR', name: 'Bengaluru Warehouse',  city: 'Bengaluru', state: 'Karnataka' },
      // { id: 'LOC-MUM', name: 'Mumbai Distribution',   city: 'Mumbai',    state: 'Maharashtra' },
      // { id: 'LOC-DEL', name: 'Delhi Hub',             city: 'Delhi',     state: 'Delhi' },
      { id: 'LOC-CHN', name: 'Chennai Depot',         city: 'Chennai',   state: 'Tamil Nadu' },
    ],
  });

  // ── Signals ───────────────────────────────────────────────────
  readonly selectedLocationId = signal<string>('');

  // ── Computed ──────────────────────────────────────────────────
  readonly locations = computed(() => this.userProfile()?.locations??[]);

  readonly hasMultipleLocations = computed(() => this.locations().length > 1);

  readonly selectedLocation = computed(() =>
    this.locations()?.find(l => l.id === this.selectedLocationId()) ?? null
  );

  constructor() {
    // Auto-select if only one location
        const locs = this.userProfile()?.locations;
        if (locs?.length === 1) {
            this.selectLocation(locs[0]?.id);
        //this.selectedLocationId.set(locs[0].id);
        }
  }

  selectLocation(locationId: string): void {
    this.selectedLocationId.set(locationId);
  }
}