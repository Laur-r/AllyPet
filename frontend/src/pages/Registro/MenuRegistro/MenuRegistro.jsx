

import { useNavigate } from 'react-router-dom';
import './MenuRegistro.css';

import logo from '../../../assets/logo-allypet.png';

import imgDueno    from '../../../assets/register/dueno.png';
import imgVet      from '../../../assets/register/Veterinario.png';
import imgPaseador from '../../../assets/register/Paseador.png';


const CARDS = [
  {
    rol: 'dueno',
    label: 'Dueño de mascotas',
    ruta: '/register/dueno',
    color: '#7BC67E',
    accent: '#5aaa5e',
    img: imgDueno,
  },
  {
    rol: 'veterinario',
    label: 'Veterinaria',
    ruta: '/register/veterinario',
    color: '#F5A623',
    accent: '#d48b12',
    img: imgVet,
  },
  {
    rol: 'paseador',
    label: 'Paseador',
    ruta: '/register/paseador',
    color: '#5BC8D4',
    accent: '#38adb9',
    img: imgPaseador,
  },
];

export default function MenuRegistro() {
  const navigate = useNavigate();

  return (
    <div className="mr-wrapper">

      {/* NAVBAR */}
      <header className="mr-navbar">
        <div className="mr-navbar__brand" onClick={() => navigate('/')}>
          <img src={logo} alt="AllyPet logo" className="mr-navbar__logo" />
          <span className="mr-navbar__name">
            <strong>Ally</strong>Pet
          </span>
        </div>
        <nav className="mr-navbar__links">
          <a href="#">Servicios</a>
          <a href="#">Paseadores</a>
          <a href="#">Veterinarios</a>
          <a href="#">Contacto</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="mr-hero">
        <div className="mr-hero__blob" />
        <img src={logo} alt="AllyPet" className="mr-hero__logo" />
        <h1 className="mr-hero__title">¿Qué tipo de usuario eres?</h1>
        <p className="mr-hero__subtitle">
          Regístrate según tu perfil para acceder a los servicios de AllyPet
        </p>
      </section>

      {/* CARDS */}
      <section className="mr-cards">
        {CARDS.map((card) => (
          <div
            key={card.rol}
            className="mr-card"
            style={{ '--card-color': card.color, '--card-accent': card.accent }}
          >
            <div className="mr-card__img-wrap">
              <img src={card.img} alt={card.label} className="mr-card__img" />
            </div>
            <p className="mr-card__label">{card.label}</p>
            <button
              className="mr-card__btn"
              onClick={() => navigate(card.ruta)}
            >
              Regístrate &gt;
            </button>
          </div>
        ))}
      </section>

    </div>
  );
}
