// frontend/src/pages/RegistroDueno.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './RegistroDueno.css';

import logo          from '../assets/Logo-AllyPet.png';
import formularioImg from '../assets/register/formulario-dueno.png';

export default function RegistroDueno() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre:     '',
    correo:     '',
    contrasena: '',
    confirmar:  '',
    telefono:   '',
    ciudad:     '',
    direccion:  '',
    terminos:   false,
  });

  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmar,  setVerConfirmar]  = useState(false);
  const [error,         setError]         = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre || !form.correo || !form.contrasena || !form.confirmar) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (form.contrasena !== form.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!form.terminos) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }

    console.log('Datos del formulario:', form);
    alert('Registro exitoso! (pendiente conexión con backend)');
  };

  return (
    <div className="rd-wrapper">

      {/* NAVBAR */}
      <header className="rd-navbar">
        <div className="rd-navbar__brand" onClick={() => navigate('/')}>
          <img src={logo} alt="AllyPet" className="rd-navbar__logo" />
          <span className="rd-navbar__name"><strong>Ally</strong>Pet</span>
        </div>
        <nav className="rd-navbar__links">
          <a href="#">Servicios</a>
          <a href="#">Paseadores</a>
          <a href="#">Veterinarios</a>
          <a href="#">Sobre Nosotros</a>
        </nav>
      </header>

      {/* FONDO BLOB */}
      <div className="rd-bg">
        <div className="rd-blob" />

        {/* CARD FORMULARIO */}
        <div className="rd-card">

          {/* IMAGEN SUPERIOR */}
          <div className="rd-card__img-wrap">
            <img src={formularioImg} alt="Dueño de mascota" className="rd-card__img" />
            <div className="rd-card__img-overlay">
              <h2 className="rd-card__title">Registro del Dueño<br />de Mascotas</h2>
              <p className="rd-card__subtitle">
                Completa tus datos para empezar a gestionar el bienestar de tu mejor amigo.
              </p>
            </div>
          </div>

          {/* FORMULARIO */}
          <form className="rd-form" onSubmit={handleSubmit}>

            {/* Fila 1 */}
            <div className="rd-form__row">
              <div className="rd-form__group">
                <label>Nombre completo*</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="rd-form__group">
                <label>Correo electrónico*</label>
                <input
                  type="email"
                  name="correo"
                  placeholder="Correo electrónico"
                  value={form.correo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Fila 2 */}
            <div className="rd-form__row">
              <div className="rd-form__group">
                <label>Crea una contraseña*</label>
                <div className="rd-input-eye">
                  <input
                    type={verContrasena ? 'text' : 'password'}
                    name="contrasena"
                    placeholder="Contraseña"
                    value={form.contrasena}
                    onChange={handleChange}
                  />
                  <span onClick={() => setVerContrasena(!verContrasena)}>
                    {verContrasena
                      ? <AiOutlineEyeInvisible size={20} />
                      : <AiOutlineEye size={20} />}
                  </span>
                </div>
              </div>
              <div className="rd-form__group">
                <label>Repite la contraseña*</label>
                <div className="rd-input-eye">
                  <input
                    type={verConfirmar ? 'text' : 'password'}
                    name="confirmar"
                    placeholder="Repite la contraseña"
                    value={form.confirmar}
                    onChange={handleChange}
                  />
                  <span onClick={() => setVerConfirmar(!verConfirmar)}>
                    {verConfirmar
                      ? <AiOutlineEyeInvisible size={20} />
                      : <AiOutlineEye size={20} />}
                  </span>
                </div>
              </div>
            </div>

            {/* Fila 3 */}
            <div className="rd-form__row">
              <div className="rd-form__group">
                <label>Número de teléfono (Opcional)</label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
              <div className="rd-form__group">
                <label>Ciudad (Opcional)</label>
                <input
                  type="text"
                  name="ciudad"
                  placeholder="Ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Fila 4 */}
            <div className="rd-form__row">
              <div className="rd-form__group rd-form__group--full">
                <label>Dirección (Opcional)</label>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Dirección"
                  value={form.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Error */}
            {error && <p className="rd-error">{error}</p>}

            {/* Términos */}
            <div className="rd-terminos">
              <input
                type="checkbox"
                name="terminos"
                id="terminos"
                checked={form.terminos}
                onChange={handleChange}
              />
              <label htmlFor="terminos">
                Acepto los <span className="rd-link">términos y condiciones</span>
              </label>
            </div>

            {/* Botón */}
            <button type="submit" className="rd-btn">
              Registrarse
            </button>

            {/* Link login */}
            <p className="rd-login-link">
              ¿Ya tienes una cuenta?{' '}
              <span className="rd-link" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}