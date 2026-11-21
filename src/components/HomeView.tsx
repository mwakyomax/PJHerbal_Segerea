/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Truck,
  HeartHandshake,
  Sparkles,
  Star,
  BookOpen,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Heart,
  Database
} from "lucide-react";
import { motion } from "motion/react";
import { Product, Category, BlogArticle, SiteSettings } from "../types";

interface HomeViewProps {
  products: Product[];
  blogs: BlogArticle[];
  siteSettings: SiteSettings;
  catalogLoading: boolean;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  setCurrentPath: (path: string) => void;
  setProductSlug: (slug: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onSelectCategory: (category: Category | null) => void;
}

export default function HomeView({
  products,
  blogs,
  siteSettings,
  catalogLoading,
  wishlistIds,
  onToggleWishlist,
  setCurrentPath,
  setProductSlug,
  onAddToCart,
  onSelectCategory
}: HomeViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = useMemo(
    () => [
      {
        image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1200&auto=format&fit=crop",
        title: siteSettings.heroTitleText,
        subtitle: "PJHERBAL CLINIC — SEGEREA BRANCH",
        description: siteSettings.heroDescText,
        badge: siteSettings.heroBadgeText,
        ctaPrimary: "Explore Dispensary",
        ctaSecondary: "Chat With Specialist",
        targetCategory: null as Category | null
      },
      {
        image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=1200&auto=format&fit=crop",
        title: "Prioritize Prostate & Men's Vitality",
        subtitle: "MZEE-APPROVED NATURAL FORMULAS",
        description:
          "Defend against nighttime bathroom trips and reclaim your physical strength with our high-grade Saw Palmetto and pumpkin seed extracts.",
        badge: "Specialist Approved",
        ctaPrimary: "Shop Men's Health",
        ctaSecondary: "Consult on WhatsApp",
        targetCategory: "Men's Health" as Category
      },
      {
        image: "https://images.unsplash.com/photo-1611070973770-b1a672610041?w=1200&auto=format&fit=crop",
        title: "Pure Moringa from Tanzanian Soil",
        subtitle: "NUTRITIONAL SUPERFOOD IMMUNE BOOSTER",
        description:
          "Sourced directly from organic Morogoro fields, providing 90+ essential nutrients, calcium, and iron for ultimate cell revitalization.",
        badge: "Morogoro Sourced Special",
        ctaPrimary: "Order Moringa Now",
        ctaSecondary: "WhatsApp Consultation",
        targetCategory: "Energy & Immunity" as Category
      }
    ],
    [siteSettings]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const bestSellers = products.filter((p) => p.isBestSeller);
  const displayedBestSellers = bestSellers.length > 0 ? bestSellers : products.slice(0, 4);

  const featuredCategories: { name: Category; icon: string; count: number; desc: string }[] = [
    {
      name: "Men's Health",
      icon: "👨‍⚕️",
      count: products.filter((p) => p.category === "Men's Health").length,
      desc: "Vitality, stamina & prostate defense."
    },
    {
      name: "Weight Management",
      icon: "🔥",
      count: products.filter((p) => p.category === "Weight Management").length,
      desc: "Metabolism boosters & starch neutralizers."
    },
    {
      name: "Energy & Immunity",
      icon: "⚡",
      count: products.filter((p) => p.category === "Energy & Immunity").length,
      desc: "Morogoro Moringa & daily vitamin boosters."
    },
    {
      name: "Women's Wellness",
      icon: "🌸",
      count: products.filter((p) => p.category === "Women's Wellness").length,
      desc: "Hormonal balance, radiant glow & cycle care."
    },
    {
      name: "Brain & Focus",
      icon: "🧠",
      count: products.filter((p) => p.category === "Brain & Focus").length,
      desc: "Nootropic formulas for memory & concentration."
    },
    {
      name: "Detox & Digestion",
      icon: "🍃",
      count: products.filter((p) => p.category === "Detox & Digestion").length,
      desc: "Overnight colon cleanse & bloating relief."
    }
  ];

  const getWhatsAppUrl = (text: string) =>
    `https://wa.me/255629899017?text=${encodeURIComponent(text)}`;

  const handleProductClick = (slug: string) => {
    setProductSlug(slug);
    setCurrentPath(`product/${slug}`);
  };

  const handleFeaturedCategoryClick = (catName: Category) => {
    onSelectCategory(catName);
    setCurrentPath("shop");
  };

  const handleHeroPrimaryCta = (slideIdx: number, targetCategory: Category | null) => {
    if (slideIdx === 2) {
      const moringa = products.find((p) => p.slug.includes("moringa") || p.name.toLowerCase().includes("moringa"));
      if (moringa) {
        handleProductClick(moringa.slug);
        return;
      }
    }
    onSelectCategory(targetCategory);
    setCurrentPath("shop");
  };

  return (
    <div className="space-y-12 pb-16 font-sans bg-stone-50/60 text-slate-800">
      {/* ROW 1: HERO SLIDER & FEATURED CATEGORIES BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* HERO SLIDER (col-span-7) */}
          <div className="lg:col-span-7 bg-emerald-950 rounded-3xl overflow-hidden relative min-h-[440px] sm:min-h-[490px] lg:min-h-[530px] flex items-center shadow-md border border-emerald-900/70">
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/85 to-slate-900/60 mix-blend-multiply z-1" />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-7000 ease-out"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 z-2 flex items-center p-6 sm:p-10">
                  {idx === currentSlide && (
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="max-w-2xl text-left space-y-3.5"
                    >
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {slide.badge}
                      </span>

                      <p className="text-emerald-400 font-extrabold text-xs tracking-widest uppercase">
                        {slide.subtitle}
                      </p>

                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white leading-tight">
                        {slide.title}
                      </h1>

                      <p className="text-slate-200 text-xs sm:text-sm md:text-base max-w-lg leading-relaxed font-normal">
                        {slide.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleHeroPrimaryCta(idx, slide.targetCategory)}
                          className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                          id="hero-explore-btn"
                        >
                          <span>{slide.ctaPrimary}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                          href={getWhatsAppUrl(
                            "Hello PJHerbal Clinic, I would like a digital consultation regarding my nutritional supplement requirements."
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs sm:text-sm transition-all backdrop-blur-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                          id="hero-consult-btn"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400 fill-current" />
                          <span>{slide.ctaSecondary}</span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/50 text-white flex items-center justify-center transition-all opacity-70 hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/50 text-white flex items-center justify-center transition-all opacity-70 hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide ? "bg-amber-400 w-7" : "bg-white/40 hover:bg-white/70 w-2"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* FEATURED CATEGORIES (col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="text-left">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block mb-0.5">
                  TARGETED FORMULATIONS
                </span>
                <h3 className="font-black text-xl text-slate-800">Featured Categories</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(null);
                  setCurrentPath("shop");
                }}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold transition-colors inline-flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 flex-1">
              {featuredCategories.map((cat) => (
                <motion.button
                  type="button"
                  key={cat.name}
                  onClick={() => handleFeaturedCategoryClick(cat.name)}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="bg-stone-50 hover:bg-emerald-50/80 rounded-2xl p-3.5 flex flex-col items-center justify-center border border-stone-200/70 hover:border-emerald-200 transition-all duration-200 cursor-pointer text-center group shadow-2xs"
                >
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg mb-1.5 shadow-2xs border border-stone-200/60 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-950 block leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-500 group-hover:text-emerald-800 font-semibold mt-1 bg-white px-2 py-0.5 rounded-full border border-stone-200/60">
                    {cat.count} Products
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DISPENSARY GUARANTEE TRUST BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
          <div className="flex items-center gap-3 pt-2 sm:pt-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-800">100% Organic Extracts</h4>
              <p className="text-[11px] text-slate-500">Pure Morogoro & Tanzanian botanicals</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-800">Fast Dar Delivery</h4>
              <p className="text-[11px] text-slate-500">Dispatched within hours across DSM</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-800">Tamper-Proof Seal</h4>
              <p className="text-[11px] text-slate-500">Laboratory batch verified quality</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-800">Clinical Support</h4>
              <p className="text-[11px] text-slate-500">Direct WhatsApp guidance daily</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 2: QUICK STATS & CONSULTATION BENTO BOXES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 bg-emerald-50/70 border border-emerald-100/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-center items-center text-center shadow-xs">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block mb-2">
              VERIFIED PATIENT COMMUNITY
            </span>
            <div className="text-4xl font-black text-emerald-950 tracking-tight mb-1">15,000+</div>
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              Patients Restored Across Tanzania
            </div>

            <div className="mt-4 flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-600 flex items-center justify-center text-xs text-white font-bold">
                A
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-500 flex items-center justify-center text-xs text-emerald-950 font-bold">
                B
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-rose-500 flex items-center justify-center text-xs text-white font-bold">
                L
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-800 flex items-center justify-center text-[10px] text-white font-bold">
                +15k
              </div>
            </div>
            <p className="text-[11px] text-emerald-800/80 mt-3 max-w-xs leading-relaxed font-medium">
              Serving Segerea, Ilala, Dar es Salaam, and nationwide clinics with authentic therapeutic botanicals.
            </p>
          </div>

          <a
            href={getWhatsAppUrl(
              "Hello PJHerbal Clinic, I would like a digital consultation regarding my nutritional supplement requirements."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="lg:col-span-7 bg-amber-500 hover:bg-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 group cursor-pointer transition-all duration-300 shadow-sm border border-amber-400"
          >
            <div className="w-16 h-16 bg-emerald-950 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
              <MessageCircle className="w-8 h-8 text-amber-400 fill-current" />
            </div>
            <div className="text-left flex-1 space-y-1.5">
              <span className="bg-emerald-950 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                FREE DIGITAL CONSULTATION
              </span>
              <h3 className="font-black text-emerald-950 text-xl leading-tight uppercase">
                Direct WhatsApp Consultation
              </h3>
              <p className="text-emerald-950/90 text-xs font-medium max-w-md leading-relaxed">
                Chat directly with Dr. Peter Juma and our certified wellness herbalists for personalized guidance on dosage and herbal remedies.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-black text-emerald-950 group-hover:translate-x-1.5 transition-transform">
                <span>Start WhatsApp Conversation</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* ROW 3: BEST SELLING PRODUCTS (LIVE FIRESTORE) */}
      <section className="bg-emerald-950 text-white rounded-3xl py-12 px-6 sm:px-10 max-w-7xl mx-auto border border-emerald-900 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-800/10 rounded-full blur-3xl -z-1" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-1" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Clinical Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">Best Selling Formulations</h2>
            <p className="text-emerald-200/80 text-xs max-w-lg">
              Tanzania's most requested natural wellness solutions. Synchronized live from our Segerea Dispensary database.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCurrentPath("shop");
              onSelectCategory(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline transition-all shrink-0"
          >
            <span>See All Products ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {catalogLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-emerald-900/40 border border-emerald-800/60 rounded-3xl h-96 animate-pulse" />
            ))}
          </div>
        ) : displayedBestSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedBestSellers.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const outOfStock = product.stock <= 0;
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-emerald-900/50 backdrop-blur-xs border border-emerald-800/90 hover:border-amber-400/50 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group h-full text-left"
                >
                  <div
                    onClick={() => handleProductClick(product.slug)}
                    className="relative aspect-square overflow-hidden cursor-pointer bg-white"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {product.originalPrice && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product);
                      }}
                      title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-xs transition-all cursor-pointer ${
                        isWishlisted
                          ? "bg-rose-500 text-white"
                          : "bg-white/90 text-slate-600 hover:text-rose-500"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-extrabold text-emerald-300 uppercase tracking-widest">
                          {product.category}
                        </span>
                        {product.isBestSeller && (
                          <span className="bg-amber-400 text-emerald-950 font-bold text-[8px] px-1.5 py-0.5 rounded-sm uppercase">
                            Best Seller
                          </span>
                        )}
                      </div>
                      <h3
                        onClick={() => handleProductClick(product.slug)}
                        className="font-extrabold text-base text-white hover:text-amber-300 transition-colors cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-emerald-100/70 line-clamp-2 min-h-[32px] font-normal">
                        {product.shortBenefits}
                      </p>

                      <div className="flex items-center gap-1.5">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.round(product.rating) ? "fill-current" : "opacity-30"}`} />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-200">({product.reviewsCount} reviews)</span>
                      </div>

                      <div className="pt-1 flex items-baseline gap-2">
                        <span className="text-base font-black text-amber-400">
                          {product.price.toLocaleString()} TZS
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-emerald-300/50 line-through">
                            {product.originalPrice.toLocaleString()} TZS
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => onAddToCart(product, 1)}
                        className={`py-2.5 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 shadow-xs border ${
                          outOfStock
                            ? "bg-emerald-900 text-emerald-400 border-emerald-800 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-400 active:scale-95 text-emerald-950 border-amber-400 cursor-pointer"
                        }`}
                      >
                        {outOfStock ? "Out of Stock" : "Add To Cart"}
                      </button>
                      <a
                        href={getWhatsAppUrl(
                          `Hello PJHerbal Segerea! I am interested in ordering "${product.name}". Please let me know how I can proceed.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 border border-emerald-700 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        Inquire
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-emerald-900/50 border border-emerald-800 rounded-3xl p-10 text-center space-y-4">
            <Database className="w-10 h-10 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-white">Dispensary Catalog Not Yet Initialized</h3>
              <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
                No formulations are currently published in Firestore. Clinic administrators can sign in to the Admin Portal to initialize the clinic catalog or add products.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPath("admin")}
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider transition-all"
            >
              Open Admin Portal
            </button>
          </div>
        )}
      </section>

      {/* ROW 4: WHY CHOOSE US - ADVANCED BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between text-left space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block">
                PJHERBAL ADVANTAGE
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-800 leading-tight">
                A Science-First Supplement Platform Sourced with Trust
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                At PJHerbal Clinic Segerea Branch, we do not sell generic formulas. We research active bio-available botanical ingredients, certify every batch for purity, and deliver complete professional support.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex flex-col justify-between h-full">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg w-fit mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 leading-tight mb-1">100% Authentic</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Every formulation is checked for purity and certified organic.
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex flex-col justify-between h-full">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg w-fit mb-3">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 leading-tight mb-1">Fast Delivery</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Delivered within 24 hours in Dar es Salaam; 48 hours upcountry.
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex flex-col justify-between h-full">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg w-fit mb-3">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 leading-tight mb-1">Clinical Support</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Instant direct access to certified nutritionists and herbalists.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-emerald-950 rounded-3xl overflow-hidden relative flex flex-col justify-between p-6 sm:p-8 text-white min-h-[380px] border border-emerald-900 shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&auto=format&fit=crop"
              alt="Authentic Herbs and Scientific Supplementation"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-25"
              referrerPolicy="no-referrer"
            />

            <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit relative z-10">
              Segerea Branch Director
            </span>

            <div className="space-y-4 relative z-10 text-left mt-auto">
              <blockquote className="text-xs sm:text-sm font-normal leading-relaxed italic text-emerald-100">
                "Our mission at PJHerbal Clinic is simple: bridging traditional African botanical science with modern clinical quality. We inspect every batch for dosage consistency."
              </blockquote>

              <div className="flex items-center justify-between border-t border-emerald-800/80 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-400 bg-emerald-800 flex items-center justify-center font-bold text-sm text-white">
                    PJ
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Dr. Peter Juma</h4>
                    <p className="text-[10px] text-emerald-300">Head Clinical Director & Nutritionist</p>
                  </div>
                </div>
                <a
                  href="tel:+255629899017"
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors shadow-xs"
                >
                  Call Clinic
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 5: TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1.5">
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block">
            PATIENT STORY CIRCLE
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-800">
            Real People. Real Health Outcomes.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Read how authentic nutritional support from our Segerea clinic transformed our customers' health and energy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "Nimekuwa nikisumbuliwa na tumbo kujaa na maumivu makali baada ya kula kwa miaka miwili. Nilitumia PJ CleanseDetox Colon Fit kwa ushauri wa daktari wa Segerea. Ndani ya siku tatu nilijisikia mwepesi, na gesi yote imeisha!"
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-xs">
                LA
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Lilian Aloyce</p>
                <p className="text-[10px] text-slate-400">Kigamboni, Dar es Salaam</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/60 border-2 border-amber-300 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "Mzee wangu alikuwa anateseka na kuamka mara 4 hadi 5 kila usiku kukojoa. Baada ya kuanza PJ ProstActive Care Gold, sasa hivi anaamka mara moja tu au haamki kabisa! Ana amani ya moyo sana. Shukrani kwa huduma yenu."
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-amber-200 pt-4">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-emerald-950 font-bold flex items-center justify-center text-xs">
                MI
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Mzee Ibrahim</p>
                <p className="text-[10px] text-amber-700 font-bold">Segerea, Dar es Salaam</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "PJ Moringa Power Boost has completely replaced my afternoon coffee cravings. I run a tech company and need high focus. This organic supplement provides continuous physical energy all afternoon!"
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-xs">
                DB
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Dev Baraka</p>
                <p className="text-[10px] text-slate-400">Kinondoni, Dar es Salaam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 6: HEALTH BLOGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block font-sans">
              PJHERBAL CLINICAL RESEARCH
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-800">
              Latest Nutritional & Health Blogs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Education is the key to prevention. Read medical-herbal guides authored by our clinical director.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentPath("blog")}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-700 transition-colors shrink-0"
          >
            <span>Visit Our Health Blog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {blogs.slice(0, 3).map((article) => (
              <article
                key={article.id}
                className="bg-white border border-stone-200/90 hover:border-emerald-700/20 hover:shadow-md rounded-3xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-xs"
              >
                <div
                  className="aspect-video cursor-pointer overflow-hidden relative"
                  onClick={() => {
                    setProductSlug(article.slug);
                    setCurrentPath(`blog/${article.slug}`);
                  }}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-3 left-3 bg-emerald-950/85 text-emerald-300 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                    {article.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{article.date}</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3
                      className="font-serif font-extrabold text-slate-800 text-base hover:text-emerald-800 transition-colors cursor-pointer line-clamp-2"
                      onClick={() => {
                        setProductSlug(article.slug);
                        setCurrentPath(`blog/${article.slug}`);
                      }}
                    >
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-normal">
                      {article.summary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProductSlug(article.slug);
                      setCurrentPath(`blog/${article.slug}`);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-amber-600 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Full Article</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center text-xs text-slate-500">
            No clinical health articles have been published yet.
          </div>
        )}
      </section>
    </div>
  );
}
