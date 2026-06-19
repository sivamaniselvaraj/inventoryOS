export interface GstRateOption {
  value: number;
  label: string;
  description: string;
}

export const GST_RATE_OPTIONS: GstRateOption[] = [
  { value: 0,    label: '0%',    description: 'Nil — Essential goods (fresh food, grains, milk)' },
//   { value: 0.1,  label: '0.1%',  description: 'Rough precious stones' },
//   { value: 0.25, label: '0.25%', description: 'Rough diamonds, cut & polished diamonds' },
//   { value: 1.5,  label: '1.5%',  description: 'Gold, silver, platinum jewellery' },
//   { value: 3,    label: '3%',    description: 'Gold bars, silver articles, processed diamonds' },
  { value: 5,    label: '5%',    description: 'Packaged food, footwear (< ₹1000), fertilizers' },
  { value: 12,   label: '12%',   description: 'Processed food, computers, mobiles, umbrella' },
  { value: 18,   label: '18%',   description: 'Electronics, IT services, financial services' },
//   { value: 28,   label: '28%',   description: 'Luxury items, automobiles, cement, AC' },
];