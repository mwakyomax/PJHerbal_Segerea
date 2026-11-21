/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Truck,
  HeartHandshake,
  Star,
  BookOpen,
  ArrowRight,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Heart,
  Database,
  Scale,
  Sun,
  Brain,
  MapPin,
  Clock
} from "lucide-react";
import { Product, Category, BlogArticle, SiteSettings } from "../types";
import { CLINIC_MEDIA, resolveClinicImage, resolveProductImage, handleImageFallback } from "../lib/clinicMedia";

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
        image: CLINIC_MEDIA.dispensary,
        title: siteSettings.heroTitleText,
        kicker: `${siteSettings.heroBadgeText} · Segerea Branch`,
        description: siteSettings.heroDescText,
        ctaPrimary: "Browse Dispensary",
        ctaSecondary: "WhatsApp Herbalist",
        targetCategory: null as Category | null
      },
      {
        image: CLINIC_MEDIA.prostate,
        title: "Targeted Prostate & Men's Vitality Care",
        kicker: "Men's Health · Segerea Dispensary",
        description:
          "Standardized Saw Palmetto berry and roasted pumpkin seed extracts prepared to ease nighttime urinary discomfort and support daily strength.",
        ctaPrimary: "Shop Men's Health",
        ctaSecondary: "Consult on WhatsApp",
        targetCategory: "Men's Health" as Category
      },
      {
        image: CLINIC_MEDIA.moringa,
        title: "Pure Morogoro Moringa Leaf Formulations",
        kicker: "Energy & Immunity · Morogoro Harvest",
        description:
          "Shade-dried and finely milled Tanzanian Moringa oleifera leaf capsules providing natural iron, calcium, and steady daytime nourishment.",
        ctaPrimary: "Order Moringa",
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

  const featuredCategories: {
    name: Category;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    desc: string;
  }[] = [
    {
      name: "Men's Health",
      icon: ShieldCheck,
      count: products.filter((p) => p.category === "Men's Health").length,
      desc: "Prostate care & daily stamina."
    },
    {
      name: "Weight Management",
      icon: Scale,
      count: products.filter((p) => p.category === "Weight Management").length,
      desc: "Metabolic support & meal balance."
    },
    {
      name: "Energy & Immunity",
      icon: Sun,
      count: products.filter((p) => p.category === "Energy & Immunity").length,
      desc: "Morogoro Moringa & daily nutrients."
    },
    {
      name: "Women's Wellness",
      icon: Heart,
      count: products.filter((p) => p.category === "Women's Wellness").length,
      desc: "Cycle balance & herbal nourishment."
    },
    {
      name: "Brain & Focus",
      icon: Brain,
      count: products.filter((p) => p.category === "Brain & Focus").length,
      desc: "Clear recall & mental steadiness."
    },
    {
      name: "Detox & Digestion",
      icon: Leaf,
      count: products.filter((p) => p.category === "Detox & Digestion").length,
      desc: "Gentle colon & bloating relief."
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
      const moringa = products.find(
        (p) => p.slug.includes("moringa") || p.name.toLowerCase().includes("moringa")
      );
      if (moringa) {
        handleProductClick(moringa.slug);
        return;
      }
    }
    onSelectCategory(targetCategory);
    setCurrentPath("shop");
  };

  return (
    <div className="space-y-12 pb-16 font-sans bg-stone-50/70 text-slate-800">
      {/* 1. HERO SHOWCASE & CATEGORY DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Editorial Hero Slider */}
          <div className="lg:col-span-7 bg-emerald-950 rounded-2xl overflow-hidden relative min-h-[430px] sm:min-h-[480px] lg:min-h-[510px] flex items-center border border-emerald-900">
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-emerald-950/35 z-1" />
                <img
                  src={slide.image}
                  alt={slide.title}
                  onError={handleImageFallback}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 z-2 flex items-center p-6 sm:p-10">
                  {idx === currentSlide && (
                    <div className="max-w-xl text-left space-y-4">
                      <p className="text-amber-300 font-semibold text-xs tracking-wide">
                        {slide.kicker}
                      </p>

                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white leading-tight text-balance">
                        {slide.title}
                      </h1>

                      <p className="text-stone-200 text-xs sm:text-sm md:text-base max-w-lg leading-relaxed font-normal">
                        {slide.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleHeroPrimaryCta(idx, slide.targetCategory)}
                          className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
                          id="hero-explore-btn"
                        >
                          <span>{slide.ctaPrimary}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                          href={getWhatsAppUrl(
                            "Hello PJHerbal Clinic, I would like advice regarding nutritional supplements."
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-900 text-white border border-white/25 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                          id="hero-consult-btn"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-300" />
                          <span>{slide.ctaSecondary}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-emerald-950/75 hover:bg-emerald-900 border border-white/20 text-white flex items-center justify-center transition-opacity opacity-80 hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-emerald-950/75 hover:bg-emerald-900 border border-white/20 text-white flex items-center justify-center transition-opacity opacity-80 hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-4 left-6 sm:left-10 z-20 flex gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === currentSlide ? "bg-amber-400 w-7" : "bg-white/40 hover:bg-white/70 w-2"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Targeted Formulations Directory */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 flex flex-col justify-between">
            <div className="flex justify-between items-baseline mb-5 border-b border-stone-100 pb-4">
              <div className="text-left">
                <span className="text-[11px] font-semibold text-emerald-800 tracking-wide block mb-0.5">
                  Segerea Dispensary
                </span>
                <h2 className="font-serif font-bold text-xl text-slate-900">Browse by Health Focus</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(null);
                  setCurrentPath("shop");
                }}
                className="text-emerald-800 hover:text-emerald-950 text-xs font-semibold transition-colors inline-flex items-center gap-1 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {featuredCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => handleFeaturedCategoryClick(cat.name)}
                    className="bg-stone-50 hover:bg-emerald-50/70 rounded-xl p-3.5 flex items-start gap-3 border border-stone-200/80 hover:border-emerald-300 transition-colors cursor-pointer text-left group"
                  >
                    <Icon className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 block leading-snug">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                        {cat.desc}
                      </span>
                      <span className="text-[11px] text-emerald-800 font-medium tabular-nums block mt-1">
                        {cat.count} {cat.count === 1 ? "formulation" : "formulations"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. DISPENSARY STANDARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 text-left">
          <div className="flex items-start gap-3 pt-2 sm:pt-0">
            <Leaf className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">100% Botanical Extracts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sourced from Morogoro and regional growers</p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3 sm:pt-0 sm:pl-5">
            <Truck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">Same-Day Dar Dispatch</h3>
              <p className="text-xs text-slate-500 mt-0.5">Courier delivery across Dar es Salaam</p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3 sm:pt-0 sm:pl-5">
            <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">Tamper-Evident Seals</h3>
              <p className="text-xs text-slate-500 mt-0.5">Inspected and sealed by batch at the clinic</p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3 sm:pt-0 sm:pl-5">
            <HeartHandshake className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">Pharmacist Guidance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct WhatsApp & Segerea counter advice</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BEST SELLING FORMULATIONS (LIVE FIRESTORE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-950 text-white rounded-2xl py-10 px-6 sm:px-10 border border-emerald-900">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div className="space-y-1 text-left">
              <p className="text-xs font-semibold text-amber-300">Dispensary Shelf</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white text-balance">
                Frequently Requested Formulations
              </h2>
              <p className="text-emerald-200/85 text-xs sm:text-sm max-w-lg">
                Prepared and stocked at PJHerbal Segerea for pickup or courier dispatch across Tanzania.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCurrentPath("shop");
                onSelectCategory(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:underline transition-colors shrink-0 cursor-pointer"
            >
              <span className="tabular-nums">View Full Catalog ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {catalogLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-emerald-900/40 border border-emerald-800/60 rounded-xl h-88" />
              ))}
            </div>
          ) : displayedBestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedBestSellers.map((product) => {
                const isWishlisted = wishlistIds.includes(product.id);
                const outOfStock = product.stock <= 0;
                return (
                  <div
                    key={product.id}
                    className="bg-emerald-900/45 border border-emerald-800/90 hover:border-amber-400/60 rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 flex flex-col group h-full text-left"
                  >
                    <div
                      onClick={() => handleProductClick(product.slug)}
                      className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-stone-100"
                    >
                      <img
                        src={resolveProductImage(product)}
                        alt={product.name}
                        onError={handleImageFallback}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product);
                        }}
                        title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                        className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-colors cursor-pointer ${
                          isWishlisted
                            ? "bg-rose-600 text-white"
                            : "bg-white/90 text-slate-600 hover:text-rose-600"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
                          <span className="truncate">{product.category}</span>
                          {product.isBestSeller && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-300 shrink-0">Clinic Favorite</span>
                            </>
                          )}
                        </div>
                        <h3
                          onClick={() => handleProductClick(product.slug)}
                          className="font-semibold text-base text-white hover:text-amber-300 transition-colors cursor-pointer line-clamp-1"
                        >
                          {product.name}
                        </h3>
                        <p className="text-xs text-emerald-100/75 line-clamp-2 min-h-[32px] font-normal">
                          {product.shortBenefits}
                        </p>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.round(product.rating) ? "fill-current" : "opacity-30"}`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-emerald-200 tabular-nums">
                            ({product.reviewsCount})
                          </span>
                        </div>

                        <div className="pt-1 flex items-baseline gap-2 tabular-nums">
                          <span className="text-[15px] font-bold text-amber-300">
                            {product.price.toLocaleString()} TZS
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-emerald-300/60 line-through">
                              {product.originalPrice.toLocaleString()} TZS
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={outOfStock}
                          onClick={() => onAddToCart(product, 1)}
                          className={`py-2 px-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center ${
                            outOfStock
                              ? "bg-emerald-900 text-emerald-400 border border-emerald-800 cursor-not-allowed"
                              : "bg-amber-500 hover:bg-amber-400 text-emerald-950 cursor-pointer"
                          }`}
                        >
                          {outOfStock ? "Out of Stock" : "Add to Cart"}
                        </button>
                        <a
                          href={getWhatsAppUrl(
                            `Hello PJHerbal Segerea! I would like more details about "${product.name}".`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 border border-emerald-700 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Inquire</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-emerald-900/50 border border-emerald-800 rounded-xl p-10 text-center space-y-4">
              <Database className="w-9 h-9 text-amber-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-white">Dispensary Catalog Not Initialized</h3>
                <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
                  No formulations are currently published in Firestore. Clinic administrators can sign in to initialize the dispensary catalog or add products.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPath("admin")}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Open Admin Console
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. SEGEREA CLINIC CONSULTATION & DIRECTOR NOTE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-left space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-800 block">
                Visit or Consult Online
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight text-balance">
                Segerea Mwisho Dispensary & Herbalist Consultation
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Speak directly with Dr. Peter Juma and our Segerea dispensary staff before selecting a supplement. We advise on practical dosage schedules, food pairings, and safe use alongside daily medication.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Branch Address</p>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Segerea Mwisho, opposite the Catholic Church bus stop, Ilala, Dar es Salaam
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Opening Hours</p>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Mon – Sat: 8:00 AM – 8:00 PM
                    <br />
                    Sunday: 10:00 AM – 4:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={getWhatsAppUrl(
                  "Hello PJHerbal Segerea! I would like to speak with a herbalist regarding dosage and supplements."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Start WhatsApp Consultation</span>
              </a>
              <button
                type="button"
                onClick={() => setCurrentPath("contact")}
                className="px-4 py-2.5 rounded-lg border border-stone-300 hover:border-emerald-800 text-slate-700 hover:text-emerald-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clinic Map & Contact Form
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-emerald-950 rounded-2xl overflow-hidden relative flex flex-col justify-between p-6 sm:p-8 text-white min-h-[340px] border border-emerald-900">
            <img
              src={CLINIC_MEDIA.clinicInterior}
              alt="PJHerbal Segerea Clinic Consultation Room"
              onError={handleImageFallback}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/75 to-emerald-950/40" />

            <span className="text-xs font-semibold text-amber-300 relative z-10 text-left">
              Segerea Branch Director
            </span>

            <div className="space-y-4 relative z-10 text-left mt-auto">
              <blockquote className="text-xs sm:text-sm font-normal leading-relaxed text-stone-100">
                "Patients deserve honest botanical preparations with clear sourcing and careful dosing. Every bottle that leaves our Segerea shelf is checked for seal integrity and freshness."
              </blockquote>

              <div className="flex items-center justify-between border-t border-emerald-800/80 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Dr. Peter Juma</h4>
                  <p className="text-xs text-emerald-300">Clinical Herbalist & Nutritionist</p>
                </div>
                <a
                  href="tel:+255629899017"
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3.5 py-2 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0"
                >
                  Call +255 629 899 017
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PATIENT FEEDBACK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-3 text-left">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-800">Patient Notes</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Feedback from Dar es Salaam Patients
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                "Nimekuwa nikisumbuliwa na tumbo kujaa na maumivu baada ya kula kwa muda mrefu. Nilitumia PJ CleanseDetox Colon Fit kwa ushauri wa daktari wa Segerea, ndani ya siku tatu nilijisikia mwepesi."
              </p>
            </div>
            <div className="border-t border-stone-100 pt-3">
              <p className="text-xs font-bold text-slate-900">Lilian Aloyce</p>
              <p className="text-[11px] text-slate-500">Kigamboni, Dar es Salaam</p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                "Mzee wangu alikuwa anaamka mara 4 hadi 5 kila usiku kukojoa. Baada ya kuanza PJ ProstActive Care Gold, sasa anaamka mara moja tu au analala mpaka asubuhi."
              </p>
            </div>
            <div className="border-t border-stone-100 pt-3">
              <p className="text-xs font-bold text-slate-900">Mzee Ibrahim</p>
              <p className="text-[11px] text-slate-500">Segerea, Dar es Salaam</p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                "Taking two capsules of PJ Pure Moringa with breakfast keeps my energy steady through afternoon work at Posta without relying on sweet tea or energy drinks."
              </p>
            </div>
            <div className="border-t border-stone-100 pt-3">
              <p className="text-xs font-bold text-slate-900">Baraka Mussa</p>
              <p className="text-[11px] text-slate-500">Kinondoni, Dar es Salaam</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HEALTH NOTES & BLOGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div className="space-y-1 text-left">
            <p className="text-xs font-semibold text-emerald-800">Clinic Journal</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Nutritional & Herbal Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Practical articles on preventive nutrition and daily herbal habits written by our clinic staff.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentPath("blog")}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors shrink-0 cursor-pointer"
          >
            <span>All Health Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {blogs.slice(0, 3).map((article) => (
              <article
                key={article.id}
                className="bg-white border border-stone-200 hover:border-emerald-700/30 rounded-xl overflow-hidden transition-colors flex flex-col h-full"
              >
                <div
                  className="aspect-video cursor-pointer overflow-hidden bg-stone-100"
                  onClick={() => {
                    setProductSlug(article.slug);
                    setCurrentPath(`blog/${article.slug}`);
                  }}
                >
                  <img
                    src={resolveClinicImage(article.image)}
                    alt={article.title}
                    onError={handleImageFallback}
                    className="w-full h-full object-cover hover:scale-103 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span className="text-emerald-800 font-semibold">{article.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3
                      className="font-serif font-bold text-slate-900 text-base hover:text-emerald-800 transition-colors cursor-pointer line-clamp-2"
                      onClick={() => {
                        setProductSlug(article.slug);
                        setCurrentPath(`blog/${article.slug}`);
                      }}
                    >
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProductSlug(article.slug);
                      setCurrentPath(`blog/${article.slug}`);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Article</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-xs text-slate-500">
            No clinic articles published yet.
          </div>
        )}
      </section>
    </div>
  );
}
