// App.js
// Example usage of ShadowSafeComponentRunner with SES-isolated component
// Пример использования ShadowSafeComponentRunner с SES-изолированным компонентом

import React, { useState } from 'react';
import ShadowSafeComponentRunner from './components/ShadowSafeComponentRunner';
import { EXAMPLE_MODULE_TEXT } from './hooks/useSafeComponentLoader';

// Scoped CSS for Shadow DOM (won't affect parent app styles)
// Локальные CSS для Shadow DOM (не повлияют на стили родительского приложения)
const SHADOW_DOM_CSS = `
  .dynamic-widget {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .dynamic-widget h4 {
    font-size: 24px;
    margin: 0 0 16px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .dynamic-widget p {
    font-size: 14px;
    margin: 0 0 16px 0;
    opacity: 0.95;
  }

  .dynamic-widget button {
    background: white;
    color: #667eea;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .dynamic-widget button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .dynamic-widget button:active {
    transform: translateY(0);
  }
`;

function App() {
  const [data, setData] = useState({ count: 42, timestamp: new Date().toISOString() });
  return (
    <div style={{
      maxWidth: '900px',
      margin: '40px auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '8px' }}>
          🔒 SES + Shadow DOM + React Demo
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Secure, isolated component loading with Compartment API and Shadow DOM encapsulation
        </p>
      </header>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#374151', fontSize: '20px', marginBottom: '16px' }}>
          📦 Isolated Dynamic Widget
        </h2>
        <div>
          <button onClick={() => setData({ count: data.count + 1, timestamp: new Date().toISOString() })}>Изменяем пропсы</button>
        </div>
        <ShadowSafeComponentRunner
          moduleText={EXAMPLE_MODULE_TEXT}
          moduleName="dynamic-widget"
          initialProps={{
            title: 'Secure Dynamic Widget',
            data,
          }}
          scopedCSS={SHADOW_DOM_CSS}
        />
      </section>

      <section style={{
        background: '#f9fafb',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ color: '#374151', fontSize: '18px', marginBottom: '12px' }}>
          🛠️ How to Test:
        </h3>
        <ol style={{ color: '#4b5563', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Open Browser DevTools (F12)</li>
          <li>
            Inspect the green bordered element → Find <code>#shadow-root (open)</code>
          </li>
          <li>Observe isolated DOM structure and scoped styles (gradient, shadows)</li>
          <li>Click the button → Check console for safe log output</li>
          <li>
            Try <code>window.alert()</code> in the module text → Will be blocked by SES
          </li>
        </ol>

        <h3 style={{ color: '#374151', fontSize: '18px', margin: '20px 0 12px' }}>
          🚀 Next Steps:
        </h3>
        <ul style={{ color: '#4b5563', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Replace <code>EXAMPLE_MODULE_TEXT</code> with <code>fetch()</code> from server/CDN</li>
          <li>Add module caching (IndexedDB or memory)</li>
          <li>Implement plugin versioning and signature verification</li>
          <li>Use <code>sourceMapHook</code> for production debugging</li>
          <li>Integrate with collaborative editors (Yjs, Automerge) or WASM modules</li>
        </ul>

        <h3 style={{ color: '#374151', fontSize: '18px', margin: '20px 0 12px' }}>
          ⚠️ Known Limitations:
        </h3>
        <ul style={{ color: '#4b5563', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>
            <strong>SSR:</strong> Shadow DOM requires browser; not compatible with server-side rendering
          </li>
          <li>
            <strong>Browser Support:</strong> Requires modern browsers (Chrome 53+, Firefox 63+, Safari 10+)
          </li>
          <li>
            <strong>SES Performance:</strong> Module transformation adds overhead; cache compiled modules
          </li>
          <li>
            <strong>Debugging:</strong> Add <code>sourceMapHook</code> to map transformed code to original
          </li>
        </ul>
      </section>

      <footer style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '14px'
      }}>
        Built with React 18, SES, @endo/module-source, and Shadow DOM<br />
        For collaborative editors, AI integrations, and secure plugin systems
      </footer>
    </div>
  );
}

export default App;
