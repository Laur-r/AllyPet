import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom'; 
import QRCode from 'qrcode';
import html2pdf from 'html2pdf.js';
import './Carnet.css';

import {
  getCarnet,
  generarToken,
  revocarToken,
} from '../../services/carnet.service';

const API_PET = import.meta.env.VITE_PET_API_URL || 'http://localhost:3003/api';

export default function Carnet() {
  const { petId } = useParams();  // ← viene de la URL
  const pdfRef = useRef();

  const [carnet, setCarnet]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [qrUrl, setQrUrl]             = useState(null);
  const [generandoQr, setGenerandoQr] = useState(false);

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    setError(null);

    getCarnet(petId)
      .then(async (res) => {
        const data = res.data.data;
        setCarnet(data);
        if (data.token) {
          const url = `${window.location.origin}/carnet/public/${data.token}`;
          const qr = await QRCode.toDataURL(url, { width: 160, margin: 1 });
          setQrUrl(qr);
        }
      })
      .catch(() => setError('No se pudo cargar el carnet.'))
      .finally(() => setLoading(false));
  }, [petId]);

  // ...resto del componente igual, solo elimina toda la parte del selector de mascotas

  const handleGenerarQR = async () => {
    setGenerandoQr(true);
    try {
      const res = await generarToken(petId);
      const token = res.data.data.token;
      const url = `${window.location.origin}/carnet/public/${token}`;
      const qr = await QRCode.toDataURL(url, { width: 160, margin: 1 });
      setQrUrl(qr);
      setCarnet((prev) => ({ ...prev, token }));
    } catch {
      alert('Error al generar el QR');
    } finally {
      setGenerandoQr(false);
    }
  };

  const handleRevocarQR = async () => {
    if (!window.confirm('¿Desactivar el acceso por QR?')) return;
    await revocarToken(petId);
    setQrUrl(null);
    setCarnet((prev) => ({ ...prev, token: null }));
  };

  const handleDescargar = () => {
    const element = pdfRef.current;
    html2pdf()
      .set({
        margin: 10,
        filename: `carnet_${carnet?.nombre || 'mascota'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save();
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const vacunasRecientes = carnet?.vacunas?.slice(0, 3) || [];
  const recordatoriosProximos = carnet?.recordatorios?.filter(
    (r) => !r.completado && new Date(r.fecha_programada) >= new Date()
  ).slice(0, 3) || [];

  return (
    <div className="carnet-page">

      {loading && <div className="carnet-loading">Cargando carnet...</div>}
      {error && <div className="carnet-error">{error}</div>}

      {carnet && (
        <div className="carnet-card" ref={pdfRef}>
          {/* Header */}
          <div className="carnet-header">
            <div className="carnet-avatar">
              {carnet.foto
                ? <img src={`http://localhost:3003${carnet.foto}`} alt={carnet.nombre} />
                : '🐾'}
            </div>
            <div className="carnet-header-info">
              <h2>{carnet.nombre}</h2>
              <p>{carnet.raza} · {carnet.sexo} · {carnet.edad} {carnet.edad === 1 ? 'año' : 'años'}</p>
            </div>
            <div className="carnet-id-badge">ID #{String(carnet.id).padStart(5, '0')}</div>
          </div>

          <div className="carnet-body">
            {/* Stats */}
            <div className="carnet-stats">
              <div className="stat-box">
                <label>Peso</label>
                <span>{carnet.peso ? `${carnet.peso} kg` : '—'}</span>
              </div>
              <div className="stat-box">
                <label>Especie</label>
                <span>{carnet.especie || '—'}</span>
              </div>
              <div className="stat-box">
                <label>Color</label>
                <span>{carnet.color || '—'}</span>
              </div>
            </div>

            <div className="carnet-divider" />

            {/* Dueño + QR */}
            <div>
              <p className="carnet-section-title">Dueño</p>
              <div className="owner-qr-row">
                <div className="owner-data">
                  <div className="owner-field">
                    <label>Nombre</label>
                    <span>{carnet.dueno_nombre || '—'}</span>
                  </div>
                  <div className="owner-field">
                    <label>Contacto</label>
                    <span>{carnet.dueno_telefono || carnet.dueno_email || '—'}</span>
                  </div>
                </div>
                <div className="qr-container">
                  {qrUrl ? (
                    <>
                      <img src={qrUrl} alt="QR carnet" />
                      <span className="qr-label" style={{ color: '#E0467A', cursor: 'pointer' }} onClick={handleRevocarQR}>
                        Revocar acceso
                      </span>
                    </>
                  ) : (
                    <div className="qr-no-token" onClick={handleGenerarQR}>
                      {generandoQr ? 'Generando...' : '+ Generar QR'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="carnet-divider" />

            {/* Vacunas recientes */}
            <div>
              <p className="carnet-section-title">Vacunas recientes</p>
              {vacunasRecientes.length === 0
                ? <p style={{ fontSize: '0.85rem', color: '#aaa' }}>Sin vacunas registradas</p>
                : vacunasRecientes.map((v) => (
                  <div className="vacuna-item" key={v.id}>
                    <div className={`vacuna-dot ${v.fecha_proxima && new Date(v.fecha_proxima) >= new Date() ? 'proxima' : ''}`} />
                    <span className="vacuna-nombre">{v.nombre}</span>
                    <span className="vacuna-fecha">
                      {v.fecha_proxima
                        ? `Próxima: ${formatFecha(v.fecha_proxima)}`
                        : `Aplicada: ${formatFecha(v.fecha_aplicacion)}`}
                    </span>
                  </div>
                ))}
            </div>

            {/* Recordatorios próximos */}
            {recordatoriosProximos.length > 0 && (
              <>
                <div className="carnet-divider" />
                <div>
                  <p className="carnet-section-title">Recordatorios próximos</p>
                  <div className="recordatorios-chips">
                    {recordatoriosProximos.map((r) => (
                      <div className="chip-recordatorio" key={r.id}>
                        {r.nombre} · {formatFecha(r.fecha_programada)}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="carnet-footer">
            <button className="btn-carnet btn-descargar" onClick={handleDescargar}>
              Descargar PDF
            </button>
            <button
              className="btn-carnet btn-compartir"
              onClick={() => {
                if (carnet.token) {
                  navigator.clipboard.writeText(`${window.location.origin}/carnet/public/${carnet.token}`);
                  alert('Enlace copiado al portapapeles');
                } else {
                  handleGenerarQR();
                }
              }}
            >
              Compartir enlace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}