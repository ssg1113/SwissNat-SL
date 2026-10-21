/**
 * SwissNat SL - Type Definitions
 * Targeting Swiss-Manager National Rating / Player List Import (RatingNat.DAT)
 */

export interface RawPlayerRow {
  id?: string;
  timestamp?: string;
  fullName?: string;
  birthday?: string;
  gender?: string;
  category?: string;
  school?: string;
  fideId?: string;
  rating?: string;
  title?: string;
  kFactor?: string;
  [key: string]: any;
}

export type SplitMode = 'surname_first' | 'initials_first';

export interface NatRecord {
  id: string; // Internal unique id
  ID_No: string; // Col 1: Max 10 chars (Sequential integer 1, 2, 3... or national ID)
  LastName: string; // Col 2: Full Last Name (all letters included)
  FirstName: string; // Col 3: Full First Name (all letters included)
  Sex: string; // Col 4: 'f' for female, blank for male
  Fed: string; // Col 5: Default 'SRI'
  Clubnumber: string; // Col 6: Club Number
  ClubName: string; // Col 7: Full School / Club Name (all letters included)
  Birthday: string; // Col 8: YYYYMMDD
  Rtg_Nat: string; // Col 9: National Rating
  Fide_No: string; // Col 10: FIDE ID
  Rtg_Int: string; // Col 11: International Rating
  Title: string; // Col 12: GM, IM, FM, CM, WGM, WIM, WFM, WCM
  K: string; // Col 13: 40, 30, 20, 10
  Category: string; // Extra field for division filtering (e.g. Under 08 Boys)
  rawName: string; // Original raw name for arbiter transparency
  rawSchool: string; // Original school
  flags: string[]; // Sanitization audit notes (e.g. 'Transliterated', 'NIC Rejected')
}

export interface ColumnMapping {
  fullName: string;
  firstName?: string;
  lastName?: string;
  birthday: string;
  gender: string;
  category: string;
  school: string;
  fideId: string;
  rating: string;
  nationalRating?: string;
  title?: string;
  kFactor?: string;
  clubnumber?: string;
}

export interface QATestResult {
  testId: string;
  sourceRow: string;
  rawInput: Record<string, string>;
  expected: Record<string, string>;
  actual: Record<string, string>;
  passed: boolean;
  notes?: string;
}
