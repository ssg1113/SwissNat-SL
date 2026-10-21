import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, BookOpen, ShieldCheck, HelpCircle } from 'lucide-react';
import { runQAVerificationSuite } from '../core/sampleData';
import type { QATestResult } from '../core/types';

export const QAVerificationTab: React.FC = () => {
  const [testResults, setTestResults] = useState<QATestResult[]>(() => runQAVerificationSuite());

  const handleRunTests = () => {
    const results = runQAVerificationSuite();
    setTestResults(results);
  };

  const passedCount = testResults.filter(t => t.passed).length;
  const totalCount = testResults.length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px', width: '100%' }}>
      {/* Test Suite Summary Banner */}
      <div className="glass-panel" style={{
        padding: 24,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: passedCount === totalCount ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: passedCount === totalCount ? 'var(--accent-emerald-dark)' : 'var(--accent-rose-dark)',
          }}>
            {passedCount === totalCount ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                15-Case SwissNat SL Verification Matrix
              </h2>
              <span className={`badge ${passedCount === totalCount ? 'badge-emerald' : 'badge-rose'}`}>
                {passedCount}/{totalCount} Passed
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Validates real Sri Lankan tournament registration edge cases from National Youth &amp; Open championships.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunTests}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
          }}
        >
          <Play size={15} fill="#ffffff" />
          Re-Run Verification Suite
        </button>
      </div>

      {/* Verification Matrix Table */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} color="var(--accent-gold)" />
          Quality Assurance (QA) Verification Table
        </h3>

        <div className="nat-table-container">
          <table className="nat-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Test ID</th>
                <th style={{ width: 90 }}>Source Row</th>
                <th>Raw Google Form Input</th>
                <th>Expected NAT Output</th>
                <th>Actual Sanitized Output</th>
                <th style={{ width: 95, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map(tc => (
                <tr key={tc.testId}>
                  <td style={{ fontWeight: 800, color: 'var(--accent-gold-dark)' }}>{tc.testId}</td>
                  <td style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{tc.sourceRow}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {Object.entries(tc.rawInput).map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: 'var(--text-dim)' }}>{k}: </span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                    {Object.entries(tc.expected).map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: 'var(--text-dim)' }}>{k}: </span>
                        <span>{v || '(blank)'}</span>
                      </div>
                    ))}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: tc.passed ? 'var(--accent-emerald-dark)' : 'var(--accent-rose-dark)' }}>
                    {Object.entries(tc.actual).map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: 'var(--text-dim)' }}>{k}: </span>
                        <span style={{ fontWeight: 700 }}>{v || '(blank)'}</span>
                      </div>
                    ))}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {tc.passed ? (
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      <span className="badge badge-rose">
                        <XCircle size={12} /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Swiss-Manager Import Guide */}
      <div className="glass-panel" style={{ padding: 26 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={20} color="var(--accent-cyan)" />
          Pairing Arbiter Operations Manual: Importing NAT File into Swiss-Manager
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          <div style={{ background: 'var(--bg-secondary)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--accent-gold-dark)', fontWeight: 700 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-gold)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>1</span>
              Open Rating Lists
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              On your Swiss-Manager laptop, open your tournament file and click:
              <br />
              <strong style={{ color: 'var(--text-main)' }}>Specials</strong> → <strong style={{ color: 'var(--text-main)' }}>Options...</strong> → Tab: <strong style={{ color: 'var(--text-main)' }}>Rating lists</strong>
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--accent-cyan-dark)', fontWeight: 700 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-cyan)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>2</span>
              Select NAT Rating List
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Click <strong style={{ color: 'var(--text-main)' }}>Import rating list</strong> button. Select <strong style={{ color: 'var(--text-main)' }}>NAT rating list</strong> radio button, then browse and choose the downloaded <strong style={{ color: 'var(--text-main)' }}>.xls</strong> file.
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--accent-emerald-dark)', fontWeight: 700 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-emerald)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>3</span>
              Generate RatingNat.DAT
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Click <strong style={{ color: 'var(--text-main)' }}>Start import</strong>. Swiss-Manager will compile the players into <strong style={{ color: 'var(--text-main)' }}>RatingNat.DAT</strong>. Verify that the imported player count matches your registration count!
            </p>
          </div>
        </div>

        {/* Arbiter Rulebook Summary */}
        <div style={{
          marginTop: 20,
          background: 'var(--accent-gold-light)',
          border: '1px solid var(--accent-gold-border)',
          borderRadius: 'var(--radius-md)',
          padding: 18,
          fontSize: 12,
          lineHeight: 1.6,
          color: 'var(--text-main)',
        }}>
          <div style={{ fontWeight: 800, color: 'var(--accent-gold-dark)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <HelpCircle size={16} />
            Key Swiss-Manager &amp; Sri Lankan Chess Federation (CFSL) Conventions Enforced:
          </div>
          <ul style={{ paddingLeft: 20, color: 'var(--text-muted)' }}>
            <li><strong style={{ color: 'var(--text-main)' }}>32-Character Constraint:</strong> Swiss-Manager strictly truncates names where <code>Last Name + First Name &gt; 32 characters</code>. SwissNat SL automatically compacts initials spaces and shortens middle names to ensure no player's primary identity is truncated.</li>
            <li><strong style={{ color: 'var(--text-main)' }}>No Dots in Initials:</strong> Parents often enter dots (e.g. <code>K.G.Banuja</code>). SwissNat SL separates jammed uppercase letters so no dot enters Swiss-Manager.</li>
            <li><strong style={{ color: 'var(--text-main)' }}>Compound Sri Lankan Surnames:</strong> Automatically recognizes surnames like <code>De Silva</code>, <code>De Zoysa</code>, <code>Wimalaguna Kodithuwakku</code>, <code>Arachchi Mudiyanselage</code>.</li>
            <li><strong style={{ color: 'var(--text-main)' }}>FIDE ID &amp; Rating Filtering:</strong> Sri Lankan NICs (9-12 digits) entered by parents are rejected from the 8-digit FIDE column, and text like <code>"1416 blitz"</code> is stripped to <code>1416</code>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
