/**
 * SwissNat SL - Sinhala & Tamil Transliteration Engine & School Dictionary
 * Automatically translates Sinhala/Tamil school names and phonetically transliterates names into clean English Title Case.
 */

// Sinhala initials mapping when parents type English letters using Sinhala phonetics
export const SINHALA_INITIALS_MAP: Record<string, string> = {
  'ඒ': 'A',
  'බී': 'B',
  'සී': 'C',
  'ඩී': 'D',
  'ඩි': 'D',
  'ඩී.': 'D',
  'ඩි.': 'D',
  'ඊ': 'E',
  'එෆ්': 'F',
  'ජී': 'G',
  'එච්': 'H',
  'අයි': 'I',
  'ජේ': 'J',
  'කේ': 'K',
  'කේ': 'K', // vowel sign form
  'කේ.': 'K',
  'කේ.': 'K',
  'එල්': 'L',
  'එම්': 'M',
  'එන්': 'N',
  'ඕ': 'O',
  'පී': 'P',
  'කිව්': 'Q',
  'කියු': 'Q',
  'ආර්': 'R',
  'එස්': 'S',
  'ටී': 'T',
  'ටි': 'T',
  'යූ': 'U',
  'වී': 'V',
  'වි': 'V',
  'ඩබ්ලිව්': 'W',
  'ඩබ්': 'W',
  'එක්ස්': 'X',
  'වයි': 'Y',
  'ඉසෙඩ්': 'Z',
};

// Known common school translation pairs & suffixes
export const SCHOOL_DICT: Record<string, string> = {
  // Full school names
  'ගොඩපිටිය ජාතික පාසල': 'Godapitiya National School',
  'ගොඩපිටිය ජොතික පොසල': 'Godapitiya National School',
  'මාර/ තෙලිජ්ජවිල මධ්ය විද්යාලය': 'MR/Thelijjawila Central College',
  'මාර/ තෙලිජ්ජවිල මධ්‍ය විද්‍යාලය': 'MR/Thelijjawila Central College',
  'මාර/තෙලිජ්ජවිල මධ්‍ය විද්‍යාලය': 'MR/Thelijjawila Central College',
  'මාර/තෙලිජ්ජවිල මධ්ය විද්යාලය': 'MR/Thelijjawila Central College',
  'තෙලිජ්ජවිල මධ්‍ය විද්‍යාලය': 'Thelijjawila Central College',
  'තෙලිජ්ජවිල මධ්ය විද්යාලය': 'Thelijjawila Central College',

  // Suffixes and phrases
  'ජාතික පාසල': 'National School',
  'ජොතික පොසල': 'National School',
  'මධ්‍ය මහා විද්‍යාලය': 'Central College',
  'මධ්‍ය මහො විද්‍යොලය': 'Central College',
  'මධ්‍ය විද්‍යාලය': 'Central College',
  'මධ්ය විද්යාලය': 'Central College',
  'මහා විද්‍යාලය': 'Maha Vidyalaya',
  'මහ විද්‍යාලය': 'Maha Vidyalaya',
  'මහො විද්‍යොලය': 'Maha Vidyalaya',
  'කනිෂ්ඨ විද්‍යාලය': 'Kanishta Vidyalaya',
  'කනෂ්ඨ විද්‍යොලය': 'Kanishta Vidyalaya',
  'බාලිකා විද්‍යාලය': 'Balika Vidyalaya',
  'බොලිකො විද්‍යොලය': 'Balika Vidyalaya',
  'ආදර්ශ ප්‍රාථමික විද්‍යාලය': 'Model Primary School',
  'ආදර්ශ ප්‍රොථමික විද්‍යොලය': 'Model Primary School',
  'ප්‍රාථමික විද්‍යාලය': 'Primary School',
  'ප්‍රොථමික විද්‍යොලය': 'Primary School',
  'විද්‍යාලය': 'Vidyalaya',
  'විද්යාලය': 'Vidyalaya',
  'විද්‍යොලය': 'Vidyalaya',
  'පාසල': 'School',
  'පොසල': 'School',
  'ජාතික': 'National',
  'ආදර්ශ': 'Model',
  'ප්‍රාථමික': 'Primary',
  'බාලිකා': 'Balika',
  'කොළඹ': 'Colombo',
  'ගාල්ල': 'Galle',
  'මාතර': 'Matara',
  'මහනුවර': 'Kandy',
  'කුරුණෑගල': 'Kurunegala',
  'කළුතර': 'Kalutara',
  'ගම්පහ': 'Gampaha',
  'රත්නපුර': 'Ratnapura',
  'අනුරාධපුර': 'Anuradhapura',
  'බදුල්ල': 'Badulla',
  'ගොඩපිටිය': 'Godapitiya',
  'තෙලිජ්ජවිල': 'Thelijjawila',
  'මාරම්බ': 'Maramba',
  'තෙල්ලඹුර': 'Thellambura',
};

// Known common Sinhala personal names dictionary for accurate spelling
export const NAME_DICT: Record<string, string> = {
  'කුලිත': 'Kulitha',
  'ගිනෙත්': 'Gineth',
  'සඳැස්': 'Sandas',
  'දිනුක': 'Dinuka',
  'සඳුන්': 'Sandun',
  'කවිඳු': 'Kavindu',
  'නෙත්මි': 'Nethmi',
  'සෙනුරි': 'Senuri',
  'හිරුණි': 'Hiruni',
  'තරුෂි': 'Tharushi',
  'කසුන්': 'Kasun',
  'තිසර': 'Thisara',
  'ළහිරු': 'Lahiru',
  'දෙව්මි': 'Dewmi',
  'දෙව්දුන්': 'Dewdun',
  'සෙහස්': 'Sehas',
  'බිනුවර': 'Binuwara',
  'සඳකැන්': 'Sandakan',
  'අනිදු': 'Anidu',
  'හර්ෂිත': 'Harshitha',
  'තීර්ථ': 'Theertha',
  'ජයශංක': 'Jayashankha',
  'දිනූප': 'Dinupa',
  'සිතුසහන්': 'Sithusahan',
  'ෂෙනුමි': 'Shenumi',
  'විහංසා': 'Vihansa',
  'ලුමිනි': 'Lumini',
  'සසන්‍යා': 'Sasanya',
  'අකීසා': 'Akeesa',
  'රත්නායක': 'Rathnayake',
  'බිසක්‍යා': 'Bisakya',
  'කෙශාන්': 'Keshan',
  'චනුක': 'Chanuka',
  'ඔදම්ස': 'Odamsa',
  'කරන්දෙණිය': 'Karandeniya',
};

// Sinhala Unicode character tables for algorithmic phonetic fallback
const SINHALA_CONSONANTS: Record<string, string> = {
  '\u0D9A': 'k', '\u0D9B': 'kh', '\u0D9C': 'g', '\u0D9D': 'gh', '\u0D9E': 'ng', '\u0D9F': 'ng',
  '\u0DA0': 'ch', '\u0DA1': 'chh', '\u0DA2': 'j', '\u0DA3': 'jh', '\u0DA4': 'ny', '\u0DA5': 'jny', '\u0DA6': 'nj',
  '\u0DA7': 't', '\u0DA8': 'th', '\u0DA9': 'd', '\u0DAA': 'dh', '\u0DAB': 'n', '\u0DAC': 'nd',
  '\u0DAD': 'th', '\u0DAE': 'th', '\u0DAF': 'd', '\u0DB0': 'dh', '\u0DB1': 'n', '\u0DB3': 'nd',
  '\u0DB4': 'p', '\u0DB5': 'ph', '\u0DB6': 'b', '\u0DB7': 'bh', '\u0DB8': 'm', '\u0DB9': 'mb',
  '\u0DBA': 'y', '\u0DBB': 'r', '\u0DBD': 'l', '\u0DC0': 'v',
  '\u0DC1': 'sh', '\u0DC2': 'sh', '\u0DC3': 's', '\u0DC4': 'h', '\u0DC5': 'l', '\u0DC6': 'f',
};

const SINHALA_INDEPENDENT_VOWELS: Record<string, string> = {
  '\u0D85': 'a', '\u0D86': 'aa', '\u0D87': 'ae', '\u0D88': 'aae',
  '\u0D89': 'i', '\u0D8A': 'ee', '\u0D8B': 'u', '\u0D8C': 'oo',
  '\u0D8D': 'ri', '\u0D8E': 'ree', '\u0D8F': 'li', '\u0D90': 'lii',
  '\u0D91': 'e', '\u0D92': 'e', '\u0D93': 'ai', '\u0D94': 'o',
  '\u0D95': 'o', '\u0D96': 'au',
};

const SINHALA_VOWEL_SIGNS: Record<string, string> = {
  '\u0DCF': 'aa', '\u0DD0': 'a', '\u0DD1': 'ae', '\u0DD2': 'i',
  '\u0DD3': 'ee', '\u0DD4': 'u', '\u0DD6': 'oo', '\u0DD8': 'ri',
  '\u0DD9': 'e', '\u0DDA': 'e', '\u0DDB': 'ai', '\u0DDC': 'o',
  '\u0DDD': 'o', '\u0DDE': 'au', '\u0DDF': 'g', '\u0DF2': 'o',
  '\u0DF3': 'oo',
};

// Check if string contains Sinhala Unicode (0x0D80 to 0x0DFF)
export function containsSinhala(text: string): boolean {
  return /[\u0D80-\u0DFF]/.test(text);
}

// Check if string contains Tamil Unicode (0x0B80 to 0x0BFF)
export function containsTamil(text: string): boolean {
  return /[\u0B80-\u0BFF]/.test(text);
}

/**
 * Phonetically transliterates a Sinhala word or phrase
 */
export function transliterateSinhalaWord(word: string): string {
  // Check initials map first
  const trimmed = word.trim();
  if (SINHALA_INITIALS_MAP[trimmed]) {
    return SINHALA_INITIALS_MAP[trimmed];
  }

  // Check dictionary
  if (NAME_DICT[trimmed]) {
    return NAME_DICT[trimmed];
  }
  if (SCHOOL_DICT[trimmed]) {
    return SCHOOL_DICT[trimmed];
  }

  // Fallback to character-by-character transliteration
  let result = '';
  const chars = Array.from(trimmed);
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const nextChar = chars[i + 1];

    if (SINHALA_INDEPENDENT_VOWELS[char]) {
      result += SINHALA_INDEPENDENT_VOWELS[char];
    } else if (SINHALA_CONSONANTS[char]) {
      const consonant = SINHALA_CONSONANTS[char];
      if (nextChar === '\u0DCA') {
        // Hal kireema (virama) - silent vowel
        result += consonant;
        i++; // skip virama
      } else if (nextChar && SINHALA_VOWEL_SIGNS[nextChar]) {
        result += consonant + SINHALA_VOWEL_SIGNS[nextChar];
        i++; // skip vowel sign
      } else {
        // Inherent 'a' vowel if middle/start of word, softer at end
        result += consonant + (i === chars.length - 1 ? 'a' : 'a');
      }
    } else if (char === '\u0D82') {
      result += 'ng';
    } else if (char === '\u0D83') {
      result += 'h';
    } else if (char === ' ' || char === '.' || char === '-' || char === '/') {
      result += char;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Transliterates Tamil text into English
 */
export function transliterateTamil(text: string): string {
  const TAMIL_MAP: Record<string, string> = {
    'க': 'k', 'ங': 'ng', 'ச': 's', 'ஞ': 'gn', 'ட': 't', 'ண': 'n',
    'த': 'th', 'ந': 'n', 'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r',
    'ல': 'l', 'வ': 'v', 'ழ': 'zh', 'ள': 'l', 'ற': 'r', 'ன': 'n',
    'ஜ': 'j', 'ஷ': 'sh', 'ஸ': 's', 'ஹ': 'h',
    'அ': 'A', 'ஆ': 'Aa', 'இ': 'I', 'ஈ': 'Ee', 'உ': 'U', 'ஊ': 'Oo',
    'எ': 'E', 'ஏ': 'E', 'ஐ': 'Ai', 'ஒ': 'O', 'ஓ': 'O', 'ஔ': 'Au',
    'ா': 'aa', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo',
    'ெ': 'e', 'ே': 'e', 'ை': 'ai', 'ொ': 'o', 'ோ': 'o', 'ௌ': 'au',
    '்': '',
  };

  return text.split('').map(c => TAMIL_MAP[c] || c).join('');
}

/**
 * Converts any Sinhala or Tamil player name tokens into clean English Title Case.
 */
export function transliterateSinhalaTamilToEnglish(name: string): string {
  if (!name) return '';
  if (!containsSinhala(name) && !containsTamil(name)) {
    return name;
  }

  // If Sinhala
  if (containsSinhala(name)) {
    // Check if entire phrase is in dictionary
    const trimmed = name.trim();
    if (NAME_DICT[trimmed]) return NAME_DICT[trimmed];

    // Split into tokens (whitespace, dots)
    const tokens = trimmed.split(/[\s.]+/).filter(Boolean);
    const transliteratedTokens = tokens.map(token => {
      // Check initials
      if (SINHALA_INITIALS_MAP[token]) {
        return SINHALA_INITIALS_MAP[token];
      }
      if (NAME_DICT[token]) {
        return NAME_DICT[token];
      }
      const trans = transliterateSinhalaWord(token);
      return trans ? trans.charAt(0).toUpperCase() + trans.slice(1).toLowerCase() : token;
    });

    return transliteratedTokens.join(' ');
  }

  // Tamil transliteration
  const tamilTrans = transliterateTamil(name);
  return toTitleCase(tamilTrans);
}

/**
 * Clean & English-translate School / Club Name (Max 35 chars)
 * Handles known Sinhala terms, prefixes (MR/, G/), St. Mary's, and invalid entries like "Yes"/"No"/"නැත".
 */
// Comprehensive list of Sri Lankan cities, towns, and tournament centers
export const SRI_LANKAN_CITIES = [
  'Colombo', 'Galle', 'Matara', 'Kandy', 'Kalutara', 'Panadura',
  'Ambalangoda', 'Gampaha', 'Kurunegala', 'Ratnapura', 'Rathnapura',
  'Anuradhapura', 'Badulla', 'Bandarawela', 'Kegalle', 'Matale',
  'Nuwara Eliya', 'Hambantota', 'Tangalle', 'Negombo', 'Moratuwa',
  'Dehiwala', 'Dehiwela', 'Mount Lavinia', 'Mt Lavinia', 'Horana',
  'Homagama', 'Maharagama', 'Nugegoda', 'Piliyandala', 'Battaramulla',
  'Malabe', 'Kaduwela', 'Kelaniya', 'Wattala', 'Ja-Ela', 'Ja Ela',
  'Minuwangoda', 'Mirigama', 'Veyangoda', 'Beruwala', 'Aluthgama',
  'Alutgama', 'Bentota', 'Balapitiya', 'Hikkaduwa', 'Elpitiya',
  'Karandeniya', 'Baddegama', 'Ahangama', 'Koggala', 'Weligama',
  'Akuressa', 'Deniyaya', 'Hakmana', 'Kamburupitiya', 'Dikwella',
  'Dickwella', 'Beliatta', 'Ranna', 'Ambalantota', 'Tissamaharama',
  'Embilipitiya', 'Balangoda', 'Avissawella', 'Hanwella', 'Padukka',
  'Chilaw', 'Puttalam', 'Wennappuwa', 'Marawila', 'Kuliyapitiya',
  'Wariyapola', 'Polonnaruwa', 'Dambulla', 'Gampola', 'Nawalapitiya',
  'Hatton', 'Talawakele', 'Jaffna', 'Vavuniya', 'Mannar', 'Trincomalee',
  'Batticaloa', 'Ampara', 'Monaragala', 'Wellawaya', 'Welimada',
  'Mahiyanganaya', 'Thelijjawila', 'Godapitiya', 'Wadduwa', 'Payagala',
  'Bandaragama', 'Mathugama', 'Matugama', 'Ingiriya', 'Bulathsinhala',
  'Mulleriyawa', 'Kotikawatta', 'Angoda', 'Kolonnawa', 'Rajagiriya',
  'Nawala', 'Kotte', 'Sri Jayawardenepura', 'Kohuwala', 'Boralesgamuwa',
  'Kesbewa', 'Moragahahena', 'Pannipitiya', 'Kottawa', 'Athurugiriya',
  'Hokandara', 'Thalawathugoda', 'Mabima', 'Biyagama', 'Delgoda',
  'Kiribathgoda', 'Kadawatha', 'Ragama', 'Mahabage', 'Kandana',
  'Seeduwa', 'Katunayake', 'Divulapitiya', 'Nittambuwa', 'Yakkala',
  'Dompe', 'Kirindiwela', 'Pugoda', 'Katugastota', 'Peradeniya',
  'Kundasale', 'Digana', 'Pilimathalawa', 'Kadugannawa', 'Gelioya',
  'Galaha', 'Akurana', 'Wattegama', 'Madawala', 'Maramba', 'Thellambura'
];

/**
 * Cleans, transliterates, and standardizes Sri Lankan School and Club Names:
 * 1. Guarantees space after '/' and removes space before '/' (e.g. MR/Vijitha -> MR/ Vijitha, G / Dharmasoka -> G/ Dharmasoka)
 * 2. Removes all '.' in the club name, while preserving/converting Saint short form to 'St.' (e.g. ST Johns -> St. Johns)
 * 3. Before a city name at the end, places ' - ' (e.g. Mahinda Rajapaksha Vidyalaya Matara -> Mahinda Rajapaksha Vidyalaya - Matara)
 *    Preserves direct comma without space (e.g. Mahinda College,Galle -> Mahinda College,Galle)
 */
export function cleanSchoolName(school: string | undefined | null): string {
  if (!school) return '';
  let str = String(school).trim();

  // Strip invalid placeholder values
  const lower = str.toLowerCase();
  const invalidPlaceholders = ['yes', 'no', 'none', 'n/a', 'na', 'null', 'undefined', '-', '.', 'නැත', 'නැ', 'නැත.', 'இல்லை'];
  if (invalidPlaceholders.includes(lower) || invalidPlaceholders.includes(str)) {
    return '';
  }

  // Check full match in dictionary
  for (const [sinhalaKey, englishVal] of Object.entries(SCHOOL_DICT)) {
    if (str === sinhalaKey || str.includes(sinhalaKey)) {
      str = str.replace(new RegExp(sinhalaKey, 'g'), englishVal);
    }
  }

  // If still contains Sinhala words, transliterate remaining
  if (containsSinhala(str)) {
    const tokens = str.split(' ');
    str = tokens.map(t => SCHOOL_DICT[t] || transliterateSinhalaWord(t)).join(' ');
  }

  // 1. Slash ("/") handling:
  // Remove space before '/' and guarantee a space after '/'
  str = str.replace(/\s*\/\s*/g, '/ ');

  // Standardize uppercase for district/province prefixes before slash: e.g. mr/ -> MR/, g/ -> G/
  str = str.replace(/\b([a-zA-Z]{1,3})\/\s*/g, (_, code) => `${code.toUpperCase()}/ `);

  // 2. Dots (".") and Saint ("St.") handling:
  // Temporarily protect Saint short form (St., ST., St, ST, st, S.T., S.T, Saint)
  str = str.replace(/\b(?:St|ST|Saint|S\.?\s*T)\b\.?(?=[\s'’]|$)/gi, '___SAINT___');

  // Remove all other '.' characters from the club name
  str = str.replace(/\./g, '');

  // Restore Saint as exact "St."
  str = str.replace(/___SAINT___/g, 'St.');

  // Standardize apostrophes
  str = str.replace(/['’]s\b/g, "'s");
  str = str.replace(/s['’]\b/g, "s'");

  // Collapse multiple spaces
  str = str.replace(/\s+/g, ' ').trim();

  // 3. Word Title Casing:
  // Preserve "St.", district prefixes with slash like "MR/", and known acronyms
  const words = str.split(' ');
  const formattedWords = words.map(word => {
    if (word === 'St.') return 'St.';
    if (/^[A-Z]{1,3}\/$/.test(word)) return word;
    if (['KV', 'MV', 'CC', 'NS', 'MMV', 'DS', 'CWW'].includes(word.toUpperCase())) {
      return word.toUpperCase();
    }
    return toTitleCase(word);
  });
  str = formattedWords.join(' ').trim();

  // 4. City formatting:
  // If the club name has a city, place ' - ' before the city.
  // Exception: direct comma without space like ",Galle" is preserved as-is.
  const sortedCities = [...SRI_LANKAN_CITIES].sort((a, b) => b.length - a.length);
  const cityRegexPattern = sortedCities.map(c => c.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');

  const commaNoSpaceRegex = new RegExp(',(' + cityRegexPattern + ')(?:\\s+(?:0?[1-9]|1[0-5]|North|South))?$', 'i');
  if (!commaNoSpaceRegex.test(str)) {
    const cityEndRegex = new RegExp(
      '^(.+?)(?:,\\s+|\\s+-\\s+|\\s*-\\s*|\\s+)(' + cityRegexPattern + ')(\\s+(?:0?[1-9]|1[0-5]|North|South))?$',
      'i'
    );
    const match = str.match(cityEndRegex);
    if (match) {
      const prefix = match[1].trim();
      // Ensure prefix is not empty and does not end with a slash like "G/ "
      if (prefix && !prefix.endsWith('/')) {
        const canonicalCity = sortedCities.find(c => c.toLowerCase() === match[2].toLowerCase()) || match[2];
        const extraZone = match[3] ? match[3].trim() : '';
        const fullCity = extraZone ? `${canonicalCity} ${extraZone}` : canonicalCity;
        str = `${prefix} - ${fullCity}`;
      }
    }
  }

  return str;
}

/**
 * Standard Title Case helper that preserves uppercase single initials
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str.split(' ').map(token => {
    if (token.includes(',')) {
      return token.split(',').map(sub => toTitleCase(sub)).join(',');
    }
    if (token.length <= 1) return token.toUpperCase();
    // Keep acronyms like GWWD or ST or KV
    if (token === token.toUpperCase() && token.length <= 4 && !/[aeiou]/i.test(token)) {
      return token;
    }
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  }).join(' ');
}
