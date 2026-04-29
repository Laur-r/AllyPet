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

const API = 'http://localhost:3003';

export default function Carnet() {
  const { petId } = useParams();
  const pdfRef = useRef();

  const [carnet,      setCarnet]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [qrUrl,       setQrUrl]       = useState(null);
  const [generandoQr, setGenerandoQr] = useState(false);

  useEffect(() => {
    if (!petId) return;
    let cancelado = false;
    setLoading(true);
    setError(null);

    getCarnet(petId)
      .then(async res => {
        if (cancelado) return;
        const data = res.data.data;
        setCarnet(data);
        if (data.token) {
          const url = `${window.location.origin}/carnet/public/${data.token}`;
          const qr  = await QRCode.toDataURL(url, { width: 160, margin: 1 });
          if (!cancelado) setQrUrl(qr);
        }
      })
      .catch(() => { if (!cancelado) setError('No se pudo cargar el carnet.'); })
      .finally(() => { if (!cancelado) setLoading(false); });

    return () => { cancelado = true; };
  }, [petId]);

  const handleGenerarQR = async () => {
    setGenerandoQr(true);
    try {
      const res   = await generarToken(petId);
      const token = res.data.data.token;
      const url   = `${window.location.origin}/carnet/public/${token}`;
      const qr    = await QRCode.toDataURL(url, { width: 160, margin: 1 });
      setQrUrl(qr);
      setCarnet(prev => ({ ...prev, token }));
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
    setCarnet(prev => ({ ...prev, token: null }));
  };

  const handleDescargar = () => {
    if (!pdfRef.current) return;
    html2pdf()
      .set({
        margin: 10,
        filename: `carnet_${carnet?.nombre || 'mascota'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(pdfRef.current)
      .save();
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const getFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/uploads')) return `${API}${foto}`;
    return null;
  };

  const vacunasRecientes = carnet?.vacunas?.slice(0, 3) || [];
  const recordatoriosProximos = carnet?.recordatorios?.filter(
    r => !r.completado && new Date(r.fecha_programada) >= new Date()
  ).slice(0, 3) || [];

  return (
    <div className="carnet-page">
      {loading && <div className="carnet-loading">Cargando carnet...</div>}
      {error   && <div className="carnet-error">{error}</div>}

      {carnet && (
        <div className="carnet-card">

          {/* Todo lo que va al PDF */}
          <div ref={pdfRef}>

            {/* HEADER */}
            <div className="carnet-header">
              <div className="carnet-avatar">
                {getFotoUrl(carnet.foto) ? (
                  <img
                    src={getFotoUrl(carnet.foto)}
                    alt={carnet.nombre}
                    crossOrigin="anonymous"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : '🐾'}
              </div>
              <div className="carnet-header-info">
                <h2>{carnet.nombre}</h2>
                <p>{carnet.raza} · {carnet.sexo} · {carnet.edad} {carnet.edad === 1 ? 'año' : 'años'}</p>
              </div>
              <div className="carnet-id-badge">ID #{String(carnet.id).padStart(5, '0')}</div>
            </div>

            {/* BODY */}
            <div className="carnet-body">

              {/* Stats */}
              <div className="carnet-stats">
                <div className="stat-box"><label>Peso</label><span>{carnet.peso ? `${carnet.peso} kg` : '—'}</span></div>
                <div className="stat-box"><label>Especie</label><span>{carnet.especie || '—'}</span></div>
                <div className="stat-box"><label>Color</label><span>{carnet.color || '—'}</span></div>
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
                        <span
                          className="qr-label"
                          style={{ color: '#E0467A', cursor: 'pointer' }}
                          onClick={handleRevocarQR}
                        >
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

            </div>
          </div>
          {/* Fin del área PDF */}

          {/* FOOTER — fuera del ref, no va al PDF */}
          <div className="carnet-footer">
            <button className="btn-carnet btn-descargar" onClick={handleDescargar}>
              Descargar PDF
            </button>
            <button
              className="btn-carnet btn-compartir"
              onClick={() => {
                if (carnet.token) {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/carnet/public/${carnet.token}`
                  );
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