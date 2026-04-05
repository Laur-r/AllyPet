import './Services.css';

const SERVICES = [
  {
    emoji: '🏥',
    title: 'Veterinarias',
    desc: 'Clínicas y consultorios cercanos a ti, con horarios y contacto directo.',
    tag: 'Salud',
    color: 'purple',
  },
  {
    emoji: '🦮',
    title: 'Paseadores',
    desc: 'Paseadores verificados para que tu mascota se ejercite cuando no puedas.',
    tag: 'Actividad',
    color: 'green',
  },
  {
    emoji: '🏡',
    title: 'Guarderías',
    desc: 'Cuidado temporal para cuando viajes. Con reseñas reales de otros dueños.',
    tag: 'Cuidado',
    color: 'pink',
  },
  {
    emoji: '✂️',
    title: 'Peluquerías',
    desc: 'Estética y aseo profesional con fotos del trabajo y calificaciones verificadas.',
    tag: 'Estética',
    color: 'amber',
  },
];

export default function Services() {
  return (
    <section className="services" id="servicios">

      <div className="services__header">
        <h2 className="services__title">
          Encuentra el servicio que<br />
          <em className="services__title-em">necesitas, cerca.</em>
        </h2>
        <p className="services__subtitle">
          Profesionales verificados con calificaciones reales de otros dueños.
        </p>
      </div>

      <div className="services__grid">
        {SERVICES.map((s) => (
          <div className="services__card" key={s.title}>
            <div className="services__emoji">{s.emoji}</div>
            <h3 className="services__name">{s.title}</h3>
            <p className="services__desc">{s.desc}</p>
            <span className={`services__tag services__tag--${s.color}`}>
              {s.tag}
            </span>
          </div>
        ))}
      </div>

    </section>
  );
}