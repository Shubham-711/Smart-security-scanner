import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SplitSquareHorizontal, AlignJustify, Copy, Check } from 'lucide-react';

/**
 * Compute a simple line‐level diff:
 * - lines only in old → removed (red)
 * - lines only in new → added (green)
 * - lines in both    → unchanged
 */
function computeLineDiff(oldCode, newCode) {
  const oldLines = (oldCode || '').split('\n');
  const newLines = (newCode || '').split('\n');
  const maxLen = Math.max(oldLines.length, newLines.length);
  const result = [];

  for (let i = 0; i < maxLen; i++) {
    const oldLine = i < oldLines.length ? oldLines[i] : null;
    const newLine = i < newLines.length ? newLines[i] : null;

    if (oldLine === newLine) {
      result.push({ type: 'unchanged', lineNum: i + 1, text: oldLine });
    } else {
      if (oldLine !== null && oldLine !== undefined) {
        result.push({ type: 'removed', lineNum: i + 1, text: oldLine });
      }
      if (newLine !== null && newLine !== undefined) {
        result.push({ type: 'added', lineNum: i + 1, text: newLine });
      }
    }
  }

  return result;
}

const DiffResult = ({ oldCode, newCode }) => {
  const [copied, setCopied] = useState(false);

  const diff = computeLineDiff(oldCode, newCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(newCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="diff-container">
      {/* Header */}
      <div className="diff-header">
        <div className="diff-labels">
          <span className="diff-dot red" />
          Vulnerable
          <span className="diff-arrow">→</span>
          <span className="diff-dot green" />
          Secure
        </div>
        <button className="code-card-copy" onClick={handleCopy} title="Copy fixed code">
          {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>

      {/* Diff body with red/green line highlights */}
      <div className="diff-body">
        <div className="diff-lines-wrapper">
          {diff.map((line, i) => {
            let bgColor = 'transparent';
            let prefix = ' ';
            let textColor = '#d4d4d8';
            let gutterColor = '#3a3d4e';

            if (line.type === 'removed') {
              bgColor = 'rgba(239, 68, 68, 0.15)';
              prefix = '−';
              textColor = '#fca5a5';
              gutterColor = '#ef4444';
            } else if (line.type === 'added') {
              bgColor = 'rgba(34, 197, 94, 0.15)';
              prefix = '+';
              textColor = '#86efac';
              gutterColor = '#22c55e';
            }

            return (
              <div
                key={i}
                className="diff-line"
                style={{ background: bgColor }}
              >
                <span className="diff-line-gutter" style={{ color: gutterColor }}>
                  {prefix}
                </span>
                <span className="diff-line-num" style={{ color: gutterColor }}>
                  {line.lineNum}
                </span>
                <span className="diff-line-text" style={{ color: textColor }}>
                  {line.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DiffResult;