import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Languages,
  FileCheck2,
  Zap,
  Layers,
  ShieldCheck,
  Smartphone,
  BadgeCheck,
  Lock,
  Hash,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const TRUST_POINTS = [
  'Built by a National Arbiter for Sri Lankan chess tournaments',
  'No installation or account needed',
  'Works on PC and phone, even with poor internet',
];

const FEATURE_BLOCKS: { icon: LucideIcon; color: string; title: string; body: string }[] = [
  {
    icon: FileSpreadsheet,
    color: 'var(--accent-gold)',
    title: 'Turn Messy Registrations Into a Clean NAT List',
    body:
      'Upload the Excel or CSV export from your Google Form, paste rows straight from Google Sheets, or load a shared ' +
      'sheet link. SwissNat SL detects the name, birthday, gender, school, FIDE ID, rating, category, and playing ' +
      'event columns for you, including Sinhala headers, and builds one tidy player list.',
  },
  {
    icon: Languages,
    color: 'var(--accent-emerald)',
    title: 'Sri Lankan Names, Split the Right Way',
    body:
      'Initials are cleaned without being merged ("S.S.Gayashan" becomes "S S Gayashan"), compound surnames like ' +
      '"De Silva" are recognized, and Sinhala or Tamil names and school names are converted to English. Anything ' +
      'that looks wrong can be swapped or edited in one click.',
  },
  {
    icon: FileCheck2,
    color: 'var(--accent-cyan)',
    title: 'Files That Import Into Swiss-Manager First Time',
    body:
      'Swiss-Manager is strict: exact column names and order, an 8-digit birthday, a 32-character name limit, and the ' +
      'old Excel 97-2003 format. SwissNat SL builds the .xls file in exactly that structure, so a file that looks ' +
      'right also imports correctly.',
  },
];

const STEPS = [
  'Import your registrations: upload an Excel or CSV file, paste rows, or enter a Google Sheet link.',
  'Review the players in the table and correct any rows marked for attention.',
  'Pick an age category if you need a separate file, then download the .xls (or share it from your phone).',
  'In Swiss-Manager, open Specials → Options → Rating lists → Import rating list, choose "NAT rating list", and import the file.',
];

const BENEFIT_CARDS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Zap,
    title: 'Ready in Seconds, Not Hours',
    body: 'Hundreds of registrations are cleaned at once, so you only check the few rows that need a human eye.',
  },
  {
    icon: Languages,
    title: 'Sinhala & Tamil Support',
    body: 'Player and school names in Sinhala, Tamil, or mixed English are converted to standard English text.',
  },
  {
    icon: Layers,
    title: 'Separate Files per Division',
    body: 'Download one master file, or a separate NAT file for Under-08, Under-10, Under-12, and other categories.',
  },
  {
    icon: Hash,
    title: 'Automatic Club Numbers for Every Event',
    body: 'Each division gets its own club number, and Blitz only, Rapid only, and Both events entries are kept apart (e.g. 611, 612, 613).',
  },
  {
    icon: BadgeCheck,
    title: 'Clean FIDE IDs, Ratings & Birthdays',
    body: 'NIC numbers and "No" entries are removed from FIDE IDs, ratings like "1416 blitz" become 1416, and dates become YYYYMMDD.',
  },
  {
    icon: Smartphone,
    title: 'Works on Any Device',
    body: 'Use it on a laptop or phone, install it to your home screen, and keep working at venues with weak internet.',
  },
  {
    icon: Lock,
    title: 'Your Data Stays on Your Device',
    body: 'Files are processed in your browser. Player details are not uploaded to a SwissNat SL server.',
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is SwissNat SL free to use?',
    a: 'Yes. It is free and you do not need to create an account or sign in.',
  },
  {
    q: 'Which file types can I import?',
    a: 'Excel (.xlsx and .xls) and .csv files. You can also paste rows copied from Google Sheets, or load a Google Sheet shared as "Anyone with the link can view".',
  },
  {
    q: 'How are club numbers assigned?',
    a: 'From the age category: the age, then 1 for boys/open or 2 for girls (Under 06 Boys = 61, Under 06 Girls = 62). If the player chose an event, a third digit is added: 1 for Blitz only, 2 for Rapid only, 3 for both events (Under 06 Boys - Blitz Event Only = 611). Club numbers already in your sheet are kept.',
  },
  {
    q: 'My form has a separate "Playing Event" column. Will it be used?',
    a: 'Yes. A column such as "Playing Event" or "ක්‍රීඩා කරන ඉසව්ව" is detected automatically and added to the category, for example "Under 10 Open (2016 & 2017) - Rapid Event Only". Each event then gets its own club number and can be downloaded as its own file.',
  },
  {
    q: 'Should I download .xls or .xlsx?',
    a: 'Use .xls for Swiss-Manager. It is the Excel 97-2003 format Swiss-Manager expects. The .xlsx file is only for viewing or editing in modern Excel.',
  },
  {
    q: 'My Google Sheet link does not load. What should I do?',
    a: 'Check that the sheet is shared as "Anyone with the link can view". If it still fails, open the sheet, press Ctrl+A and Ctrl+C, and paste the rows using the "Paste from Clipboard" option.',
  },
  {
    q: 'A name was split the wrong way round. How do I fix it?',
    a: 'Use the swap button on that row to switch Last Name and First Name, or swap all filtered rows at once. You can also edit any cell directly in the table.',
  },
  {
    q: 'Can I use it without internet?',
    a: 'Yes. Once the site has loaded (or is installed to your home screen), cleaning and exporting work offline. Loading a Google Sheet link still needs a connection.',
  },
  {
    q: 'Can I trust the results without checking them?',
    a: 'Please always review before exporting. Some names are ambiguous, and a valid-looking FIDE ID may not belong to that player. The tool does the heavy lifting; the arbiter has the final say.',
  },
];

interface SiteInfoSectionProps {
  onGetStarted?: () => void;
}

export const SiteInfoSection: React.FC<SiteInfoSectionProps> = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="site-info">
      {/* Intro */}
      <section className="site-info-intro">
        <h2 className="site-info-h2">Free Swiss-Manager NAT File Generator</h2>
        <p className="site-info-lead">
          SwissNat SL turns tournament registration sheets into a clean, ready-to-import NAT player list for
          Swiss-Manager, so arbiters spend less time fixing spreadsheets and more time running the tournament.
        </p>
        <ul className="site-info-trust">
          {TRUST_POINTS.map(point => (
            <li key={point}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Alternating feature blocks */}
      <section className="site-info-features">
        {FEATURE_BLOCKS.map(({ icon: Icon, color, title, body }, i) => (
          <div key={title} className={`site-info-feature${i % 2 === 1 ? ' reverse' : ''}`}>
            <div className="site-info-feature-art">
              <Icon size={64} color={color} strokeWidth={1.4} />
            </div>
            <div className="site-info-feature-text">
              <h3 className="site-info-h3">{title}</h3>
              <p>{body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* How to */}
      <section className="site-info-panel">
        <h2 className="site-info-h2">How To Create a Swiss-Manager NAT File</h2>
        <ol className="site-info-steps">
          {STEPS.map((step, i) => (
            <li key={step}>
              <span className="site-info-step-num">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Benefit cards */}
      <section>
        <h2 className="site-info-h2" style={{ textAlign: 'center' }}>Built for Tournament Day</h2>
        <div className="site-info-grid">
          {BENEFIT_CARDS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="site-info-card">
              <Icon size={22} color="var(--accent-gold)" />
              <h3 className="site-info-h3 small">{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="site-info-panel">
        <h2 className="site-info-h2">SwissNat SL FAQs</h2>
        <div>
          {FAQS.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={item.q} className="site-info-faq">
                <button type="button" onClick={() => setOpenFaq(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
                  />
                </button>
                {isOpen && <p className="animate-fade-in">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Closing banner */}
      <section className="site-info-cta">
        <ShieldCheck size={32} color="#ffffff" />
        <h2>Spend Less Time on Spreadsheets</h2>
        <p>Prepare your next tournament's player list in minutes, on any device.</p>
        {onGetStarted && (
          <button type="button" onClick={onGetStarted}>
            Start Importing <ArrowRight size={16} />
          </button>
        )}
      </section>
    </div>
  );
};
