// ShadowSafeComponentRunner.jsx
// [translate:Безопасный рендеринг компонентов в Shadow DOM с изоляцией SES]
// Renders untrusted components with maximum security: SES + Shadow DOM

import React, { useRef, useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { useSafeComponentLoader } from '../hooks/useSafeComponentLoader';

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * ShadowSafeComponentRunner
 * 
 * Double security layer:
 * 1. SES Compartment - JavaScript execution isolation
 * 2. Shadow DOM - CSS/DOM encapsulation
 * 
 * [translate:Двойной уровень безопасности]:
 * 1. SES Compartment - [translate:изоляция выполнения JavaScript]
 * 2. Shadow DOM - [translate:инкапсуляция CSS/DOM]
 * 
 * @param {string} moduleText - Component source code
 * @param {string} moduleName - Unique module identifier
 * @param {Object} initialProps - Props to pass to component
 * @param {string} scopedCSS - Isolated styles for Shadow DOM
 */
function ShadowSafeComponentRunner({
  moduleText,
  moduleName = 'dynamic-module',
  initialProps = {},
  scopedCSS = '',
}) {
  // ----------------------------------------
  // Refs for Shadow DOM and React
  // [translate:Ссылки для Shadow DOM и React]
  // ----------------------------------------
  const hostRef = useRef(null);              // Shadow DOM host element
  const shadowRootRef = useRef(null);        // Shadow root reference
  const reactRootRef = useRef(null);         // React 18 root API
  const [shadowReady, setShadowReady] = useState(false);

  // ----------------------------------------
  // STEP 1: Prepare safe globals
  // [translate:ШАГ 1: Подготовить безопасные глобальные объекты]
  // ----------------------------------------

  /**
   * IMPORTANT: Memoize endowments to prevent infinite re-renders
   * [translate:ВАЖНО: Мемоизировать endowments чтобы предотвратить бесконечные перерисовки]
   * 
   * Without useMemo, a new object is created on every render,
   * causing useSafeComponentLoader to re-run infinitely
   */
  const endowments = useMemo(() => ({
    React: React,      // Provide React for createElement
    console: console,  // Allow logging (safe in compartment)
  }), []); // Empty dependencies = create only once

  // ----------------------------------------
  // STEP 2: Load component via SES
  // [translate:ШАГ 2: Загрузить компонент через SES]
  // ----------------------------------------

  const { component: DynamicComponent, loading, error } = useSafeComponentLoader(
    moduleText,
    moduleName,
    endowments
  );

  // ----------------------------------------
  // STEP 3: Initialize Shadow DOM
  // [translate:ШАГ 3: Инициализировать Shadow DOM]
  // ----------------------------------------

  useEffect(() => {
    if (!hostRef.current) return;

    let shadowRoot = hostRef.current.shadowRoot;

    // Protect against React 18 StrictMode double-render
    // [translate:Защита от двойного рендера в React 18 StrictMode]
    if (!shadowRoot) {
      // Create Shadow DOM with open mode (accessible via shadowRoot)
      shadowRoot = hostRef.current.attachShadow({ mode: 'open' });
      shadowRootRef.current = shadowRoot;

      // Create container for React app
      // [translate:Создать контейнер для React приложения]
      const appContainer = document.createElement('div');
      appContainer.id = 'shadow-app-root';
      shadowRoot.appendChild(appContainer);

      // Inject scoped CSS if provided
      // [translate:Внедрить изолированные стили если предоставлены]
      if (scopedCSS) {
        const styleEl = document.createElement('style');
        styleEl.textContent = scopedCSS;
        shadowRoot.appendChild(styleEl);
      }
    } else {
      // Shadow root already exists (StrictMode re-render)
      shadowRootRef.current = shadowRoot;
    }

    setShadowReady(true);

    // Cleanup: unmount React root
    return () => {
      if (reactRootRef.current) {
        reactRootRef.current.unmount();
        reactRootRef.current = null;
      }
      setShadowReady(false);
    };
  }, [scopedCSS]);

  // ----------------------------------------
  // STEP 4: Render component in Shadow DOM
  // [translate:ШАГ 4: Отрендерить компонент в Shadow DOM]
  // ----------------------------------------

  useEffect(() => {
    // Wait for all conditions
    if (!shadowReady || !DynamicComponent || !shadowRootRef.current) return;

    const appContainer = shadowRootRef.current.querySelector('#shadow-app-root');
    if (!appContainer) return;

    // Create React 18 root if not exists
    if (!reactRootRef.current) {
      reactRootRef.current = ReactDOM.createRoot(appContainer);
    }

    // Render the isolated component
    reactRootRef.current.render(
      <React.StrictMode>
        <DynamicComponent {...initialProps} />
      </React.StrictMode>
    );
  }, [shadowReady, DynamicComponent, initialProps]);

  // ----------------------------------------
  // UI: Status indicators
  // [translate:UI: Индикаторы статуса]
  // ----------------------------------------

  return (
    <div
      ref={hostRef}
      style={{
        border: '3px solid #10b981',
        borderRadius: '8px',
        padding: '16px',
        background: '#f0fdf4',
        minHeight: '150px',
        position: 'relative',
      }}
    >
      {/* Loading state */}
      {loading && (
        <div style={{ color: '#059669', fontWeight: 'bold', padding: '8px' }}>
          ⏳ [translate:Загрузка безопасного компонента из SES Compartment]...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          color: '#dc2626',
          fontWeight: 'bold',
          padding: '8px',
          background: '#fee2e2',
          borderRadius: '4px'
        }}>
          ❌ [translate:Ошибка загрузки компонента]: {error}
        </div>
      )}

      {/* Success state */}
      {!loading && !error && DynamicComponent && (
        <div style={{
          fontSize: '12px',
          color: '#059669',
          marginBottom: '8px',
          padding: '6px',
          background: '#d1fae5',
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          ✅ [translate:Компонент загружен в изолированном Shadow DOM + SES Compartment]
        </div>
      )}
    </div>
  );
}

export default ShadowSafeComponentRunner;
