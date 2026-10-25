import React from 'react';
import { Star, Download } from 'lucide-react';

interface WebFooterProps {
  onOpenInstall?: () => void;
}

const GithubIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const WebFooter: React.FC<WebFooterProps> = ({ onOpenInstall }) => {
  const currentYear = new Date().getFullYear();
  const repoUrl = 'https://github.com/ssg1113/SwissNat-SL';
  const authorUrl = 'https://github.com/ssg1113';

  return (
    <footer className="footer-simple-bar">
      <div className="footer-simple-inner">
        {/* Left: Copyright & Rights */}
        <div className="footer-simple-left">
          &copy; {currentYear} <strong className="footer-brand-name">SwissNat SL</strong>. All rights reserved.
        </div>

        {/* Right: Star on GitHub & Creator attribution */}
        <div className="footer-simple-right">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-star-pill"
            title="Star ssg1113/SwissNat-SL on GitHub"
          >
            <GithubIcon size={14} />
            <span className="footer-star-pill-label">Star</span>
            <Star size={12} className="star-icon-glow" />
          </a>

          <span className="footer-simple-creator">
            Created &amp; Developed by{' '}
            <a
              href={authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-author-link"
            >
              <strong>S S Gayashan De Silva</strong>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};
