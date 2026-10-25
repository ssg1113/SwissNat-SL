# SwissNat SL

### Smart Swiss-Manager NAT File Generator for Chess Tournaments

**SwissNat SL** is a web and mobile application project designed to help chess pairing arbiters turn inconsistent tournament registration data into a clean, Swiss-Manager-compatible **NAT player list**. It focuses on the challenges of Sri Lankan names, Sinhala and Tamil entries, school/club information, and strict legacy Excel import requirements.

> **Project status:** Under development. The features below describe the intended scope defined by the project specifications; their implementation and Swiss-Manager compatibility must be verified before being marked complete.

**Repository:** https://github.com/ssg1113/SwissNat-SL  
**Web application:** https://swissnat-sl.vercel.app/

## Why I Started This Project

As a **pairing arbiter**, I regularly work with tournament registrations collected through Google Forms and Excel sheets. Before a tournament can be paired in **Swiss-Manager**, the registration data must be cleaned and converted into the exact format expected by its national rating/player-list import.

This sounds simple, but in real tournaments it can involve hundreds of registrations and hours of repetitive spreadsheet editing—often just before the first round, when time is limited.

### Real-World Problems

1. **Names arrive in inconsistent formats.** Parents and players enter names with initials at the beginning or end, with or without dots and spaces. For example, `S. S. Gayashan De Silva`, `S.S.Gayashan De Silva`, and `De Silva S S G` cannot all be split reliably by a simple spreadsheet formula.
2. **Removing dots can accidentally merge initials and names.** A naive replacement can turn `S. S. Gayashan` into `SSGayashan`, rather than the required `S S Gayashan`. 
3. **Sri Lankan surname conventions are complex.** Compound surnames such as `De Silva`, `De Zoysa`, and `Arachchi Mudiyanselage` need special handling, and an arbiter may prefer surname-first or initials-first arrangements.
4. **Registrations contain mixed languages.** Player names and school names may be entered in Sinhala, Tamil, English, or a mixture, while the NAT import needs standardized English text.
5. **FIDE details and dates are messy.** FIDE ID fields may contain `No`, `නැත`, a national ID number, or an incorrect value; ratings may be entered as `1416 blitz`; birthdays may use different date formats.
6. **Swiss-Manager has a strict import structure.** The NAT workbook needs exact column names and order, constrained text lengths, an eight-digit birthday, and the correct legacy `.xls` format. A visually correct spreadsheet may still fail to import.
7. **Tournaments have multiple divisions and events.** Preparing separate player lists for Under-06, Under-08, Under-10, Under-12, Under-15, boys' and girls' sections takes additional manual work, and many tournaments also split each section into **Blitz only**, **Rapid only**, and **Both events** entries that need different club numbers.
8. **Work often happens away from a laptop.** Arbiters may need to process a sheet on a phone, download the file, or send it to another official through WhatsApp, Telegram, email, or Drive.
9. **Internet access can be unreliable at tournament venues.** Core file cleaning should not depend on a constant network connection.

**The goal:** Spend less time repairing spreadsheets and more time running the tournament accurately.

## 🚀 What SwissNat SL Is Designed to Do

### 📥 Registration Data Import

- Upload registration files in `.xlsx`, `.xls`, or `.csv` format.
- Import Google Form response sheets through a Google Sheets link.
- Support public CSV export links and a Google Apps Script route for restricted sheets.
- Automatically detect and map common English/Sinhala form headers, including player name, birthday, gender, school/club, FIDE ID, rating, category, and playing event (for example `Playing Event / ක්‍රීඩා කරන ඉසව්ව`).
- Accept a user-supplied **`Nat File - Last Name & First Name.xls`** template.

### 🧹 Name Cleaning and Sri Lankan Name Splitting

- Remove periods, commas, and backticks without joining initials together.
- Detect jammed initials and normalize whitespace.
- Handle initials at the start or end of a name.
- Recognize selected compound Sri Lankan surnames and family-name patterns.
- Offer **Surname-First Mode** and **Initials-First Mode**.
- Allow an arbiter to swap or manually correct names on individual rows.
- Enforce the Swiss-Manager **32-character combined name limit**.

**Examples:**

| Raw registration name | Intended cleaned form |
| --- | --- |
| `S.S.Gayashan` | `S S Gayashan` |
| `S. S. Gayashan De Silva` | `S S Gayashan De Silva` |
| `De Silva SSG` | `De Silva S S G` |
| `S.S.Gayashan De Silva` | Normalized initials with `De Silva` recognized as a compound surname |

Name splitting can be ambiguous; the **arbiter's editable review is the final authority**.

### 🌐 Sinhala and Tamil Support

- Phonetically transliterate Sinhala and Tamil player names into English.
- Standardize school and club names using a Sri Lankan translation dictionary.
- Handle mixed Sinhala/English and Tamil/English inputs.
- Normalize local placeholders such as `නැත` in fields where a number is expected.
- Let the arbiter correct transliteration or dictionary results before export.

### 🪪 Player Data Validation

- Clean FIDE IDs and reject placeholders or obviously incompatible values.
- Extract numerical ratings from free-text inputs such as `1416 blitz`.
- Normalize birthdays to **`YYYYMMDD`**.
- Normalize player gender and other mapped NAT fields.
- Apply field-length limits and flag entries that need manual review.
- Show original input beside cleaned, editable data to reduce silent data loss.

> **Important:** A syntactically valid FIDE ID is not proof that the ID belongs to the player. Ambiguous dates and identity details should be reviewed rather than silently guessed.

### 🏆 Tournament Category Filtering

- Filter registration records by age division and gender.
- Generate a **master NAT file** for all players or separate files for selected divisions.
- Support common youth divisions such as Under-06, Under-08, Under-10, Under-12, and Under-15, according to the configured registration categories.
- Separate **Blitz only**, **Rapid only**, and **Both events** entries, whether the event is written inside the category (`Under 06 Boys - Blitz Event Only`) or collected in its own column (`Playing Event`). When it is a separate column, the event is added to the category, for example `Under 10 Open (2016 & 2017) - Rapid Event Only`.

### 🔢 Automatic Club Numbers

Swiss-Manager's `Clubnumber` column is filled automatically from the category, so every player in the same division shares the same number and divisions can be paired or filtered separately:

- **Age** + **1** for boys/open or **2** for girls.
- Plus a third digit when an event is given: **1** = Blitz only, **2** = Rapid only, **3** = Both events.

| Category | Club number |
| --- | --- |
| `Under 06 Boys` | `61` |
| `Under 06 Boys - Blitz Event Only` | `611` |
| `Under 06 Boys - Rapid Event Only` | `612` |
| `Under 06 Boys - Both Events` | `613` |
| `Under 06 Girls` | `62` |
| `Under 20 Girls - Both Events` | `2023` |

Club numbers already present in the registration sheet are kept as entered, and editing a player's category or gender in the table recalculates the number.

### 📄 Swiss-Manager NAT Export

Generate a workbook compatible with the specified Swiss-Manager national player-list workflow:

- Excel **97–2003 `.xls`** export (and `.xlsx` export as specified in the SRS).
- Sheet 1: **`Nat`**, with the exact **13 columns** shown below.
- Sheet 2: **`Help`**, preserved from the supplied NAT template.
- Combined `Last Name` + `First Name`: maximum **32 characters**.
- `ClubName`: maximum **35 characters**.
- `Birthday`: eight digits in **`YYYYMMDD`** format.

| # | Required column |
| --- | --- |
| 1 | `ID_No` |
| 2 | `Last Name` |
| 3 | `First Name` |
| 4 | `Sex` |
| 5 | `Fed` |
| 6 | `Clubnumber` |
| 7 | `ClubName` |
| 8 | `Birthday` |
| 9 | `Rtg_Nat` |
| 10 | `Fide_No` |
| 11 | `Rtg_Int` |
| 12 | `Title` |
| 13 | `K` |

**Compatibility is a release requirement:** the generated `.xls` file must be tested by importing it into Swiss-Manager, not just by opening it in Excel.

### 📱 Web, Mobile, and Offline Workflow

- Responsive, touch-friendly web interface for desktop and phone.
- Installable **Progressive Web App (PWA)** experience.
- Planned Android/iOS app packaging through **React Native (Expo)**, as documented in the developer guide.
- Client-side file processing for use in tournament halls with unstable internet.
- Download generated files and share them using supported native mobile share options.
- Built-in guide on the website (below the upload tool) and in the mobile **Help** tab: feature overview, step-by-step instructions, Swiss-Manager import steps, and an FAQ.
- Optional AI-assisted processing where configured; essential cleaning must remain usable without AI or an internet connection.

## 🔄 Intended Workflow

```text
Google Form / Google Sheets / Excel / CSV
                  |
                  v
        Import and detect columns
                  |
                  v
     Clean names and player details
                  |
                  v
     Transliterate / normalize data
                  |
                  v
      Arbiter reviews and edits rows
                  |
                  v
       Filter tournament divisions
                  |
                  v
     Build exact Nat + Help workbook
                  |
                  v
       Download / share BIFF8 .xls
                  |
                  v
          Import into Swiss-Manager
```

## 🛠️ Technology and Architecture

The technical specifications define the following stack and modules:

| Area | Technology / approach |
| --- | --- |
| Web UI | React, TypeScript, Tailwind CSS |
| Web tooling | Vite |
| Mobile app | React Native / Expo |
| Offline web experience | PWA, service worker |
| Spreadsheet handling | SheetJS (`xlsx`) |
| Legacy Excel output | SheetJS BIFF8 (`bookType: 'biff8'`) |
| Automated tests | Vitest |
| Deployment | Vercel |
| Google Sheets integration | Public CSV export or Google Apps Script |
| Optional AI | OpenRouter API |

**Planned shared processing modules:**

```text
src/
  core/
    transliterate.ts    # Sinhala/Tamil transliteration and school dictionary
    nameSplitter.ts     # Initials, surnames, length checks
    natBuilder.ts       # Nat + Help workbook generation
  web/                  # Responsive web/PWA interface
  mobile/               # Expo mobile integration

tests/
  natSanitizer.test.ts  # Data-cleaning and NAT export tests
```

This is the **target structure from the developer guide**, not a claim that every folder is already present in the repository.

## 🧪 Quality and Acceptance Criteria

The project specifications call for testing that covers:

- Dotted and jammed initials.
- Leading and trailing initials.
- Compound Sri Lankan surnames.
- Sinhala/Tamil and mixed-language input.
- School-name dictionary normalization.
- Invalid or missing FIDE IDs and ratings.
- Multiple date formats.
- Combined name and club-name length limits.
- Exact NAT column names, ordering, and sheet preservation.
- BIFF8 file generation and **actual Swiss-Manager import**.
- Age/gender division exports.
- Event-based club numbers (Blitz only / Rapid only / Both events), including a separate `Playing Event` column.
- Mobile upload, download, and sharing.
- Offline operation and large registration sheets.

The SRS targets processing **200+ rows in under 500 ms** on the client side. This is a performance target, **not a benchmark result**.

## 🎯 Who This Project Is For

- Chess pairing arbiters and tournament arbiters.
- Chess tournament organizers and registration teams.
- Sri Lankan chess clubs, schools, and district associations.
- Anyone preparing Swiss-Manager NAT player-list imports from registration spreadsheets.

## 🤝 Contributing

Suggestions, bug reports, and test cases are welcome, particularly anonymized examples of difficult Sri Lankan name formats and Swiss-Manager import issues.

Please **do not post real players' private registration details, dates of birth, identity numbers, or children's personal data** in public GitHub issues.

## 👨‍💻 Project Background

Created by **S S Gayashan De Silva**, IT Undergraduate, Chess arbiter to address repetitive data-cleaning problems encountered while preparing Sri Lankan chess tournaments.

---

**SwissNat SL - From messy tournament registrations to cleaner, faster Swiss-Manager preparation.** ♟️
