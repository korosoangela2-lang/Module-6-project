import { Smartphone, CreditCard, MapPin } from "lucide-react";

export const CURRENCIES = {
  CAD: { symbol: "CA$", locale: "en-CA", decimals: 2 },
  KES: { symbol: "KSh", locale: "en-KE", decimals: 2 },
  UGX: { symbol: "USh", locale: "en-UG", decimals: 0 },
  NGN: { symbol: "₦", locale: "en-NG", decimals: 2 },
  GHS: { symbol: "GH₵", locale: "en-GH", decimals: 2 },
};

export const BASE_RATES = { KES: 111.42, UGX: 2718.5, NGN: 1164.3, GHS: 10.87 };

export const CORRIDORS = [
  { code: "KES", country: "Kenya", flag: "🇰🇪", city: "Nairobi" },
  { code: "UGX", country: "Uganda", flag: "🇺🇬", city: "Kampala" },
  { code: "NGN", country: "Nigeria", flag: "🇳🇬", city: "Lagos" },
  { code: "GHS", country: "Ghana", flag: "🇬🇭", city: "Accra" },
];

export const PAYOUT_METHODS = [
  { id: "mobile", label: "Mobile money", note: "M-Pesa, MTN, Airtel", icon: Smartphone, minutes: 2 },
  { id: "bank", label: "Bank deposit", note: "Any local bank account", icon: CreditCard, minutes: 90 },
  { id: "cash", label: "Cash pickup", note: "18,400 agent counters", icon: MapPin, minutes: 15 },
];
