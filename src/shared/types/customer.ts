export interface Customer {
  id: string | number;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  category?: 'customer' | 'vendor' | 'prospect' | 'partner' | 'other';
  active?: boolean;
}
