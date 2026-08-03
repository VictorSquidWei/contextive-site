// Reader hooks — the plain-English, everyday-reader line for each campaign.
//
// Harvested from Contextive's own published social copy (Courtney's messaging pass)
// and tightened. These are QUALITATIVE framing only — no signal numbers live here.
// Every number a reader sees on the site still comes from the measured campaign data
// (the hero tension + leaderboard), so "measure, don't estimate" is never at risk.
// C08's hook was re-anchored: the campaign is now measured, so the old
// "unmeasurable" framing was dropped for the measured "loudest isn't winning" read.

export const READER_HOOKS: Record<string, string> = {
  '01-trade-war': 'One tariff can be three different stories — depending on who names it.',
  '02-ai-and-work': 'A word can rule the conversation long after it stops winning the argument.',
  '03-bodies-and-food': 'The words reshaping food and weight arrived before the science settled.',
  '04-primaries': 'Same election result. Three different political realities, built by vocabulary.',
  '05-economy': 'One inflation number can mean progress, pain, and blame all at once.',
  '06-iran-war': 'One war, competing words for how it ended — and whether it did.',
  '07-money': 'The market ditched the trade faster than believers ditched the belief.',
  '08-abundance': 'The loudest words own the headlines. That is not the same as winning.',
  '09-real': 'The words that named synthetic media are no longer the ones carrying it.',
  '10-power': 'Who pays for the AI power boom — you, or Big Tech?',
};

/**
 * Hand-written hero-tension captions (Courtney's messaging pass), sharper than the
 * auto-derived "X is surging while Y is steady". Number-free framing only; the hero
 * still shows the real measured velocities on each pole. Campaigns without an entry
 * fall back to the auto-derived caption.
 */
export const HERO_CAPTIONS: Record<string, string> = {
  '10-power': 'The loud slogan is standing still. The rule that decides who pays is moving.',
  '09-real': 'The vocabulary is shifting from naming the flood to describing what it produces at work.',
  '05-economy': 'The mood word took off. The policy phrase never did.',
};

/** The three campaigns whose hooks pull the widest audience — the homepage features. */
export const FEATURED_CAMPAIGN_IDS = ['10-power', '05-economy', '03-bodies-and-food'];

export function readerHook(id: string): string | undefined {
  return READER_HOOKS[id];
}
