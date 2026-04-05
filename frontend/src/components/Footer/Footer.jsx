import './Footer.css';

const FOOTER_LINKS = [
  { label: 'Servicios',    href: '#servicios' },
  { label: 'Paseadores',  href: '#servicios' },
  { label: 'Veterinarias',href: '#servicios' },
  { label: 'Comunidad',   href: '#comunidad' },
  { label: 'Privacidad',  href: '#'          },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">

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
        <nav className="footer__links">
          {FOOTER_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="footer__link">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Copy */}
        <span className="footer__copy">© 2025 AllyPet</span>

      </div>
    </footer>
  );
}