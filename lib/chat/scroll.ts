/**
 * Is a scrollable element close enough to its bottom that we should keep it
 * pinned when new content arrives? Takes plain metrics (an HTMLElement already
 * exposes scrollTop/scrollHeight/clientHeight) so it stays pure and testable in
 * the node test environment.
 */
export function isNearBottom(
  m: { scrollTop: number; scrollHeight: number; clientHeight: number },
  threshold = 120
): boolean {
  return m.scrollHeight - m.scrollTop - m.clientHeight <= threshold;
}
