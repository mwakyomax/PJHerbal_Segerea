/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  RefreshCw,
  Truck,
  Calendar,
  MessageSquare,
  Lock,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  LogOut,
  XCircle,
  Loader2
} from "lucide-react";
import { Order, Product, UserProfile } from "../types";
import { TANZANIA_REGIONS } from "../data";
import { FirebaseUser } from "../lib/firebase";

interface CustomerDashboardViewProps {
  authUser: FirebaseUser | null;
  authReady: boolean;
  userProfile: UserProfile | null;
  products: Product[];
  orders: Order[];
  wishlist: Product[];
  onSignInWithGoogle: () => Promise<FirebaseUser | null>;
  onSignOut: () => Promise<void>;
  onUpdateProfile: (
    updates: Partial<Pick<UserProfile, "name" | "phone" | "region" | "district" | "address">>
  ) => Promise<void>;
  onCancelOrder: (order: Order) => Promise<void>;
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onReorder: (order: Order) => void;
  setCurrentPath: (path: string) => void;
  setProductSlug: (slug: string) => void;
}

export default function CustomerDashboardView({
  authUser,
  authReady,
  userProfile,
  products,
  orders,
  wishlist,
  onSignInWithGoogle,
  onSignOut,
  onUpdateProfile,
  onCancelOrder,
  onRemoveFromWishlist,
  onAddToCart,
  onReorder,
  setCurrentPath,
  setProductSlug
}: CustomerDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses" | "security">("orders");
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");

  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [regionInput, setRegionInput] = useState("Dar es Salaam");
  const [districtInput, setDistrictInput] = useState("Ilala (includes Segerea)");
  const [addressInput, setAddressInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setNameInput(userProfile.name || "");
      setPhoneInput(userProfile.phone || "");
      setRegionInput(userProfile.region || "Dar es Salaam");
      setDistrictInput(userProfile.district || "Ilala (includes Segerea)");
      setAddressInput(userProfile.address || "");
    } else if (authUser) {
      setNameInput(authUser.displayName || "");
    }
  }, [userProfile, authUser]);

  const handleGoogleLogin = async () => {
    setAuthError("");
    setSigningIn(true);
    try {
      await onSignInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Google Sign-In failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);
    try {
      await onUpdateProfile({
        name: nameInput.trim(),
        phone: phoneInput.trim(),
        region: regionInput,
        district: districtInput.trim(),
        address: addressInput.trim()
      });
      setProfileSuccess("Default clinic address & contact details saved to Firestore!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to save profile preferences.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelPendingOrder = async (order: Order) => {
    setCancellingId(order.id);
    try {
      await onCancelOrder(order);
    } finally {
      setCancellingId(null);
    }
  };

  const handleProductClick = (slug: string) => {
    setProductSlug(slug);
    setCurrentPath(`product/${slug}`);
  };

  const handleOrderItemClick = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      handleProductClick(found.slug);
    } else {
      setCurrentPath("shop");
    }
  };

  const getWhatsAppSupportUrl = (orderId: string) =>
    `https://wa.me/255629899017?text=${encodeURIComponent(
      `Hello PJHerbal Segerea! I am inquiring about my order ID: ${orderId}. Can I get an update on dispatch?`
    )}`;

  if (!authReady) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-800 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Connecting to PJHerbal Patient Gateway...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 font-sans text-slate-800 text-left">
        <div className="bg-white border border-stone-200/60 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-100/50 shadow-2xs">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-serif font-bold text-emerald-950">Patient Secure Gateway</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with your Google account to track supplement orders, manage delivery addresses, and view your saved wishlist.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex gap-2.5 items-start text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium">{authError}</span>
            </div>
          )}

          <button
            type="button"
            disabled={signingIn}
            onClick={handleGoogleLogin}
            className="w-full bg-emerald-800 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-4 rounded-xl hover:bg-emerald-900 active:scale-98 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {signingIn && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Continue with Google</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Authenticated via Firebase Auth. All orders and wishlists are privately scoped to your verified Google identity.
          </p>
        </div>
      </div>
    );
  }

  const displayName = userProfile?.name || authUser.displayName || authUser.email?.split("@")[0] || "Patient";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-slate-800 text-left">
      <div className="bg-emerald-950 text-white rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-emerald-900 shadow-md">
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="w-16 h-16 rounded-full bg-amber-400 text-emerald-950 font-serif font-extrabold text-2xl flex items-center justify-center shadow-lg border-2 border-white">
            {initials || "PJ"}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-serif font-bold">{displayName}</h1>
            <p className="text-emerald-300 text-xs font-light">
              {authUser.email} {userProfile?.phone ? `• ${userProfile.phone}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="text-center bg-emerald-900/60 border border-emerald-800 p-3 rounded-2xl min-w-28">
            <span className="block text-2xl font-extrabold text-amber-400 font-mono">{orders.length}</span>
            <span className="text-[10px] uppercase text-emerald-200 tracking-wider">Orders Logged</span>
          </div>
          <div className="text-center bg-emerald-900/60 border border-emerald-800 p-3 rounded-2xl min-w-28">
            <span className="block text-2xl font-extrabold text-amber-400 font-mono">{wishlist.length}</span>
            <span className="text-[10px] uppercase text-emerald-200 tracking-wider">Wishlisted</span>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-100 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3 space-y-2">
          {[
            { id: "orders", label: "My Orders History", icon: ShoppingBag },
            { id: "wishlist", label: "Saved Wishlist", icon: Heart },
            { id: "addresses", label: "Delivery Addresses", icon: MapPin },
            { id: "security", label: "Security & Account", icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "orders" | "wishlist" | "addresses" | "security")}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-slate-600 bg-white hover:bg-slate-50 border border-slate-100"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100/80">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:text-rose-700"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log Out of Session</span>
            </button>
          </div>
        </aside>

        <main className="lg:col-span-9 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs min-h-[400px]">
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-emerald-950 text-lg border-b border-slate-50 pb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-800" /> Supplement Orders
              </h3>

              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800">
                            Order ID: <span className="font-mono text-emerald-800">{order.id}</span>
                          </p>
                          <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Ordered: {order.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5" /> Courier: {order.deliveryCourier || "Pending Assignment"}
                            </span>
                            {order.trackingNumber && (
                              <span className="font-mono text-emerald-800">Tracking: {order.trackingNumber}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-extrabold text-emerald-950">
                            {order.totalAmount.toLocaleString()} TZS
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.paymentStatus === "Paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.paymentStatus === "Failed"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            Pay: {order.paymentStatus}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 divide-y divide-slate-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                            <div className="space-y-0.5">
                              <button
                                type="button"
                                onClick={() => handleOrderItemClick(item.productId)}
                                className="font-bold text-slate-800 hover:text-emerald-800 transition-colors cursor-pointer text-left"
                              >
                                {item.productName}
                              </button>
                              <p className="text-[10px] text-slate-400 font-light">
                                Quantity: {item.quantity} × {item.price.toLocaleString()} TZS
                              </p>
                            </div>
                            <span className="font-bold text-slate-700">
                              {(item.price * item.quantity).toLocaleString()} TZS
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Real-Time Routing & Dispatch Logs
                        </p>
                        <div className="relative pl-4 border-l border-emerald-800/20 space-y-3 text-left">
                          {order.trackingLogs.map((log, i) => (
                            <div key={i} className="relative">
                              <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-800" />
                              <div className="text-[11px]">
                                <span className="font-bold text-emerald-950">{log.status}</span>
                                <span className="text-[9px] text-slate-400 ml-2">{log.timestamp}</span>
                                <p className="text-slate-500 font-light mt-0.5">{log.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-white border-t border-slate-50 flex flex-wrap justify-between items-center gap-2">
                        <a
                          href={getWhatsAppSupportUrl(order.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Consult Clinic on WhatsApp
                        </a>
                        <div className="flex items-center gap-2">
                          {order.status === "Pending" && (
                            <button
                              type="button"
                              disabled={cancellingId === order.id}
                              onClick={() => handleCancelPendingOrder(order)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onReorder(order)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Reorder All Items
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-4">
                  <p className="text-sm font-semibold">You have no orders logged under {authUser.email} yet.</p>
                  <button
                    type="button"
                    onClick={() => setCurrentPath("shop")}
                    className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-lg"
                  >
                    Go To Shop
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-emerald-950 text-lg border-b border-slate-50 pb-3">
                My Saved Supplement Wishlist
              </h3>

              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {wishlist.map((product) => (
                    <div
                      key={product.id}
                      className="border border-slate-100 rounded-2xl p-4 flex gap-4 items-center text-left hover:border-emerald-200 transition-colors bg-white shadow-2xs"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        onClick={() => handleProductClick(product.slug)}
                        className="w-16 h-16 object-cover rounded-xl border border-slate-100 shadow-2xs cursor-pointer shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4
                          onClick={() => handleProductClick(product.slug)}
                          className="font-bold text-sm text-slate-800 hover:text-emerald-800 transition-colors cursor-pointer truncate"
                        >
                          {product.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-semibold">{product.category}</span>
                        <p className="text-xs font-bold text-emerald-950">{product.price.toLocaleString()} TZS</p>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            disabled={product.stock <= 0}
                            onClick={() => onAddToCart(product, 1)}
                            className="text-[10px] font-bold text-emerald-800 hover:underline disabled:text-slate-400"
                          >
                            {product.stock <= 0 ? "Out of Stock" : "Add To Cart"}
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => onRemoveFromWishlist(product)}
                            className="text-[10px] font-bold text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic py-12 text-center">
                  Your wishlist is currently empty. Click the heart icon on any supplement card to save it here.
                </p>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-emerald-950 text-lg border-b border-slate-50 pb-3">
                Clinic Billing & Delivery Preferences
              </h3>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      minLength={1}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg p-2.5 text-xs outline-hidden text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+255 712 345 678"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg p-2.5 text-xs outline-hidden text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Region</label>
                    <select
                      value={regionInput}
                      onChange={(e) => setRegionInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 focus:bg-white outline-hidden"
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
                    <input
                      type="text"
                      required
                      placeholder="e.g., Ilala / Segerea Mwisho"
                      value={districtInput}
                      onChange={(e) => setDistrictInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg p-2.5 text-xs outline-hidden text-slate-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Street Address & Landmark
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Segerea Block B, near Catholic Church"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg p-2.5 text-xs outline-hidden text-slate-800"
                    />
                  </div>
                </div>

                {profileError && <p className="text-xs font-bold text-rose-600">{profileError}</p>}
                {profileSuccess && <p className="text-xs font-bold text-emerald-700">{profileSuccess}</p>}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  {savingProfile ? "Saving..." : "Save Address Preferences"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-emerald-950 text-lg border-b border-slate-50 pb-3">
                Patient Account & Authentication
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl text-xs space-y-1.5">
                  <p className="font-bold">Verified Google Identity</p>
                  <p className="font-light text-slate-600">
                    Your profile is linked to <span className="font-mono text-emerald-800">{authUser.email}</span> (Role:{" "}
                    <strong className="text-emerald-950">{userProfile?.role || "customer"}</strong>). All orders and wishlists are stored in Firestore and strictly protected by per-user security rules.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Firebase UID</span>
                    <span className="font-mono text-slate-700 break-all">{authUser.uid}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Verification</span>
                    <span className="font-bold text-emerald-700">
                      {authUser.emailVerified ? "Verified Google Account" : "Pending Verification"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
