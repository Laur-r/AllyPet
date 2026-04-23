import { useState } from 'react';
import './BusquedaVeterinarias.css';

const API_VET = 'http://localhost:3005';

export default function BusquedaVeterinarias() {
  const [ciudad, setCiudad]           = useState('');
  const [veterinarias, setVeterinarias] = useState([]);
  const [cargando, setCargando]       = useState(false);
  const [buscado, setBuscado]         = useState(false);
  const [error, setError]             = useState(null);

  const buscar = async () => {
    if (!ciudad.trim()) return;

    setCargando(true);
    setError(null);
    setBuscado(false);

    try {
      const res  = await fetch(`${API_VET}/perfil-vet/buscar?ciudad=${encodeURIComponent(ciudad.trim())}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al buscar');

      setVeterinarias(data.data);
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
    <div className="bv-page">

      {/* ENCABEZADO */}
      <div className="bv-head">
        <h1>Buscar Veterinarias</h1>
        <p>Encuentra veterinarias disponibles en tu ciudad</p>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bv-searchbar">
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
        <div className="bv-error">{error}</div>
      )}

      {/* RESULTADOS */}
      {buscado && !cargando && (
        <>
          <p className="bv-resultado-label">
            {veterinarias.length > 0
              ? `${veterinarias.length} veterinaria${veterinarias.length > 1 ? 's' : ''} encontrada${veterinarias.length > 1 ? 's' : ''} en "${ciudad}"`
              : `No se encontraron veterinarias disponibles en "${ciudad}"`
            }
          </p>

          <div className="bv-grid">
            {veterinarias.map((vet) => (
              <TarjetaVeterinaria key={vet.id} veterinaria={vet} />
            ))}
          </div>
        </>
      )}

      {/* ESTADO INICIAL */}
      {!buscado && !cargando && (
        <div className="bv-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <p>Ingresa una ciudad para comenzar la búsqueda</p>
        </div>
      )}

    </div>
  );
}

/* ── Tarjeta de cada veterinaria ── */
function TarjetaVeterinaria({ veterinaria }) {
  const { nombre_establecimiento, direccion, servicios, ciudad } = veterinaria;

  const serviciosTexto = Array.isArray(servicios) && servicios.length > 0
    ? servicios.slice(0, 3).join(', ')
    : typeof servicios === 'string' && servicios
    ? servicios
    : 'Sin servicios registrados';

  return (
    <div className="bv-card">
      <div className="bv-card-accent" />

      <div className="bv-card-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>

      <div className="bv-card-info">
        <h3>{nombre_establecimiento}</h3>
        <span className="bv-card-direccion">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {direccion || ciudad || 'Sin dirección'}
        </span>
        <span className="bv-card-servicios">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          {serviciosTexto}
        </span>
      </div>

      <button className="bv-card-btn">Ver perfil</button>
    </div>
  );
}