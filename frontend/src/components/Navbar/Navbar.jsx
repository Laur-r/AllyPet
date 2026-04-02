// src/components/Navbar/Navbar.jsx

import { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Servicios',     href: '#servicios' },
  { label: 'Paseadores',   href: '#servicios' },
  { label: 'Veterinarios', href: '#servicios' },
  { label: 'Comunidad',    href: '#comunidad' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>

      {/* Logo */}
      <a className="navbar__logo" href="#">
        <img
          src="/logo.png"
          alt="AllyPet"
          className="navbar__logo-img"
        />
        <span className="navbar__logo-text">
          Ally<span>Pet</span>
        </span>
      </a>

      {/* Links */}
      <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a href={link.href} onClick={handleLinkClick}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Acciones */}
      <div className="navbar__actions">
        <a className="navbar__register" href="#">
          Comenzar gratis
        </a>

        {/* Hamburger mobile */}
        <button
          className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Abrir menú"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

    </header>
  );
}