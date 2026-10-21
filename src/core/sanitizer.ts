/**
 * SwissNat SL - Data Sanitizer & Swiss-Manager Schema Transformer
 * 
 * Cleans FIDE IDs, Ratings, Birthdays, Sex, School names, and auto-detects Google Form headers.
 */

import { cleanSchoolName } from './transliterate';
import { cleanDotsAndNormalizeSpaces, splitSriLankanName } from './nameSplitter';
import type { RawPlayerRow, NatRecord, ColumnMapping, SplitMode } from './types';

/**
 * Normalizes FIDE ID (Col 10):
 * - Formula: FIDE ID = Federation Identifier (1 to 3 digits) + Player Identifier (5 digits)
 * - Typically ranges from 6 to 8 digits (e.g. 6-digit US/early, 7-digit US 2003740, 8-digit Sri Lanka 80885780, 29986095)
 * - Also supports modern 9-digit FIDE IDs rolled out across federations starting with 575 (e.g. 575013070, 575011700)
 * - Invalid (Cleared): "No", "NO", "නැත", Sri Lankan NICs with letters (e.g. 575013070n, 981234567v) or 10-12 digit numbers (12-digit NIC)
 */
export function sanitizeFideId(val: any): { fideId: string; wasNicStripped: boolean; isInvalid: boolean } {
  if (val === undefined || val === null || val === '') {
    return { fideId: '', wasNicStripped: false, isInvalid: false };
  }
  const str = String(val).trim();
  if (!str) {
    return { fideId: '', wasNicStripped: false, isInvalid: false };
  }

  // Strip obvious "No" / "None" / Sinhala "නැත" / "-" / "0" (Clean unrated player)
  const lower = str.toLowerCase();
  if (['no', 'none', 'n/a', 'na', 'නැත', 'නැ', 'නැත.', 'illai', 'nil', '-', '0'].includes(lower)) {
    return { fideId: '', wasNicStripped: false, isInvalid: false };
  }

  // Check for Sri Lankan NIC with letter suffix (e.g. 9 digits + 'v', 'x', or 'n', like 575013070n, 981234567v)
  if (/[a-z]/i.test(str)) {
    const digitsOnly = str.replace(/\D/g, '');
    const isNicLike = digitsOnly.length >= 9 || /[vxn]$/i.test(str);
    // User instruction: DO NOT remove that data! Preserve str, flag NIC
    return { fideId: str, wasNicStripped: isNicLike, isInvalid: true };
  }

  const digits = str.replace(/\D/g, '');

  // 12-digit new Sri Lankan NIC or > 9 digits
  if (digits.length >= 10) {
    // User instruction: DO NOT remove that data! Preserve str, flag NIC
    return { fideId: str, wasNicStripped: true, isInvalid: true };
  }

  // Valid FIDE ID: 6 to 9 numeric digits
  // - 6 digits: Early registered players
  // - 7 digits: e.g. USA (20 + 03740 = 2003740)
  // - 8 digits: Traditional Sri Lankan (80885780, 29986095)
  // - 9 digits: Modern FIDE formatting system (575013070, 575011700)
  if (digits.length >= 6 && digits.length <= 9) {
    return { fideId: digits, wasNicStripped: false, isInvalid: false };
  }

  // Fewer than 6 digits or non-numeric invalid string: preserve data, flag invalid
  return { fideId: str, wasNicStripped: false, isInvalid: true };
}

/**
 * Normalizes Rating (Col 11 - Rtg_Int or Col 9 - Rtg_Nat):
 * - Extracts 4-digit rating integer (1000-3000) from strings like "1416 blitz" -> "1416"
 * - Strips "No", "NO", "නැත", etc. (unrated)
 * - Retains invalid ratings without removing them and flags as invalid
 */
export function sanitizeRating(val: any): { rating: string; isInvalid: boolean } {
  if (val === undefined || val === null || val === '') {
    return { rating: '', isInvalid: false };
  }
  const str = String(val).trim();
  if (!str) {
    return { rating: '', isInvalid: false };
  }

  const lower = str.toLowerCase();
  if (['no', 'none', 'n/a', 'na', 'නැත', 'නැ', 'unrated', '0', '-'].includes(lower)) {
    return { rating: '', isInvalid: false };
  }

  // Look for 4-digit rating number (1000 - 3000)
  const match = str.match(/\b(1[0-9]{3}|2[0-9]{3}|3000)\b/);
  if (match) {
    return { rating: match[1], isInvalid: false };
  }

  // Fallback: any 3-4 digit number (1000 - 3000)
  const num = parseInt(str.replace(/\D/g, ''), 10);
  if (!isNaN(num) && num >= 1000 && num <= 3000) {
    return { rating: String(num), isInvalid: false };
  }

  // FIDE IDs (6 to 9 numeric digits, e.g. 80885780) and Sri Lankan NICs are NEVER ratings
  const digitsOnly = str.replace(/\D/g, '');
  if (
    (digitsOnly.length >= 6 && digitsOnly.length <= 9 && !str.includes('/') && !str.includes(',')) ||
    (digitsOnly.length >= 9 && /[a-z]/i.test(str)) ||
    digitsOnly.length >= 10
  ) {
    return { rating: '', isInvalid: false };
  }

  // User Rule: DO NOT remove that data! Preserve str, flag invalid
  return { rating: str, isInvalid: true };
}

/**
 * Normalizes Birthday to YYYYMMDD (Col 8):
 * - Accepts MM/DD/YYYY (e.g. 10/14/2019 -> 20191014, 7/4/2015 -> 20150704)
 * - Accepts YYYY-MM-DD (e.g. 2017-01-19 -> 20170119)
 * - Accepts DD/MM/YYYY
 * - Auto-corrects future year typos like 8/23/2029 -> 20190823!
 * - If invalid, retains raw data and flags as invalid
 */
export function sanitizeBirthday(val: any, categoryHint?: string): { birthday: string; wasTypoFixed: boolean; isInvalid: boolean } {
  if (val === undefined || val === null || val === '') {
    return { birthday: '', wasTypoFixed: false, isInvalid: false };
  }
  let wasTypoFixed = false;
  let str = String(val).trim();
  if (!str) {
    return { birthday: '', wasTypoFixed: false, isInvalid: false };
  }

  // Strip ISO timestamp if present (e.g. 2018-11-14T00:00:00)
  if (str.includes('T')) {
    str = str.split('T')[0].trim();
  }

  // Excel serial date number check
  if (typeof val === 'number' || (/^\d{5}$/.test(str) && Number(str) > 20000 && Number(str) < 60000)) {
    const excelDate = new Date(Math.round((Number(str) - 25569) * 86400 * 1000));
    if (!isNaN(excelDate.getTime())) {
      let y = excelDate.getUTCFullYear();
      const m = String(excelDate.getUTCMonth() + 1).padStart(2, '0');
      const d = String(excelDate.getUTCDate()).padStart(2, '0');

      if (y > 2026) {
        y = y - 10;
        wasTypoFixed = true;
      }
      return { birthday: `${y}${m}${d}`, wasTypoFixed, isInvalid: false };
    }
  }

  // Replace dashes/dots with slashes for uniform splitting if needed
  const slashStr = str.replace(/[.-]/g, '/');
  const parts = slashStr.split('/');

  if (parts.length === 3) {
    let year = 0;
    let month = 0;
    let day = 0;

    if (parts[0].length === 4) {
      // YYYY/MM/DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else if (parts[2].length === 4 || parts[2].length === 2) {
      // MM/DD/YYYY or DD/MM/YYYY or 2-digit year (e.g. 11/14/18)
      year = parseInt(parts[2], 10);
      if (year < 100) {
        year += year <= 30 ? 2000 : 1900;
      }
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);

      if (p0 > 12) {
        // Must be DD/MM/YYYY
        day = p0;
        month = p1;
      } else {
        // Standard Google Forms US format: MM/DD/YYYY
        month = p0;
        day = p1;
      }
    }

    if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      // Auto-correct parent future year typo (e.g. 2029 typed instead of 2019)
      const currentYear = new Date().getFullYear();
      if (year > currentYear || (categoryHint && categoryHint.includes('06') && year > 2020)) {
        if (year === 2029) {
          year = 2019;
          wasTypoFixed = true;
        } else if (year > 2026) {
          year = year - 10;
          wasTypoFixed = true;
        }
      }

      const yStr = String(year);
      const mStr = String(month).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      return { birthday: `${yStr}${mStr}${dStr}`, wasTypoFixed, isInvalid: false };
    }
  }

  // If already YYYYMMDD
  if (/^\d{8}$/.test(str)) {
    let year = parseInt(str.substring(0, 4), 10);
    const month = parseInt(str.substring(4, 6), 10);
    const day = parseInt(str.substring(6, 8), 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      if (year > 2026) {
        year = year - 10;
        wasTypoFixed = true;
        return { birthday: `${year}${str.substring(4)}`, wasTypoFixed, isInvalid: false };
      }
      return { birthday: str, wasTypoFixed: false, isInvalid: false };
    }
  }

  // User Rule: DO NOT remove that data! Preserve raw string, flag as invalid
  return { birthday: str, wasTypoFixed: false, isInvalid: true };
}

/**
 * Normalizes Sex (Col 4):
 * - Max 1 char
 * - 'f' for female, '' (blank) for male
 */
export function sanitizeSex(genderVal: any, categoryHint?: string): string {
  const combined = `${genderVal || ''} ${categoryHint || ''}`.toLowerCase();

  if (
    combined.includes('girl') ||
    combined.includes('female') ||
    combined.includes('කාන්තා') ||
    combined.includes('ගැහැණු') ||
    genderVal === 'f' ||
    genderVal === 'F'
  ) {
    return 'f';
  }

  return '';
}

/**
 * Computes Club Number (Col 6 in Swiss-Manager NAT file) according to Age Categories:
 * Same age category must have the exact same club number.
 * 
 * Rules & Examples:
 * - Under 06 Girls --> 62
 * - Under 06 Open  --> 61
 * - Under 7 Boys   --> 71
 * - Under 11 Girls --> 112
 * - Under 11 Boys  --> 111
 * - Over 11 Open   --> 212
 */
export function getClubNumberForCategory(categoryVal: any, genderHint?: string): string {
  if (!categoryVal && !genderHint) return '';
  const raw = String(categoryVal || '').trim();
  const lower = raw.toLowerCase();
  const genderLower = String(genderHint || '').toLowerCase();

  // Determine if player/category is Girl / Female
  const isGirl =
    lower.includes('girl') ||
    lower.includes('female') ||
    lower.includes('බාලිකා') ||
    lower.includes('ගැහැණු') ||
    lower.includes('කාන්තා') ||
    /\b(g|f)\b/i.test(lower) ||
    lower.endsWith('g') ||
    genderLower === 'f' ||
    genderLower.includes('girl') ||
    genderLower.includes('female') ||
    genderLower.includes('බාලිකා');

  // 1. Check for "Over" categories (e.g. "Over 11 Open", "Over 11", "Open (Over 11)", "11 න් ඉහළ")
  const isOver = lower.includes('over') || lower.includes('ඉහළ') || lower.includes('වැඩි') || /\bo\s*\d+/i.test(lower);
  if (isOver) {
    const overMatch =
      lower.match(/(?:over|ඉහළ|වැඩි|o)[\s-_]*0?(\d+)/i) ||
      lower.match(/0?(\d+)[\s-_]*(?:over|ඉහළ|වැඩි)/i) ||
      lower.match(/\b0?(\d+)\b/);

    const age = overMatch ? parseInt(overMatch[1], 10) : 11;
    // Over categories formula: 200 + age + (isGirl ? 2 : 1)
    // E.g. "Over 11 Open" -> 200 + 11 + 1 = 212
    const genderOffset = isGirl ? 2 : 1;
    return String(200 + age + genderOffset);
  }

  // 2. Check for "Under" categories (e.g. "Under 06 Girls", "Under 7 Boys", "Under 11 Girls", "U-11")
  const underMatch =
    lower.match(/(?:under|u|අවුරුදු)[\s-_]*0?(\d+)/i) ||
    lower.match(/0?(\d+)[\s-_]*(?:under|u|න්\s*පහළ|පහළ|අඩු)/i) ||
    lower.match(/\b0?(\d+)\b/);

  if (underMatch) {
    const age = parseInt(underMatch[1], 10);
    const suffix = isGirl ? '2' : '1';
    return `${age}${suffix}`;
  }

  // Fallback if no numeric age found
  if (isGirl) return '2';
  if (lower.includes('open') || lower.includes('boy')) return '1';

  return '';
}

/**
 * Splits combined FIDE ID and International Rating from a single input string.
 * Real-world examples in Sri Lankan tournament registrations:
 * - "80885780" -> fideId: "80885780", rating: "" (Unrated player with FIDE ID)
 * - "80885780 / 1450" -> fideId: "80885780", rating: "1450"
 * - "80885780 - 1520" -> fideId: "80885780", rating: "1520"
 * - "80885780, 1450" -> fideId: "80885780", rating: "1450"
 * - "80885780 (1450)" -> fideId: "80885780", rating: "1450"
 * - "80885780 1450" -> fideId: "80885780", rating: "1450"
 * - "80885780 / 1416 blitz" -> fideId: "80885780", rating: "1416"
 * - "1450 / 80885780" -> fideId: "80885780", rating: "1450"
 * - "1450" -> fideId: "", rating: "1450"
 * - "575013070n" (NIC) -> fideId: "575013070n", rating: ""
 * - "No" / "None" / "නැත" -> fideId: "", rating: ""
 */
export function parseCombinedFideAndRating(rawVal: any): { fideId: string; rating: string } {
  if (rawVal === undefined || rawVal === null || rawVal === '') {
    return { fideId: '', rating: '' };
  }
  const str = String(rawVal).trim();
  if (!str) {
    return { fideId: '', rating: '' };
  }

  const lower = str.toLowerCase();
  if (['no', 'none', 'n/a', 'na', 'නැත', 'නැ', 'නැත.', 'illai', 'nil', '-', '0'].includes(lower)) {
    return { fideId: '', rating: '' };
  }

  // Check if it's an NIC with letter suffix (e.g. 9 digits + 'v', 'x', or 'n', like 575013070n, 981234567v)
  const isNicWithLetter = /\b[0-9]{9}[a-z]\b/i.test(str) || (str.replace(/\D/g, '').length === 9 && /[vxn]$/i.test(str.trim()));
  if (isNicWithLetter) {
    return { fideId: str, rating: '' };
  }

  // Check if it's a 12-digit NIC
  const allDigits = str.replace(/\D/g, '');
  if (
    allDigits.length >= 10 &&
    !str.includes('/') &&
    !str.includes(',') &&
    !str.includes('(') &&
    !str.includes('-') &&
    !str.includes(' ')
  ) {
    return { fideId: str, rating: '' };
  }

  // Find 6-9 digit FIDE ID (Federation Identifier + Player Identifier)
  const fideMatch = str.match(/\b([1-9][0-9]{5,8})\b/);

  // Find 3-4 digit rating (1000 - 3000)
  let ratingVal = '';
  const ratingMatches = Array.from(str.matchAll(/\b(1[0-9]{3}|2[0-9]{3}|3000)\b/g));
  for (const m of ratingMatches) {
    if (fideMatch && m[0] === fideMatch[1]) {
      continue;
    }
    ratingVal = m[1];
    break;
  }

  let fideVal = '';
  if (fideMatch) {
    fideVal = fideMatch[1];
  } else {
    // If no 6-9 digit number was found, check if the string was intended as FIDE ID/NIC
    // but only if it's not a standalone rating
    if (!ratingVal) {
      fideVal = str;
    }
  }

  return { fideId: fideVal, rating: ratingVal };
}

/**
 * Auto-detects columns from Google Form, Excel, or CSV headers
 */
export function autoDetectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    fullName: '',
    firstName: '',
    lastName: '',
    birthday: '',
    gender: '',
    category: '',
    school: '',
    fideId: '',
    rating: '',
    nationalRating: '',
    title: '',
    kFactor: '',
    clubnumber: '',
  };

  const cleanHeaders = headers.map(h => ({
    raw: h,
    normalized: h
      .toLowerCase()
      .trim()
      .replace(/['"’`]/g, '')
      .replace(/[\s_-]+/g, ' '),
  }));

  let combinedFideRatingHeader = '';

  for (const h of cleanHeaders) {
    const text = h.normalized;
    const raw = h.raw;

    // Detect combined FIDE ID & Rating header (e.g. "FIDE ID / Rating", "FIDE / Rating", "FIDE No / Rating")
    const isCombinedFideRating =
      (text.includes('fide') || text.includes('fid')) &&
      (text.includes('rating') || text.includes('rtg') || text.includes('elo') || text.includes('ශ්‍රේණිගත')) &&
      (text.includes('/') ||
        text.includes('&') ||
        text.includes('and') ||
        text.includes('or') ||
        text.includes(',') ||
        text.includes('(') ||
        text.includes('-') ||
        text.includes('id / rating') ||
        text.includes('no / rating') ||
        text.includes('fide/rating') ||
        text.includes('fide / rating'));

    if (isCombinedFideRating && !combinedFideRatingHeader) {
      combinedFideRatingHeader = raw;
    }

    // 1. Separate Last Name / Surname
    if (
      !mapping.lastName &&
      (text === 'last name' ||
        text === 'lastname' ||
        text.includes('last name') ||
        text.includes('surname') ||
        text.includes('family name') ||
        text.includes('වාසගම') ||
        text.includes('පෙළපත්'))
    ) {
      mapping.lastName = raw;
    }

    // 2. Separate First Name / Given Name / Middle Name
    if (
      !mapping.firstName &&
      (text === 'first name' ||
        text === 'firstname' ||
        text.includes('first name') ||
        text.includes('given name') ||
        text.includes('forename') ||
        text.includes('මුල් නම') ||
        text === 'initials')
    ) {
      mapping.firstName = raw;
    }

    // 3. Single Full Name column
    if (
      !mapping.fullName &&
      !text.includes('first name') &&
      !text.includes('last name') &&
      !text.includes('school') &&
      !text.includes('club') &&
      !text.includes('parent') &&
      !text.includes('father') &&
      !text.includes('mother') &&
      (text.includes('full name') ||
        text.includes('fullname') ||
        text.includes('name in full') ||
        text.includes('name with initials') ||
        text.includes('initials with name') ||
        text.includes('initials and name') ||
        text.includes('name and initials') ||
        text.includes('certificate') ||
        text.includes('player name') ||
        text.includes('players name') ||
        text.includes('student name') ||
        text.includes('students name') ||
        text.includes('child name') ||
        text.includes('childs name') ||
        text.includes('candidate name') ||
        text.includes('applicant name') ||
        text.includes('participant name') ||
        text.includes('name of') ||
        text.includes('සම්පූර්ණ නම') ||
        text.includes('තරඟකරුගේ නම') ||
        text.includes('ක්‍රීඩකයාගේ නම') ||
        text.includes('ක්‍රීඩිකාවගේ නම') ||
        text === 'name' ||
        text === 'names' ||
        text === 'නම')
    ) {
      mapping.fullName = raw;
    }

    // 4. Birthday
    if (
      !mapping.birthday &&
      (text.includes('birth') ||
        text.includes('dob') ||
        text.includes('date of birth') ||
        text.includes('bday') ||
        text.includes('උපන් දිනය') ||
        text.includes('උපන්දිනය'))
    ) {
      mapping.birthday = raw;
    }

    // 5. Gender
    if (
      !mapping.gender &&
      (text.includes('gender') ||
        text.includes('sex') ||
        text.includes('ස්ත්‍රී') ||
        text.includes('පුරුෂ') ||
        text === 'g')
    ) {
      mapping.gender = raw;
    }

    // 6. Category / Age Group
    if (
      !mapping.category &&
      (text.includes('category') ||
        text.includes('division') ||
        text.includes('age group') ||
        text.includes('age') ||
        text.includes('කාණ්ඩය'))
    ) {
      mapping.category = raw;
    }

    // 7. School / Club
    if (
      !mapping.school &&
      (text.includes('school') ||
        text.includes('club') ||
        text.includes('college') ||
        text.includes('academy') ||
        text.includes('institution') ||
        text.includes('පාසල'))
    ) {
      mapping.school = raw;
    }

    // 8. Dedicated FIDE ID (Preferred over combined header)
    if (
      !mapping.fideId &&
      !isCombinedFideRating &&
      (text.includes('fide id') ||
        text.includes('fide no') ||
        text.includes('fide_no') ||
        text.includes('fide number') ||
        text.includes('fide අංකය') ||
        text === 'fide' ||
        text === 'fide id no' ||
        text === 'fide #')
    ) {
      mapping.fideId = raw;
    }

    // 9. Dedicated Standard / International Rating (Preferred over combined header)
    if (
      !mapping.rating &&
      !isCombinedFideRating &&
      !text.includes('national') &&
      !text.includes('nat rating') &&
      !text.includes('nat rtg') &&
      !text.includes('rtg nat') &&
      !text.includes('cfsl') &&
      (text === 'rating' ||
        text === 'rtg' ||
        text === 'rtg_int' ||
        text === 'rtg int' ||
        text === 'fide rating' ||
        text === 'fide rtg' ||
        text === 'international rating' ||
        text === 'int rating' ||
        text === 'elo' ||
        text.includes('international rating') ||
        text.includes('int rating') ||
        text.includes('fide rating') ||
        text.includes('fide rtg') ||
        (text.includes('rating') && !text.includes('fide id') && !text.includes('fide no')) ||
        (text.includes('rtg') && !text.includes('fide id') && !text.includes('fide no')) ||
        text.includes('ශ්‍රේණිගත කිරීම'))
    ) {
      mapping.rating = raw;
    }

    // 10. National Rating (CFSL)
    if (
      !mapping.nationalRating &&
      (text.includes('national rating') ||
        text.includes('nat rating') ||
        text.includes('nat rtg') ||
        text.includes('rtg nat') ||
        text.includes('cfsl'))
    ) {
      mapping.nationalRating = raw;
    }

    // 11. Title
    if (!mapping.title && (text.includes('title') || text.includes('fide title'))) {
      mapping.title = raw;
    }

    // 12. K-factor
    if (!mapping.kFactor && (text === 'k' || text.includes('k-factor') || text.includes('k factor'))) {
      mapping.kFactor = raw;
    }

    // 13. Club Number
    if (
      !mapping.clubnumber &&
      (text === 'clubnumber' ||
        text === 'club number' ||
        text === 'club no' ||
        text === 'club #' ||
        text === 'club_number' ||
        text.includes('club number') ||
        text.includes('club no'))
    ) {
      mapping.clubnumber = raw;
    }
  }

  // Fallback to combined FIDE / Rating column if dedicated columns were not found
  if (!mapping.fideId && combinedFideRatingHeader) {
    mapping.fideId = combinedFideRatingHeader;
  }
  if (!mapping.rating && combinedFideRatingHeader) {
    mapping.rating = combinedFideRatingHeader;
  }

  // Fallbacks if neither fullName nor separate (firstName / lastName) were detected:
  const hasSeparate = Boolean(mapping.lastName || mapping.firstName);
  if (!mapping.fullName && !hasSeparate && headers.length > 1) {
    const candidate = headers.find(h => {
      const lower = h.toLowerCase().trim();
      return (
        !lower.includes('timestamp') &&
        !lower.includes('time') &&
        !lower.startsWith('__empty') &&
        lower !== 'id' &&
        lower !== 'no' &&
        lower !== 's.no'
      );
    }) || headers[1];
    mapping.fullName = candidate;
  }

  return mapping;
}

/**
 * Cleans a full player row into a Swiss-Manager NAT record
 */
export function sanitizePlayerRow(
  raw: RawPlayerRow,
  index: number,
  mapping: ColumnMapping,
  splitMode: SplitMode = 'surname_first'
): NatRecord {
  const flags: string[] = [];

  // Extract raw values using mapping with safe fallbacks
  const rawLastName = (mapping.lastName ? String(raw[mapping.lastName] ?? '').trim() : '') || String(raw.lastName ?? raw.LastName ?? '').trim();
  const rawFirstName = (mapping.firstName ? String(raw[mapping.firstName] ?? '').trim() : '') || String(raw.firstName ?? raw.FirstName ?? '').trim();
  const rawFullName = (mapping.fullName ? String(raw[mapping.fullName] ?? '').trim() : '') || String(raw.fullName ?? raw.rawName ?? '').trim();
  const rawBirthday = (mapping.birthday ? raw[mapping.birthday] : '') || (raw.birthday || raw.Birthday || '');
  const rawGender = (mapping.gender ? raw[mapping.gender] : '') || (raw.gender || raw.Sex || '');
  const rawCategory = (mapping.category ? raw[mapping.category] : '') || (raw.category || raw.Category || '');
  const rawSchool = (mapping.school ? raw[mapping.school] : '') || (raw.school || raw.ClubName || raw.rawSchool || '');
  let rawFideId = (mapping.fideId ? raw[mapping.fideId] : '') || (raw.fideId || raw.Fide_No || '');
  let rawRating = (mapping.rating ? raw[mapping.rating] : '') || (raw.rating || raw.Rtg_Int || '');
  const rawNatRating = (mapping.nationalRating ? raw[mapping.nationalRating] : '') || (raw.nationalRating || raw.Rtg_Nat || '');

  // Intelligent FIDE ID & Rating separation (handles Google Form combined headers like "FIDE ID / Rating")
  const isSameSource = Boolean(
    (mapping.fideId && mapping.rating && mapping.fideId === mapping.rating) ||
    (rawFideId && rawRating && String(rawFideId).trim() === String(rawRating).trim())
  );

  if (isSameSource) {
    const combined = parseCombinedFideAndRating(rawFideId || rawRating);
    rawFideId = combined.fideId;
    rawRating = combined.rating;
  } else {
    // Separate columns handling:
    const ratingStr = String(rawRating ?? '').trim();
    const fideDigits = ratingStr.replace(/\D/g, '');
    const isRatingActuallyFide = fideDigits.length >= 6 && fideDigits.length <= 9 && !ratingStr.includes('/') && !ratingStr.includes(',');

    if (isRatingActuallyFide) {
      if (!rawFideId) {
        // Player entered FIDE ID into the rating column
        rawFideId = ratingStr;
        rawRating = '';
      } else if (String(rawFideId).trim() === ratingStr) {
        // Duplicate FIDE ID in both columns
        rawRating = '';
      } else {
        // Number >= 100,000 in rating column is not a rating
        rawRating = '';
      }
    }

    // If FIDE column has both (e.g. "80885780 / 1450") and Rating column was left blank
    if (rawFideId && !rawRating && (String(rawFideId).includes('/') || String(rawFideId).includes('(') || String(rawFideId).includes(','))) {
      const combined = parseCombinedFideAndRating(rawFideId);
      rawFideId = combined.fideId;
      rawRating = combined.rating;
    }
  }

  // 1. Process Names (Separate Columns vs Single Full Name)
  let finalLastName = '';
  let finalFirstName = '';

  const hasSeparateNames = Boolean(rawLastName || rawFirstName);

  if (hasSeparateNames) {
    const cleanLast = cleanDotsAndNormalizeSpaces(rawLastName);
    const cleanFirst = cleanDotsAndNormalizeSpaces(rawFirstName);

    if (cleanLast && cleanFirst) {
      // Both columns have data -> preserve all letters without limitation
      finalLastName = cleanLast;
      finalFirstName = cleanFirst;
    } else if (cleanLast && !cleanFirst) {
      // Only Last Name has data: if multi-word, split it; otherwise keep as Last Name
      const tokens = cleanLast.split(' ').filter(Boolean);
      if (tokens.length > 1) {
        const split = splitSriLankanName(cleanLast, splitMode);
        finalLastName = split.lastName;
        finalFirstName = split.firstName;
      } else {
        finalLastName = cleanLast;
        finalFirstName = '';
      }
    } else if (!cleanLast && cleanFirst) {
      // Only First Name has data: if multi-word, split it so Last Name is NEVER empty!
      const tokens = cleanFirst.split(' ').filter(Boolean);
      if (tokens.length > 1) {
        const split = splitSriLankanName(cleanFirst, splitMode);
        finalLastName = split.lastName;
        finalFirstName = split.firstName;
      } else {
        // Single word: in Swiss-Manager, place in Last Name
        finalLastName = cleanFirst;
        finalFirstName = '';
      }
    }
  } else {
    // Single Full Name column -> preserve all letters
    const cleanedName = cleanDotsAndNormalizeSpaces(rawFullName);
    const split = splitSriLankanName(cleanedName, splitMode);
    finalLastName = split.lastName;
    finalFirstName = split.firstName;
  }

  // Final fallback safety: Last Name must NEVER be blank if First Name contains multiple words
  if (!finalLastName && finalFirstName) {
    const split = splitSriLankanName(finalFirstName, splitMode);
    finalLastName = split.lastName;
    finalFirstName = split.firstName;
  }

  // 2. Clean School Name
  const cleanedSchool = cleanSchoolName(rawSchool);

  // 3. Clean FIDE ID (Do NOT remove wrong data - preserve and flag)
  const { fideId, wasNicStripped, isInvalid: isFideInvalid } = sanitizeFideId(rawFideId);
  if (wasNicStripped) {
    flags.push('Invalid FIDE ID');
  } else if (isFideInvalid) {
    flags.push('Invalid FIDE ID');
  }

  // 4. Clean Rating (Do NOT remove wrong data - preserve and flag)
  const rtgIntRes = sanitizeRating(rawRating);
  const rtgNatRes = sanitizeRating(rawNatRating);
  if (rtgIntRes.isInvalid || rtgNatRes.isInvalid) {
    flags.push('Invalid Rating');
  }
  const rtgInt = rtgIntRes.rating;
  const rtgNat = rtgNatRes.rating;

  // 5. Clean Birthday (Do NOT remove wrong data - preserve and flag)
  const { birthday, wasTypoFixed, isInvalid: isBirthdayInvalid } = sanitizeBirthday(rawBirthday, rawCategory);
  if (wasTypoFixed) {
    flags.push('Typo Auto-Corrected');
  }
  if (isBirthdayInvalid) {
    flags.push('Invalid Birthday');
  }

  // 6. Sex
  const sex = sanitizeSex(rawGender, rawCategory);

  // 7. Club Number (auto-calculated from age category or preserved from mapping)
  const rawClubNumber = (mapping.clubnumber ? raw[mapping.clubnumber] : '') || (raw.clubnumber || raw.Clubnumber || raw.ClubNo || '');
  let clubnumber = String(rawClubNumber || '').trim();
  if (!clubnumber) {
    clubnumber = getClubNumberForCategory(rawCategory, sex);
  }

  // 8. Title
  let title = (raw[mapping.title || ''] || raw.title || raw.Title || '').toString().trim().toUpperCase();
  const validTitles = ['GM', 'IM', 'FM', 'CM', 'WGM', 'WIM', 'WFM', 'WCM'];
  if (!validTitles.includes(title)) {
    title = '';
  }

  // 9. K-factor
  let k = (raw[mapping.kFactor || ''] || raw.kFactor || raw.K || '').toString().trim();
  if (!['40', '30', '20', '10'].includes(k)) {
    k = '';
  }

  const combinedRawName = [rawLastName, rawFirstName].filter(Boolean).join(' ') || rawFullName;

  return {
    id: `player_${index + 1}`,
    ID_No: String(index + 1),
    LastName: finalLastName,
    FirstName: finalFirstName,
    Sex: sex,
    Fed: 'SRI',
    Clubnumber: clubnumber,
    ClubName: cleanedSchool,
    Birthday: birthday,
    Rtg_Nat: rtgNat,
    Fide_No: fideId,
    Rtg_Int: rtgInt,
    Title: title,
    K: k,
    Category: rawCategory,
    rawName: combinedRawName,
    rawSchool: rawSchool,
    flags,
  };
}

/**
 * Recalculates sanitization status flags when an arbiter edits a record or swaps names
 */
export function recalculateRecordFlags(r: NatRecord): string[] {
  const flags: string[] = [];

  // 1. Check FIDE ID
  if (r.Fide_No) {
    const { wasNicStripped, isInvalid } = sanitizeFideId(r.Fide_No);
    if (wasNicStripped) {
      flags.push('Invalid FIDE ID');
    } else if (isInvalid) {
      flags.push('Invalid FIDE ID');
    }
  }

  // 2. Check Birthday
  if (r.Birthday) {
    const { isInvalid } = sanitizeBirthday(r.Birthday, r.Category);
    if (isInvalid) {
      flags.push('Invalid Birthday');
    }
  }

  // 3. Check Rating
  if (r.Rtg_Int) {
    const { isInvalid } = sanitizeRating(r.Rtg_Int);
    if (isInvalid) {
      flags.push('Invalid Rating');
    }
  }
  if (r.Rtg_Nat) {
    const { isInvalid } = sanitizeRating(r.Rtg_Nat);
    if (isInvalid && !flags.includes('Invalid Rating')) {
      flags.push('Invalid Rating');
    }
  }

  // 4. Preserve existing Typo Auto-Corrected flag if date is valid
  if (r.flags.some(f => f.includes('Typo')) && !flags.includes('Invalid Birthday')) {
    flags.push('Typo Auto-Corrected');
  }

  return flags;
}

