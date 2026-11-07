/**
 * Lightweight Bengali/English/Banglish query expansion.
 * Query-time only: stored content and database schemas remain unchanged.
 */
const BENGALI_TO_LATIN: Record<string, string> = {
  "অ": "o", "আ": "a", "ই": "i", "ঈ": "i", "উ": "u", "ঊ": "u", "ঋ": "ri",
  "এ": "e", "ঐ": "oi", "ও": "o", "ঔ": "ou",
  "ক": "k", "খ": "kh", "গ": "g", "ঘ": "gh", "ঙ": "ng",
  "চ": "ch", "ছ": "chh", "জ": "j", "ঝ": "jh", "ঞ": "ny",
  "ট": "t", "ঠ": "th", "ড": "d", "ঢ": "dh", "ণ": "n",
  "ত": "t", "থ": "th", "দ": "d", "ধ": "dh", "ন": "n",
  "প": "p", "ফ": "ph", "ব": "b", "ভ": "bh", "ম": "m",
  "য": "j", "র": "r", "ল": "l", "শ": "sh", "ষ": "sh", "স": "s",
  "হ": "h", "ড়": "r", "ঢ়": "rh", "য়": "y", "ং": "ng", "ঃ": "h", "ঁ": "n",
  "া": "a", "ি": "i", "ী": "i", "ু": "u", "ূ": "u", "ে": "e", "ৈ": "oi",
  "ো": "o", "ৌ": "ou", "ৃ": "ri", "্": "",
};

const BENGALI_PLACE_ALIASES: Record<string, string> = {
  "ঢাকা":"dhaka","ফরিদপুর":"faridpur","গাজীপুর":"gazipur","গোপালগঞ্জ":"gopalganj","কিশোরগঞ্জ":"kishoreganj","মাদারীপুর":"madaripur","মানিকগঞ্জ":"manikganj","মুন্সীগঞ্জ":"munshiganj","নারায়ণগঞ্জ":"narayanganj","নরসিংদী":"narsingdi","রাজবাড়ী":"rajbari","শরীয়তপুর":"shariatpur","টাঙ্গাইল":"tangail",
  "চট্টগ্রাম":"chattogram","বান্দরবান":"bandarban","ব্রাহ্মণবাড়িয়া":"brahmanbaria","চাঁদপুর":"chandpur","কুমিল্লা":"cumilla","কক্সবাজার":"coxsbazar","ফেনী":"feni","খাগড়াছড়ি":"khagrachhari","লক্ষ্মীপুর":"lakshmipur","নোয়াখালী":"noakhali","রাঙামাটি":"rangamati",
  "রাজশাহী":"rajshahi","বগুড়া":"bogura","জয়পুরহাট":"joypurhat","নওগাঁ":"naogaon","নাটোর":"natore","চাঁপাইনবাবগঞ্জ":"chapainawabganj","পাবনা":"pabna","সিরাজগঞ্জ":"sirajganj",
  "খুলনা":"khulna","বাগেরহাট":"bagerhat","চুয়াডাঙ্গা":"chuadanga","যশোর":"jashore","ঝিনাইদহ":"jhenaidah","কুষ্টিয়া":"kushtia","মাগুরা":"magura","মেহেরপুর":"meherpur","নড়াইল":"narail","সাতক্ষীরা":"satkhira",
  "বরিশাল":"barishal","বরগুনা":"barguna","ভোলা":"bhola","ঝালকাঠি":"jhalokati","পটুয়াখালী":"patuakhali","পিরোজপুর":"pirojpur",
  "সিলেট":"sylhet","হবিগঞ্জ":"habiganj","মৌলভীবাজার":"moulvibazar","সুনামগঞ্জ":"sunamganj",
  "রংপুর":"rangpur","দিনাজপুর":"dinajpur","গাইবান্ধা":"gaibandha","কুড়িগ্রাম":"kurigram","লালমনিরহাট":"lalmonirhat","নীলফামারী":"nilphamari","পঞ্চগড়":"panchagarh","ঠাকুরগাঁও":"thakurgaon",
  "ময়মনসিংহ":"mymensingh","জামালপুর":"jamalpur","নেত্রকোণা":"netrokona","শেরপুর":"sherpur"
};

// Reverse lookup makes common district/division names searchable in Banglish.
const LATIN_TO_BENGALI_PLACE_ALIASES: Record<string, string> = {
  ...Object.fromEntries(Object.entries(BENGALI_PLACE_ALIASES).map(([bengali, latin]) => [latin, bengali])),
  chittagong: "চট্টগ্রাম",
  comilla: "কুমিল্লা",
  bogra: "বগুড়া",
  jessore: "যশোর",
  barisal: "বরিশাল",
};


export function normalizeSearchIdentity(value: string): string {
  const normalized = value.normalize("NFC").trim().toLocaleLowerCase();
  const alias = BENGALI_PLACE_ALIASES[normalized];
  if (alias) return alias.replace(/[^a-z0-9]+/g, "");
  const latin = /[\u0980-\u09FF]/.test(normalized) ? bengaliToLatin(normalized) : normalized;
  return latin.replace(/[^a-z0-9]+/g, "");
}

const COMMON_BANGLISH_ALIASES: Record<string, string> = {
  oprajeyo: "অপরাজেয়",
  oparajeyo: "অপরাজেয়",
  oporajeyo: "অপরাজেয়",
  aparajeyo: "অপরাজেয়",
};
const APARAJEYO_VARIANTS = ["অপরাজেয়", "oprajeyo", "oparajeyo", "oporajeyo", "aparajeyo", "oprajey"];

const ROMAN_TO_BENGALI: Array<[string, string]> = [
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
  const normalized = value.normalize("NFC").replace(/য়/g, "য়");
  return Array.from(normalized).map((char) => BENGALI_TO_LATIN[char] ?? char).join("");
}

/** Convert common phonetic Banglish input into a Bengali search variant. */
export function banglishToBengali(value: string): string {
  const input = value.toLocaleLowerCase().replace(/[^a-z\s-]/g, " ").replace(/\s+/g, " ").trim();
  if (!input) return "";
  if (COMMON_BANGLISH_ALIASES[input]) return COMMON_BANGLISH_ALIASES[input];

  return input.split(/([\s-]+)/).map((part) => {
    if (!part || /^[\s-]+$/.test(part)) return part;
    const placeAlias = LATIN_TO_BENGALI_PLACE_ALIASES[part];
    if (placeAlias) return placeAlias;
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

/** Return the original query plus cross-script and common spelling alternatives. */
export function expandSearchTerms(query: string): string[] {
  const original = query.normalize("NFC").trim().replace(/\s+/g, " ");
  if (!original) return [];
  const terms = new Set([original]);

  if (/[\u0980-\u09FF]/.test(original)) {
    const latin = (BENGALI_PLACE_ALIASES[original] ?? bengaliToLatin(original)).trim();
    if (latin && latin.toLowerCase() !== original.toLowerCase()) terms.add(latin);
    if (original.replace(/য়/g, "য়").includes("অপরাজেয়")) APARAJEYO_VARIANTS.forEach((variant) => terms.add(variant));
  } else if (/[a-z]/i.test(original)) {
    const bengali = banglishToBengali(original);
    if (bengali && bengali !== original) terms.add(bengali);
    if (COMMON_BANGLISH_ALIASES[original.toLowerCase()]) {
      APARAJEYO_VARIANTS.forEach((variant) => terms.add(variant));
    }
  }

  return Array.from(terms).slice(0, 8);
}
