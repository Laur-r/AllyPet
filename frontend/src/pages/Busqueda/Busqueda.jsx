import { useState } from 'react';
import './Busqueda.css';

const API_PAS = 'http://localhost:3006';

export default function BusquedaPaseadores() {
  const [ciudad, setCiudad]       = useState('');
  const [paseadores, setPaseadores] = useState([]);
  const [cargando, setCargando]   = useState(false);
  const [buscado, setBuscado]     = useState(false);
  const [error, setError]         = useState(null);

  const buscar = async () => {
    if (!ciudad.trim()) return;

    setCargando(true);
    setError(null);
    setBuscado(false);

    try {
      const res  = await fetch(`${API_PAS}/api/perfil-paseador/buscar?ciudad=${encodeURIComponent(ciudad.trim())}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al buscar');

      setPaseadores(data.data);
      setBuscado(true);
    } catch (err) {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') buscar();
  };

  return (
    <div className="bq-page">

      {/* ENCABEZADO */}
      <div className="bq-head">
        <h1>Buscar Paseadores</h1>
        <p>Encuentra paseadores disponibles en tu ciudad</p>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bq-searchbar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <input
          type="text"
          placeholder="Escribe una ciudad, ej: Buga, Cali, Bogotá..."
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={buscar} disabled={cargando || !ciudad.trim()}>
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bq-error">{error}</div>
      )}

      {/* RESULTADOS */}
      {buscado && !cargando && (
        <>
          <p className="bq-resultado-label">
            {paseadores.length > 0
              ? `${paseadores.length} paseador${paseadores.length > 1 ? 'es' : ''} encontrado${paseadores.length > 1 ? 's' : ''} en "${ciudad}"`
              : `No se encontraron paseadores disponibles en "${ciudad}"`
            }
          </p>

          <div className="bq-grid">
            {paseadores.map((pas) => (
              <TarjetaPaseador key={pas.id} paseador={pas} />
            ))}
          </div>
        </>
      )}

      {/* ESTADO INICIAL */}
      {!buscado && !cargando && (
        <div className="bq-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>Ingresa una ciudad para comenzar la búsqueda</p>
        </div>
      )}

    </div>
  );
}

/* ── Tarjeta de cada paseador ── */
function TarjetaPaseador({ paseador }) {
  const { nombre, foto_perfil, tarifa, calificacion, ciudad } = paseador;

  return (
    <div className="bq-card">
      <div className="bq-card-accent" />

      <div className="bq-card-foto">
        {foto_perfil
          ? <img src={foto_perfil.startsWith('/uploads') ? `http://localhost:3006${foto_perfil}` : foto_perfil} alt={nombre} />
          : <div className="bq-card-avatar">{nombre?.[0]?.toUpperCase()}</div>
        }
      </div>

      <div className="bq-card-info">
        <h3>{nombre}</h3>
        <span className="bq-card-ciudad">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {ciudad}
        </span>
        <div className="bq-card-stats">
          <span className="bq-card-tarifa">
            ${tarifa ? Number(tarifa).toLocaleString('es-CO') : '—'}
          </span>
          <span className="bq-card-cal">
            ★ {calificacion ? Number(calificacion).toFixed(1) : '0.0'}
          </span>
        </div>
      </div>

      <button className="bq-card-btn">Ver perfil</button>
    </div>
  );
}