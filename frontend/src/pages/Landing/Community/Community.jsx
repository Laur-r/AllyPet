import './Community.css';

const REVIEWS = [
  {
    avatar: '👩',
    avatarColor: 'purple',
    name: 'Laura M.',
    service: 'Paseadora · Bogotá',
    stars: 5,
    text: '"Por fin encontré un paseador de confianza. Las reseñas me dieron la seguridad que necesitaba antes de dejar a Coco con alguien desconocido."',
  },
  {
    avatar: '👨',
    avatarColor: 'green',
    name: 'Andrés P.',
    service: 'Veterinaria · Medellín',
    stars: 5,
    text: '"El Dr. Ramírez tiene reseñas de más de un año. Eso me dio mucha más confianza que cualquier recomendación informal de WhatsApp."',
  },
  {
    avatar: '👩',
    avatarColor: 'pink',
    name: 'Camila R.',
    service: 'Guardería · Cali',
    stars: 4,
    text: '"Fotos reales y comentarios detallados. Mi gato quedó feliz y yo tranquila durante el viaje."',
  },
];

const STATS = [
  { value: '+5.000', label: 'Servicios completados' },
  { value: '4.8 ★', label: 'Calificación promedio'  },
  { value: '100%',  label: 'Reseñas verificadas'    },
];

const DIFFS = [
  {
    title: 'Solo reseñas de usuarios reales',
    desc:  'No hay calificaciones falsas ni perfiles sin historial.',
  },
  {
    title: 'Proveedores verificados por AllyPet',
    desc:  'Revisamos credenciales antes de aparecer en el directorio.',
  },
  {
    title: 'Califica después de cada servicio',
    desc:  'Tu opinión ayuda a otros dueños a decidir mejor.',
  },
];

export default function Community() {
  return (
    <section className="community" id="comunidad">
      <div className="community__grid">

        {/* ── Columna izquierda ── */}
        <div className="community__left">
          <h2 className="community__title">
            Reseñas reales.<br />
            <span className="community__title-accent">Confianza real.</span>
          </h2>
          <p className="community__desc">
            El problema con otras plataformas es que los proveedores
            no tienen calificaciones verificadas. En AllyPet, cada
            reseña viene de un dueño real que usó el servicio.
          </p>

          <ul className="community__diffs">
            {DIFFS.map((d) => (
              <li className="community__diff" key={d.title}>
                <div className="community__diff-check">✓</div>
                <div>
                  <strong>{d.title}</strong>
                  <span>{d.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Columna derecha ── */}
        <div className="community__right">
          <div className="community__reviews">
            {REVIEWS.map((r) => (
              <div className="community__review" key={r.name + r.service}>
                <div className="community__review-top">
                  <div className={`community__avatar community__avatar--${r.avatarColor}`}>
                    {r.avatar}
                  </div>
                  <div className="community__review-meta">
                    <strong>{r.name}</strong>
                    <small>{r.service}</small>
                  </div>
                  <div className="community__review-right">
                    <div className="community__stars">
                      {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                    </div>
                    <span className="community__badge">✓ Verificado</span>
                  </div>
                </div>
                <p className="community__review-text">{r.text}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="community__stats">
            {STATS.map((s) => (
              <div className="community__stat" key={s.label}>
                <strong>{s.value}</strong>
                <small>{s.label}</small>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}