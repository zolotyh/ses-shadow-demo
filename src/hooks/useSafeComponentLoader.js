// useSafeComponentLoader.js
// [translate:Безопасная загрузка динамических React компонентов]
// Loads untrusted React components in isolated SES environment

import { useState, useEffect } from 'react';
import 'ses';
import { ModuleSource } from '@endo/module-source';

// ============================================
// SES INITIALIZATION
// ============================================

/**
 * Initialize SES lockdown to create secure JavaScript environment
 * [translate:Инициализировать SES lockdown для создания безопасного JavaScript окружения]
 * 
 * This hardens all JavaScript intrinsics and blocks dangerous features like eval()
 */
if (typeof lockdown === 'function') {
  window.lockdown({
    errorTaming: 'unsafe',      // Show full error stacks (helpful for debugging)
    stackFiltering: 'verbose',  // Include all stack frames
    consoleTaming: 'unsafe',    // Allow console.log in compartment
  });
}

// ============================================
// MAIN HOOK
// ============================================

/**
 * Load and execute a dynamic React component in isolated environment
 * [translate:Загрузить и выполнить динамический React компонент в изолированной среде]
 * 
 * @param {string} moduleText - JavaScript code as string
 * @param {string} moduleName - Unique identifier for the module
 * @param {Object} endowments - Safe globals to inject (like React)
 * @returns {Object} { component, loading, error }
 */
export function useSafeComponentLoader(
  moduleText,
  moduleName = 'dynamic-module',
  endowments = {}
) {
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let compartment = null;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        // ----------------------------------------
        // STEP 1: Create isolated compartment
        // [translate:ШАГ 1: Создать изолированный compartment]
        // ----------------------------------------
        compartment = new window.Compartment(
          endowments,  // Provide safe globals like React
          {},          // Module map (empty for now)
          {
            name: moduleName,

            // Resolve module paths
            resolveHook: (moduleSpecifier, moduleReferrer) => {
              if (moduleSpecifier === moduleName) {
                return moduleSpecifier;
              }
              throw new Error(
                `[translate:Не удалось найти модуль]: ${moduleSpecifier}`
              );
            },

            // Load module source code
            importHook: async (moduleSpecifier) => {
              if (moduleSpecifier === moduleName) {
                // Optional: log source maps for debugging
                const sourceMapHook = (sourceMap, details) => {
                  console.debug('[SES] Source map:', details.sourceUrl);
                };

                // Return module with ModuleSource wrapper
                return {
                  source: new ModuleSource(moduleText, {
                    sourceUrl: `${moduleName}.js`,
                    sourceMapUrl: `${moduleName}.js.map`,
                    sourceMapHook,
                  }),
                  specifier: moduleSpecifier,
                };
              }

              throw new Error(
                `[translate:Модуль не найден]: ${moduleSpecifier}`
              );
            },
          }
        );

        // ----------------------------------------
        // STEP 2: Import and extract component
        // [translate:ШАГ 2: Импортировать и извлечь компонент]
        // ----------------------------------------
        const moduleNamespace = await compartment.import(moduleName);

        // Look for named export 'DynamicWidget' or default export
        const loadedComponent =
          moduleNamespace.namespace.DynamicWidget ||
          moduleNamespace.default;

        // Validate it's a React component function
        if (typeof loadedComponent !== 'function') {
          throw new Error(
            '[translate:Модуль должен экспортировать React компонент функцию] (DynamicWidget or default)'
          );
        }

        setComponent(() => loadedComponent);
        setLoading(false);

      } catch (err) {
        console.error('[SES Loader] [translate:Ошибка загрузки компонента]:', err);
        setError(err.message || '[translate:Неизвестная ошибка]');
        setLoading(false);
      }
    };

    loadComponent();

    // Cleanup on unmount
    return () => {
      compartment = null;
      setComponent(null);
    };
  }, [moduleText, moduleName, endowments]);

  return { component, loading, error };
}

// ============================================
// EXAMPLE MODULE FOR TESTING
// ============================================

/**
 * Example safe component that runs in SES Compartment
 * [translate:Пример безопасного компонента, который выполняется в SES Compartment]
 * 
 * Key limitations in SES:
 * - No JSX (must use React.createElement)
 * - No direct window/document access
 * - Only globals provided via endowments
 */
export const EXAMPLE_MODULE_TEXT = `
// React is injected via endowments
// [translate:React внедряется через endowments]
const React = globalThis.React || {
  createElement: (type, props, ...children) => ({
    type,
    props: { 
      ...props, 
      children: children.length === 1 ? children[0] : children 
    }
  })
};

/**
 * Safe dynamic component - completely isolated from parent app
 * [translate:Безопасный динамический компонент - полностью изолирован от родительского приложения]
 */
export function DynamicWidget(userProps) {
  const { title = 'Default Title', data = {} } = userProps;

  // Event handler - console is allowed in compartment
  // [translate:Обработчик события - console разрешен в compartment]
  const handleClick = () => {
    console.log('[Dynamic Widget] [translate:Кнопка нажата]!', userProps);
  };

  // Build component tree using React.createElement
  return React.createElement(
    'div',
    { 
      className: 'dynamic-widget',
      style: { 
        padding: '20px', 
        border: '2px dashed #0070f3',
        borderRadius: '8px',
        margin: '10px 0'
      }
    },
    React.createElement(
      'h4',
      { style: { margin: '0 0 10px 0', color: '#0070f3' } },
      title
    ),
    React.createElement(
      'p',
      { style: { margin: '0 0 10px 0', color: '#666' } },
      '[translate:Данные props]: ' + JSON.stringify(data)
    ),
    React.createElement(
      'button',
      {
        onClick: handleClick,
        style: {
          padding: '8px 16px',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }
      },
      'Нажми меня (Безопасно!)'
    )
  );
}
`;
