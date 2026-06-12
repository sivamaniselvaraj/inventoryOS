import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorStore } from '../../store/vendor.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  store = inject(VendorStore);

  formatter = new Intl.NumberFormat('en', { notation: 'compact' });

  get statusItems() {
    const s = this.store.stats();
    return [
      { label: 'Active', count: s.active, color: '#22c55e' },
      { label: 'Pending', count: s.pending, color: '#f59e0b' },
      { label: 'Inactive', count: s.total - s.active - s.pending - s.suspended, color: '#94a3b8' },
      { label: 'Suspended', count: s.suspended, color: '#ef4444' }
    ];
  }
  get categoryBreakdown() {
    const counts: Record<string, number> = {};
    this.store.vendors().forEach(v => { counts[v.category] = (counts[v.category] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }
  get recentVendors() { return [...this.store.vendors()].slice(0, 6); }
  barWidth(count: number) { return (count / this.store.stats().total) * 100; }
  catBarWidth(count: number) { const max = Math.max(...this.categoryBreakdown.map(c => c.count)); return (count / max) * 100; }
  initials(name: string) { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
}
