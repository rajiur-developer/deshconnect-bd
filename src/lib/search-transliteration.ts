/**
 * Lightweight Bengali/English/Banglish query expansion.
 *
 * This is intentionally query-time only: it does not alter stored content or
 * database schemas. It supports common informal Banglish spellings and keeps
 * the original query as a fallback for exact English/Bengali matches.
 */
const BENGALI_TO_LATIN: Record<string, string> = {
  অ: "o", আ: "a", ই: "i", ঈ: "i", উ: "u", ঊ: "u", ঋ: "ri",
  এ: "e", ঐ: "oi", ও: "o", ঔ: "ou",
  ক: "k", খ: "kh", গ: "g", ঘ: "gh", ঙ: "ng",
  চ: "ch", ছ: "chh", জ: "j", ঝ: "jh", ঞ: "ny",
  ট: "t", ঠ: "th", ড: "d", ঢ: "dh", ণ: "n",
  ত: "t", থ: "th", দ: "d", ধ: "dh", ন: "n",
  প: "p", ফ: "ph", ব: "b", ভ: "bh", ম: "m",
  য: "j", র: "r", ল: "l", শ: "sh", ষ: "sh", স: "s",
  হ: "h", ড়: "r", ঢ়: "rh", য়: "y", ং: "ng", ঃ: "h", ঁ: "n",
  া: "a", ি: "i", ী: "i", ু: "u", ূ: "u", ে: "e", ৈ: "oi",
  ো: "o", ৌ: "ou", ৃ: "ri", ্: "",
};

const COMMON_BANGLISH_ALIASES: Record<string, string> = {\n  oprajeyo: "অপরাজেয়",\n  oparajeyo: "অপরাজেয়",\n  oporajeyo: "অপরাজেয়",\n  aparajeyo: "অপরাজেয়",\n};\nconst APARAJEYO_VARIANTS = ["অপরাজেয়", "oprajeyo", "oparajeyo", "oporajeyo", "aparajeyo", "oprajey"];\n\nconst ROMAN_TO_BENGALI: Array<[string, string]> = [
  ["op", "অপ"], ["eyo", "েয়"], ["yoo", "্যু"], ["chh", "ছ"], ["kh", "খ"],
  ["gh", "ঘ"], ["ch", "চ"], ["jh", "ঝ"], ["th", "থ"], ["dh", "ধ"],
  ["ph", "ফ"], ["bh", "ভ"], ["sh", "শ"], ["ng", "ং"], ["ny", "ঞ"],
  ["aa", "া"], ["ee", "ী"], ["ii", "ী"], ["oo", "ূ"], ["uu", "ূ"],
  ["oi", "ৈ"], ["ou", "ৌ"], ["ri", "ৃ"],
  ["a", "া"], ["i", "ি"], ["e", "ে"], ["u", "ু"], ["o", "ো"],
  ["k", "ক"], ["g", "গ"], ["c", "ক"], ["j", "জ"], ["t", "ত"],
  ["d", "দ"], ["n", "ন"], ["p", "প"], ["f", "ফ"], ["b", "ব"],
  ["v", "ভ"], ["m", "ম"], ["r", "র"], ["l", "ল"], ["s", "স"],
  ["h", "হ"], ["w", "ও"], ["y", "য়"], ["x", "ক্স"], ["z", "জ"],
];

export function bengaliToLatin(value: string): string {
  return Array.from(value.normalize("NFC")).map((char) => BENGALI_TO_LATIN[char] ?? char).join("");
}

/** Convert common phonetic Banglish input into a Bengali search variant. */
export function banglishToBengali(value: string): string {
  const input = value.toLocaleLowerCase().replace(/[^a-z\s-]/g, " ").replace(/\s+/g, " ").trim();
  if (!input) return "";
  return input.split(/([\s-]+)/).map((part) => {
    if (!part || /^[\s-]+$/.test(part)) return part;
    let output = "";
    for (let index = 0; index < part.length;) {
      const match = ROMAN_TO_BENGALI.find(([roman]) => part.startsWith(roman, index));
      if (!match) {
        output += part[index];
        index += 1;
      } else {
        output += match[1];
        index += match[0].length;
      }
    }
    return output;
  }).join("");
}

/** Return the original query plus useful cross-script alternatives. */
export function expandSearchTerms(query: string): string[] {
  const original = query.normalize("NFC").trim().replace(/\s+/g, " ");
  if (!original) return [];
  const terms = new Set([original]);
  if (/[\u0980-\u09FF]/.test(original)) {
    const latin = bengaliToLatin(original).trim();
    if (latin && latin.toLowerCase() !== original.toLowerCase()) terms.add(latin);
  } else if (/[a-z]/i.test(original)) {
    const bengali = banglishToBengali(original);
    if (bengali && bengali !== original) terms.add(bengali);
  }
  return Array.from(terms).slice(0, 3);
}
