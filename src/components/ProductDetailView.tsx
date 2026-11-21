/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Star,
  MessageCircle,
  ShoppingCart,
  ChevronRight,
  ShieldAlert,
  Leaf,
  CalendarClock,
  Check,
  AlertTriangle,
  UserCheck,
  Heart,
  Loader2
} from "lucide-react";
import { Product, Review } from "../types";
import { FirebaseUser } from "../lib/firebase";
import { subscribeProductReviews } from "../lib/firestoreService";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  setCurrentPath: (path: string) => void;
  setProductSlug: (slug: string) => void;
  onAddReview: (productId: string, review: Omit<Review, "productId" | "userId" | "createdAt">) => Promise<void>;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  authUser: FirebaseUser | null;
  onSignInWithGoogle: () => Promise<FirebaseUser | null>;
}

export default function ProductDetailView({
  product,
  relatedProducts,
  onAddToCart,
  onBuyNow,
  setCurrentPath,
  setProductSlug,
  onAddReview,
  wishlistIds,
  onToggleWishlist,
  authUser,
  onSignInWithGoogle
}: ProductDetailViewProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Review Form State
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    const unsub = subscribeProductReviews(product.id, (list) => {
      setReviews(list);
    });
    return () => unsub();
  }, [product.id]);

  useEffect(() => {
    if (authUser?.displayName && !reviewAuthor) {
      setReviewAuthor(authUser.displayName);
    }
  }, [authUser, reviewAuthor]);

  const isWishlisted = wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0;

  const displayReviewsCount = reviews.length > 0 ? reviews.length : product.reviewsCount;
  const displayRating =
    reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : product.rating;

  const incrementQty = () => setQuantity((prev) => Math.min(Math.max(1, product.stock), prev + 1));
  const decrementQty = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    if (reviewAuthor.trim().length < 2 || reviewComment.trim().length < 3) {
      setReviewError("Please provide your name (at least 2 characters) and review feedback.");
      return;
    }

    setReviewSubmitting(true);
    try {
      let user = authUser;
      if (!user) {
        user = await onSignInWithGoogle();
        if (!user) {
          setReviewError("Google sign-in is required to verify and publish your patient review.");
          setReviewSubmitting(false);
          return;
        }
      }

      const newReview: Omit<Review, "productId" | "userId" | "createdAt"> = {
        id: `rev-${Date.now()}`,
        author: reviewAuthor.trim(),
        rating: reviewRating,
        date: new Date().toISOString().split("T")[0],
        comment: reviewComment.trim(),
        verified: true
      };

      await onAddReview(product.id, newReview);
      setReviewSubmitted(true);
      setReviewComment("");
      setTimeout(() => setReviewSubmitted(false), 4000);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Could not submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/255629899017?text=${encodeURIComponent(
    `Hello PJHerbal Clinic! I am looking at "${product.name}" and have a few questions about its ingredients/benefits before I order. Can you assist?`
  )}`;

  const handleProductSelect = (slug: string) => {
    setProductSlug(slug);
    setActiveImageIdx(0);
    setQuantity(1);
    setCurrentPath(`product/${slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-slate-800">
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-8 text-left">
        <button type="button" onClick={() => setCurrentPath("home")} className="hover:text-emerald-800 font-medium">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button type="button" onClick={() => setCurrentPath("shop")} className="hover:text-emerald-800 font-medium">
          Shop Dispensary
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-emerald-900 font-bold truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left items-start mb-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative shadow-sm">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            {product.stock <= 5 && product.stock > 0 && (
              <span className="absolute top-4 left-4 bg-amber-500 text-white font-bold text-xs py-1 px-3 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Low Stock Alert ({product.stock} left)
              </span>
            )}
            <button
              type="button"
              onClick={() => onToggleWishlist(product)}
              className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md transition-all cursor-pointer ${
                isWishlisted ? "bg-rose-500 text-white" : "bg-white/90 text-slate-600 hover:text-rose-500"
              }`}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIdx === idx ? "border-emerald-800 scale-95" : "border-slate-100 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="text-center space-y-1">
              <Leaf className="w-5 h-5 text-emerald-800 mx-auto" />
              <p className="text-[10px] font-bold text-emerald-950">100% Herbal</p>
              <p className="text-[9px] text-slate-400 font-light">Organic Extract</p>
            </div>
            <div className="text-center space-y-1 border-x border-slate-200">
              <CalendarClock className="w-5 h-5 text-emerald-800 mx-auto" />
              <p className="text-[10px] font-bold text-emerald-950">2029 Expiry</p>
              <p className="text-[9px] text-slate-400 font-light">Freshly Batched</p>
            </div>
            <div className="text-center space-y-1">
              <UserCheck className="w-5 h-5 text-emerald-800 mx-auto" />
              <p className="text-[10px] font-bold text-emerald-950">Approved</p>
              <p className="text-[9px] text-slate-400 font-light">By Clinic Director</p>
            </div>
          </div>
        </div>

        {/* Right: Product Details Sheet */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(displayRating) ? "fill-current" : "text-slate-200"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-emerald-900">{displayRating} Rating</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500">({displayReviewsCount} patient reviews)</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinic Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-emerald-950">
                  {product.price.toLocaleString()} TZS
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {product.originalPrice.toLocaleString()} TZS
                  </span>
                )}
              </div>
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${
                  product.stock > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock"}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-light">{product.description}</p>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Therapeutic Ingredients</h4>
            <div className="flex flex-wrap gap-1.5">
              {product.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg border border-slate-200/40 font-medium"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-4 space-y-1">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              Clinical Usage Instructions
            </h4>
            <p className="text-xs text-emerald-900 leading-relaxed font-light">{product.usageInstructions}</p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expected Health Benefits</h4>
            <div className="space-y-1.5">
              {product.benefits.map((benefit, i) => (
                <div key={i} className="flex gap-2 items-start text-xs text-slate-600">
                  <div className="bg-emerald-100 text-emerald-800 rounded-full p-0.5 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-light leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {product.warnings.length > 0 && (
            <div className="border border-amber-100 bg-amber-50 rounded-2xl p-4 space-y-1">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" /> Precautions & Warnings
              </h4>
              <div className="space-y-1 text-left">
                {product.warnings.map((warning, idx) => (
                  <p key={idx} className="text-[11px] text-amber-900 font-light">
                    • {warning}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={decrementQty}
                  className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors border-r border-slate-200 disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 py-1 text-sm font-bold text-slate-800">{outOfStock ? 0 : quantity}</span>
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={incrementQty}
                  className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors border-l border-slate-200 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => onAddToCart(product, quantity)}
                className="flex-1 py-3 px-4 bg-emerald-950 hover:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> {outOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() => onBuyNow(product, quantity)}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-500 active:scale-95 text-emerald-950 font-bold text-xs rounded-xl transition-all"
              >
                Buy Now
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" /> Consult Expert
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section: Live Firestore Subcollection */}
      <section className="border-t border-slate-100 pt-12 mb-16 text-left">
        <h2 className="text-xl font-serif font-bold text-emerald-950 mb-8">
          Patient Feedback & Reviews ({reviews.length})
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-6">
            {reviews.length > 0 ? (
              <div className="divide-y divide-slate-100 space-y-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-6 first:pt-0 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{rev.author}</span>
                        {rev.verified && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <UserCheck className="w-2.5 h-2.5" /> Verified Patient
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{rev.date}</span>
                    </div>

                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "text-slate-200"}`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-light italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">
                No patient reviews logged yet in Firestore for this formula. Be the first verified patient to share your experience.
              </p>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
            <h3 className="font-serif font-bold text-emerald-950 text-base mb-4">Submit Supplement Review</h3>

            {reviewSubmitted ? (
              <div className="p-4 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl text-center space-y-1.5">
                <p>Review saved to clinic database!</p>
                <p className="font-light text-[10px]">
                  Your verified feedback is now visible to other patients.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && (
                  <p className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                    {reviewError}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Juma Hamisi"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-hidden focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-amber-400 focus:outline-hidden"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? "fill-current" : "text-slate-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Clinical Comments / Experience
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe how this supplement helped your energy, symptoms, or daily health..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-hidden focus:border-emerald-700 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {reviewSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{authUser ? "Submit Review" : "Sign In with Google & Submit"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="text-left border-t border-slate-100 pt-12">
          <h2 className="text-xl font-serif font-bold text-emerald-950 mb-6">Related Dietary Supplements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rp) => (
              <div
                key={rp.id}
                onClick={() => handleProductSelect(rp.slug)}
                className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-emerald-200 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square rounded-xl overflow-hidden mb-3">
                    <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 block mb-1 uppercase">{rp.category}</span>
                  <h3 className="font-bold text-xs text-slate-800 hover:text-emerald-800 transition-colors line-clamp-1">
                    {rp.name}
                  </h3>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-950">{rp.price.toLocaleString()} TZS</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-sm">
                    View
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
