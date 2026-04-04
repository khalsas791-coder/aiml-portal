const fs = require('fs');
const html = fs.readFileSync('../index.html', 'utf8');
const startIdx = html.indexOf('<!-- ═══════════════════════ ABOUT ═══════════════════════ -->');
const endIdx = html.indexOf('<!-- ═══════════════════════ SCRIPTS ═══════════════════════ -->');
const sectionHtml = html.substring(startIdx, endIdx);

// Convert standard HTML to JSX-compatible string (escape backticks, \ => \\)
const escapedHtml = sectionHtml.replace(/\\/g, '\\\\').replace(/`/g, '\\`');

const jsxCode = `import React, { useEffect, useRef } from 'react';

export default function AimlVanilla() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Inject vanilla CSS
    const styles = ['variables.css', 'base.css', 'components.css', 'sections.css', 'responsive.css'];
    styles.forEach(css => {
      if (!document.querySelector(\`link[href='/css/\${css}']\`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/' + css;
        document.head.appendChild(link);
      }
    });

    // Inject vanilla JS scripts dynamically so they run
    const scripts = ['animations.js', 'cgpa.js', 'gallery.js', 'chatbot.js'];
    let loaded = 0;
    scripts.forEach(src => {
      if (!document.querySelector(\`script[src='/js/\${src}']\`)) {
        const script = document.createElement('script');
        script.src = '/js/' + src;
        script.onload = () => {
          loaded++;
          if (loaded === scripts.length) {
            // Re-bind listeners just in case
            if(window.initRevealAnimations) window.initRevealAnimations();
            if(window.initCounters) window.initCounters();
            if(window.initStaggeredReveal) window.initStaggeredReveal();
            if(window.initSectionAnimations) window.initSectionAnimations();
            if(window.initTabs) window.initTabs();
            if(window.initScrollSpy) window.initScrollSpy();
          }
        };
        document.body.appendChild(script);
      }
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      className="aiml-vanilla-wrapper"
      dangerouslySetInnerHTML={{ __html: \`${escapedHtml}\` }} 
    />
  );
}
`;

fs.writeFileSync('src/components/AimlVanilla.jsx', jsxCode);
console.log('Successfully wrote src/components/AimlVanilla.jsx');
