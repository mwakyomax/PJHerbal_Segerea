/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  User,
  Lock,
  Loader2,
  AlertCircle,
  Truck,
  Building2,
  Smartphone,
  Landmark,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { CartItem, Order, PromoCampaign, UserProfile } from "../types";
import { TANZANIA_REGIONS } from "../data";
import { FirebaseUser } from "../lib/firebase";

interface CheckoutViewProps {
  cartItems: CartItem[];
  couponCode: string;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  availableCampaigns: PromoCampaign[];
  onPlaceOrder: (order: Omit<Order, "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateProfile: (updates: Partial<Pick<UserProfile, "name" | "phone" | "region" | "district" | "address">>) => Promise<void>;
  setCurrentPath: (path: string) => void;
  authUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  onSignInWithGoogle: () => Promise<FirebaseUser | null>;
}

const PAYMENT_OPTIONS = [
  {
    id: "Cash on Delivery",
    label: "Cash on Delivery",
    subtitle: "Pay courier upon delivery",
    icon: Truck
  },
  {
    id: "Clinic Pickup (Segerea)",
    label: "Clinic Pickup (Segerea)",
    subtitle: "Pay at dispensary counter",
    icon: Building2
  },
  {
    id: "Direct Mobile Money (M-Pesa / Tigo / Airtel / HaloPesa)",
    label: "Direct Mobile Money",
    subtitle: "Send to +255 629 899 017",
    icon: Smartphone
  },
  {
    id: "Direct Bank Transfer (CRDB / NMB)",
    label: "Bank Transfer",
    subtitle: "CRDB / NMB Settlement",
    icon: Landmark
  }
];

export default function CheckoutView({
  cartItems,
  couponCode,
  selectedRegion,
  setSelectedRegion,
  availableCampaigns,
  onPlaceOrder,
  onUpdateProfile,
  setCurrentPath,
  authUser,
  userProfile,
  onSignInWithGoogle
}: CheckoutViewProps) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [district, setDistrict] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_OPTIONS[0].id);
  const [paymentReference, setPaymentReference] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [formError, setFormError] = useState("");

  const activeRegionData = TANZANIA_REGIONS.find((r) => r.name === selectedRegion) || TANZANIA_REGIONS[0];
  const districtsList = activeRegionData.districts;

  // Pre-fill customer info from Firebase Auth / Firestore Profile
  useEffect(() => {
    if (userProfile) {
      if (!fullName && userProfile.name) setFullName(userProfile.name);
      if (!email && userProfile.email) setEmail(userProfile.email);
      if (!phoneNumber && userProfile.phone) setPhoneNumber(userProfile.phone);
      if (!deliveryAddress && userProfile.address) setDeliveryAddress(userProfile.address);
      if (userProfile.region && TANZANIA_REGIONS.some((r) => r.name === userProfile.region)) {
        setSelectedRegion(userProfile.region);
      }
      if (userProfile.district) setDistrict(userProfile.district);
    } else if (authUser) {
      if (!fullName && authUser.displayName) setFullName(authUser.displayName);
      if (!email && authUser.email) setEmail(authUser.email);
    }
  }, [userProfile, authUser]);

  useEffect(() => {
    if (districtsList.length > 0 && !districtsList.includes(district)) {
      setDistrict(districtsList[0]);
    }
  }, [selectedRegion, districtsList, district]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const activeCampaigns = availableCampaigns.filter((c) => c.active);
  const activePromo = activeCampaigns.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
  const discountRate = activePromo ? activePromo.discountPercentage / 100 : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const isClinicPickup = paymentMethod.includes("Clinic Pickup");
  const shippingFee = subtotal > 0 && !isClinicPickup ? activeRegionData.baseShipping : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const needsPaymentRef = paymentMethod.includes("Mobile Money") || paymentMethod.includes("Bank Transfer");

  const handleGoogleSignIn = async () => {
    setFormError("");
    setSigningIn(true);
    try {
      await onSignInWithGoogle();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Google Sign-In failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!authUser) {
      setFormError("Please sign in with Google first so your order can be securely logged to your patient account.");
      return;
    }

    if (cartItems.length === 0) {
      setFormError("Your cart is empty. Please add supplements before checking out.");
      return;
    }

    if (fullName.trim().length < 2 || phoneNumber.trim().length < 6 || !email.includes("@") || deliveryAddress.trim().length < 2) {
      setFormError("Please complete all required patient name, phone number, email, and delivery landmark fields.");
      return;
    }

    setSubmitting(true);
    try {
      const orderId = `PJH-${Math.floor(Math.random() * 90000) + 10000}`;
      const estimatedDeliveryStr = isClinicPickup
        ? "Ready for pickup today at Segerea Clinic"
        : selectedRegion === "Dar es Salaam"
          ? "Today (within 4-8 hours)"
          : "Within 24-48 hours via courier";

      const cleanRef = paymentReference.trim();
      const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
      const initialLogDesc = cleanRef
        ? `Order logged (${paymentMethod}). Patient submitted reference "${cleanRef}" for clinic verification.`
        : `Order logged (${paymentMethod}). Awaiting clinic review and dispatch confirmation.`;

      const orderPayload: Omit<Order, "userId" | "createdAt" | "updatedAt"> = {
        id: orderId,
        customerDetails: {
          fullName: fullName.trim().slice(0, 120),
          phoneNumber: phoneNumber.trim().slice(0, 30),
          email: email.trim().toLowerCase().slice(0, 150),
          deliveryAddress: deliveryAddress.trim().slice(0, 300),
          region: selectedRegion,
          district: district || districtsList[0] || "Ilala"
        },
        items: cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        paymentMethod,
        ...(cleanRef ? { paymentReference: cleanRef.slice(0, 100) } : {}),
        paymentStatus: "Pending",
        shippingFee,
        discount: discountAmount,
        totalAmount,
        status: "Pending",
        date: new Date().toISOString().split("T")[0],
        estimatedDelivery: estimatedDeliveryStr,
        trackingLogs: [
          {
            status: "Pending",
            timestamp,
            description: initialLogDesc
          }
        ]
      };

      await onPlaceOrder(orderPayload);

      // Update saved profile coordinates for next time (non-blocking)
      onUpdateProfile({
        name: fullName.trim().slice(0, 120),
        phone: phoneNumber.trim().slice(0, 30),
        region: selectedRegion,
        district: district || districtsList[0] || "Ilala",
        address: deliveryAddress.trim().slice(0, 250)
      }).catch(() => {});

      setCurrentPath("order-success");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not submit order to clinic database. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-5 font-sans">
        <h2 className="text-2xl font-serif font-bold text-emerald-950">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Add natural supplement formulations from the Segerea dispensary before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={() => setCurrentPath("shop")}
          className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-full transition-colors"
        >
          Browse Dispensary Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-slate-800">
      <div className="text-left mb-8 border-b border-slate-100 pb-5 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-950">Clinic Order Checkout</h1>
          <p className="text-slate-500 text-sm mt-1">
            Submit your delivery details and preferred Tanzanian settlement option directly to PJHerbal Segerea.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCurrentPath("cart")}
          className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </button>
      </div>

      {/* Google Sign-In Verification Gate */}
      {!authUser && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-emerald-950">Sign in with Google to Place & Track Orders</h3>
              <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                For patient privacy and real-time order tracking, your order is linked directly to your verified Google account.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={signingIn}
            onClick={handleGoogleSignIn}
            className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            {signingIn && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Sign In with Google</span>
          </button>
        </div>
      )}

      {formError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 text-left">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Columns: Forms */}
        <div className="lg:col-span-8 space-y-6 text-left">
          {/* Step 1: Patient details & shipping */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-emerald-950 uppercase tracking-wider">
                  Patient & Shipping Logistics
                </h3>
              </div>
              {authUser && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Signed in: {authUser.email}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    minLength={2}
                    placeholder="e.g., Neema Shayo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-hidden text-slate-800"
                  />
                  <User className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    minLength={6}
                    placeholder="e.g., +255 712 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-hidden text-slate-800"
                  />
                  <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Used by our Segerea courier for delivery coordination.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g., patient@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-hidden text-slate-800"
                  />
                  <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Delivery Address & Landmark
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    minLength={2}
                    placeholder="e.g., Segerea Mwisho, near Catholic Church"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-hidden text-slate-800"
                  />
                  <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-emerald-700"
                >
                  {TANZANIA_REGIONS.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">District / Locality</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-emerald-700"
                >
                  {districtsList.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Honest Settlement Options */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-sm text-emerald-950 uppercase tracking-wider">
                Payment & Settlement Option
              </h3>
            </div>

            <p className="text-xs text-slate-500 font-light leading-relaxed">
              Select how you would like to settle your order. All orders start as <strong>Pending</strong> until confirmed or paid at delivery, pickup, or verified by our clinic desk.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                      selected
                        ? "border-emerald-800 bg-emerald-50/70 shadow-xs"
                        : "border-slate-200/70 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-bold text-emerald-950 block">{opt.label}</span>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] font-semibold text-emerald-700">{opt.subtitle}</span>
                      <Icon className="w-4 h-4 text-emerald-800" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-emerald-50 text-emerald-950 rounded-xl text-xs space-y-2 border border-emerald-100">
              <p className="font-bold">Settlement Instructions: {paymentMethod}</p>
              {paymentMethod === "Cash on Delivery" && (
                <p className="font-light text-slate-600">
                  Our courier will call {phoneNumber || "your mobile number"} before arrival. Inspect your tamper-proof sealed bottles and pay {totalAmount.toLocaleString()} TZS upon delivery.
                </p>
              )}
              {paymentMethod === "Clinic Pickup (Segerea)" && (
                <p className="font-light text-slate-600">
                  Shipping fee is waived (0 TZS). Visit PJHerbal Clinic, Segerea Mwisho (near Catholic Church) and present your Order ID at the dispensary counter.
                </p>
              )}
              {paymentMethod.includes("Mobile Money") && (
                <p className="font-light text-slate-600">
                  Send <strong>{totalAmount.toLocaleString()} TZS</strong> via M-Pesa, Tigo Pesa, Airtel Money, or HaloPesa to PJHerbal Clinic Business Number <strong>+255 629 899 017</strong> (Peter Juma). Enter your SMS confirmation code below if you have already transferred, or submit first and pay after our pharmacist confirms stock.
                </p>
              )}
              {paymentMethod.includes("Bank Transfer") && (
                <p className="font-light text-slate-600">
                  Transfer <strong>{totalAmount.toLocaleString()} TZS</strong> via CRDB / NMB SimBanking and contact +255 629 899 017 for clinic account coordinates. You may attach your transfer reference code below once paid.
                </p>
              )}

              {needsPaymentRef && (
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-1">
                    Transaction / Reference Code (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g., CE84K29X1 (leave blank if paying after confirmation)"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full bg-white border border-emerald-200 focus:border-emerald-700 rounded-lg p-2.5 text-xs font-mono outline-hidden text-slate-800"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Overview */}
        <div className="lg:col-span-4 space-y-6 text-left">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-emerald-950 text-base border-b border-slate-100 pb-3">
              Supplement Summary
            </h3>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="py-3 flex gap-3 items-center text-xs justify-between">
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 truncate block">{item.product.name}</span>
                    <span className="text-slate-400 block font-light">
                      Qty: {item.quantity} × {item.product.price.toLocaleString()} TZS
                    </span>
                  </div>
                  <span className="font-bold text-emerald-950">
                    {(item.product.price * item.quantity).toLocaleString()} TZS
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold">{subtotal.toLocaleString()} TZS</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-{discountAmount.toLocaleString()} TZS</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>{isClinicPickup ? "Clinic Pickup (Segerea)" : `Courier Delivery (${selectedRegion})`}</span>
                <span className="font-semibold">+{shippingFee.toLocaleString()} TZS</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm">
                <span className="font-serif font-bold text-emerald-950">Total Amount</span>
                <span className="font-extrabold text-emerald-800">{totalAmount.toLocaleString()} TZS</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 rounded-lg text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-emerald-800" /> Authenticated Firestore Order Log
            </div>

            <button
              type="submit"
              disabled={submitting || !authUser}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{authUser ? "Confirm & Place Order" : "Sign In Above to Place Order"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
