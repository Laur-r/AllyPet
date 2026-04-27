import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* Brand */}
        <div className="footer__brand">
          <img src="/logo.png" alt="AllyPet" className="footer__logo" />
          <h3>Ally<span>Pet</span></h3>
          <p>Encuentra servicios para tu mascota cerca de ti.</p>
        </div>

        {/* Links */}
        <div className="footer__section">
          <h4>Servicios</h4>
          <a href="#">Paseadores</a>
          <a href="#">Veterinarios</a>
          <a href="#">Guarderías</a>
        </div>

        <div className="footer__section">
          <h4>Compañía</h4>
          <a href="#">Sobre nosotros</a>
          <a href="#">Comunidad</a>
        </div>

        <div className="footer__section">
          <h4>Legal</h4>
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
        </div>

      </div>

      <div className="footer__bottom">
        © 2026 AllyPet
      </div>
    </footer>
  );
}