/**
 * English, social-first comment pool for simulated activity.
 * Vibe: a premium TikTok / Instagram comment section on a prediction market —
 * hype, betting slang, skeptics, jokes, questions and short replies, with light emoji.
 *
 * This is the single source of truth for bot comment text. `comment-templates.ts`
 * re-exports a generic-only slice for the legacy runner; the reseed script uses the
 * richer pickers below (per-category flavor + replies).
 */

export type CommentBucket = "politics" | "finance" | "sports" | "tech" | "culture";

export interface SocialLine {
  text: string;
  /** When set, this line is extra fitting for that bucket (still usable elsewhere via the mixers). */
  bucket?: CommentBucket;
}

/**
 * Maps the platform's (Italian) event categories onto an English flavor bucket.
 * Unknown / missing categories fall back to the generic pool only.
 */
export function bucketForCategory(category: string | null | undefined): CommentBucket | null {
  const c = (category ?? "").trim().toLowerCase();
  if (!c) return null;
  if (["politica", "elezioni", "geopolitica", "politics", "elections"].includes(c)) return "politics";
  if (["finanza", "economia", "criptovalute", "crypto", "finance", "economy"].includes(c)) return "finance";
  if (["sport", "calcio", "sports", "football", "soccer"].includes(c)) return "sports";
  if (["tecnologia", "tech", "technology"].includes(c)) return "tech";
  if (["cultura", "intrattenimento", "culture", "entertainment", "music"].includes(c)) return "culture";
  return null;
}

/** Top-level comments that fit any market. The backbone of every thread. */
export const GENERIC_LINES: string[] = [
  // hype / YES energy
  "calling it now, screenshot this 📌",
  "this is gonna age SO well 📈",
  "loaded up on YES, see you all at the top 🚀",
  "the way this is basically free money rn 💸",
  "betting the house on this one, no notes",
  "YES and it's not even close lol",
  "smart money is all over this, wake up",
  "locked in. easiest yes of my life",
  "if you're not in yet idk what to tell you",
  "this aged into a layup, thank me later",
  "the YES gang stays winning 🤝",
  "been saying this for weeks, market finally caught up",
  "green candles incoming, mark my words",
  "putting my rent on it (don't tell my landlord)",
  "i'd bet my left airpod on this tbh",
  "we eating GOOD on this one 🍽️",
  // skeptic / NO energy
  "y'all are so down bad for this, it's NO all day",
  "fading this with my eyes closed",
  "this is copium with extra steps 💀",
  "NO. and I'll be back to say I told you so",
  "the market is high on its own supply rn",
  "shorting this into oblivion",
  "remindme 30 days, this ain't happening",
  "bold of everyone to assume… it's a no from me",
  "delusional prices, easiest fade of the week",
  "the hopium in this thread is unreal",
  "NO gang where you at 🙅",
  "imagine actually believing this lol",
  // funny / meme
  "my portfolio is NOT ready for this 😭",
  "commenting before this blows up 👀",
  "i have no idea what i'm doing but i'm in",
  "bookmarking to flex on my friends later",
  "down horrendous but staying optimistic",
  "saw the odds and gasped audibly on the bus",
  "not me refreshing this every 5 minutes",
  "broke: stocks. woke: this exact market",
  "the volatility is giving me a whole personality",
  "i came for the odds, i stayed for the comments 😂",
  "explaining this market to my mom was a journey",
  "this is the only thing keeping me humble",
  // questions / engagement
  "wait what's the actual resolution date on this?",
  "someone smarter than me explain the odds pls 🙏",
  "what are y'all seeing that i'm not 🤔",
  "is this priced in already or nah?",
  "who's actually in and at what %?",
  "genuine question, what flips this to YES?",
  "early gang say something, who's here before it pops?",
  "ok what's the catch, this looks too clean",
  "how is this not higher already??",
  "drop your entry, i'm collecting receipts 📸",
  // social / community
  "this comment section is eating fr 🔥",
  "best market on here right now, no debate",
  "we are so early it's almost illegal",
  "the analysis in here > my finance degree",
  "telling my group chat to pull up 📲",
  "found my new favorite market, gg",
  "saving this thread, you people are unserious 😂",
  "love this community, never change",
];

/** Per-bucket flavor lines, mixed in on top of the generic pool. */
export const BUCKET_LINES: Record<CommentBucket, string[]> = {
  politics: [
    "the polls are cooked, i'm trusting the vibes instead",
    "every pundit is gonna pretend they called this",
    "swing voters about to ruin my bag again 😤",
    "this gets decided in like 4 counties and we all know it",
    "October surprise loading… 🍿",
    "my poli sci professor could never",
    "betting on chaos has literally never let me down",
    "the establishment vs the timeline, place your bets",
    "the base case is way more boring than this market thinks",
    "watch them move the goalposts the second it resolves",
  ],
  finance: [
    "zoom out and this is honestly obvious",
    "DCA in and touch grass, you'll thank me",
    "liquidity is thin, this moves on one headline",
    "the chart is screaming, are you blind 📊",
    "macro says one thing, vibes say another, i trust vibes",
    "few understand 🤝",
    "this is a generational entry and you're sleeping",
    "diamond hands or get out of the kitchen 💎🙌",
    "the Fed is gonna fumble and we feast",
    "screenshot this, it's the trade of the quarter",
  ],
  sports: [
    "form table says yes, my heart says louder yes",
    "the underdog price here is straight up criminal",
    "watched every game this season, locking it in",
    "home crowd is worth a couple goals, easy",
    "the xG doesn't lie, fade the haters",
    "one red card and my whole thesis is cooked 😅",
    "if the keeper shows up this is already over",
    "injuries are the only thing scaring me here",
  ],
  tech: [
    "ship date slipping is basically a law of physics 😂",
    "the demo always looks better than the rollout",
    "they'll announce it then delay it, classic",
    "betting against the hype cycle literally pays my bills",
    "the roadmap says yes, the engineers say lol no",
    "vaporware until proven otherwise",
    "this ships Q4… of some unspecified year",
  ],
  culture: [
    "the drop is coming, i can feel it in my playlist 🎧",
    "they've been teasing this for a literal year",
    "stan accounts already know, get in now",
    "the rollout's been too quiet, something is cooking",
    "i will riot if this doesn't happen ngl",
    "the lore on this market is honestly unmatched 😂",
  ],
};

/** Short, conversational replies — used for the threaded replies in each market. */
export const REPLY_LINES: string[] = [
  "facts 💯",
  "this 👆",
  "underrated take honestly",
  "ok but source? 😭",
  "W comment",
  "aged like milk already lol",
  "couldn't have said it better",
  "respectfully, no 😂",
  "you're so real for this",
  "saving this, you're cooking 🔥",
  "hard disagree but i respect it",
  "this is the one take i actually trust",
  "screenshotting this for later 📸",
  "ngl you might be onto something",
  "lmaooo the confidence is sending me",
  "based",
  "couldn't be more wrong but go off 😂",
  "ok now THIS is analysis",
  "tell me you're new without telling me 😅",
  "real ones knew this weeks ago",
  "+1, been saying the same",
  "the delusion is strong with this one 💀",
  "finally someone said it",
  "remindme to come back and laugh at this 😂",
  "spitting straight facts no chaser",
  "needed this take today honestly",
  "first time you've been right all week 😂",
  "i'm stealing this for my group chat",
  "this aged perfectly, take a bow 🫡",
  "ratio + you're still wrong 💀",
];

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Picks a top-level comment for an event. With a bucket, mixes the generic pool
 * with that bucket's flavor lines (generic stays dominant so threads feel natural).
 */
export function pickRootLine(
  bucket: CommentBucket | null,
  rng: () => number = Math.random
): string {
  if (bucket && rng() < 0.45) {
    return pick(BUCKET_LINES[bucket], rng);
  }
  return pick(GENERIC_LINES, rng);
}

/** Picks a short reply line. */
export function pickReplyLine(rng: () => number = Math.random): string {
  return pick(REPLY_LINES, rng);
}

/** Probability (0–1) of using a comment as a reply (parentId) in the legacy runner. */
export const REPLY_PROBABILITY = 0.35;
