import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import { registrarCuidador } from '../../../services/cuidador.service';
import cuidadorImg from '../../../assets/register/cuidador.png';
import './RegistroCuidador.css';

export default function RegistroCuidador() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre:         '',
    correo:         '',
    contrasena:     '',
    confirmar:      '',
    telefono:       '',
    ciudad:         '',
    descripcion:    '',
    tarifa:         '',
    disponibilidad: '',
  });

  const [verContrasena,  setVerContrasena]  = useState(false);
  const [verConfirmar,   setVerConfirmar]   = useState(false);
  const [error,          setError]          = useState('');
  const [cargando,       setCargando]       = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.correo || !form.contrasena) {
      setError('Nombre, correo y contraseña son obligatorios');
      return;
    }
    if (form.contrasena !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);
    try {
      await registrarCuidador({
        nombre:         form.nombre,
        correo:         form.correo,
        contrasena:     form.contrasena,
        telefono:       form.telefono,
        ciudad:         form.ciudad,
        descripcion:    form.descripcion,
        tarifa:         form.tarifa,
        disponibilidad: form.disponibilidad,
      });
      alert('¡Registro exitoso! Tu cuenta está pendiente de aprobación por el administrador.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const IcoOjo = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const IcoOjoOff = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="rc-wrapper">
      <Navbar showActions={false} />

      <main className="rc-main">
        <div className="rc-card">

          {/* IMAGEN SUPERIOR */}
          <div className="rc-card__img-wrap">
            <img src={cuidadorImg} alt="Cuidador de mascotas" className="rc-card__img" />
            <div className="rc-card__img-overlay">
              <h1 className="rc-card__title">Registro de Cuidador</h1>
              <p className="rc-card__subtitle">Ofrece tus servicios de cuidado temporal en AllyPet</p>
            </div>
          </div>

          <form className="rc-form" onSubmit={handleSubmit}>

            <div className="rc-form__row">
              <div className="rc-form__group">
                <label>Nombre completo *</label>
                <input name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="rc-form__group">
                <label>Correo electrónico *</label>
                <input name="correo" type="email" placeholder="correo@ejemplo.com" value={form.correo} onChange={handleChange} required />
              </div>
            </div>

            <div className="rc-form__row">
              <div className="rc-form__group">
                <label>Contraseña *</label>
                <div className="rc-input-eye">
                  <input
                    name="contrasena"
                    type={verContrasena ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={form.contrasena}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" onClick={() => setVerContrasena(!verContrasena)}>
                    {verContrasena ? <IcoOjoOff /> : <IcoOjo />}
                  </button>
                </div>
              </div>
              <div className="rc-form__group">
                <label>Confirmar contraseña *</label>
                <div className="rc-input-eye">
                  <input
                    name="confirmar"
                    type={verConfirmar ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={form.confirmar}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" onClick={() => setVerConfirmar(!verConfirmar)}>
                    {verConfirmar ? <IcoOjoOff /> : <IcoOjo />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rc-form__row">
              <div className="rc-form__group">
                <label>Teléfono</label>
                <input name="telefono" placeholder="300 000 0000" value={form.telefono} onChange={handleChange} />
              </div>
              <div className="rc-form__group">
                <label>Ciudad *</label>
                <input name="ciudad" placeholder="Tu ciudad" value={form.ciudad} onChange={handleChange} required />
              </div>
            </div>

            <div className="rc-form__row">
              <div className="rc-form__group">
                <label>Tarifa por día</label>
                <input name="tarifa" type="number" placeholder="Ej: 50000" value={form.tarifa} onChange={handleChange} />
              </div>
              <div className="rc-form__group">
                <label>Disponibilidad</label>
                <select name="disponibilidad" value={form.disponibilidad} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  <option value="Fines de semana">Fines de semana</option>
                  <option value="Entre semana">Entre semana</option>
                  <option value="Tiempo completo">Tiempo completo</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="rc-form__group rc-form__group--full">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                placeholder="Cuéntanos sobre tu experiencia cuidando mascotas..."
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {error && <p className="rc-error">{error}</p>}

            <button type="submit" className="rc-btn" disabled={cargando}>
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </button>

            <p className="rc-login-link">
              ¿Ya tienes cuenta?{' '}
              <span onClick={() => navigate('/login')}>Inicia sesión</span>
            </p>

          </form>
        </div>
      </main>
    </div>
  );
}