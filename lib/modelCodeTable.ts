import { products } from "@/data/products";
import { REPRESENTATIVE_MODEL_CODE } from "@/lib/modelCodes";

export interface ModelCodeRow {
  id: string;
  name: string;
  category: string;
  series: string;
  code: string;
  sizes: string[];
}

/**
 * Joins the verified India order codes to the live catalogue.
 *
 * Only products that both exist and carry a code appear. Codes marked `// ~` in
 * lib/modelCodes.ts are valid Samsung SKUs whose India page could not be
 * confirmed; they stay in the map (the comment is not machine-readable), so the
 * page copy must present the table as "representative codes, verified against
 * samsung.com/in where a product page exists" rather than claiming all 48 are
 * confirmed.
 */
export function modelCodeRows(): ModelCodeRow[] {
  return products
    .filter((p) => Boolean(REPRESENTATIVE_MODEL_CODE[p.id]))
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      series: p.series,
      code: REPRESENTATIVE_MODEL_CODE[p.id],
      sizes: p.specs.screenSizes,
    }))
    .sort((a, b) =>
      `${a.category}|${a.name}`.localeCompare(`${b.category}|${b.name}`),
    );
}
