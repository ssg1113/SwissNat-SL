/**
 * SwissNat SL - Sri Lankan Chess Tournament Sample Data & QA Test Suite Definitions
 * 
 * Includes the 15 concrete test cases from the SwissNat SL Quality Assurance (QA) Test Plan.
 */

import type { RawPlayerRow, QATestResult } from './types';
import { sanitizePlayerRow } from './sanitizer';

// Real-world Sri Lankan tournament Google Form sample submissions covering all 15 edge cases
export const SAMPLE_GOOGLE_FORM_DATA: RawPlayerRow[] = [
  {
    // TC-01 (Row 2): Dotted initials without spaces
    fullName: 'K.G.Banuja Binuwara',
    birthday: '11/14/2018',
    gender: 'Boys',
    category: 'Under 08 Boys',
    school: 'Rahula College Matara',
    fideId: '',
    rating: '',
  },
  {
    // TC-02 (Row 7): Sinhala school name and Sinhala 'නැත' FIDE placeholder
    fullName: 'M.D. Thisath Nethmika',
    birthday: '5/12/2016',
    gender: 'Boys',
    category: 'Under 10 Boys',
    school: 'ගොඩපිටිය ජාතික පාසල',
    fideId: 'නැත',
    rating: '',
  },
  {
    // TC-03 (Row 8): Dotted initials + multiple given names + surname
    fullName: 'J.P. Anidu Harshitha Sandakan',
    birthday: '03/25/2015',
    gender: 'Boys',
    category: 'Under 10 Boys',
    school: 'Royal College Colombo',
    fideId: '',
    rating: '',
  },
  {
    // TC-04 (Row 16): Valid 8-digit FIDE ID and date format
    fullName: 'R M Chanul Senhas',
    birthday: '10/14/2019',
    gender: 'Boys',
    category: 'Under 06 Boys',
    school: 'Ananda College Colombo',
    fideId: '80885780',
    rating: '',
  },
  {
    // TC-05 (Row 23): Dotted spaced initials + 9-digit NIC number entered in FIDE ID
    fullName: 'H A D Bisakya',
    birthday: '07/04/2017',
    gender: 'Girls',
    category: 'Under 08 Girls',
    school: 'Sujatha Vidyalaya Matara',
    fideId: '575013070n',
    rating: '',
  },
  {
    // TC-06 (Row 24): Surname + Trailing initials + Girls gender mapping
    fullName: 'Odamsa K B V S',
    birthday: '09/18/2017',
    gender: 'Girls',
    category: 'Under 08 Girls',
    school: 'Southlands College Galle',
    fideId: '',
    rating: '',
  },
  {
    // TC-07 (Row 38): Sinhala school name with prefix and Central College suffix
    fullName: 'W.P. Kavindu Mihiran',
    birthday: '12/02/2015',
    gender: 'Boys',
    category: 'Under 10 Boys',
    school: 'මාර/ තෙලිජ්ජවිල මධ්ය විද්යාලය',
    fideId: '',
    rating: '',
  },
  {
    // TC-08 (Row 52): Jammed trailing uppercase initials
    fullName: 'Karandeniya TNW',
    birthday: '06/20/2014',
    gender: 'Boys',
    category: 'Under 12 Boys',
    school: 'Dharmasoka College Ambalangoda',
    fideId: '',
    rating: '',
  },
  {
    // TC-09 (Row 58): Pure Sinhala Unicode name with Sinhala initials
    fullName: 'කේ ඩි කුලිත ගිනෙත්',
    birthday: '04/15/2016',
    gender: 'Boys',
    category: 'Under 10 Boys',
    school: 'St. Aloysius College Galle',
    fideId: '',
    rating: '',
  },
  {
    // TC-10 (Row 65): Long compound surname + 32-character guardrail
    fullName: 'SHENUMI VIHANSA WIMALAGUNA KODITHUWAKKU',
    birthday: '08/11/2016',
    gender: 'Girls',
    category: 'Under 10 Girls',
    school: 'Visakha Vidyalaya Colombo',
    fideId: '',
    rating: '',
  },
  {
    // TC-11 (Row 72): Invalid placeholder "Yes" in school name
    fullName: 'G H Sasen Dewmith',
    birthday: '01/19/2017',
    gender: 'Boys',
    category: 'Under 08 Boys',
    school: 'Yes',
    fideId: '',
    rating: '',
  },
  {
    // TC-12 (Row 74): FIDE rating with text string "1416 blitz" + valid 8-digit FIDE ID
    fullName: 'K.H. Thisara Nimsara',
    birthday: '02/14/2013',
    gender: 'Boys',
    category: 'Under 12 Boys',
    school: 'Richmond College Galle',
    fideId: '29986095',
    rating: '1416 blitz',
  },
  {
    // TC-13 (Row 86): Name exceeding 32 chars: P D Lumini Sasanya Akeesa Rathnayake
    fullName: 'P D Lumini Sasanya Akeesa Rathnayake',
    birthday: '11/30/2015',
    gender: 'Girls',
    category: 'Under 10 Girls',
    school: 'Mahamaya Girls College Kandy',
    fideId: '',
    rating: '',
  },
  {
    // TC-14 (Row 92): Multi-word initials + compound surname De Silva
    fullName: 'G.W.W.D Dinupa Sithusahan De Silva',
    birthday: '07/22/2014',
    gender: 'Boys',
    category: 'Under 12 Boys',
    school: 'Nalanda College Colombo',
    fideId: '',
    rating: '',
  },
  {
    // TC-15 (Row 94): Birthday year typo by parent (typed 2029 for Under 06 boy)
    fullName: 'S A Senuth Randive',
    birthday: '8/23/2029',
    gender: 'Boys',
    category: 'Under 06 Boys',
    school: 'Mahanama College Colombo',
    fideId: '',
    rating: '',
  },
  // Additional typical entries
  {
    fullName: 'Arachchi Mudiyanselage Sehas Dewdun',
    birthday: '03/10/2019',
    gender: 'Boys',
    category: 'Under 06 Boys',
    school: 'Mr/maramba k.v.',
    fideId: 'no',
    rating: '',
  },
  {
    fullName: 'T H Theertha Jayashankha De Silva',
    birthday: '09/05/2015',
    gender: 'Boys',
    category: 'Under 10 Boys',
    school: 'G/Thellabura vijaya k. V.',
    fideId: '',
    rating: '',
  },
  {
    fullName: 'A.T.Hesandi Nethumya',
    birthday: '12/28/2018',
    gender: 'Girls',
    category: 'Under 08 Girls',
    school: 'St. Mary’s Convent Matara.',
    fideId: '575011700', // 9-digit national school index
    rating: '',
  },
  {
    fullName: 'VG. Thisandi Omalya',
    birthday: '04/18/2017',
    gender: 'Girls',
    category: 'Under 08 Girls',
    school: 'Sanghamitta Balika Vidyalaya Galle',
    fideId: '80805817',
    rating: '1240',
  },
];

// Specification Verification Matrix (Table 2 in QA Test Plan)
export interface VerificationCase {
  id: string;
  sourceRow: string;
  description: string;
  input: {
    name?: string;
    school?: string;
    fideId?: string;
    birthday?: string;
    gender?: string;
    rating?: string;
    category?: string;
  };
  expected: {
    lastName?: string;
    firstName?: string;
    clubName?: string;
    fideNo?: string;
    birthday?: string;
    sex?: string;
    rtgInt?: string;
  };
}

export const QA_VERIFICATION_MATRIX: VerificationCase[] = [
  {
    id: 'TC-01',
    sourceRow: 'Row 2',
    description: 'Dotted initials without spaces (K.G.Banuja Binuwara)',
    input: { name: 'K.G.Banuja Binuwara' },
    expected: { lastName: 'Binuwara', firstName: 'K G Banuja' },
  },
  {
    id: 'TC-02',
    sourceRow: 'Row 7',
    description: 'Sinhala school name & "නැත" in FIDE column',
    input: { school: 'ගොඩපිටිය ජාතික පාසල', fideId: 'නැත' },
    expected: { clubName: 'Godapitiya National School', fideNo: '' },
  },
  {
    id: 'TC-03',
    sourceRow: 'Row 8',
    description: 'Dotted initials with spaces (J.P. Anidu Harshitha Sandakan)',
    input: { name: 'J.P. Anidu Harshitha Sandakan' },
    expected: { lastName: 'Sandakan', firstName: 'J P Anidu Harshitha' },
  },
  {
    id: 'TC-04',
    sourceRow: 'Row 16',
    description: 'Valid 8-digit FIDE ID & Birthday MM/DD/YYYY conversion',
    input: { fideId: '80885780', birthday: '10/14/2019' },
    expected: { fideNo: '80885780', birthday: '20191014' },
  },
  {
    id: 'TC-05',
    sourceRow: 'Row 23',
    description: '9-digit NIC entered in FIDE column detected & preserved without removing data',
    input: { name: 'H A D Bisakya', fideId: '575013070n' },
    expected: { lastName: 'Bisakya', firstName: 'H A D', fideNo: '575013070n' },
  },
  {
    id: 'TC-06',
    sourceRow: 'Row 24',
    description: 'Surname + Trailing initials & Girls to "f"',
    input: { name: 'Odamsa K B V S', gender: 'Girls' },
    expected: { lastName: 'Odamsa', firstName: 'K B V S', sex: 'f' },
  },
  {
    id: 'TC-07',
    sourceRow: 'Row 38',
    description: 'Sinhala Central College translation within 35 char limit',
    input: { school: 'මාර/ තෙලිජ්ජවිල මධ්ය විද්යාලය' },
    expected: { clubName: 'MR/ Thelijjawila Central College' },
  },
  {
    id: 'TC-08',
    sourceRow: 'Row 52',
    description: 'Jammed trailing uppercase initials (Karandeniya TNW)',
    input: { name: 'Karandeniya TNW' },
    expected: { lastName: 'Karandeniya', firstName: 'T N W' },
  },
  {
    id: 'TC-09',
    sourceRow: 'Row 58',
    description: 'Pure Sinhala Unicode name with Sinhala initials transliterated',
    input: { name: 'කේ ඩි කුලිත ගිනෙත්' },
    expected: { lastName: 'Gineth', firstName: 'K D Kulitha' },
  },
  {
    id: 'TC-10',
    sourceRow: 'Row 65',
    description: 'Long compound surname with all letters included (Shenumi Vihansa)',
    input: { name: 'SHENUMI VIHANSA WIMALAGUNA KODITHUWAKKU' },
    expected: { lastName: 'Wimalaguna Kodithuwakku', firstName: 'Shenumi Vihansa' },
  },
  {
    id: 'TC-11',
    sourceRow: 'Row 72',
    description: 'Invalid school placeholder "Yes" auto-cleared to blank',
    input: { school: 'Yes' },
    expected: { clubName: '' },
  },
  {
    id: 'TC-12',
    sourceRow: 'Row 74',
    description: 'Rating integer extraction from text string "1416 blitz"',
    input: { rating: '1416 blitz', fideId: '29986095' },
    expected: { rtgInt: '1416', fideNo: '29986095' },
  },
  {
    id: 'TC-13',
    sourceRow: 'Row 86',
    description: 'Full name with all letters included without truncation',
    input: { name: 'P D Lumini Sasanya Akeesa Rathnayake' },
    expected: { lastName: 'Rathnayake', firstName: 'P D Lumini Sasanya Akeesa' },
  },
  {
    id: 'TC-14',
    sourceRow: 'Row 92',
    description: 'Full name with compound surname De Silva and all letters included',
    input: { name: 'G.W.W.D Dinupa Sithusahan De Silva' },
    expected: { lastName: 'De Silva', firstName: 'G W W D Dinupa Sithusahan' },
  },
  {
    id: 'TC-15',
    sourceRow: 'Row 94',
    description: 'Parent birth-year typo auto-correction (2029 -> 2019)',
    input: { birthday: '8/23/2029', category: 'Under 06 Boys' },
    expected: { birthday: '20190823' },
  },
];

/**
 * Runs all 15 verification matrix test cases and returns results
 */
export function runQAVerificationSuite(): QATestResult[] {
  const dummyMapping = {
    fullName: 'name',
    birthday: 'birthday',
    gender: 'gender',
    category: 'category',
    school: 'school',
    fideId: 'fideId',
    rating: 'rating',
  };

  return QA_VERIFICATION_MATRIX.map(tc => {
    const rawRow: RawPlayerRow = {
      fullName: tc.input.name || '',
      school: tc.input.school || '',
      fideId: tc.input.fideId || '',
      birthday: tc.input.birthday || '',
      gender: tc.input.gender || '',
      rating: tc.input.rating || '',
      category: tc.input.category || '',
    };

    const sanitized = sanitizePlayerRow(rawRow, 0, dummyMapping, 'surname_first');

    const actual: Record<string, string> = {};
    let passed = true;

    if (tc.expected.lastName !== undefined) {
      actual.lastName = sanitized.LastName;
      if (sanitized.LastName !== tc.expected.lastName) passed = false;
    }
    if (tc.expected.firstName !== undefined) {
      actual.firstName = sanitized.FirstName;
      if (sanitized.FirstName !== tc.expected.firstName) passed = false;
    }
    if (tc.expected.clubName !== undefined) {
      actual.clubName = sanitized.ClubName;
      if (sanitized.ClubName !== tc.expected.clubName) passed = false;
    }
    if (tc.expected.fideNo !== undefined) {
      actual.fideNo = sanitized.Fide_No;
      if (sanitized.Fide_No !== tc.expected.fideNo) passed = false;
    }
    if (tc.expected.birthday !== undefined) {
      actual.birthday = sanitized.Birthday;
      if (sanitized.Birthday !== tc.expected.birthday) passed = false;
    }
    if (tc.expected.sex !== undefined) {
      actual.sex = sanitized.Sex;
      if (sanitized.Sex !== tc.expected.sex) passed = false;
    }
    if (tc.expected.rtgInt !== undefined) {
      actual.rtgInt = sanitized.Rtg_Int;
      if (sanitized.Rtg_Int !== tc.expected.rtgInt) passed = false;
    }

    const rawRecord: Record<string, string> = {};
    for (const [k, v] of Object.entries(tc.input)) {
      if (v !== undefined) rawRecord[k] = v;
    }

    const expRecord: Record<string, string> = {};
    for (const [k, v] of Object.entries(tc.expected)) {
      if (v !== undefined) expRecord[k] = v;
    }

    return {
      testId: tc.id,
      sourceRow: tc.sourceRow,
      rawInput: rawRecord,
      expected: expRecord,
      actual,
      passed,
      notes: tc.description,
    };
  });
}
