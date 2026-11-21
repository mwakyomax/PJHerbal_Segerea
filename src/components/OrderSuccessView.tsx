/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  CheckCircle,
  ShoppingBag,
  Truck,
  MessageCircle,
  ArrowRight,
  ClipboardCheck
} from "lucide-react";
import { Order } from "../types";

interface OrderSuccessViewProps {
  latestOrder: Order | null;
  setCurrentPath: (path: string) => void;
}

export default function OrderSuccessView({ latestOrder, setCurrentPath }: OrderSuccessViewProps) {
  if (!latestOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 font-sans text-slate-800 text-center space-y-5">
        <h1 className="text-2xl font-serif font-bold text-emerald-950">No Recent Order Selected</h1>
        <p className="text-xs text-slate-500">
          Open your Patient Portal to view all orders linked to your Google account, or browse the dispensary shop.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentPath("customer-dashboard")}
            className="px-5 py-2.5 bg-emerald-900 text-white text-xs font-bold rounded-xl"
          >
            Patient Portal
          </button>
          <button
            type="button"
            onClick={() => setCurrentPath("shop")}
            className="px-5 py-2.5 bg-stone-100 text-slate-700 text-xs font-bold rounded-xl"
          >
            Browse Shop
          </button>
        </div>
      </div>
    );
  }

  const orderId = latestOrder.id;
  const customerName = latestOrder.customerDetails.fullName;
  const customerPhone = latestOrder.customerDetails.phoneNumber;
  const totalAmount = latestOrder.totalAmount;
  const deliveryAddress = latestOrder.customerDetails.deliveryAddress;
  const estimatedDelivery = latestOrder.estimatedDelivery;

  const whatsappUrl = `https://wa.me/255629899017?text=${encodeURIComponent(
    `Hello PJHerbal Segerea! I just placed supplement order *${orderId}* (${latestOrder.paymentMethod}, Total: ${totalAmount.toLocaleString()} TZS${
      latestOrder.paymentReference ? `, Ref: ${latestOrder.paymentReference}` : ""
    }). Delivery location: ${deliveryAddress}. Please confirm dispatch.`
  )}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 font-sans text-slate-800 text-center space-y-8">
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 space-y-4 shadow-2xs relative overflow-hidden">

        <div className="w-16 h-16 rounded-full bg-emerald-800 text-amber-400 flex items-center justify-center mx-auto shadow-md border-2 border-white">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Order Logged</span>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-emerald-950">Asante Sana, {customerName}!</h1>
          <p className="text-xs text-emerald-800/80 font-light max-w-sm mx-auto">
            Your order has been saved securely to the PJHerbal Segerea database. Our dispensary team will confirm your formulation and settlement shortly.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs text-left space-y-4">
        <h3 className="font-serif font-bold text-sm text-emerald-950 flex items-center gap-1.5 border-b border-slate-50 pb-3">
          <ClipboardCheck className="w-4 h-4 text-emerald-800" /> Clinic Order Slip
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Order Reference:</span>
            <span className="font-mono font-bold text-emerald-800">{orderId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Order Status:</span>
            <span className="font-bold text-amber-700">{latestOrder.status}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Payment Method:</span>
            <span className="font-medium text-slate-700">{latestOrder.paymentMethod}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Payment Verification:</span>
            <span className="font-bold text-amber-700">{latestOrder.paymentStatus}</span>
          </div>

          {latestOrder.paymentReference && (
            <div className="flex justify-between">
              <span className="text-slate-400">Submitted Reference:</span>
              <span className="font-mono font-bold text-slate-700">{latestOrder.paymentReference}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-slate-400">Registered Phone:</span>
            <span className="font-medium text-slate-700">{customerPhone}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Total Amount Due:</span>
            <span className="font-extrabold text-emerald-950">{totalAmount.toLocaleString()} TZS</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Delivery Landmark:</span>
            <span className="font-medium text-slate-700">{deliveryAddress}</span>
          </div>

          <div className="flex justify-between border-t border-slate-50 pt-3">
            <span className="text-slate-400 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-800" /> Estimated Arrival:
            </span>
            <span className="font-bold text-emerald-800">{estimatedDelivery}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1 text-left">
        <p className="font-bold text-slate-700">How to track your supplement dispatch</p>
        <p className="font-light text-slate-500 leading-normal">
          Switch to your <strong>Patient Portal</strong> to monitor live updates as our Segerea herbalists verify payment, seal your bottles, and assign a courier.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-3 px-4 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4 fill-current" /> Confirm on WhatsApp
        </a>

        <button
          type="button"
          onClick={() => setCurrentPath("customer-dashboard")}
          className="py-3 px-4 bg-emerald-950 hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" /> Live Order Tracking
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setCurrentPath("home")}
          className="text-xs font-bold text-slate-400 hover:text-emerald-800 flex items-center gap-1 mx-auto transition-colors"
        >
          Return to Clinic Homepage <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
