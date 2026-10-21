/**
 * SwissNat SL - Sri Lankan Name Sanitization, Initials Normalization & Name Splitting Engine
 * 
 * Implements:
 * 1. Dot Removal & Initials Spacing (K.G.Banuja -> K G Banuja, SwA -> S W A)
 * 2. Multi-Word Sri Lankan Compound Surname Recognition (De Silva, Wimalaguna Kodithuwakku, etc.)
 * 3. Configurable Splitting Modes: Surname-First (Default FIDE & CFSL) vs Initials-First
 * 4. 32-Character Swiss-Manager Combined Length Guardrail
 */

import { transliterateSinhalaTamilToEnglish, toTitleCase } from './transliterate';
import type { SplitMode } from './types';

// Recognized Sri Lankan compound surnames (ordered by length descending to match longest first)
export const COMPOUND_SURNAMES: string[] = [
  'Hetti Arachchige Don',
  'Arachchi Mudiyanselage',
  'Wimalaguna Kodithuwakku',
  'Ranepura Hewage',
  'Pituwala Liyanage',
  'Horawala Withana',
  'Hetti Arachchige',
  'Korale Arachchige',
  'Korale Arachchi',
  'Loku Kumarage',
  'Wije Wantha',
  'Abey Rathna',
  'De Zoysa',
  'De Silva',
  'De Alwis',
  'De Saram',
  'Da Silva',
  'Van Eyck',
  'Von Neumann',
];

// Prefixes that indicate compound surnames (like De, Da, Van, etc.)
const SURNAME_PREFIXES = ['de', 'da', 'van', 'von', 'del', 'dos', 'di'];

/**
 * Step 1: Clean dots, commas, backticks, split jammed initials, and normalize spaces
 */
export function cleanDotsAndNormalizeSpaces(rawName: string): string {
  if (!rawName) return '';

  // 1. If contains Sinhala/Tamil, transliterate first
  let name = transliterateSinhalaTamilToEnglish(rawName);

  // 2. Replace periods, commas, backticks, slashes, underscores, brackets, and quotes with spaces
  name = name.replace(/[.,`\/_\\:;()[\]"'{}]/g, ' ');

  // 3. Handle lowercase letters between uppercase initials like "SwA" -> "S W A"
  name = name.replace(/\b([A-Z])([a-z])([A-Z])\b/g, '$1 $2 $3');

  // 4. Trailing grouped 2-4 uppercase initials (e.g. "Perera WAD" -> "Perera W A D")
  name = name.replace(/([a-z]{2,})\s+([A-Z]{2,4})$/g, (_match, word, initials) => {
    return word + ' ' + initials.split('').join(' ');
  });

  // 5. Separate jammed capital initials attached to words:
  // e.g. "KGBanuja" -> "K G Banuja"
  name = name.replace(/\b([A-Z]{2,})([A-Z][a-z]+)/g, (_match, initials, word) => {
    return initials.split('').join(' ') + ' ' + word;
  });

  // Also single uppercase letter attached to capitalized word: "JAnidu" -> "J Anidu"
  name = name.replace(/\b([A-Z])([A-Z][a-z]{2,})/g, '$1 $2');

  // Trailing or standalone jammed initials without vowels (e.g. "TNW" in "Karandeniya TNW", "KBVS" -> "K B V S")
  name = name.replace(/\b([BCDFGHJKLMNPQRSTVWXYZ]{2,4})\b/g, (match) => {
    return match.split('').join(' ');
  });

  // 6. Collapse multiple spaces and trim
  name = name.replace(/\s+/g, ' ').trim();

  // 7. Convert to Title Case while keeping single initials uppercase
  return toTitleCase(name);
}

/**
 * Step 2: Detect if the name ends with trailing initials (e.g. "Odamsa K B V S" or "Karandeniya T N W")
 */
function isTrailingInitialsPattern(tokens: string[]): boolean {
  if (tokens.length < 2) return false;
  // If the last token is a single uppercase letter, check how many trailing single letters there are
  let trailingInitialsCount = 0;
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].length === 1 && /^[A-Z]$/i.test(tokens[i])) {
      trailingInitialsCount++;
    } else {
      break;
    }
  }
  // If there are 1 or more trailing single initials and at least one preceding full word
  return trailingInitialsCount >= 1 && tokens.length > trailingInitialsCount;
}

/**
 * Step 3: Match compound surname at end or start of tokens
 */
function findCompoundSurname(tokens: string[]): {
  found: boolean;
  position: 'end' | 'start' | null;
  surname: string;
  remainingTokens: string[];
} {
  for (const compound of COMPOUND_SURNAMES) {
    const compoundWords = compound.split(' ');
    const compoundLen = compoundWords.length;

    // Check if ends with compound surname (case-insensitive)
    if (tokens.length >= compoundLen) {
      const endSlice = tokens.slice(-compoundLen).join(' ');
      if (endSlice.toLowerCase() === compound.toLowerCase()) {
        return {
          found: true,
          position: 'end',
          surname: compound,
          remainingTokens: tokens.slice(0, -compoundLen),
        };
      }
    }

    // Check if starts with compound surname (e.g. "Arachchi Mudiyanselage Sehas Dewdun")
    if (tokens.length > compoundLen) {
      const startSlice = tokens.slice(0, compoundLen).join(' ');
      if (startSlice.toLowerCase() === compound.toLowerCase()) {
        return {
          found: true,
          position: 'start',
          surname: compound,
          remainingTokens: tokens.slice(compoundLen),
        };
      }
    }
  }

  // Check generic "De <Word>" or "Da <Word>" at end
  if (tokens.length >= 2) {
    const secondToLast = tokens[tokens.length - 2].toLowerCase();
    if (SURNAME_PREFIXES.includes(secondToLast)) {
      const surname = tokens.slice(-2).map(toTitleCase).join(' ');
      return {
        found: true,
        position: 'end',
        surname,
        remainingTokens: tokens.slice(0, -2),
      };
    }
  }

  return { found: false, position: null, surname: '', remainingTokens: tokens };
}

/**
 * Step 4: Split Sri Lankan Name into Last Name & First Name
 */
export function splitSriLankanName(
  cleanedName: string,
  mode: SplitMode = 'surname_first'
): { lastName: string; firstName: string; wasCompacted: boolean } {
  if (!cleanedName) {
    return { lastName: '', firstName: '', wasCompacted: false };
  }

  const tokens = cleanedName.split(' ').filter(Boolean);
  if (tokens.length === 1) {
    return { lastName: tokens[0], firstName: '', wasCompacted: false };
  }

  let rawLastName = '';
  let rawFirstName = '';

  // Check 1: Trailing initials pattern (e.g. "Odamsa K B V S", "Karandeniya T N W")
  if (isTrailingInitialsPattern(tokens)) {
    // Find index where initials begin
    let initialsStartIndex = tokens.length;
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i].length === 1 && /^[A-Z]$/i.test(tokens[i])) {
        initialsStartIndex = i;
      } else {
        break;
      }
    }
    const surnameTokens = tokens.slice(0, initialsStartIndex);
    const initialsTokens = tokens.slice(initialsStartIndex);

    rawLastName = surnameTokens.join(' ');
    rawFirstName = initialsTokens.join(' ');
  } else {
    // Check 2: Compound surname match (e.g. "De Silva", "Arachchi Mudiyanselage", "Wimalaguna Kodithuwakku")
    const compound = findCompoundSurname(tokens);

    if (compound.found) {
      if (compound.position === 'end') {
        rawLastName = compound.surname;
        rawFirstName = compound.remainingTokens.join(' ');
      } else {
        // Starts with compound surname (e.g. "Arachchi Mudiyanselage Sehas Dewdun")
        if (mode === 'surname_first') {
          rawLastName = compound.surname;
          rawFirstName = compound.remainingTokens.join(' ');
        } else {
          // Initials first or given first
          rawLastName = compound.remainingTokens[compound.remainingTokens.length - 1] || compound.surname;
          rawFirstName = compound.surname + ' ' + compound.remainingTokens.slice(0, -1).join(' ');
        }
      }
    } else {
      // Standard Sri Lankan Name (e.g. "K G Banuja Binuwara", "J P Anidu Harshitha Sandakan")
      if (mode === 'surname_first') {
        // Default FIDE & CFSL: Last word is Last Name (Surname), rest is First Name
        rawLastName = tokens[tokens.length - 1];
        rawFirstName = tokens.slice(0, -1).join(' ');
      } else {
        // Initials-first mode:
        // E.g. "K G / Banuja Binuwara" or "Binuwara / K G Banuja"
        // If leading tokens are initials, use them as first part
        const leadingInitials: string[] = [];
        let i = 0;
        while (i < tokens.length - 1 && tokens[i].length === 1) {
          leadingInitials.push(tokens[i]);
          i++;
        }
        if (leadingInitials.length > 0) {
          rawLastName = leadingInitials.join(' ');
          rawFirstName = tokens.slice(i).join(' ');
        } else {
          rawLastName = tokens[tokens.length - 1];
          rawFirstName = tokens.slice(0, -1).join(' ');
        }
      }
    }
  }

  // Preserve full names with all letters included (no character count limitation)
  return {
    lastName: rawLastName.trim(),
    firstName: rawFirstName.trim(),
    wasCompacted: false,
  };
}

/**
 * Returns full names with all letters included (no character count limitation)
 */
export function applySwissManagerLengthGuardrail(
  lastName: string,
  firstName: string
): { lastName: string; firstName: string; wasCompacted: boolean } {
  return {
    lastName: (lastName || '').trim(),
    firstName: (firstName || '').trim(),
    wasCompacted: false,
  };
}
