import './Features.css';
import perfilVet from '../../../assets/features/perfil.png';
import notificacion from '../../../assets/features/notificacion.png';
import asistente from '../../../assets/features/asistente.png';

const FEATURES = [
  {
    num: '01',
    tag: 'Perfil',
    icon: perfilVet,
    title: 'Perfil médico completo',
    desc: 'Historial clínico, vacunas y peso en un carnet digital siempre disponible — y descargable en PDF para el veterinario.',
    color: 'purple',
  },
  {
    num: '02',
    tag: 'Recordatorios',
    icon: notificacion,
    title: 'Alertas automáticas',
    desc: 'Vacunas, desparasitación y citas programadas con anticipación. Sin depender de tu memoria ni de un carnet físico.',
    color: 'green',
  },
  {
    num: '03',
    tag: 'Asistente IA',
    icon: asistente,
    title: 'Orientación inteligente',
    desc: 'Consulta síntomas, cuidados y alimentación con nuestro asistente disponible 24/7. Con criterio profesional.',
    color: 'pink',
  },
];

export default function Features() {
  return (
    <section className="features" id="funciones">

      <div className="features__header">
        <h2 className="features__title">
          Tres herramientas.<br />
          <em className="features__title-em">Un solo lugar.</em>
        </h2>
        <p className="features__subtitle">
          Diseñadas para que no tengas que buscar nada en otro sitio.
        </p>
      </div>

      <div className="features__grid">
        {FEATURES.map((f) => (
          <div className={`features__item features__item--${f.color}`} key={f.num}>
            <div className="features__tag">
              <span className="features__tag-line" />
              {f.num} — {f.tag}
            </div>
            <div className={`features__icon features__icon--${f.color}`}>
              <img src={f.icon} alt={f.title} />
            </div>
            <h3 className="features__name">{f.title}</h3>
            <p className="features__desc">{f.desc}</p>
          </div>
        ))}
      </div>

    </section>
  );
}