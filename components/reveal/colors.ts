// Deterministic per-contestant color palette (issue #65a).
//
// Our `contestants` table has no `color` column (the original data-vis repo
// did). We derive a stable, vivid color from the contestant id so the same
// contestant always draws in the same color across renders and reloads —
// critical for a broadcast where viewers track lines week to week.
//
// Tuned for OBS/livestream capture against a near-black backdrop: saturated,
// high-luminance hues that stay distinct when compressed by a stream encoder.

const BROADCAST_PALETTE = [
  "#ff4d6d", // rose
  "#4dd4ff", // cyan
  "#ffd24d", // amber
  "#7c5cff", // violet
  "#3ddc84", // green
  "#ff8a3d", // orange
  "#ff5ce8", // magenta
  "#36e0c8", // teal
  "#a0ff4d", // lime
  "#5c8bff", // blue
  "#ff6f4d", // coral
  "#c77dff", // lavender
  "#ffe14d", // yellow
  "#4dffb0", // mint
  "#ff4da6", // pink
  "#6de2ff", // sky
] as const;

/**
 * FNV-1a-style string hash. Stable across runtime/platform, unlike a naive
 * char-sum (which collides badly on anagram-like ids). We only need a
 * well-distributed integer to index the palette.
 */
function hashId(id: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    // 32-bit FNV prime multiply, kept in unsigned range.
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Stable broadcast color for a contestant id. */
export function contestantColor(id: string): string {
  return BROADCAST_PALETTE[hashId(id) % BROADCAST_PALETTE.length];
}

/**
 * Assign colors across a roster while minimizing adjacent-index collisions.
 *
 * A pure `hash % length` can map two contestants to the same swatch. For a
 * legible chart we want every drawn line distinct, so we hash-seed the order
 * but then hand out unique palette slots greedily, falling back to the raw
 * hash color only once the palette is exhausted (more contestants than colors).
 */
export function buildColorMap(ids: string[]): Map<string, string> {
  const map = new Map<string, string>();
  const used = new Set<number>();

  // Sort by hash so assignment is deterministic regardless of input order.
  const ordered = [...ids].sort((a, b) => hashId(a) - hashId(b));

  for (const id of ordered) {
    const preferred = hashId(id) % BROADCAST_PALETTE.length;
    let slot = preferred;
    if (used.size < BROADCAST_PALETTE.length) {
      // Walk forward to the next free slot for a collision-free assignment.
      while (used.has(slot)) {
        slot = (slot + 1) % BROADCAST_PALETTE.length;
      }
      used.add(slot);
    }
    map.set(id, BROADCAST_PALETTE[slot]);
  }

  return map;
}
