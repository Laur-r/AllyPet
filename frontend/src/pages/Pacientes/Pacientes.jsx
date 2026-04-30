import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pacientes.css';
import { getCarnetVet } from '../../services/carnet.service';

const STORAGE_KEY = 'vet_pacientes_recientes';

const IcoSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IcoPaw = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4A0D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20a1 1 0 0 0 2 0c0-1.1-1-2-1-2s-1 .9-1 2z"/>
    <path d="M5 9c1.1 0 2-1.3 2-3S6.1 3 5 3 3 4.3 3 6s.9 3 2 3z"/>
    <path d="M19 9c1.1 0 2-1.3 2-3s-.9-3-2-3-2 1.3-2 3 .9 3 2 3z"/>
    <path d="M9 9c1.1 0 2-1.3 2-3S10.1 3 9 3 7 4.3 7 6s.9 3 2 3z"/>
    <path d="M15 9c1.1 0 2-1.3 2-3s-.9-3-2-3-2 1.3-2 3 .9 3 2 3z"/>
    <path d="M12 13c-3 0-6 2-6 4.5 0 1.5 1 2.5 2 3l1 .5h6l1-.5c1-.5 2-1.5 2-3 0-2.5-3-4.5-6-4.5z"/>
  </svg>
);

export default function Pacientes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState(null);
  const [recientes, setRecientes] = useState([]);

  useEffect(() => {
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) setRecientes(JSON.parse(guardados));
  }, []);

  const guardarReciente = (mascota) => {
    const lista = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtrada = lista.filter(m => m.id !== mascota.id);
    const nueva = [mascota, ...filtrada].slice(0, 10); // máximo 10
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nueva));
    setRecientes(nueva);
  };

  const buscarPorId = async () => {
    const id = busqueda.trim();
    if (!id) return;
    if (isNaN(id)) { setError('Ingresa un ID numérico válido'); return; }

    setCargando(true);
    setError(null);

    try {
      const res = await getCarnetVet(id);
      const mascota = res.data.data;
      guardarReciente({
        id: mascota.id,
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza,
        foto: mascota.foto,
        dueno_nombre: mascota.dueno_nombre,
      });
      navigate(`/menu/veterinario/pacientes/${id}`);
    } catch {
      setError('No se encontró ninguna mascota con ese ID');
    } finally {
      setCargando(false);
    }
  };

  const eliminarReciente = (id) => {
    const nueva = recientes.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nueva));
    setRecientes(nueva);
  };

  const getFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    return `http://localhost:3003${foto}`;
  };

  return (
    <div className="pac-page">
      <div className="pac-head">
        <h1>Pacientes</h1>
        <p>Busca una mascota por su ID de carnet o selecciona un paciente reciente</p>
      </div>

      {/* Buscador */}
      <div className="pac-search-wrap">
        <div className="pac-search-box">
          <IcoSearch />
          <input
            type="number"
            placeholder="Ingresa el ID del carnet (ej: 1)"
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setError(null); }}
            onKeyDown={e => e.key === 'Enter' && buscarPorId()}
          />
          <button
            className="pac-search-btn"
            onClick={buscarPorId}
            disabled={cargando || !busqueda.trim()}
          >
            {cargando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        {error && <p className="pac-error">{error}</p>}
      </div>

      {/* Pacientes recientes */}
      {recientes.length > 0 && (
        <div className="pac-recientes">
          <h2>Pacientes recientes</h2>
          <div className="pac-grid">
            {recientes.map(m => (
              <div className="pac-card" key={m.id}>
                <div className="pac-card-img">
                  {getFotoUrl(m.foto)
                    ? <img src={getFotoUrl(m.foto)} alt={m.nombre} />
                    : <div className="pac-placeholder"><IcoPaw /></div>
                  }
                  <span className="pac-badge">{m.especie}</span>
                </div>
                <div className="pac-card-body">
                  <div className="pac-card-top">
                    <div>
                      <div className="pac-card-name">{m.nombre}</div>
                      <div className="pac-card-sub">{m.raza} · ID #{String(m.id).padStart(5, '0')}</div>
                      <div className="pac-card-dueno">👤 {m.dueno_nombre}</div>
                    </div>
                  </div>
                  <div className="pac-card-btns">
                    <button
                      className="pac-btn-ver"
                      onClick={() => navigate(`/menu/veterinario/pacientes/${m.id}`)}
                    >
                      Ver carnet
                    </button>
                    <button
                      className="pac-btn-del"
                      onClick={() => eliminarReciente(m.id)}
                      title="Quitar de recientes"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recientes.length === 0 && (
        <div className="pac-empty">
          <IcoPaw />
          <p>Aún no has atendido pacientes.<br />Busca una mascota por su ID para comenzar.</p>
        </div>
      )}
    </div>
  );
}