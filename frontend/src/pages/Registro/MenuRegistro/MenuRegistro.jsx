

import { useNavigate } from 'react-router-dom';
import './MenuRegistro.css';

import Navbar from '../../../components/Navbar/Navbar';
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
  color: '#7B2D8B',
  accent: '#a44db8',
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

      <Navbar showActions={false} />

      {/* HERO */}
      <section className="mr-hero">
        <div className="mr-hero__blob" />
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
