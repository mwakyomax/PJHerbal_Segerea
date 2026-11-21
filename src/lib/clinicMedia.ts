import heroDispensaryImg from "../assets/images/hero_segerea_dispensary_1795262306491.jpg";
import heroMoringaImg from "../assets/images/hero_moringa_morogoro_1795262308036.jpg";
import heroProstateImg from "../assets/images/hero_prostate_herbal_1795262307749.jpg";
import productDetoxImg from "../assets/images/product_detox_herbal_1795262308273.jpg";
import aboutClinicImg from "../assets/images/about_segerea_clinic_1795262308057.jpg";
import prodMultimanImg from "../assets/images/prod_multiman_force_1795263243973.jpg";
import prodGreenTeaImg from "../assets/images/prod_greentea_slim_1795263244610.jpg";
import prodFemBalanceImg from "../assets/images/prod_fembalance_glow_1795263246209.jpg";
import prodNeuroFocusImg from "../assets/images/prod_neurofocus_extra_1795263246283.jpg";
import prodKetoCarbImg from "../assets/images/prod_ketoherbal_carb_1795263245098.jpg";

export const CLINIC_MEDIA = {
  dispensary: heroDispensaryImg,
  clinicInterior: aboutClinicImg,
  multiman: prodMultimanImg,
  prostate: heroProstateImg,
  greenTea: prodGreenTeaImg,
  moringa: heroMoringaImg,
  femBalance: prodFemBalanceImg,
  neuroFocus: prodNeuroFocusImg,
  detox: productDetoxImg,
  ketoCarb: prodKetoCarbImg
};

const PRODUCT_MEDIA_BY_SLUG: Record<string, string> = {
  "prod-1": CLINIC_MEDIA.multiman,
  "multiman-herbal-force": CLINIC_MEDIA.multiman,
  "prod-2": CLINIC_MEDIA.prostate,
  "prostactive-care-gold": CLINIC_MEDIA.prostate,
  "prod-3": CLINIC_MEDIA.greenTea,
  "green-tea-slim-burn": CLINIC_MEDIA.greenTea,
  "prod-4": CLINIC_MEDIA.moringa,
  "moringa-power-boost": CLINIC_MEDIA.moringa,
  "prod-5": CLINIC_MEDIA.femBalance,
  "fembalance-glow-max": CLINIC_MEDIA.femBalance,
  "prod-6": CLINIC_MEDIA.neuroFocus,
  "neurofocus-extra": CLINIC_MEDIA.neuroFocus,
  "prod-7": CLINIC_MEDIA.detox,
  "cleansedetox-colon-fit": CLINIC_MEDIA.detox,
  "prod-8": CLINIC_MEDIA.ketoCarb,
  "ketoherbal-carb-blocker": CLINIC_MEDIA.ketoCarb
};

const PRODUCT_IMAGE_POOL: string[] = [
  CLINIC_MEDIA.multiman,
  CLINIC_MEDIA.prostate,
  CLINIC_MEDIA.greenTea,
  CLINIC_MEDIA.moringa,
  CLINIC_MEDIA.femBalance,
  CLINIC_MEDIA.neuroFocus,
  CLINIC_MEDIA.detox,
  CLINIC_MEDIA.ketoCarb,
  CLINIC_MEDIA.dispensary,
  CLINIC_MEDIA.clinicInterior
];

const BUNDLED_LOCAL_IMAGES = new Set<string>(PRODUCT_IMAGE_POOL);

function isLegacyOrBundledDefault(url?: string): boolean {
  if (!url || !url.trim()) return true;
  if (
    url.includes("unsplash.com") ||
    url.includes("placeholder.com") ||
    url.includes("picsum.photos")
  ) {
    return true;
  }
  return BUNDLED_LOCAL_IMAGES.has(url);
}

export function getDedicatedProductImage(product: {
  id?: string;
  slug?: string;
  name?: string;
}): string | undefined {
  if (product.id && PRODUCT_MEDIA_BY_SLUG[product.id]) {
    return PRODUCT_MEDIA_BY_SLUG[product.id];
  }
  if (product.slug && PRODUCT_MEDIA_BY_SLUG[product.slug]) {
    return PRODUCT_MEDIA_BY_SLUG[product.slug];
  }
  const lower = (product.name || "").toLowerCase();
  if (lower.includes("multiman")) return CLINIC_MEDIA.multiman;
  if (lower.includes("prostactive")) return CLINIC_MEDIA.prostate;
  if (lower.includes("green tea") || lower.includes("slim burn")) return CLINIC_MEDIA.greenTea;
  if (lower.includes("moringa")) return CLINIC_MEDIA.moringa;
  if (lower.includes("fembalance")) return CLINIC_MEDIA.femBalance;
  if (lower.includes("neurofocus")) return CLINIC_MEDIA.neuroFocus;
  if (lower.includes("cleansedetox") || lower.includes("colon fit")) return CLINIC_MEDIA.detox;
  if (lower.includes("ketoherbal") || lower.includes("carb blocker")) return CLINIC_MEDIA.ketoCarb;
  return undefined;
}

export function resolveClinicImage(url?: string): string {
  if (!url) return CLINIC_MEDIA.dispensary;
  if (
    url.includes("unsplash.com") ||
    url.includes("placeholder.com") ||
    url.includes("picsum.photos")
  ) {
    if (url.includes("1611070973770")) return CLINIC_MEDIA.moringa;
    if (url.includes("1584017911766")) return CLINIC_MEDIA.prostate;
    if (url.includes("1544816155")) return CLINIC_MEDIA.detox;
    if (url.includes("1505576399279")) return CLINIC_MEDIA.clinicInterior;
    return CLINIC_MEDIA.dispensary;
  }
  return url;
}

export function resolveProductImage(
  product: { id?: string; slug?: string; name?: string; images?: string[] },
  index = 0
): string {
  const rawUrl = product.images?.[index] ?? product.images?.[0];
  const dedicated = getDedicatedProductImage(product);

  if (index === 0 && dedicated && isLegacyOrBundledDefault(rawUrl)) {
    return dedicated;
  }

  if (rawUrl && !rawUrl.includes("unsplash.com") && !rawUrl.includes("placeholder.com") && !rawUrl.includes("picsum.photos")) {
    return rawUrl;
  }

  return dedicated || resolveClinicImage(rawUrl);
}

export function ensureUniqueProductImages<
  T extends { id?: string; slug?: string; name?: string; images?: string[] }
>(products: T[]): T[] {
  const usedPrimary = new Set<string>();

  return products.map((product) => {
    const dedicated = getDedicatedProductImage(product);
    const currentFirst = product.images?.[0];
    let primary =
      dedicated && isLegacyOrBundledDefault(currentFirst)
        ? dedicated
        : resolveProductImage(product, 0);

    if (usedPrimary.has(primary)) {
      const unusedFromPool = PRODUCT_IMAGE_POOL.find((candidate) => !usedPrimary.has(candidate));
      if (unusedFromPool) {
        primary = unusedFromPool;
      }
    }
    usedPrimary.add(primary);

    const extraImages = (product.images || [])
      .slice(1)
      .filter((img) => img && img !== primary && !img.includes("unsplash.com"));

    return {
      ...product,
      images: [primary, ...extraImages]
    };
  });
}

export function handleImageFallback(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "1";
  img.src = CLINIC_MEDIA.dispensary;
}
