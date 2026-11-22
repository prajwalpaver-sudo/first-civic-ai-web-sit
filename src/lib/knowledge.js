import schemes from "@/data/schemes.json";
import guides from "@/data/guides.json";

const STOPWORDS = new Set([
  "the", "and", "for", "are", "was", "were", "with", "that", "this", "have", "has", "had",
  "will", "can", "you", "your", "our", "their", "them", "they", "from", "what", "which",
  "who", "how", "why", "when", "where", "does", "did", "not", "but", "all", "any", "how",
  "about", "into", "get", "got", "need", "want", "there", "here", "its", "it", "is", "of",
  "to", "in", "on", "at", "by", "or", "as", "be", "if", "my", "me", "we", "us", "he", "she",
  "hai", "kya", "kaise", "karo", "kar", "ke", "ki", "ka", "ko", "me", "mein", "aur", "nahi",
]);

export const PASSAGES = [
  ...schemes.map((s) => ({
    id: `scheme:${s.id}`,
    title: s.name,
    kind: "scheme",
    text: [
      s.full_name,
      s.summary,
      `Benefit: ${s.benefit}`,
      `Category: ${s.category}`,
      `Who can get it: ${s.rules.map((r) => r.label).join("; ")}`,
      `Documents: ${(s.documents || []).join(", ")}`,
      s.note || "",
    ]
      .filter(Boolean)
      .join(". "),
    source_url: s.source_url,
    last_verified: s.last_verified,
  })),
  ...guides.map((g) => ({
    id: `guide:${g.id}`,
    title: g.title,
    kind: "guide",
    text: `${g.title}. ${g.text}`,
    source_url: g.source_url,
    last_verified: g.last_verified,
  })),
];

const INDEX = PASSAGES.map((p) => ({
  passage: p,
  titleTokens: tokens(p.title),
  bodyTokens: tokens(p.text),
}));

function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

export function retrieve(query, limit = 5) {
  const qTokens = Array.from(new Set(tokens(query)));
  if (!qTokens.length) return [];

  const scored = INDEX.map(({ passage, titleTokens, bodyTokens }) => {
    const titleSet = new Set(titleTokens);
    const bodySet = new Set(bodyTokens);
    let score = 0;
    qTokens.forEach((t) => {
      if (titleSet.has(t)) score += 3;
      else if (bodySet.has(t)) score += 1;
      else if (Array.from(bodySet).some((b) => b.startsWith(t) && t.length > 4)) score += 0.5;
    });
    return { passage, score };
  })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((x) => x.passage);
}

const FLAG_RULES = [
  {
    key: "otp",
    label: "Asks for an OTP, PIN, password or CVV",
    re: /\b(otp|pin|cvv|password|passcode)\b|आधार\s*ओटीपी|ओटीपी/i,
  },
  {
    key: "fee",
    label: "Asks you to pay a fee to receive a benefit",
    re: /(registration|processing|application|security|release)\s*fee|pay\s*(rs\.?|₹|inr)?\s*\d+|शुल्क|फीस/i,
  },
  {
    key: "link",
    label: "Contains a shortened or non-government link",
    re: /(bit\.ly|tinyurl|t\.co|goo\.gl|rb\.gy|wa\.me|linktr\.ee|forms\.gle|cutt\.ly|is\.gd)/i,
  },
  {
    key: "urgency",
    label: "Creates urgency — 'today only', 'within 24 hours'",
    re: /(last date|today only|within\s*24\s*hours|immediately|hurry|expires?\s*(today|soon)|आज ही|तुरंत)/i,
  },
  {
    key: "aadhaar",
    label: "Asks you to send Aadhaar or bank details on WhatsApp",
    re: /(send|share|bhej)\w*\s+(your\s+)?(aadhaar|aadhar|bank|account|card)\s*(number|details)?|आधार\s*(नंबर|संख्या)\s*(भेजें|साझा)/i,
  },
  {
    key: "forward",
    label: "Asks you to forward the message to many people",
    re: /(forward|share)\s+(this\s+)?(to\s+)?(10|ten|all|\d+)\s*(people|friends|groups)|सभी को\s*(भेजें|शेयर)/i,
  },
  {
    key: "prize",
    label: "Promises a lottery, prize or lucky draw",
    re: /(lottery|lucky\s*draw|prize|jackpot|winner|इनाम|लॉटरी)/i,
  },
  {
    key: "amount",
    label: "Promises a large cash amount to 'everyone'",
    re: /(₹|rs\.?|inr)\s*[\d,]{3,}\s*(to|for|per|every)|every\s+(woman|citizen|farmer|student|family)/i,
  },
];

export function detectRedFlags(text) {
  const t = String(text || "");
  return FLAG_RULES.filter((f) => f.re.test(t)).map((f) => ({ key: f.key, label: f.label }));
}

export function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export const OFFICIAL_DOMAIN = /\.(gov\.in|nic\.in)$|(^|\.)(gov\.in|nic\.in)$/i;