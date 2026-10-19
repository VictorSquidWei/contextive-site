// FreshnessBadge — the "Live Campaigns" proof stamp.
//
// Shows a campaign's real measurement as-of date (campaign.refDate), read straight
// from the measured campaign data. It is the on-site proof of freshness the Live
// Campaigns feature is built around (see
// contextive-toolkit/CONTEXTIVE_LIVE_CAMPAIGNS_PLAN.md, Part 2).
//
// ──────────────────────────────────────────────────────────────────────────────
// HONESTY GATE — read before flipping LIVE_MODE.
// ──────────────────────────────────────────────────────────────────────────────
// The daily auto-refresh loop is NOT running yet. Until it is VERIFIED running in
// production, this badge states only the real measurement date and MUST NOT claim
// "Live", "real-time", or "updates daily" — that would over-claim a feature that
// does not exist yet, which is exactly the kind of over-claim the brand exists to
// avoid. So today it reads: "Measured as of <date>".
//
// >>> THE ONE FLAG TO FLIP <<<
// When the daily refresh loop is verified live, set LIVE_MODE = true (right here).
// That single change swaps the wording to "Live · updated <date>" everywhere the
// badge renders (campaign page, /readout, homepage index). Nothing else changes.
// Keep it false until the loop is proven running.
export const LIVE_MODE = false;

import type { Campaign } from '../data/campaign';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format an ISO YYYY-MM-DD date as e.g. "Jul 21, 2026". Parsed by hand (not via
 * `new Date`) so it never drifts across a timezone boundary. Returns null for
 * anything that isn't a well-formed date — the caller then hides the badge rather
 * than showing a blank or a fabricated date.
 */
function formatRefDate(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  const mi = Number(mo) - 1;
  const day = Number(d);
  if (mi < 0 || mi > 11 || day < 1 || day > 31) return null;
  return `${MONTHS[mi]} ${day}, ${y}`;
}

interface FreshnessBadgeProps {
  campaign: Pick<Campaign, 'refDate'>;
  /**
   * 'chip'   — bordered, self-contained (campaign header / readout header).
   * 'inline' — no border/background; inherits the surrounding text color so it can
   *            live inside a card that inverts on hover.
   */
  variant?: 'chip' | 'inline';
  className?: string;
}

export function FreshnessBadge({ campaign, variant = 'chip', className = '' }: FreshnessBadgeProps) {
  const iso = campaign.refDate;
  const date = iso ? formatRefDate(iso) : null;
  // No real date → render nothing. Never a blank, never a fabricated stamp.
  if (!iso || !date) return null;

  const label = LIVE_MODE ? 'Live · updated' : 'Measured as of';
  const aria = LIVE_MODE ? `Live campaign, updated ${date}` : `Measured as of ${date}`;

  const shell =
    variant === 'chip'
      ? 'border border-rule bg-canvas text-muted px-2 py-1'
      : ''; // inline inherits color from the caller (via className)

  return (
    <span
      aria-label={aria}
      title={aria}
      className={`inline-flex items-center gap-1.5 max-w-full small-caps text-[11px] leading-none ${shell} ${className}`.trim()}
    >
      {/* Pulse dot ONLY once genuinely live. Decorative — the words carry the
          meaning, so the badge never conveys freshness by color/shape alone. */}
      {LIVE_MODE && (
        <span
          aria-hidden
          className="inline-block w-1.5 h-1.5 rotate-45 bg-current motion-safe:animate-pulse shrink-0"
        />
      )}
      <span aria-hidden className="truncate">
        {label}{' '}
        <time
          dateTime={iso}
          className={variant === 'chip' ? 'text-ink tabular-nums' : 'tabular-nums'}
        >
          {date}
        </time>
      </span>
    </span>
  );
}
