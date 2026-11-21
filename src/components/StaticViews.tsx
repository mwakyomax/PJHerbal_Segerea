/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  BookOpen,
  Send,
  CheckCircle,
  Info,
  ArrowLeft,
  Calendar,
  User,
  ShieldCheck,
  Award,
  ChevronRight,
  Loader2
} from "lucide-react";
import { BlogArticle, Product } from "../types";
import { FirebaseUser } from "../lib/firebase";

// ==========================================
// ABOUT VIEW
// ==========================================
export function AboutView({ setCurrentPath }: { setCurrentPath: (path: string) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-800 text-left space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">ABOUT US</span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-950">PJHerbal Clinic — Segerea</h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Providing high-potency, clinically certified botanical extracts and holistic nutritional supplements in Tanzania since 2018.
        </p>
      </div>

      <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-100 shadow-md">
        <img
          src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&auto=format&fit=crop"
          alt="Clinic Lab"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent flex items-end p-6">
          <p className="text-white text-sm font-semibold max-w-md">
            Our physical Segerea Clinic premises, equipped with standard clinical nutrition consultation services.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-emerald-950 text-xl border-b border-slate-50 pb-2">
            Our Clinical Mission
          </h3>
          <p className="font-light text-slate-600">
            At PJHerbal, we bridge the gap between traditional African herbal wisdom and cutting-edge pharmaceutical standards. We understand that wellness is not about artificial additives; it's about supplying the cellular matrix with premium, concentrated organic phytonutrients.
          </p>
          <p className="font-light text-slate-600">
            Our Segerea Branch acts as a dispensary and consultation point, offering custom formulations targeting prostate tissue protection, optimal weight management, blood glucose stability, and cognitive performance.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-serif font-bold text-emerald-950 text-xl border-b border-slate-50 pb-2">
            Why Our Patients Trust Us
          </h3>
          <div className="space-y-3">
            <div className="flex gap-2 items-start">
              <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0" />
              <div>
                <p className="font-bold text-slate-800 text-xs">Laboratory Batch Certification</p>
                <p className="text-xs text-slate-400 font-light">
                  Every single batch is tested for heavy metals and purity thresholds.
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-start">
              <Award className="w-5 h-5 text-emerald-800 shrink-0" />
              <div>
                <p className="font-bold text-slate-800 text-xs">Clinical Supervision</p>
                <p className="text-xs text-slate-400 font-light">
                  Direct advice from certified nutritionists, ensuring you take the correct dosages.
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-start">
              <Info className="w-5 h-5 text-emerald-800 shrink-0" />
              <div>
                <p className="font-bold text-slate-800 text-xs">Empathetic Consultations</p>
                <p className="text-xs text-slate-400 font-light">
                  We protect patient privacy and treat chronic issues with high discretion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-6">
        <button
          type="button"
          onClick={() => setCurrentPath("shop")}
          className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
        >
          Explore Supplement Dispensary
        </button>
      </div>
    </div>
  );
}

// ==========================================
// CONTACT VIEW (Firestore Persisted)
// ==========================================
interface ContactViewProps {
  authUser: FirebaseUser | null;
  onSignInWithGoogle: () => Promise<FirebaseUser | null>;
  onSubmitMessage: (name: string, email: string, message: string) => Promise<void>;
}

export function ContactView({ authUser, onSignInWithGoogle, onSubmitMessage }: ContactViewProps) {
  const [name, setName] = useState(authUser?.displayName || "");
  const [email, setEmail] = useState(authUser?.email || "");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authUser) {
      if (!name && authUser.displayName) setName(authUser.displayName);
      if (!email && authUser.email) setEmail(authUser.email);
    }
  }, [authUser, name, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2 || !email.includes("@") || msg.trim().length < 3) {
      setError("Please enter your name, a valid email address, and your consultation message.");
      return;
    }

    setSending(true);
    try {
      let currentUser = authUser;
      if (!currentUser) {
        currentUser = await onSignInWithGoogle();
        if (!currentUser) {
          setError("Please sign in with Google so our specialists can securely log and reply to your inquiry.");
          setSending(false);
          return;
        }
      }

      await onSubmitMessage(name.trim(), email.trim(), msg.trim());
      setSent(true);
      setMsg("");
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-sans text-slate-800 text-left">
      <div className="text-center space-y-3 mb-12">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">CONTACT US</span>
        <h1 className="text-3xl font-serif font-bold text-emerald-950">Get in Touch with our Specialists</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-5 space-y-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-6">
            <h3 className="font-serif font-bold text-emerald-950 text-base">Segerea Clinic Contact Details</h3>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3 items-center">
                <MapPin className="w-5 h-5 text-emerald-800 shrink-0" />
                <div>
                  <p className="font-bold">Clinic Physical Address</p>
                  <p className="text-slate-500 font-light mt-0.5">
                    Segerea Mwisho, near Catholic Church, Ilala, Dar es Salaam, Tanzania
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <Phone className="w-5 h-5 text-emerald-800 shrink-0" />
                <div>
                  <p className="font-bold">WhatsApp & Call Support</p>
                  <p className="text-slate-500 font-light mt-0.5">+255 629 899 017</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <Mail className="w-5 h-5 text-emerald-800 shrink-0" />
                <div>
                  <p className="font-bold">Official Clinic Email</p>
                  <p className="text-slate-500 font-light mt-0.5">info@pjherbal-segerea.com</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <Clock className="w-5 h-5 text-emerald-800 shrink-0" />
                <div>
                  <p className="font-bold">Dispensary Opening Hours</p>
                  <p className="text-slate-500 font-light mt-0.5">Monday - Saturday: 8:00 AM - 8:00 PM</p>
                  <p className="text-slate-500 font-light">Sunday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-100 font-light leading-relaxed">
            <strong>Local Tip:</strong> Our Segerea clinic is located right opposite the Catholic Church bus stop. Feel free to request free secure parking inside the clinic lot if you are picking up your pre-ordered supplements.
          </div>
        </div>

        <div className="md:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <h3 className="font-serif font-bold text-emerald-950 text-base mb-4">Send a Direct Message</h3>

          {sent ? (
            <div className="p-6 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl text-center space-y-2">
              <CheckCircle className="w-8 h-8 mx-auto" />
              <p>Message saved to clinic inbox!</p>
              <p className="font-light text-[11px]">
                A certified wellness specialist will review your message in the Segerea Clinic portal and reply shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Khamis Juma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg p-3 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., customer@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg p-3 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">
                  How can our specialists assist you?
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your health goals or ask any question regarding our prostate, weight loss, or detox supplements..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 rounded-lg p-3 outline-hidden resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{authUser ? "Send Message" : "Sign In with Google & Send"}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <h3 className="font-serif font-bold text-emerald-950 text-base flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-800" />
          Visit Our Physical Clinic
        </h3>

        <div
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-xs relative"
          style={{ height: "450px" }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.4208988632904!2d39.18808117412023!3d-6.840036993158055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4856aacd9691%3A0xdfd1612e5baa83ed!2sParokia%20ya%20Roho%20Mtakatifu%20Segerea!5e0!3m2!1sen!2stz!4v1783235166099!5m2!1sen!2stz"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Segerea Clinic Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// BLOG LIST VIEW
// ==========================================
export function BlogListView({
  blogs,
  setCurrentPath,
  setProductSlug
}: {
  blogs: BlogArticle[];
  setCurrentPath: (path: string) => void;
  setProductSlug: (slug: string) => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-slate-800 text-left">
      <div className="text-center space-y-3 mb-12">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
          NUTRITIONAL INTELLIGENCE
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-950">
          PJHerbal Health & Science Blog
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Explore educational guidelines, traditional herbal science, and preventative dietary advice authored by Dr. Peter J.
        </p>
      </div>

      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((article) => (
            <article
              key={article.id}
              className="bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full"
            >
              <div
                className="aspect-video overflow-hidden relative cursor-pointer"
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
                <span className="absolute bottom-3 left-3 bg-emerald-950/80 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {article.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>{article.date}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3
                    className="font-serif font-bold text-emerald-950 text-base hover:text-emerald-800 transition-colors cursor-pointer line-clamp-2"
                    onClick={() => {
                      setProductSlug(article.slug);
                      setCurrentPath(`blog/${article.slug}`);
                    }}
                  >
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-light">{article.summary}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProductSlug(article.slug);
                    setCurrentPath(`blog/${article.slug}`);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-amber-600 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Read Article
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-xs text-slate-500">
          No clinical health articles have been published yet.
        </div>
      )}
    </div>
  );
}

// ==========================================
// BLOG DETAIL VIEW WITH RELATED PRODUCTS
// ==========================================
interface BlogDetailProps {
  article: BlogArticle;
  products: Product[];
  setCurrentPath: (path: string) => void;
  setProductSlug: (slug: string) => void;
}

export function BlogDetailView({ article, products, setCurrentPath, setProductSlug }: BlogDetailProps) {
  const relatedSupplements = products.filter(
    (p) =>
      p.category.toLowerCase().includes(article.category.toLowerCase()) ||
      article.tags.some((tag) => p.name.toLowerCase().includes(tag.toLowerCase()))
  );

  const fallbackRelated = products.slice(0, 2);
  const supplementsToDisplay = relatedSupplements.length > 0 ? relatedSupplements : fallbackRelated;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-800 text-left">
      <button
        type="button"
        onClick={() => setCurrentPath("blog")}
        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-800 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Health Blogs List
      </button>

      <article className="space-y-6">
        <div className="space-y-3">
          <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {article.category}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-emerald-950 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-1.5">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-800" /> By {article.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {article.date}
            </span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
        </div>

        <div className="aspect-video w-full rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed font-light space-y-6 pt-4">
          {article.content.split("\n\n").map((para, idx) => {
            if (para.startsWith("###")) {
              return (
                <h2 key={idx} className="font-serif font-bold text-emerald-950 text-xl pt-4">
                  {para.replace("###", "").trim()}
                </h2>
              );
            }
            if (para.startsWith("####")) {
              return (
                <h3 key={idx} className="font-bold text-emerald-900 text-base pt-2">
                  {para.replace("####", "").trim()}
                </h3>
              );
            }
            if (para.startsWith("*") || para.startsWith("-")) {
              return (
                <ul key={idx} className="list-disc pl-5 space-y-1 text-xs font-light">
                  {para.split("\n").map((li, liIdx) => (
                    <li key={liIdx}>{li.replace(/^(\*|-)\s+/, "").trim()}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-50">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </article>

      {supplementsToDisplay.length > 0 && (
        <section className="mt-16 bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 text-left">
          <div>
            <h3 className="font-serif font-bold text-emerald-950 text-lg">Recommended Supplements for this Article</h3>
            <p className="text-xs text-slate-400 mt-1 font-light">
              Target specific biological pathways referenced in this clinical blog. Order now to secure direct courier dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {supplementsToDisplay.slice(0, 2).map((rp) => (
              <div
                key={rp.id}
                onClick={() => {
                  setProductSlug(rp.slug);
                  setCurrentPath(`product/${rp.slug}`);
                }}
                className="bg-white border border-slate-200/50 hover:border-emerald-300 rounded-2xl p-4 flex gap-4 cursor-pointer transition-all hover:shadow-md items-center"
              >
                <img
                  src={rp.images[0]}
                  alt={rp.name}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-100 shadow-2xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-emerald-700 block uppercase">{rp.category}</span>
                  <h4 className="font-bold text-xs text-slate-800 hover:text-emerald-800 transition-colors truncate">
                    {rp.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-light truncate mt-0.5">{rp.shortBenefits}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold text-emerald-950">{rp.price.toLocaleString()} TZS</span>
                    <span className="text-[9px] font-bold text-amber-600 flex items-center">
                      Order Formulation <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ==========================================
// PRIVACY POLICY VIEW
// ==========================================
export function PrivacyPolicyView() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 font-sans text-slate-800 text-left space-y-6">
      <h1 className="text-3xl font-serif font-bold text-emerald-950">Patient Privacy Policy</h1>
      <p className="text-xs text-slate-400 font-medium">Last updated: 2026</p>

      <div className="space-y-4 text-xs font-light text-slate-600 leading-relaxed">
        <p>
          At PJHerbal Clinic (Segerea Branch), we recognize that patient confidentiality is paramount, particularly regarding nutritional health, chronic symptoms, and private consultations. This Privacy Policy documents how we process, store, and utilize details logged on our platform.
        </p>

        <h3 className="font-serif font-bold text-emerald-950 text-sm pt-4">1. Information Gathered</h3>
        <p>
          We gather your verified Google profile identity, contact phone number, and delivery address coordinates solely to fulfill supplement orders, confirm clinic pickup or courier delivery, and provide personalized order tracking.
        </p>

        <h3 className="font-serif font-bold text-emerald-950 text-sm pt-4">2. Patient Consultation Privacy</h3>
        <p>
          All direct digital consultations triggered through WhatsApp or clinic contact forms remain strictly confidential between you and our verified Segerea clinical specialists.
        </p>

        <h3 className="font-serif font-bold text-emerald-950 text-sm pt-4">3. Payment Integrity</h3>
        <p>
          PJHerbal never asks for or stores your mobile money PIN, bank password, or payment card secret codes. Direct mobile money and bank transfers are verified exclusively by clinic staff against official settlement receipts.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// TERMS OF SERVICE
// ==========================================
export function TermsOfServiceView() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 font-sans text-slate-800 text-left space-y-6">
      <h1 className="text-3xl font-serif font-bold text-emerald-950">Dispensary Terms & Conditions</h1>
      <p className="text-xs text-slate-400 font-medium">Last updated: 2026</p>

      <div className="space-y-4 text-xs font-light text-slate-600 leading-relaxed">
        <p>
          These Terms govern the purchase of dietary herbal formulations and nutritional supplements from PJHerbal Clinic Segerea Branch. By submitting checkout details, you consent to the conditions listed herein.
        </p>

        <h3 className="font-serif font-bold text-emerald-950 text-sm pt-4">1. Clinical Disclaimer</h3>
        <p>
          Supplements provided by PJHerbal (including Moringa, Saw Palmetto, and Detox formulas) are certified high-grade organic preparations aimed at supporting holistic physiological wellness. They are not designed to substitute for standard diagnostic evaluations or physician-assigned chemical therapies. Please consult a cardiologist or general practitioner if you are managing severe chronic pathologies.
        </p>

        <h3 className="font-serif font-bold text-emerald-950 text-sm pt-4">2. Dispatch & Delivery Commitments</h3>
        <p>
          Deliveries in Dar es Salaam are prioritized and assigned to secure clinic couriers. We dispatch confirmed orders within hours in Dar es Salaam. Upcountry regional shipping (such as Arusha, Dodoma, Zanzibar) is dispatched via verified transit logistics (24 to 48 hours).
        </p>

        <h3 className="font-serif font-bold text-emerald-950 text-sm pt-4">3. Refund Guidelines</h3>
        <p>
          Due to the biological and pharmaceutical purity constraints of natural extracts, we can only accept refunds or product exchanges if the container safety seal remains completely intact and is returned within 7 calendar days of receipt.
        </p>
      </div>
    </div>
  );
}
