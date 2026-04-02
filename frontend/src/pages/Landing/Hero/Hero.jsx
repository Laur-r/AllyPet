import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">

      {/* Blobs de fondo */}
      <div className="hero__blob hero__blob--purple" />
      <div className="hero__blob hero__blob--green" />

      <div className="hero__inner">

        {/* ── Columna izquierda ── */}
        <div className="hero__text">

          <div className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            El aliado inteligente de tu mascota
          </div>

          <h1 className="hero__title">
            Todo lo que tu<br />
            mascota necesita,<br />
            <span className="hero__title--purple">en un solo </span>
            <span className="hero__title--green">lugar.</span>
          </h1>

          <p className="hero__desc">
            Gestiona su salud, encuentra servicios verificados
            y recibe orientación experta. Sin apps dispersas,
            sin información perdida.
          </p>

          <div className="hero__actions">
            <a className="hero__btn-main" href="#">
              Crear cuenta gratis
            </a>
            <a className="hero__btn-ghost" href="#servicios">
              Ver servicios
            </a>
          </div>

          {/* Pills de servicios */}
          <div className="hero__pills">
            {SERVICES.map((s) => (
              <div className="hero__pill" key={s.label}>
                <span
                  className="hero__pill-dot"
                  style={{ background: s.color }}
                />
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Columna derecha — foto ── */}
        <div className="hero__visual">
          <img
            className="hero__img"
            src="/hero-pet.png"
            alt="Dueño feliz con su mascota"
          />
          <div className="hero__img-fade" />

          {/* Tarjeta flotante 1 — vacuna */}
          <div className="hero__card hero__card--1">
            <div className="hero__card-icon hero__card-icon--green">🩺</div>
            <div className="hero__card-info">
              <strong>Vacuna al día</strong>
              <small>Próximo control: 15 días</small>
            </div>
          </div>

          {/* Tarjeta flotante 2 — stat */}
          <div className="hero__card hero__card--2">
            <div className="hero__card-stat">
              <b>+500</b>
              <small>mascotas registradas</small>
            </div>
          </div>

          {/* Tarjeta flotante 3 — reseña */}
          <div className="hero__card hero__card--3">
            <div className="hero__card-icon hero__card-icon--pink">⭐</div>
            <div className="hero__card-info">
              <strong>Dr. Carlos López</strong>
              <span className="hero__card-stars">★★★★★</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ── Data ── */
const SERVICES = [
  { label: 'Veterinarias', color: '#8B35C8' },
  { label: 'Paseadores',  color: '#6AB33E' },
  { label: 'Guarderías',  color: '#E0467A' },
  { label: 'Peluquerías', color: '#F59E0B' },
  { label: 'Cuidadores',  color: '#3B82F6' },
];