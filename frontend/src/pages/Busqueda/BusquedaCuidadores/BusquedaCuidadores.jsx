import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarCuidadoresPorCiudad } from '../../../services/cuidador.service';
import './BusquedaCuidadores.css';

const API_CUID = 'http://localhost:3011';

export default function BusquedaCuidadores() {
  const [ciudad,     setCiudad]     = useState('');
  const [cuidadores, setCuidadores] = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState(null);

  /* Filtros */
  const [tarifaMin,       setTarifaMin]       = useState('');
  const [tarifaMax,       setTarifaMax]       = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  /* ── Carga inicial: todos los cuidadores ── */
  const cargarTodos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await buscarCuidadoresPorCiudad('');
      setCuidadores(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodos();
  }, []);

  /* ── Buscar por ciudad ── */
  const buscar = async () => {
    if (!ciudad.trim()) {
      cargarTodos();
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const data = await buscarCuidadoresPorCiudad(ciudad.trim());
      setCuidadores(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') buscar();
  };

  /* ── Limpiar búsqueda ── */
  const limpiarBusqueda = () => {
    setCiudad('');
    cargarTodos();
  };

  /* ── Filtros en memoria ── */
  const cuidadoresFiltrados = useMemo(() => {
    return cuidadores.filter(c => {
      const tarifa = Number(c.tarifa) || 0;
      if (tarifaMin !== '' && tarifa < Number(tarifaMin)) return false;
      if (tarifaMax !== '' && tarifa > Number(tarifaMax)) return false;
      if (soloDisponibles && !c.disponible) return false;
      return true;
    });
  }, [cuidadores, tarifaMin, tarifaMax, soloDisponibles]);

  const hayFiltros = tarifaMin !== '' || tarifaMax !== '' || soloDisponibles;

  const limpiarFiltros = () => {
    setTarifaMin('');
    setTarifaMax('');
    setSoloDisponibles(false);
  };

  return (
    <div className="bc-page">

      {/* ENCABEZADO */}
      <div className="bc-head">
        <h1>Buscar Cuidadores</h1>
        <p>Encuentra cuidadores disponibles para tu mascota</p>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bc-searchbar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <input
          type="text"
          placeholder="Filtrar por ciudad, ej: Buga, Cali, Bogotá..."
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {ciudad && (
          <button className="bc-btn-limpiar" onClick={limpiarBusqueda} title="Limpiar">
            ✕
          </button>
        )}
        <button onClick={buscar} disabled={cargando}>
          {cargando ? 'Cargando...' : 'Buscar'}
        </button>
      </div>

      {/* FILTROS */}
      {cuidadores.length > 0 && (
        <div className="bc-filtros">
          <div className="bc-filtros-header">
            <span className="bc-filtros-titulo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filtros
            </span>
            {hayFiltros && (
              <button className="bc-filtros-limpiar" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="bc-filtros-body">
            <div className="bc-filtro-grupo">
              <label>Tarifa mínima</label>
              <input
                type="number"
                placeholder="Ej: 10000"
                value={tarifaMin}
                onChange={(e) => setTarifaMin(e.target.value)}
              />
            </div>
            <div className="bc-filtro-grupo">
              <label>Tarifa máxima</label>
              <input
                type="number"
                placeholder="Ej: 50000"
                value={tarifaMax}
                onChange={(e) => setTarifaMax(e.target.value)}
              />
            </div>
            <div className="bc-filtro-grupo bc-filtro-check">
              <label className="bc-check-label">
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
      {error && <div className="bc-error">{error}</div>}

      {/* CARGANDO */}
      {cargando && (
        <div className="bc-empty">
          <div className="bc-spinner" />
          <p>Cargando cuidadores...</p>
        </div>
      )}

      {/* RESULTADOS */}
      {!cargando && !error && (
        <>
          <p className="bc-resultado-label">
            {cuidadoresFiltrados.length > 0
              ? `${cuidadoresFiltrados.length} cuidador${cuidadoresFiltrados.length > 1 ? 'es' : ''} disponible${cuidadoresFiltrados.length > 1 ? 's' : ''}${ciudad ? ` en "${ciudad}"` : ''}`
              : 'No se encontraron cuidadores con los filtros aplicados'
            }
          </p>
          <div className="bc-grid">
            {cuidadoresFiltrados.map((c) => (
              <TarjetaCuidador key={c.usuario_id || c.id} cuidador={c} />
            ))}
          </div>
        </>
      )}

    </div>
  );
}

/* ── Tarjeta de cada cuidador ── */
function TarjetaCuidador({ cuidador }) {
  const { usuario_id, nombre, foto_perfil, tarifa, calificacion, ciudad, disponible } = cuidador;
  const navigate = useNavigate();

  return (
    <div className="bc-card">
      <div className="bc-card-accent" />
      <div className="bc-card-foto">
        {foto_perfil
          ? <img src={foto_perfil.startsWith('/uploads') ? `${API_CUID}${foto_perfil}` : foto_perfil} alt={nombre} />
          : <div className="bc-card-avatar">{nombre?.[0]?.toUpperCase()}</div>
        }
      </div>
      <div className="bc-card-info">
        <h3>{nombre}</h3>
        {ciudad && (
          <span className="bc-card-ciudad">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {ciudad}
          </span>
        )}
        <div className="bc-card-stats">
          <span className="bc-card-tarifa">
            ${tarifa ? Number(tarifa).toLocaleString('es-CO') : '—'} / día
          </span>
          <span className="bc-card-cal">
            ★ {calificacion ? Number(calificacion).toFixed(1) : '0.0'}
          </span>
        </div>
        <span className={`bc-card-disponible ${disponible ? 'on' : 'off'}`}>
          <span className="bc-dot" />
          {disponible ? 'Disponible' : 'No disponible'}
        </span>
      </div>
      <button
        className="bc-card-btn"
        onClick={() => navigate(`/menu/dueno/cuidador/${usuario_id}`)}
      >
        Ver perfil
      </button>
    </div>
  );
}