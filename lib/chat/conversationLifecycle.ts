/**
 * Client-side lifecycle signal for the customer widget.
 *
 * When an agent deletes a conversation from the sales console, the visitor's
 * widget is still holding that conversation's id in memory. The "find open
 * conversation" query only reports an *ambiguous* empty snapshot — which its
 * guard deliberately ignores to survive the transient-empty right after a thread
 * is created (the owner-query empty-flap bug). Watching the specific doc by id is
 * unambiguous, and this predicate decides when that watch means "deleted".
 */

/** The bits of a Firestore doc snapshot this decision needs. */
export interface DocPresence {
  /** snap.exists() */
  exists: boolean;
  /** snap.metadata.fromCache — true until the server has confirmed the state. */
  fromCache: boolean;
}

/**
 * True only when the SERVER confirms the conversation doc is gone.
 *
 * A cache-only "missing" (`fromCache`) is NOT a delete: it's the initial attach
 * for an existing-but-uncached doc (a returning visitor), or an offline blip.
 * Treating that as a delete would wrongly boot a valid visitor back to the
 * pre-chat form, so the server confirmation is required.
 */
export function isConversationDeleted({ exists, fromCache }: DocPresence): boolean {
  return !exists && !fromCache;
}
