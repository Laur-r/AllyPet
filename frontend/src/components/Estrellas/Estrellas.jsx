import { useState } from 'react';
import './Estrellas.css';

export default function Estrellas({ calificacion = 0, setCalificacion, editable = false, size = 20 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="estrellas-container" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((num) => (
        <span
          key={num}
          className={`estrella ${num <= (hover || calificacion) ? 'activa' : ''} ${editable ? 'editable' : ''}`}
          onClick={() => editable && setCalificacion(num)}
          onMouseEnter={() => editable && setHover(num)}
          onMouseLeave={() => editable && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
