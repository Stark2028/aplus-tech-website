import type { Product } from "@/data/products";
import { formatSize } from "@/lib/formatSize";
import { modelCodeFor } from "@/lib/modelCodes";
import { PHONE_DISPLAY } from "@/lib/contact";
import { isLogitech } from "@/lib/brand";

export interface Faq {
  q: string;
  a: string;
}

/**
 * Generate product FAQs from the product's own data. Every answer is rendered
 * visibly on the page AND emitted as FAQPage structured data — Google requires
 * the two to match, so this single source drives both.
 *
 * Answers lean into the questions B2B buyers actually search: exact model
 * number, available sizes, 24/7 suitability, and how to get pricing.
 */
export function buildProductFaqs(product: Product): Faq[] {
  const sizes = product.specs.screenSizes;
  const sizeList =
    sizes.length > 1
      ? `${sizes.slice(0, -1).map(formatSize).join(", ")} and ${formatSize(sizes[sizes.length - 1])}`
      : sizes.map(formatSize).join("");
  const modelCode = modelCodeFor(product.id);
  const is247 = /24\s*\/\s*7/.test(product.specs.operationTime);

  const faqs: Faq[] = [];

  if (sizes.length > 0) {
    faqs.push({
      q: `What screen sizes does the ${product.name} come in?`,
      a: `The ${product.series} is available in ${sizeList}${
        sizes.length > 1 ? " screen sizes" : ""
      }. Aplus Technology Solutions supplies all variants across India — contact us to confirm current stock for your required size.`,
    });
  }

  if (modelCode) {
    faqs.push({
      q: `What is the model number of the ${product.name}?`,
      a: `The base model code is ${modelCode} (${product.series}). Larger sizes in the series carry matching Samsung order codes — share your preferred size and we'll confirm the exact model number and availability.`,
    });
  }

  faqs.push({
    q: `What are the key display specifications of the ${product.series}?`,
    a: `The ${product.series} offers ${product.specs.resolution} resolution at ${product.specs.brightness} brightness, rated for ${product.specs.operationTime} operation. See the full technical specifications table above for connectivity, panel, and power details.`,
  });

  faqs.push({
    q: `Is the ${product.series} suitable for continuous ${
      is247 ? "24/7" : "daily commercial"
    } use?`,
    a: is247
      ? `Yes. The ${product.series} is rated for 24/7 continuous operation, making it suitable for control rooms, transport hubs, and always-on retail or signage installations.`
      : `Yes. The ${product.series} is rated for ${product.specs.operationTime} operation, well suited to business-hours use in offices, retail, hospitality, and meeting spaces.`,
  });

  faqs.push({
    q: `How do I get pricing for the ${product.name} in India?`,
    a: isLogitech(product)
      ? `Aplus Technology Solutions supplies ${product.name} to businesses across India with project and bulk pricing on quote. Request a quote on this page, message us on WhatsApp, or call ${PHONE_DISPLAY} for B2B pricing within 24 hours — GST invoice included.`
      : `Aplus Technology Solutions is an authorized Samsung B2B distributor and offers project and bulk pricing on quote. Request a quote on this page, message us on WhatsApp, or call ${PHONE_DISPLAY} for B2B pricing within 24 hours — GST invoice included.`,
  });

  faqs.push({
    q: `Does Aplus provide installation and ${isLogitech(product) ? "support" : "warranty"} for the ${product.series}?`,
    a: isLogitech(product)
      ? `Yes. Aplus supplies, installs and maintains ${product.name} across India, with professional installation and AMC support. A free installation assessment is available for every order.`
      : `Yes. We supply 100% genuine Samsung units with manufacturer warranty, certified installation, and AMC support across India. A free installation assessment is available for every order.`,
  });

  return faqs;
}
