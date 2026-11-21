/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Trash2,
  Tag,
  MapPin,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  Info
} from "lucide-react";
import { CartItem, PromoCampaign } from "../types";
import { TANZANIA_REGIONS } from "../data";
import { resolveProductImage, handleImageFallback } from "../lib/clinicMedia";

interface CartViewProps {
  cartItems: CartItem[];
  couponCode: string;
  setCouponCode: (code: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  setCurrentPath: (path: string) => void;
  availableCampaigns: PromoCampaign[];
}

export default function CartView({
  cartItems,
  couponCode,
  setCouponCode,
  selectedRegion,
  setSelectedRegion,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  setCurrentPath,
  availableCampaigns
}: CartViewProps) {
  const [promoInput, setPromoInput] = useState(couponCode);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(couponCode ? "Promo coupon applied successfully!" : "");

  const activeCampaigns = availableCampaigns.filter((c) => c.active);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const activePromo = activeCampaigns.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
  const discountRate = activePromo ? activePromo.discountPercentage / 100 : 0;
  const discountAmount = Math.round(subtotal * discountRate);

  const regionData = TANZANIA_REGIONS.find((r) => r.name === selectedRegion);
  const shippingFee = subtotal > 0 ? (regionData ? regionData.baseShipping : 3000) : 0;

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    if (!promoInput.trim()) {
      setCouponCode("");
      return;
    }

    const campaign = activeCampaigns.find((c) => c.code.toUpperCase() === promoInput.toUpperCase().trim());
    if (campaign) {
      setCouponCode(campaign.code);
      setPromoSuccess(`"${campaign.code}" applied! You save ${campaign.discountPercentage}% on all supplements.`);
    } else {
      setPromoError("Invalid or expired discount coupon code. Please check active offers below.");
      setCouponCode("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-slate-800">
      <div className="text-left mb-8 border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-serif font-bold text-emerald-950 flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-emerald-800" /> Patient Shopping Cart
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review your selected wellness formulations and configure clinic shipping parameters.
        </p>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-100 hidden md:grid md:grid-cols-12 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                <span className="col-span-6">Supplement details</span>
                <span className="col-span-2 text-center">Unit Price</span>
                <span className="col-span-2 text-center">Quantity</span>
                <span className="col-span-2 text-right">Subtotal</span>
              </div>

              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => {
                  const itemSubtotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      className="p-5 flex flex-col md:grid md:grid-cols-12 gap-4 items-center text-left"
                    >
                      <div className="col-span-6 flex gap-4 w-full items-center">
                        <img
                          src={resolveProductImage(item.product)}
                          alt={item.product.name}
                          onError={handleImageFallback}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-100 shadow-2xs shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">
                            {item.product.category}
                          </span>
                          <h3
                            onClick={() => setCurrentPath(`product/${item.product.slug}`)}
                            className="font-bold text-sm text-slate-800 hover:text-emerald-800 cursor-pointer truncate"
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-light truncate">{item.product.shortBenefits}</p>

                          {item.product.stock <= 5 && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm mt-1">
                              Only {item.product.stock} bottles left
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 text-center w-full md:w-auto flex justify-between md:justify-center items-center text-xs">
                        <span className="md:hidden font-semibold text-slate-500">Unit Price</span>
                        <span className="font-bold text-slate-700">{item.product.price.toLocaleString()} TZS</span>
                      </div>

                      <div className="col-span-2 text-center w-full md:w-auto flex justify-between md:justify-center items-center">
                        <span className="md:hidden font-semibold text-slate-500">Quantity</span>
                        <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg overflow-hidden scale-90">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-slate-600 font-bold hover:bg-slate-100 text-xs transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQty(item.product.id, Math.min(Math.max(1, item.product.stock), item.quantity + 1))
                            }
                            className="px-2.5 py-1 text-slate-600 font-bold hover:bg-slate-100 text-xs transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="col-span-2 text-right w-full md:w-auto flex justify-between md:justify-end items-center gap-4 text-xs font-bold">
                        <span className="md:hidden font-semibold text-slate-500">Subtotal</span>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-900">{itemSubtotal.toLocaleString()} TZS</span>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentPath("shop")}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs font-bold text-red-500 hover:text-red-700"
                >
                  Clear All Cart Items
                </button>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-left">
              <Info className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Segerea Local Fulfillment Advantage</p>
                <p className="text-[11px] text-emerald-800/80 font-light mt-0.5">
                  Customers in Segerea & Dar es Salaam enjoy same-day dispatch with Cash on Delivery, Clinic Pickup, or direct Mobile Money / Bank Transfer.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-left">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-800" /> Shipping Destination
              </h3>
              <p className="text-xs text-slate-500 font-light">
                Select your delivery region to calculate exact base courier fees automatically.
              </p>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-emerald-700 cursor-pointer"
              >
                {TANZANIA_REGIONS.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name} ({r.baseShipping.toLocaleString()} TZS)
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-800" /> Apply Coupon Code
              </h3>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-hidden focus:border-emerald-700 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-950 text-white font-bold text-xs rounded-lg hover:bg-emerald-900 transition-colors"
                >
                  Apply
                </button>
              </form>

              {promoError && <p className="text-[11px] font-bold text-red-500">{promoError}</p>}
              {promoSuccess && (
                <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {promoSuccess}
                </p>
              )}

              {activeCampaigns.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Available Offers
                  </p>
                  <div className="space-y-1">
                    {activeCampaigns.map((camp) => (
                      <button
                        type="button"
                        key={camp.code}
                        onClick={() => {
                          setPromoInput(camp.code);
                          setCouponCode(camp.code);
                          setPromoSuccess(
                            `"${camp.code}" applied! You save ${camp.discountPercentage}% on all supplements.`
                          );
                          setPromoError("");
                        }}
                        className="w-full text-left bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/50 p-2 rounded-lg transition-colors flex justify-between items-center text-[10px]"
                      >
                        <div>
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-1 py-0.5 rounded-sm">
                            {camp.code}
                          </span>
                          <p className="text-slate-500 font-light mt-0.5">{camp.description}</p>
                        </div>
                        <span className="font-bold text-emerald-800 shrink-0">-{camp.discountPercentage}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md space-y-4 border border-emerald-900">
              <h3 className="font-serif font-bold text-base text-amber-400 border-b border-emerald-900 pb-3">
                Checkout Receipt
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-emerald-200">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-white">{subtotal.toLocaleString()} TZS</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Campaign Discount ({activePromo?.discountPercentage}%)</span>
                    <span className="font-bold font-mono">-{discountAmount.toLocaleString()} TZS</span>
                  </div>
                )}

                <div className="flex justify-between text-emerald-200">
                  <span>Courier Delivery ({selectedRegion})</span>
                  <span className="font-bold text-white">+{shippingFee.toLocaleString()} TZS</span>
                </div>

                <div className="border-t border-emerald-900 pt-3 flex justify-between text-sm">
                  <span className="font-bold text-amber-400">Grand Total</span>
                  <span className="font-extrabold text-white text-base">{totalAmount.toLocaleString()} TZS</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPath("checkout")}
                className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                Proceed To Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-[10px] text-emerald-300 font-light">
                  Packaging included. Real-time clinic order confirmation.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-emerald-950 text-lg">Your Cart is Currently Empty</h3>
          </div>
          <button
            type="button"
            onClick={() => setCurrentPath("shop")}
            className="px-6 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-full hover:bg-emerald-700 transition-colors"
          >
            Go to Supplement Dispensary
          </button>
        </div>
      )}
    </div>
  );
}
