import { Injectable, signal, computed } from '@angular/core';
import { Vendor, VendorFilter, VendorContact } from '../models/vendor.model';

function c(id: string, name: string, email: string, phone: string, role: string, primary = false): VendorContact {
  return { id, name, email, phone, role: role as any, isPrimary: primary };
}

const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v001', vendorCode: 'VND-001', vendorName: 'Infyra Cloud Systems', status: 'active', category: 'technology',
    contacts: [
      c('c001', 'Arjun Mehta',       'arjun.mehta@infyra.io',       '+91 98765 43210', 'primary', true),
      c('c002', 'Meera Iyer',        'meera.iyer@infyra.io',        '+91 98765 43211', 'billing'),
      c('c003', 'Rahul Deshmukh',    'rahul.d@infyra.io',           '+91 98765 43212', 'technical'),
    ],
    address: '42 Koramangala 5th Block', city: 'Bengaluru', country: 'India',
    contractValue: 4250000, rating: 4.8, joinedDate: '2021-03-15', lastActivity: '2026-05-28',
    taxId: 'GSTIN29ABCDE1234F1Z5', website: 'https://infyra.io',
    notes: 'Preferred vendor for cloud infrastructure. Annual renewal in Q1.', isActive: true
  },
  {
    id: 'v002', vendorCode: 'VND-002', vendorName: 'VeloTrans Logistics', status: 'active', category: 'logistics',
    contacts: [
      c('c004', 'Priya Sharma',  'priya@velotrans.in',   '+91 91234 56789', 'primary', true),
      c('c005', 'Amit Kulkarni', 'amit.k@velotrans.in',  '+91 91234 56790', 'operations'),
    ],
    address: '7 MIDC Industrial Area, Hinjewadi Phase II', city: 'Pune', country: 'India',
    contractValue: 1560000, rating: 4.3, joinedDate: '2020-07-20', lastActivity: '2026-06-01',
    taxId: 'GSTIN27FGHIJ5678K2L9', website: 'https://velotrans.in',
    notes: 'Handles last-mile delivery for western region.', isActive: true
  },
  {
    id: 'v003', vendorCode: 'VND-003', vendorName: 'Nexbridge Consulting', status: 'pending', category: 'consulting',
    contacts: [
      c('c006', 'Ravi Kumar',    'ravi@nexbridge.co',     '+91 98001 12345', 'management', true),
      c('c007', 'Sunita Reddy',  'sunita@nexbridge.co',   '+91 98001 12346', 'billing'),
    ],
    address: '501 DLF Cybercity, Sector 24', city: 'Gurugram', country: 'India',
    contractValue: 2890000, rating: 3.9, joinedDate: '2023-01-10', lastActivity: '2026-04-25',
    taxId: 'GSTIN06MNOPQ9012R3S4', website: 'https://nexbridge.co',
    notes: 'Awaiting contract renewal. Proposal submitted 15 May.', isActive: false
  },
  {
    id: 'v004', vendorCode: 'VND-004', vendorName: 'SteelEdge Manufacturing', status: 'active', category: 'manufacturing',
    contacts: [
      c('c008', 'Sneha Patel',   'sneha@steeledge.com',   '+91 79000 88765', 'management', true),
      c('c009', 'Vikram Shah',   'vikram@steeledge.com',  '+91 79000 88766', 'billing'),
      c('c010', 'Jignesh Bhatt', 'jignesh@steeledge.com', '+91 79000 88767', 'operations'),
    ],
    address: '14 GIDC Estate, Vatva', city: 'Ahmedabad', country: 'India',
    contractValue: 5100000, rating: 4.5, joinedDate: '2019-11-05', lastActivity: '2026-06-02',
    taxId: 'GSTIN24TUVWX3456Y7Z8', website: 'https://steeledge.com',
    notes: '', isActive: true
  },
  {
    id: 'v005', vendorCode: 'VND-005', vendorName: 'OfficePrime Supplies', status: 'inactive', category: 'supplies',
    contacts: [
      c('c011', 'Nikhil Joshi', 'nikhil@officeprime.in', '+91 20-2234-5678', 'primary', true),
    ],
    address: '88 Hadapsar Road, Magarpatta', city: 'Pune', country: 'India',
    contractValue: 125000, rating: 3.2, joinedDate: '2022-08-30', lastActivity: '2025-12-01',
    taxId: 'GSTIN27ABCYZ7890A1B2', website: '',
    notes: 'Low activity — moved to inactive. Review in Q3.', isActive: false
  },
  {
    id: 'v006', vendorCode: 'VND-006', vendorName: 'Nimbus Digital Labs', status: 'active', category: 'technology',
    contacts: [
      c('c012', 'Ananya Rao',     'ananya@nimbusdigital.tech',  '+91 80-4567-8901', 'primary', true),
      c('c013', 'Karthik Reddy',  'karthik@nimbusdigital.tech', '+91 80-4567-8902', 'technical'),
      c('c014', 'Divya Menon',    'divya@nimbusdigital.tech',   '+91 80-4567-8903', 'billing'),
      c('c015', 'Tarun Saxena',   'tarun@nimbusdigital.tech',   '+91 80-4567-8904', 'operations'),
    ],
    address: '12 Whitefield Tech Park, ITPL Main Rd', city: 'Bengaluru', country: 'India',
    contractValue: 7450000, rating: 4.9, joinedDate: '2018-06-01', lastActivity: '2026-06-05',
    taxId: 'GSTIN29CDEFG2345H6I7', website: 'https://nimbusdigital.tech',
    notes: 'Top-tier SLA agreement. Strategic partner for AI/ML platform.', isActive: true
  },
  {
    id: 'v007', vendorCode: 'VND-007', vendorName: 'CoreServ IT Solutions', status: 'suspended', category: 'services',
    contacts: [
      c('c016', 'Deepak Nair', 'deepak@coreserv.co', '+91 44-9876-5432', 'primary', true),
    ],
    address: '3 OMR IT Corridor, Perungudi', city: 'Chennai', country: 'India',
    contractValue: 340000, rating: 2.8, joinedDate: '2021-03-18', lastActivity: '2025-09-15',
    taxId: 'GSTIN33HIJKL6789M0N1', website: '',
    notes: 'Suspended — missed 3 consecutive SLA targets. Under review by legal.', isActive: false
  },
  {
    id: 'v008', vendorCode: 'VND-008', vendorName: 'SwiftHaul Freight', status: 'active', category: 'logistics',
    contacts: [
      c('c017', 'Kavita Desai',   'kavita@swifthaul.in',   '+91 22-3456-7890', 'primary', true),
      c('c018', 'Suresh Gupta',   'suresh@swifthaul.in',   '+91 22-3456-7891', 'operations'),
    ],
    address: '55 BKC Complex, G Block', city: 'Mumbai', country: 'India',
    contractValue: 1780000, rating: 4.1, joinedDate: '2022-05-22', lastActivity: '2026-05-30',
    taxId: 'GSTIN27OPQRS1234T5U6', website: 'https://swifthaul.in',
    notes: '', isActive: true
  },
  {
    id: 'v009', vendorCode: 'VND-009', vendorName: 'ZenithWare Software', status: 'active', category: 'technology',
    contacts: [
      c('c019', 'Pooja Bansal',   'pooja@zenithware.dev',   '+91 11-4455-6677', 'primary', true),
      c('c020', 'Manish Tiwari',  'manish@zenithware.dev',  '+91 11-4455-6678', 'technical'),
    ],
    address: '9th Floor, Connaught Place Tower', city: 'New Delhi', country: 'India',
    contractValue: 3200000, rating: 4.6, joinedDate: '2020-09-14', lastActivity: '2026-06-03',
    taxId: 'GSTIN07LMNOP4567Q8R9', website: 'https://zenithware.dev',
    notes: 'Custom ERP modules. Dedicated support team assigned.', isActive: true
  },
  {
    id: 'v010', vendorCode: 'VND-010', vendorName: 'GreenLeaf Agro Exports', status: 'active', category: 'supplies',
    contacts: [
      c('c021', 'Ramesh Hegde',    'ramesh@greenleafagro.com',  '+91 821-234-5678', 'management', true),
      c('c022', 'Lakshmi Nayak',   'lakshmi@greenleafagro.com', '+91 821-234-5679', 'billing'),
      c('c023', 'Ganesh Shetty',   'ganesh@greenleafagro.com',  '+91 821-234-5680', 'operations'),
    ],
    address: 'Plot 44, Hebbal Industrial Area', city: 'Mysuru', country: 'India',
    contractValue: 890000, rating: 4.0, joinedDate: '2023-04-01', lastActivity: '2026-05-15',
    taxId: 'GSTIN29QRSTU6789V0W1', website: 'https://greenleafagro.com',
    notes: 'Organic-certified supplier. Seasonal volume spikes in Oct–Dec.', isActive: true
  },
  {
    id: 'v011', vendorCode: 'VND-011', vendorName: 'PixelForge Design Studio', status: 'pending', category: 'services',
    contacts: [
      c('c024', 'Isha Kapoor', 'isha@pixelforge.design', '+91 80-5566-7788', 'primary', true),
    ],
    address: '18 Indiranagar 100ft Road', city: 'Bengaluru', country: 'India',
    contractValue: 680000, rating: 4.4, joinedDate: '2024-11-20', lastActivity: '2026-05-20',
    taxId: 'GSTIN29WXYZA1234B5C6', website: 'https://pixelforge.design',
    notes: 'New vendor. Trial project for brand refresh underway.', isActive: false
  },
  {
    id: 'v012', vendorCode: 'VND-012', vendorName: 'Vajra Heavy Equipment', status: 'active', category: 'manufacturing',
    contacts: [
      c('c025', 'Rajendra Patil',  'rajendra@vajraheavy.co.in',  '+91 712-255-8800', 'management', true),
      c('c026', 'Swati Deshpande', 'swati@vajraheavy.co.in',     '+91 712-255-8801', 'billing'),
    ],
    address: 'Butibori MIDC, Plot G-19', city: 'Nagpur', country: 'India',
    contractValue: 8900000, rating: 4.2, joinedDate: '2018-02-10', lastActivity: '2026-06-06',
    taxId: 'GSTIN27DEFGH8901I2J3', website: 'https://vajraheavy.co.in',
    notes: 'Long-term partner. Handles all heavy machinery procurement.', isActive: true
  },
  {
    id: 'v013', vendorCode: 'VND-013', vendorName: 'Kalpana BioTech Pvt Ltd', status: 'active', category: 'manufacturing',
    contacts: [
      c('c027', 'Dr. Nandini Murthy', 'nandini@kalpanabio.in',  '+91 40-3344-5566', 'primary', true),
      c('c028', 'Srinivas Rao',       'srinivas@kalpanabio.in', '+91 40-3344-5567', 'technical'),
    ],
    address: 'Genome Valley, Phase III', city: 'Hyderabad', country: 'India',
    contractValue: 4600000, rating: 4.7, joinedDate: '2021-08-15', lastActivity: '2026-06-04',
    taxId: 'GSTIN36KLMNO5678P9Q0', website: 'https://kalpanabio.in',
    notes: 'Bio-pharmaceutical supplies. Cold-chain logistics coordinated with SwiftHaul.', isActive: true
  },
  {
    id: 'v014', vendorCode: 'VND-014', vendorName: 'UrbanStack Interiors', status: 'inactive', category: 'services',
    contacts: [
      c('c029', 'Farhan Siddiqui', 'farhan@urbanstack.co', '+91 22-6677-8899', 'primary', true),
      c('c030', 'Neha Agarwal',    'neha@urbanstack.co',   '+91 22-6677-8900', 'operations'),
    ],
    address: 'Lower Parel, Kamala Mills Compound', city: 'Mumbai', country: 'India',
    contractValue: 350000, rating: 3.5, joinedDate: '2023-09-01', lastActivity: '2025-11-10',
    taxId: 'GSTIN27RSTUV0123W4X5', website: 'https://urbanstack.co',
    notes: 'Office fit-out completed. No active projects — moved to inactive.', isActive: false
  },
  {
    id: 'v015', vendorCode: 'VND-015', vendorName: 'OmniRoute Couriers', status: 'suspended', category: 'logistics',
    contacts: [
      c('c031', 'Harish Menon', 'harish@omniroute.express', '+91 484-233-4455', 'primary', true),
    ],
    address: '12 Kakkanad Info Park Road', city: 'Kochi', country: 'India',
    contractValue: 210000, rating: 2.4, joinedDate: '2024-01-12', lastActivity: '2025-08-30',
    taxId: 'GSTIN32YZABC6789D0E1', website: '',
    notes: 'Suspended — repeated delivery delays and damaged shipments. Penalty applied.', isActive: false
  },
];

@Injectable({ providedIn: 'root' })
export class VendorStore {
  private readonly _vendors = signal<Vendor[]>(MOCK_VENDORS);
  private readonly _selectedVendor = signal<Vendor | null>(null);
  private readonly _filter = signal<VendorFilter>({ search: '', status: '', category: '' });
  private readonly _loading = signal<boolean>(false);
  private readonly _formMode = signal<'add' | 'edit' | null>(null);
  private readonly _notification = signal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  readonly vendors = this._vendors.asReadonly();
  readonly selectedVendor = this._selectedVendor.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly notification = this._notification.asReadonly();

  readonly filteredVendors = computed(() => {
    const { search, status, category } = this._filter();
    return this._vendors().filter(v => {
      const s = (search || '').toLowerCase();
      const matchSearch = !s || v.vendorName.toLowerCase().includes(s) ||  v.contacts.some(ct => ct.name.toLowerCase().includes(s) || ct.email.toLowerCase().includes(s));
      const matchStatus = !status || v.status === status;
      const matchCategory = !category || v.category === category;
      return matchSearch && matchStatus && matchCategory;
    });
  });

  readonly stats = computed(() => {
    const all = this._vendors();
    return {
      total: all.length,
      active: all.filter(v => v.status === 'active').length,
      pending: all.filter(v => v.status === 'pending').length,
      suspended: all.filter(v => v.status === 'suspended').length,
      totalContractValue: all.reduce((s, v) => s + v.contractValue, 0),
      avgRating: all.reduce((s, v) => s + v.rating, 0) / (all.length || 1)
    };
  });

  setFilter(filter: Partial<VendorFilter>) { this._filter.update(f => ({ ...f, ...filter })); }
  selectVendor(vendor: Vendor | null) { this._selectedVendor.set(vendor); }
  openAddForm() { this._selectedVendor.set(null); this._formMode.set('add'); }
  openEditForm(vendor: Vendor) { this._selectedVendor.set(vendor); this._formMode.set('edit'); }
  closeForm() { this._formMode.set(null); }
  setLoading(v: boolean) { this._loading.set(v); }

  addVendor(vendor: Omit<Vendor, 'id'>) {
    this._vendors.update(list => [...list, { ...vendor, id: 'v' + Date.now().toString().slice(-6) }]);
    this._formMode.set(null);
    this.showNotification('Vendor added successfully!', 'success');
  }

  updateVendor(vendor: Vendor) {
    this._vendors.update(list => list.map(v => v.id === vendor.id ? vendor : v));
    this._selectedVendor.set(null);
    this._formMode.set(null);
    this.showNotification('Vendor updated successfully!', 'success');
  }

  deleteVendor(id: string) {
    this._vendors.update(list => list.filter(v => v.id !== id));
    if (this._selectedVendor()?.id === id) this._selectedVendor.set(null);
    this.showNotification('Vendor removed.', 'info');
  }

    // ── Actions ──
  getVendorById(id: string): Vendor | undefined {
    return this._vendors().find((v) => v.id === id);
  }

  getVendorsByIds(ids: string[]): Vendor[] {
    const set = new Set(ids);
    return this._vendors().filter((v) => set.has(v.id));
  }

  readonly activeVendors = computed(() =>
    this._vendors().filter((v) => v.isActive)
  );

  showNotification(message: string, type: 'success' | 'error' | 'info') {
    this._notification.set({ message, type });
    setTimeout(() => this._notification.set(null), 3500);
  }
}
