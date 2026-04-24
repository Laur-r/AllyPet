import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './BusquedaPaseadores.css';

const API_PAS = 'http://localhost:3006';

export default function BusquedaPaseadores() {
  const [ciudad, setCiudad]         = useState('');
  const [paseadores, setPaseadores] = useState([]);
  const [cargando, setCargando]     = useState(false);
  const [buscado, setBuscado]       = useState(false);
  const [error, setError]           = useState(null);

  // Filtros
  const [tarifaMin, setTarifaMin]   = useState('');
  const [tarifaMax, setTarifaMax]   = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);

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

  // Filtros en tiempo real con useMemo
  const paseadoresFiltrados = useMemo(() => {
    return paseadores.filter(p => {
      const tarifa = Number(p.tarifa) || 0;

      if (tarifaMin !== '' && tarifa < Number(tarifaMin)) return false;
      if (tarifaMax !== '' && tarifa > Number(tarifaMax)) return false;
      if (soloDisponibles && !p.disponible) return false;

      return true;
    });
  }, [paseadores, tarifaMin, tarifaMax, soloDisponibles]);

  const hayFiltros = tarifaMin !== '' || tarifaMax !== '' || soloDisponibles;

  const limpiarFiltros = () => {
    setTarifaMin('');
    setTarifaMax('');
    setSoloDisponibles(false);
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

      {/* FILTROS — solo se muestran si ya hay resultados */}
      {buscado && paseadores.length > 0 && (
        <div className="bq-filtros">
          <div className="bq-filtros-header">
            <span className="bq-filtros-titulo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filtros
            </span>
            {hayFiltros && (
              <button className="bq-filtros-limpiar" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="bq-filtros-body">
            <div className="bq-filtro-grupo">
              <label>Tarifa mínima</label>
              <input
                type="number"
                placeholder="Ej: 10000"
                value={tarifaMin}
                onChange={(e) => setTarifaMin(e.target.value)}
              />
            </div>

            <div className="bq-filtro-grupo">
              <label>Tarifa máxima</label>
              <input
                type="number"
                placeholder="Ej: 50000"
                value={tarifaMax}
                onChange={(e) => setTarifaMax(e.target.value)}
              />
            </div>

            <div className="bq-filtro-grupo bq-filtro-check">
              <label className="bq-check-label">
                <input
                  type="checkbox"
                  checked={soloDisponibles}
                  onChange={(e) => setSoloDisponibles(e.target.checked)}
                />
                Solo disponibles
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && <div className="bq-error">{error}</div>}

      {/* RESULTADOS */}
      {buscado && !cargando && (
        <>
          <p className="bq-resultado-label">
            {paseadoresFiltrados.length > 0
              ? `${paseadoresFiltrados.length} paseador${paseadoresFiltrados.length > 1 ? 'es' : ''} encontrado${paseadoresFiltrados.length > 1 ? 's' : ''} en "${ciudad}"`
              : `No se encontraron paseadores con los filtros aplicados`
            }
          </p>

          <div className="bq-grid">
            {paseadoresFiltrados.map((pas) => (
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
  const { id, nombre, foto_perfil, tarifa, calificacion, ciudad } = paseador;
  const navigate = useNavigate();

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

      <button
        className="bq-card-btn"
        onClick={() => navigate(`/menu/dueno/paseador/${id}`)}
      >
        Ver perfil
      </button>
    </div>
  );
}