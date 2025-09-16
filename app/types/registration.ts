export interface RegistrationData {
  _id?: string;
  city: "mumbai" | "delhi" | "bangalore";
  name: string;
  email: string;
  mobile: string;
  address: string;
  state: string;
  pin: string;
  competition: string;
  aadhaarNumber: string;
  acceptedTerms: boolean;
  paymentStatus: "pending" | "success" | "failed";
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

export const COMPETITIONS = [
  { id: "comp1", name: "National Barista Championship", price: 1180 },
  { id: "comp2", name: "National Brewer’s Cup", price: 1180 },
  { id: "comp3", name: "Coffee in Good Spirits", price: 1180 },
  { id: "comp5", name: "Filter Coffee Championship", price: 580 },
];
