import { useEffect, useState } from 'react';
import { SECTIONS } from '../config/event';
import { useActiveSection } from '../hooks/useActiveSection';
import { scrollToId } from '../lib/format';
import { Icon } from './Icon';
import './Header.css';

const IDS = SECTIONS.map((s) => s.id);

export function Header() {
  const active = useActiveSection(IDS);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header className={`hdr ${scrolled || open ? 'is-solid' : ''}`}>
      <div className="hdr-inner container">
        <a
          href="#countdown"
          className="hdr-brand"
          onClick={(e) => {
            e.preventDefault();
            go('countdown');
          }}
        >
          <span className="hdr-mark" aria-hidden="true" />
          <span className="hdr-name">
            BABYMETAL <b>ARGENTINA</b>
          </span>
          <span className="hdr-badge">FAN PROJECT</span>
        </a>

        <nav className="hdr-nav" aria-label="Secciones">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={active === s.id ? 'is-active' : ''}
              aria-current={active === s.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(s.id);
              }}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="hdr-actions">
          <button className="btn btn-primary btn-sm hdr-cta" onClick={() => go('crear')}>
            <span className="hdr-cta-long">CREAR MI SETLIST</span>
            <span className="hdr-cta-short">CREAR SETLIST</span>
            <span className="hdr-cta-tiny">
              <Icon name="plus" size={16} /> CREAR
            </span>
          </button>
          <button
            className="icon-btn hdr-menu"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <nav id="mobile-nav" className={`hdr-sheet ${open ? 'is-open' : ''}`} aria-label="Secciones" hidden={!open}>
        {SECTIONS.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={active === s.id ? 'is-active' : ''}
            onClick={(e) => {
              e.preventDefault();
              go(s.id);
            }}
          >
            <span className="hdr-sheet-num">0{i + 1}</span>
            {s.label}
          </a>
        ))}
      </nav>
      {open && <button className="hdr-scrim" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
    </header>
  );
}
