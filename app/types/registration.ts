export interface RegistrationData {
  _id?: string;
  city: 'mumbai' | 'hyderabad' | 'bangalore';
  name: string;
  email: string;
  mobile: string;
  address: string;
  state: string;
  pin: string;
  competition: string;
  aadhaarNumber: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentId?: string;
  registrationId?: string;
  createdAt?: Date;
}

export interface PaymentData {
  amount: number;
  currency: string;
  registrationId: string;
  customerInfo: {
    name: string;
    email: string;
    mobile: string;
  };
}

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh', 
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export const COMPETITIONS = [
  { id: 'comp1-500', name: 'Competition 1', price: 500 },
  { id: 'comp2-1500', name: 'Competition 2', price: 1500 }
];