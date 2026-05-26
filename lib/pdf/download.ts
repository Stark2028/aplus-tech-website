/**
 * Browser download helper for generated PDF bytes.
 *
 * Deliberately kept in its own module with NO pdf-lib import. The actual PDF
 * generators (lib/pdf/quote.ts, lib/pdf/specSheet.ts) are loaded via dynamic
 * import only when a user clicks "download", so pdf-lib (~400 KiB) must not be
 * pulled into any eager bundle. Importing `downloadPdf` from here is safe and
 * pdf-lib-free.
 */

/** Trigger a download of a PDF byte array. */
export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const blob = new Blob([ab], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // revoke after a tick so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
