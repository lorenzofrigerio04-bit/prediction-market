/**
 * English, social-media-style identities for the simulated commenters.
 * Each identity is a handle (shown as the display name, IG/TikTok style) plus a
 * generated avatar image, so the comment section reads like a real social feed
 * instead of "Marco · gray circle".
 *
 * Avatars use DiceBear (https://www.dicebear.com) — free, keyless, returns an SVG
 * that the plain <img> in CommentsSection renders directly (no next/image domain config).
 */

/** Premium-feeling, distinct social handles. Length comfortably exceeds the bot count. */
export const SOCIAL_HANDLES: string[] = [
  "jordan.blake", "mia_k", "cryptodegen", "theo.94", "samir.xr", "luna.bets",
  "notyourbroker", "graceunderfire", "tap_out23", "deccaprio", "ava.exe", "ohitsmarcus",
  "lena.trades", "wolfofwallst", "kai_says", "priya.p", "thebigshortking", "elenamov",
  "max.payne", "sofia.h", "degenharper", "ninaonchain", "rico.suave", "the_quant_guy",
  "zoe.zero", "bagholder.bri", "owens.takes", "valentinaa", "milo.mode", "the_oracle_",
  "hana.byte", "fadethecrowd", "leo.long", "calltheflop", "ivy.signals", "drew.does",
  "the_macro_mom", "noah.bits", "yields.yara", "benji.bull", "stellaonchain", "the_paper_hand",
  "kira.k", "alphaandy", "marco.minds", "tinaontilt", "the_sharp_one", "felix.fades",
  "rae.risk", "the_grid_god", "oscar.odds", "lola.longs", "the_chart_witch", "danny.delta",
  "amara.a", "hodlhenry", "the_late_entry", "vee.verdict", "theo_takes_Ls", "nora.nodes",
  "thecontrarian_", "jp.morganfreeman", "kayla.calls", "the_vol_vlogger", "ezra.exits", "sunny.spreads",
  "the_break_even", "remi.rallies", "the_thesis_lady", "cobyontheblock", "ines.insider", "the_lurker_",
  "gusto.gains", "the_2am_trader", "harper.hedges", "ode.to.odds", "the_red_candle", "sky.shorts",
  "the_green_print", "tara.theta", "willtheshill", "the_fomo_kid", "naomi.numbers", "the_exit_liquidity",
  "blaze.bids", "the_overnighter", "cici.calls", "the_smart_money_", "rory.runs", "the_degenerate_",
  "ada.alpha", "the_position_", "kev.contrarian", "thea.takes", "the_breakout_", "milan.moves",
];

export interface SocialIdentity {
  /** Display name (shown by CommentsSection as user.name). */
  name: string;
  /** Avatar URL (shown by CommentsSection as user.image). */
  image: string;
}

/** A few human-leaning DiceBear styles for variety. */
const AVATAR_STYLES = ["notionists", "avataaars", "lorelei", "adventurer", "micah", "thumbs"];

/** Builds a deterministic DiceBear avatar URL for a handle. */
export function avatarForHandle(handle: string, index: number): string {
  const style = AVATAR_STYLES[index % AVATAR_STYLES.length];
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(handle)}`;
}

/** Returns a stable social identity for a bot at a given 0-based index. */
export function socialIdentityForIndex(index: number): SocialIdentity {
  const handle = SOCIAL_HANDLES[index % SOCIAL_HANDLES.length];
  return { name: handle, image: avatarForHandle(handle, index) };
}
