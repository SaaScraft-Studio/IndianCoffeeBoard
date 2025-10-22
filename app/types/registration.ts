export interface RegistrationData {
  _id?: string;
  registrationId: string;
  city: "mumbai" | "delhi" | "bengaluru";
  name: string;
  email: string;
  mobile: string;
  address: string;
  state: string;
  workPlace: string;
  pin: string;
  competition: string;
  passportNumber?: string;
  passportFile?: File | null;
  passportUrl?: string;
  amount?: number;
  aadhaarNumber: string;
  competitionName: string;
  acceptedTerms: boolean;
  paymentStatus: "pending" | "success" | "failed";
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
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
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// In your types file (app/types/registration.ts)
export interface Competition {
  _id: string;
  name: string;
  price: number;
  passportRequired: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
