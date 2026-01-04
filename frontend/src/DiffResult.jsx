import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import './index.css'; // Ensure styling is loaded

const DiffResult = ({ oldCode, newCode }) => {
  const [isSplitView, setIsSplitView] = useState(true);

  // Custom "Cyberpunk" Theme for the Diff Viewer
  const newStyles = {
    variables: {
      dark: {
        diffViewerBackground: '#0f1014', // Matches your app bg
        diffViewerColor: '#FFF',
        addedBackground: '#003300',      // Deep Green for additions
        addedColor: '#00ff00',           // Bright Green text
        removedBackground: '#330000',    // Deep Red for deletions
        removedColor: '#ff0000',         // Bright Red text
        wordAddedBackground: '#006600',
        wordRemovedBackground: '#660000',
        addedGutterBackground: '#002200',
        removedGutterBackground: '#220000',
        gutterBackground: '#0a0a0a',
        gutterColor: '#4a4a4a',
      }
    },
    line: {
      padding: '10px 2px',
      '&:hover': {
        background: '#1a1b20',
      },
    },
  };

  return (
    <div className="diff-container" style={{ 
      marginTop: '20px', 
      background: '#0f1014', 
      borderRadius: '12px', 
      border: '1px solid #333',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      {/* 🎛️ Control Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        background: '#161b22',
        borderBottom: '1px solid #333'
      }}>
        <h3 style={{ margin: 0, color: '#e6edf3', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ height: '10px', width: '10px', background: '#ff4444', borderRadius: '50%', display: 'inline-block' }}></span>
          Vulnerable
          <span style={{ color: '#555' }}>→</span>
          <span style={{ height: '10px', width: '10px', background: '#00e676', borderRadius: '50%', display: 'inline-block' }}></span>
          Secure Fix
        </h3>

        {/* View Toggle Button */}
        <button 
          onClick={() => setIsSplitView(!isSplitView)}
          style={{
            background: '#23272e',
            color: '#fff',
            border: '1px solid #444',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.borderColor = '#007bff'}
          onMouseOut={(e) => e.target.style.borderColor = '#444'}
        >
          {isSplitView ? 'View: Split ↔' : 'View: Unified 📜'}
        </button>
      </div>

      {/* 📊 The Diff Viewer */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <ReactDiffViewer
          oldValue={oldCode}
          newValue={newCode}
          splitView={isSplitView}
          renderContent={(str) => <pre style={{ margin: 0 }}>{str}</pre>}
          useDarkTheme={true}
          styles={newStyles}
          leftTitle="🔴 Current Code"
          rightTitle="🟢 Secured Code"
        />
      </div>
    </div>
  );
};

export default DiffResult;