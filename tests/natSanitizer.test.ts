import { describe, it, expect } from 'vitest';
import { cleanDotsAndNormalizeSpaces, splitSriLankanName } from '../src/core/nameSplitter';
import { cleanSchoolName, transliterateSinhalaTamilToEnglish } from '../src/core/transliterate';
import { sanitizeFideId, sanitizeRating, sanitizeBirthday, sanitizeSex, sanitizePlayerRow, autoDetectColumns, getClubNumberForCategory, parseCombinedFideAndRating } from '../src/core/sanitizer';
import { buildNatWorkbook } from '../src/core/natBuilder';
import { QA_VERIFICATION_MATRIX, runQAVerificationSuite } from '../src/core/sampleData';

describe('SwissNat SL - 15 QA Verification Matrix Test Cases', () => {
  // TC-01: Row 2
  it('TC-01: should clean dotted initials without spaces (K.G.Banuja Binuwara)', () => {
    const cleaned = cleanDotsAndNormalizeSpaces('K.G.Banuja Binuwara');
    expect(cleaned).toBe('K G Banuja Binuwara');
    const { lastName, firstName } = splitSriLankanName(cleaned, 'surname_first');
    expect(lastName).toBe('Binuwara');
    expect(firstName).toBe('K G Banuja');

    // Edge cases: SwA, trailing initials WAD, bracket stripping
    expect(cleanDotsAndNormalizeSpaces('SwA Banuja')).toBe('S W A Banuja');
    expect(cleanDotsAndNormalizeSpaces('Perera WAD')).toBe('Perera W A D');
    expect(cleanDotsAndNormalizeSpaces('(K.G.) Banuja Binuwara')).toBe('K G Banuja Binuwara');
  });

  // TC-02: Row 7
  it('TC-02: should translate Sinhala school name and clear "නැත" in FIDE column', () => {
    const club = cleanSchoolName('ගොඩපිටිය ජාතික පාසල');
    expect(club).toBe('Godapitiya National School');
    const { fideId } = sanitizeFideId('නැත');
    expect(fideId).toBe('');
  });

  // TC-03: Row 8
  it('TC-03: should handle dotted initials with spaces (J.P. Anidu Harshitha Sandakan)', () => {
    const cleaned = cleanDotsAndNormalizeSpaces('J.P. Anidu Harshitha Sandakan');
    expect(cleaned).toBe('J P Anidu Harshitha Sandakan');
    const { lastName, firstName } = splitSriLankanName(cleaned, 'surname_first');
    expect(lastName).toBe('Sandakan');
    expect(firstName).toBe('J P Anidu Harshitha');
  });

  // TC-04: Row 16
  it('TC-04: should parse valid 8-digit FIDE ID and MM/DD/YYYY DOB into YYYYMMDD', () => {
    const { fideId } = sanitizeFideId('80885780');
    expect(fideId).toBe('80885780');
    const { birthday } = sanitizeBirthday('10/14/2019');
    expect(birthday).toBe('20191014');
  });

  // TC-05: Row 23
  it('TC-05: should detect 9-digit NIC in FIDE ID without removing data and preserve H A D Bisakya', () => {
    const cleaned = cleanDotsAndNormalizeSpaces('H A D Bisakya');
    const { lastName, firstName } = splitSriLankanName(cleaned, 'surname_first');
    expect(lastName).toBe('Bisakya');
    expect(firstName).toBe('H A D');

    const { fideId, wasNicStripped, isInvalid } = sanitizeFideId('575013070n');
    expect(fideId).toBe('575013070n');
    expect(wasNicStripped).toBe(true);
    expect(isInvalid).toBe(true);
  });

  // TC-06: Row 24
  it('TC-06: should detect trailing initials (Odamsa K B V S) and map Girls to "f"', () => {
    const cleaned = cleanDotsAndNormalizeSpaces('Odamsa K B V S');
    const { lastName, firstName } = splitSriLankanName(cleaned, 'surname_first');
    expect(lastName).toBe('Odamsa');
    expect(firstName).toBe('K B V S');
    expect(sanitizeSex('Girls')).toBe('f');
  });

  // TC-07: Row 38
  it('TC-07: should translate MR/ Thelijjawila Central College with space after slash', () => {
    const school = cleanSchoolName('මාර/ තෙලිජ්ජවිල මධ්ය විද්යාලය');
    expect(school).toBe('MR/ Thelijjawila Central College');
  });

  // TC-08: Row 52
  it('TC-08: should separate jammed trailing initials (Karandeniya TNW)', () => {
    const cleaned = cleanDotsAndNormalizeSpaces('Karandeniya TNW');
    expect(cleaned).toBe('Karandeniya T N W');
    const { lastName, firstName } = splitSriLankanName(cleaned, 'surname_first');
    expect(lastName).toBe('Karandeniya');
    expect(firstName).toBe('T N W');
  });

  // TC-09: Row 58
  it('TC-09: should phonetically transliterate Sinhala name and initials (කේ ඩි කුලිත ගිනෙත්)', () => {
    const trans = transliterateSinhalaTamilToEnglish('කේ ඩි කුලිත ගිනෙත්');
    expect(trans).toBe('K D Kulitha Gineth');
    const { lastName, firstName } = splitSriLankanName(trans, 'surname_first');
    expect(lastName).toBe('Gineth');
    expect(firstName).toBe('K D Kulitha');
  });

  // TC-10: Row 65
  it('TC-10: should include all letters for SHENUMI VIHANSA WIMALAGUNA KODITHUWAKKU without truncation', () => {
    const cleaned = cleanDotsAndNormalizeSpaces('SHENUMI VIHANSA WIMALAGUNA KODITHUWAKKU');
    const { lastName, firstName } = splitSriLankanName(cleaned, 'surname_first');
    expect(lastName).toBe('Wimalaguna Kodithuwakku');
    expect(firstName).toBe('Shenumi Vihansa');
  });

  // TC-11: Row 72
  it('TC-11: should clear invalid school placeholder "Yes" to blank', () => {
    const school = cleanSchoolName('Yes');
    expect(school).toBe('');
  });

  // TC-12: Row 74
  it('TC-12: should extract rating integer from "1416 blitz" and keep valid FIDE ID', () => {
    expect(sanitizeRating('1416 blitz').rating).toBe('1416');
    const { fideId } = sanitizeFideId('29986095');
    expect(fideId).toBe('29986095');
  });

  // TC-13: Row 86
  it('TC-13: should preserve all letters for P D Lumini Sasanya Akeesa Rathnayake without truncation', () => {
    const cleaned = cleanDotsAndNormalizeSpaces('P D Lumini Sasanya Akeesa Rathnayake');
    const { lastName, firstName } = splitSriLankanName(cleaned, 'surname_first');
    expect(lastName).toBe('Rathnayake');
    expect(firstName).toBe('P D Lumini Sasanya Akeesa');
  });

  // TC-14: Row 92
  it('TC-14: should preserve compound surname De Silva and all initials (G W W D Dinupa Sithusahan)', () => {
    const cleaned = cleanDotsAndNormalizeSpaces('G.W.W.D Dinupa Sithusahan De Silva');
    const { lastName, firstName } = splitSriLankanName(cleaned, 'surname_first');
    expect(lastName).toBe('De Silva');
    expect(firstName).toBe('G W W D Dinupa Sithusahan');
  });

  // TC-15: Row 94
  it('TC-15: should auto-correct parent birth-year typo 2029 -> 2019', () => {
    const { birthday, wasTypoFixed } = sanitizeBirthday('8/23/2029', 'Under 06 Boys');
    expect(birthday).toBe('20190823');
    expect(wasTypoFixed).toBe(true);
  });

  // Dual Name column detection and sanitization tests (GDCA Excel format & Swiss-Manager format)
  it('should auto-detect and sanitize separate Last Name and First Name columns (GDCA Excel format)', () => {
    const gdcaHeaders = [
      '__EMPTY',
      'Last Name',
      'First Name & Middle Name',
      'Date of Birth',
      'Fide ID',
      'School / Club',
      'Gender',
      'Age Group',
    ];
    const mapping = autoDetectColumns(gdcaHeaders);
    expect(mapping.lastName).toBe('Last Name');
    expect(mapping.firstName).toBe('First Name & Middle Name');
    expect(mapping.birthday).toBe('Date of Birth');
    expect(mapping.fideId).toBe('Fide ID');
    expect(mapping.school).toBe('School / Club');

    // Row 0 from real GDCA Excel file
    const row0 = {
      __EMPTY: 1,
      'Last Name': 'De Silva',
      'First Name & Middle Name': 'D W Cheatha Dulsandu',
      'Date of Birth': '2018/09/25',
      'Fide ID': 80843824,
      'School / Club': 'G/ Dharmasoka College - Ambalangoda',
      Gender: 'Male',
      'Age Group': 'Under 07 Boys',
    };
    const sanitized0 = sanitizePlayerRow(row0, 0, mapping);
    expect(sanitized0.LastName).toBe('De Silva');
    expect(sanitized0.FirstName).toBe('D W Cheatha Dulsandu');
    expect(sanitized0.Birthday).toBe('20180925');
    expect(sanitized0.Fide_No).toBe('80843824');
    expect(sanitized0.Sex).toBe('');

    // Row 1 from real GDCA Excel file
    const row1 = {
      __EMPTY: 2,
      'Last Name': 'Rathnaweera',
      'First Name & Middle Name': 'R P Himaru Vihas',
      'Date of Birth': '2018/04/09',
      'Fide ID': 80870830,
      'School / Club': 'Buonavista College - Galle',
      Gender: 'Male',
      'Age Group': 'Under 07 Boys',
    };
    const sanitized1 = sanitizePlayerRow(row1, 1, mapping);
    expect(sanitized1.LastName).toBe('Rathnaweera');
    expect(sanitized1.FirstName).toBe('R P Himaru Vihas');
  });

  it('should auto-detect and sanitize First Name first then Last Name', () => {
    const headers = ['Timestamp', 'First Name', 'Last Name', 'Date of Birth', 'School'];
    const mapping = autoDetectColumns(headers);
    expect(mapping.firstName).toBe('First Name');
    expect(mapping.lastName).toBe('Last Name');

    const row = {
      'First Name': 'Kasun',
      'Last Name': 'Perera',
      'Date of Birth': '2015-06-10',
      School: 'Royal College',
    };
    const sanitized = sanitizePlayerRow(row, 0, mapping);
    expect(sanitized.LastName).toBe('Perera');
    expect(sanitized.FirstName).toBe('Kasun');
  });

  it('should auto-split when only First Name column exists with multi-word name so Last Name is never empty', () => {
    const headers = ['First Name', 'School'];
    const mapping = autoDetectColumns(headers);
    const row = {
      'First Name': 'K G Banuja Binuwara',
      School: 'Rahula College',
    };
    const sanitized = sanitizePlayerRow(row, 0, mapping);
    expect(sanitized.LastName).toBe('Binuwara');
    expect(sanitized.FirstName).toBe('K G Banuja');
  });

  // Full suite automated verification
  it('should pass all 15 test cases in the verification runner', () => {
    const results = runQAVerificationSuite();
    expect(results).toHaveLength(15);
    for (const res of results) {
      if (!res.passed) {
        console.error(`Failed Test ${res.testId}: expected`, res.expected, 'actual', res.actual);
      }
      expect(res.passed).toBe(true);
    }
  });

  // User-specified Club Name Formatting Specification (all 5 examples)
  describe('Club Name Formatting (Slashes, St., Dots, and City Separator)', () => {
    it('Ex 1: should add space after "/" in MR/Vijitha Central College', () => {
      expect(cleanSchoolName('MR/Vijitha Central College')).toBe('MR/ Vijitha Central College');
    });

    it('Ex 2: should place " - " before city in Mahinda Rajapaksha Vidyalaya Matara', () => {
      expect(cleanSchoolName('Mahinda Rajapaksha Vidyalaya Matara')).toBe('Mahinda Rajapaksha Vidyalaya - Matara');
    });

    it('Ex 3: should preserve comma without space in Mahinda College,Galle', () => {
      expect(cleanSchoolName('Mahinda College,Galle')).toBe('Mahinda College,Galle');
    });

    it('Ex 4: should handle G / and comma space in G / Dharmasoka College, Ambalangoda', () => {
      expect(cleanSchoolName('G / Dharmasoka College, Ambalangoda')).toBe('G/ Dharmasoka College - Ambalangoda');
    });

    it('Ex 5: should convert ST to St. and place " - " before city in ST Johns Girls\' School Panadura', () => {
      expect(cleanSchoolName("ST Johns Girls' School Panadura")).toBe("St. Johns Girls' School - Panadura");
    });

    it('should remove "." in abbreviations but preserve "St."', () => {
      expect(cleanSchoolName('D.S. Senanayake College Colombo')).toBe('DS Senanayake College - Colombo');
      expect(cleanSchoolName("St. Joseph's College Colombo")).toBe("St. Joseph's College - Colombo");
      expect(cleanSchoolName("St Thomas' College Mount Lavinia")).toBe("St. Thomas' College - Mount Lavinia");
      expect(cleanSchoolName("ST. Mary's Convent Matara.")).toBe("St. Mary's Convent - Matara");
      expect(cleanSchoolName("S.T. Johns Girls' School Panadura")).toBe("St. Johns Girls' School - Panadura");
    });

    it('should handle multiple slashes and provincial prefixes properly', () => {
      expect(cleanSchoolName('wp / kl / wadduwa central college')).toBe('WP/ KL/ Wadduwa Central College');
      expect(cleanSchoolName("King's / Queen's Chess Club")).toBe("King's/ Queen's Chess Club");
    });
  });

  // User-specified Club Number by Age Category Specification (all 6 examples + grouping)
  describe('Club Number According to Age Categories (Column 6)', () => {
    it('Ex 1: Under 06 Girls --> 62', () => {
      expect(getClubNumberForCategory('Under 06 Girls')).toBe('62');
      expect(getClubNumberForCategory('Under 6 Girls')).toBe('62');
      expect(getClubNumberForCategory('U06 Girls')).toBe('62');
    });

    it('Ex 2: Under 06 Open --> 61', () => {
      expect(getClubNumberForCategory('Under 06 Open')).toBe('61');
      expect(getClubNumberForCategory('Under 6 Open')).toBe('61');
      expect(getClubNumberForCategory('Under 06 Boys')).toBe('61');
    });

    it('Ex 3: Under 7 Boys --> 71', () => {
      expect(getClubNumberForCategory('Under 7 Boys')).toBe('71');
      expect(getClubNumberForCategory('Under 07 Boys')).toBe('71');
      expect(getClubNumberForCategory('Under 7 Open')).toBe('71');
    });

    it('Ex 4: Under 11 Girls --> 112', () => {
      expect(getClubNumberForCategory('Under 11 Girls')).toBe('112');
      expect(getClubNumberForCategory('U11 Girls')).toBe('112');
    });

    it('Ex 5: Under 11 Boys --> 111', () => {
      expect(getClubNumberForCategory('Under 11 Boys')).toBe('111');
      expect(getClubNumberForCategory('Under 11 Open')).toBe('111');
    });

    it('Ex 6: Over 11 Open --> 212', () => {
      expect(getClubNumberForCategory('Over 11 Open')).toBe('212');
      expect(getClubNumberForCategory('Over 11 Boys')).toBe('212');
      expect(getClubNumberForCategory('Open (Over 11)')).toBe('212');
    });

    it('Same age category has to be the same club number across multiple players', () => {
      const mapping = { fullName: 'Name', category: 'Category' } as any;
      const p1 = sanitizePlayerRow({ Name: 'Kavindu Silva', Category: 'Under 11 Boys' }, 0, mapping);
      const p2 = sanitizePlayerRow({ Name: 'Dineth Perera', Category: 'Under 11 Boys' }, 1, mapping);
      const p3 = sanitizePlayerRow({ Name: 'Hasini Fernando', Category: 'Under 11 Girls' }, 2, mapping);
      const p4 = sanitizePlayerRow({ Name: 'Tharushi Dias', Category: 'Under 11 Girls' }, 3, mapping);
      const p5 = sanitizePlayerRow({ Name: 'Anupa Gunawardena', Category: 'Over 11 Open' }, 4, mapping);

      // Both Under 11 Boys have 111
      expect(p1.Clubnumber).toBe('111');
      expect(p2.Clubnumber).toBe('111');
      expect(p1.Clubnumber).toBe(p2.Clubnumber);

      // Both Under 11 Girls have 112
      expect(p3.Clubnumber).toBe('112');
      expect(p4.Clubnumber).toBe('112');
      expect(p3.Clubnumber).toBe(p4.Clubnumber);

      // Over 11 Open has 212
      expect(p5.Clubnumber).toBe('212');
    });

    it('should support Sinhala category names', () => {
      expect(getClubNumberForCategory('අවුරුදු 06 න් පහළ බාලිකා')).toBe('62');
      expect(getClubNumberForCategory('අවුරුදු 06 න් පහළ විවෘත')).toBe('61');
      expect(getClubNumberForCategory('අවුරුදු 11 න් පහළ බාලක')).toBe('111');
      expect(getClubNumberForCategory('අවුරුදු 11 න් ඉහළ විවෘත')).toBe('212');
    });
  });

  // FIDE ID Validation & Normalization (6 to 9 digits: Federation Identifier + Player Identifier)
  describe('FIDE ID Validation (6 to 9 Digits Formula & 575 Rollout)', () => {
    it('should accept valid 6-digit FIDE IDs (early registration)', () => {
      const res = sanitizeFideId('203740');
      expect(res.fideId).toBe('203740');
      expect(res.wasNicStripped).toBe(false);
    });

    it('should accept valid 7-digit FIDE IDs (e.g. USA 20 + 03740)', () => {
      const res = sanitizeFideId('2003740');
      expect(res.fideId).toBe('2003740');
      expect(res.wasNicStripped).toBe(false);
    });

    it('should accept valid 8-digit FIDE IDs (Sri Lanka 808/299 prefixes)', () => {
      expect(sanitizeFideId('80885780').fideId).toBe('80885780');
      expect(sanitizeFideId('29986095').fideId).toBe('29986095');
    });

    it('should accept modern 9-digit FIDE IDs starting with 575', () => {
      const res1 = sanitizeFideId('575013070');
      expect(res1.fideId).toBe('575013070');
      expect(res1.wasNicStripped).toBe(false);

      const res2 = sanitizeFideId('575011700');
      expect(res2.fideId).toBe('575011700');
      expect(res2.wasNicStripped).toBe(false);
    });

    it('should detect Sri Lankan NIC numbers with letter suffix without removing data (e.g. 575013070n, 981234567v)', () => {
      const res1 = sanitizeFideId('575013070n');
      expect(res1.fideId).toBe('575013070n');
      expect(res1.wasNicStripped).toBe(true);
      expect(res1.isInvalid).toBe(true);

      const res2 = sanitizeFideId('981234567v');
      expect(res2.fideId).toBe('981234567v');
      expect(res2.wasNicStripped).toBe(true);
      expect(res2.isInvalid).toBe(true);
    });

    it('should detect 12-digit new Sri Lankan NIC numbers without removing data', () => {
      const res = sanitizeFideId('200512345678');
      expect(res.fideId).toBe('200512345678');
      expect(res.wasNicStripped).toBe(true);
      expect(res.isInvalid).toBe(true);
    });

    it('should clear placeholder values like "No", "None", and "නැත"', () => {
      expect(sanitizeFideId('No').fideId).toBe('');
      expect(sanitizeFideId('None').fideId).toBe('');
      expect(sanitizeFideId('නැත').fideId).toBe('');
      expect(sanitizeFideId('-').fideId).toBe('');
    });
  });

  // Google Sheet Link / Combined FIDE ID and Rating Column Import Tests
  describe('Google Sheet Import - Combined FIDE ID & Rating (Issue Fix)', () => {
    it('should parse standalone 8-digit FIDE ID from combined column without invalid rating error', () => {
      const res = parseCombinedFideAndRating('80885780');
      expect(res.fideId).toBe('80885780');
      expect(res.rating).toBe('');
    });

    it('should parse FIDE ID and rating from combined "80885780 / 1450"', () => {
      const res = parseCombinedFideAndRating('80885780 / 1450');
      expect(res.fideId).toBe('80885780');
      expect(res.rating).toBe('1450');
    });

    it('should parse FIDE ID and rating with parenthesis "80885780 (1500)"', () => {
      const res = parseCombinedFideAndRating('80885780 (1500)');
      expect(res.fideId).toBe('80885780');
      expect(res.rating).toBe('1500');
    });

    it('should parse FIDE ID and rating with dash "80885780 - 1520"', () => {
      const res = parseCombinedFideAndRating('80885780 - 1520');
      expect(res.fideId).toBe('80885780');
      expect(res.rating).toBe('1520');
    });

    it('should parse FIDE ID and rating with comma "80885780, 1450"', () => {
      const res = parseCombinedFideAndRating('80885780, 1450');
      expect(res.fideId).toBe('80885780');
      expect(res.rating).toBe('1450');
    });

    it('should parse FIDE ID and rating with blitz text "80885780 / 1416 blitz"', () => {
      const res = parseCombinedFideAndRating('80885780 / 1416 blitz');
      expect(res.fideId).toBe('80885780');
      expect(res.rating).toBe('1416');
    });

    it('should parse rating-first format "1450 / 80885780"', () => {
      const res = parseCombinedFideAndRating('1450 / 80885780');
      expect(res.fideId).toBe('80885780');
      expect(res.rating).toBe('1450');
    });

    it('should parse lone rating "1450" without putting it into FIDE ID', () => {
      const res = parseCombinedFideAndRating('1450');
      expect(res.fideId).toBe('');
      expect(res.rating).toBe('1450');
    });

    it('should detect NIC in combined column and not treat as rating', () => {
      const res = parseCombinedFideAndRating('575013070n');
      expect(res.fideId).toBe('575013070n');
      expect(res.rating).toBe('');
    });

    it('should detect 12-digit NIC in combined column and not treat as rating', () => {
      const res = parseCombinedFideAndRating('200512345678');
      expect(res.fideId).toBe('200512345678');
      expect(res.rating).toBe('');
    });

    it('should auto-detect various Google Form combined headers', () => {
      const headers1 = ['Full Name', 'Date of Birth', 'Gender', 'School', 'FIDE ID / Rating'];
      const m1 = autoDetectColumns(headers1);
      expect(m1.fideId).toBe('FIDE ID / Rating');
      expect(m1.rating).toBe('FIDE ID / Rating');

      const headers2 = ['Full Name', 'Date of Birth', 'Gender', 'School', 'FIDE / Rating'];
      const m2 = autoDetectColumns(headers2);
      expect(m2.fideId).toBe('FIDE / Rating');
      expect(m2.rating).toBe('FIDE / Rating');

      const headers3 = ['Full Name', 'Date of Birth', 'Gender', 'School', 'FIDE No / Rating'];
      const m3 = autoDetectColumns(headers3);
      expect(m3.fideId).toBe('FIDE No / Rating');
      expect(m3.rating).toBe('FIDE No / Rating');

      const headers4 = ['Full Name', 'Date of Birth', 'Gender', 'School', 'FIDE_NO / Rating'];
      const m4 = autoDetectColumns(headers4);
      expect(m4.fideId).toBe('FIDE_NO / Rating');
      expect(m4.rating).toBe('FIDE_NO / Rating');

      const headers5 = ['Full Name', 'Date of Birth', 'Gender', 'School', 'FIDE ID / Rating (if any)'];
      const m5 = autoDetectColumns(headers5);
      expect(m5.fideId).toBe('FIDE ID / Rating (if any)');
      expect(m5.rating).toBe('FIDE ID / Rating (if any)');
    });

    it('should sanitize Google Sheet player row with "FIDE ID / Rating" header and produce clean output excel', () => {
      const headers = ['Full Name', 'Date of Birth', 'Gender', 'School', 'FIDE ID / Rating'];
      const mapping = autoDetectColumns(headers);

      // Player 1: Has 8-digit FIDE ID, unrated
      const row1 = {
        'Full Name': 'Kavindu Perera',
        'Date of Birth': '2015-05-10',
        'Gender': 'Boys',
        'School': 'Royal College Colombo',
        'FIDE ID / Rating': '80885780',
      };
      const p1 = sanitizePlayerRow(row1, 0, mapping);
      expect(p1.Fide_No).toBe('80885780');
      expect(p1.Rtg_Int).toBe(''); // Rtg_Int must NOT have FIDE_NO!
      expect(p1.flags).not.toContain('Invalid Rating'); // Must NOT flag Invalid Rating!

      // Player 2: Has both FIDE ID and rating
      const row2 = {
        'Full Name': 'Dineth Silva',
        'Date of Birth': '2014-08-20',
        'Gender': 'Boys',
        'School': 'Ananda College Colombo',
        'FIDE ID / Rating': '80864325 / 1450',
      };
      const p2 = sanitizePlayerRow(row2, 1, mapping);
      expect(p2.Fide_No).toBe('80864325');
      expect(p2.Rtg_Int).toBe('1450');
      expect(p2.flags).not.toContain('Invalid Rating');

      // Player 3: Unrated and no FIDE ID
      const row3 = {
        'Full Name': 'Shenaya Fernando',
        'Date of Birth': '2016-01-15',
        'Gender': 'Girls',
        'School': 'Visakha Vidyalaya Colombo',
        'FIDE ID / Rating': 'නැත',
      };
      const p3 = sanitizePlayerRow(row3, 2, mapping);
      expect(p3.Fide_No).toBe('');
      expect(p3.Rtg_Int).toBe('');
      expect(p3.flags).toHaveLength(0);

      // Player 4: NIC entered in FIDE ID / Rating
      const row4 = {
        'Full Name': 'Sahan Gunawardena',
        'Date of Birth': '2015-11-03',
        'Gender': 'Boys',
        'School': 'Dharmasoka College Ambalangoda',
        'FIDE ID / Rating': '575013070n',
      };
      const p4 = sanitizePlayerRow(row4, 3, mapping);
      expect(p4.Fide_No).toBe('575013070n');
      expect(p4.Rtg_Int).toBe('');
      expect(p4.flags).toContain('Invalid FIDE ID');
      expect(p4.flags).not.toContain('Invalid Rating');

      // Build the actual output Excel workbook and verify exact cell contents
      const wb = buildNatWorkbook([p1, p2, p3, p4]);
      const ws = wb.Sheets['Nat'];
      // Col 10 (J) is Fide_No, Col 11 (K) is Rtg_Int
      // Row 2 is player 1 (headers are in row 1)
      expect(ws['J2']?.v).toBe('80885780'); // Fide_No
      expect(ws['K2']?.v ?? '').toBe('');   // Rtg_Int must be empty, NOT '80885780'!

      // Row 3 is player 2
      expect(ws['J3']?.v).toBe('80864325');
      expect(ws['K3']?.v).toBe('1450');

      // Row 4 is player 3
      expect(ws['J4']?.v ?? '').toBe('');
      expect(ws['K4']?.v ?? '').toBe('');

      // Row 5 is player 4
      expect(ws['J5']?.v).toBe('575013070n');
      expect(ws['K5']?.v ?? '').toBe('');
    });

    it('should handle separate columns when user enters duplicate FIDE ID in both columns', () => {
      const headers = ['Full Name', 'DOB', 'FIDE ID', 'Rating'];
      const mapping = autoDetectColumns(headers);

      const row = {
        'Full Name': 'Kavindu Perera',
        'DOB': '2015-05-10',
        'FIDE ID': '80885780',
        'Rating': '80885780', // Duplicate entry
      };
      const p = sanitizePlayerRow(row, 0, mapping);
      expect(p.Fide_No).toBe('80885780');
      expect(p.Rtg_Int).toBe('');
      expect(p.flags).not.toContain('Invalid Rating');
    });

    it('should handle when user enters FIDE ID in rating column and FIDE column is blank', () => {
      const headers = ['Full Name', 'DOB', 'FIDE ID', 'Rating'];
      const mapping = autoDetectColumns(headers);

      const row = {
        'Full Name': 'Kavindu Perera',
        'DOB': '2015-05-10',
        'FIDE ID': '',
        'Rating': '80885780',
      };
      const p = sanitizePlayerRow(row, 0, mapping);
      expect(p.Fide_No).toBe('80885780');
      expect(p.Rtg_Int).toBe('');
      expect(p.flags).not.toContain('Invalid Rating');
    });

    it('should preserve genuine invalid ratings', () => {
      // Under 1000
      expect(sanitizeRating('950').isInvalid).toBe(true);
      expect(sanitizeRating('950').rating).toBe('950');

      // Over 3000
      expect(sanitizeRating('3200').isInvalid).toBe(true);
      expect(sanitizeRating('3200').rating).toBe('3200');

      // Non-numeric text
      expect(sanitizeRating('pending').isInvalid).toBe(true);
      expect(sanitizeRating('pending').rating).toBe('pending');
    });
  });
});


