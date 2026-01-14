import { ERRL_CONFIG } from '../content/errl-config';
import { BubbleButton } from './BubbleButton';

export function ErrlContentLayout() {
  return (
    <div style={{ width: '100%', color: '#f9f5ff' }}>
      {/* Hero Section */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          mixBlendMode: 'overlay',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(3rem, 8vw, 8rem)',
            fontWeight: 900,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
          }}
        >
          {ERRL_CONFIG.hero.headline}
        </h1>
        <p
          style={{
            fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            marginTop: '1.5rem',
            opacity: 0.9,
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          {ERRL_CONFIG.hero.subhead}
        </p>
      </section>

      {/* Navigation Bubbles */}
      <nav
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {ERRL_CONFIG.navigationBubbles.map((bubble) => (
          <BubbleButton key={bubble.id} bubble={bubble} />
        ))}
      </nav>

      {/* Scroll Sections */}
      {ERRL_CONFIG.sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: section.layout === 'center' ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            mixBlendMode: 'overlay',
          }}
        >
          <div
            style={{
              maxWidth: section.layout === 'center' ? '800px' : '600px',
              textAlign: section.layout === 'center' ? 'center' : 'left',
              marginLeft: section.layout === 'split-right' ? 'auto' : '0',
              marginRight: section.layout === 'split-left' ? 'auto' : '0',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 800,
                margin: '0 0 1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: '0 0 30px rgba(255, 0, 255, 0.4)',
              }}
            >
              {section.title}
            </h2>
            <p
              style={{
                fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                lineHeight: 1.6,
                opacity: 0.9,
              }}
            >
              {section.text}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
}

