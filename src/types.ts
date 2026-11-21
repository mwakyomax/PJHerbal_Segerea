/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category =
  | "Men's Health"
  | "Weight Management"
  | "Energy & Immunity"
  | "Women's Wellness"
  | "Brain & Focus"
  | "Detox & Digestion";

export interface Review {
  id: string;
  productId?: string;
  userId?: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  createdAt?: unknown;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number; // in TZS
  originalPrice?: number; // for discounts
  images: string[];
  shortBenefits: string;
  description: string;
  ingredients: string[];
  usageInstructions: string;
  benefits: string[];
  warnings: string[];
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  stock: number;
  isBestSeller: boolean;
  featuredBenefits: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "Pending"
  | "Paid"
  | "Processing"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

export type DeliveryStep = "assigned" | "picked_up" | "en_route" | "delivered";

export interface Order {
  id: string;
  userId: string;
  customerDetails: {
    fullName: string;
    phoneNumber: string;
    email: string;
    deliveryAddress: string;
    region: string;
    district: string;
  };
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  paymentMethod: string;
  paymentReference?: string;
  paymentStatus: "Pending" | "Paid" | "Failed";
  shippingFee: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  date: string;
  estimatedDelivery: string;
  deliveryCourier?: string;
  courierPhone?: string;
  trackingNumber?: string;
  deliveryStep?: DeliveryStep;
  trackingLogs: {
    status: OrderStatus;
    timestamp: string;
    description: string;
  }[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PromoCampaign {
  id: string;
  code: string;
  discountPercentage: number;
  description: string;
  active: boolean;
  expiryDate: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SiteSettings {
  announcementText: string;
  heroBadgeText: string;
  heroTitleText: string;
  heroDescText: string;
  updatedAt?: unknown;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  district: string;
  address: string;
  role: "customer";
  wishlistIds: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ContactMessage {
  id: string;
  userId: string;
  name: string;
  email: string;
  message: string;
  status: "Unread" | "Replied";
  createdAt?: unknown;
}

export interface PatientNote {
  id: string;
  patientEmail: string;
  patientName: string;
  note: string;
  updatedBy: string;
  updatedAt?: unknown;
}

export interface CampaignDispatchLog {
  id: string;
  phone: string;
  template: string;
  message: string;
  dispatchedBy: string;
  createdAt?: unknown;
}
