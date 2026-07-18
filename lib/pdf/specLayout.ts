/**
 * Pure layout planner for the spec sheet's two-column technical-spec section.
 *
 * No pdf-lib imports — heights are supplied by the caller, so this module is
 * fully unit-testable in Node. `flowGroups` packs measured spec groups into
 * two columns per page (greedy first-fit, order-preserving), splitting a
 * group across columns only when it cannot fit a fresh column whole.
 */

export interface MeasuredRow {
  labelLines: string[];
  valueLines: string[];
  /** Total row height in pt (line count × line height + vertical padding). */
  height: number;
}

export interface MeasuredGroup {
  title: string;
  rows: MeasuredRow[];
}

export interface PlacedChunk {
  /** 0-based page index within the spec section (0 = the section's first page). */
  page: number;
  col: 0 | 1;
  title: string;
  rows: MeasuredRow[];
  /** Offset from the top of the column, in pt. */
  y: number;
}

export interface FlowOptions {
  /** Column height available on the section's first page. */
  firstColH: number;
  /** Column height available on continuation pages. */
  contColH: number;
  /** Group header band height. */
  headerH: number;
  /** Vertical gap between groups within one column. */
  groupGap: number;
}

export function rowHeight(
  labelLineCount: number,
  valueLineCount: number,
  lineH: number,
  padV: number
): number {
  return Math.max(labelLineCount, valueLineCount, 1) * lineH + padV * 2;
}

export function chunkHeight(chunk: { rows: MeasuredRow[] }, headerH: number): number {
  return headerH + chunk.rows.reduce((sum, r) => sum + r.height, 0);
}

const CONT_SUFFIX = " (CONT.)";
const contTitle = (t: string) => (t.endsWith(CONT_SUFFIX) ? t : t + CONT_SUFFIX);

export function flowGroups(groups: MeasuredGroup[], opts: FlowOptions): PlacedChunk[] {
  const placed: PlacedChunk[] = [];
  const queue = groups
    .filter((g) => g.rows.length > 0)
    .map((g) => ({ title: g.title, rows: g.rows.slice() }));

  let page = 0;
  let col: 0 | 1 = 0;
  let colH = opts.firstColH;
  let used = 0;

  const advance = () => {
    if (col === 0) {
      col = 1;
    } else {
      col = 0;
      page += 1;
    }
    if (page > 0) colH = opts.contColH;
    used = 0;
  };

  for (let i = 0; i < queue.length; i++) {
    const g = queue[i];
    const gap = used > 0 ? opts.groupGap : 0;
    const total = chunkHeight(g, opts.headerH);

    // Whole group fits in the current column.
    if (used + gap + total <= colH) {
      placed.push({ page, col, title: g.title, rows: g.rows, y: used + gap });
      used += gap + total;
      continue;
    }

    // Whole group fits a fresh column — move there rather than splitting.
    const freshH = col === 0 ? colH : opts.contColH;
    if (used > 0 && total <= freshH) {
      advance();
      i -= 1;
      continue;
    }

    // Split: header + as many rows as fit here; the rest continues next column.
    const avail = colH - used - gap - opts.headerH;
    let take = 0;
    let h = 0;
    for (const r of g.rows) {
      if (h + r.height > avail) break;
      h += r.height;
      take += 1;
    }
    if (take === 0) {
      if (used > 0) {
        advance();
        i -= 1;
        continue;
      }
      // A single row taller than an empty column: overflow rather than loop.
      take = 1;
    }
    placed.push({ page, col, title: g.title, rows: g.rows.slice(0, take), y: used + gap });
    if (take < g.rows.length) {
      queue.splice(i + 1, 0, { title: contTitle(g.title), rows: g.rows.slice(take) });
    }
    advance();
  }

  return placed;
}
