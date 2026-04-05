// frontend/src/pages/RegistroPaseador.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './RegistroPaseador.css';


import logo        from '../../../assets/logo-allypet.png';
import paseadorImg from '../../../assets/register/formulario-paseador.png';

export default function RegistroPaseador() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre:       '',
    correo:       '',
    contrasena:   '',
    confirmar:    '',
    telefono:     '',
    ciudad:       '',
    descripcion:  '',
    tarifa:       '',
    disponibilidad: '',
    terminos:     false,
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
    <div className="rp-wrapper">

      {/* NAVBAR */}
      <header className="rp-navbar">
        <div className="rp-navbar__brand" onClick={() => navigate('/')}>
          <img src={logo} alt="AllyPet" className="rp-navbar__logo" />
          <span className="rp-navbar__name"><strong>Ally</strong>Pet</span>
        </div>
        <nav className="rp-navbar__links">
          <a href="#">Servicios</a>
          <a href="#">Paseadores</a>
          <a href="#">Veterinarios</a>
          <a href="#">Sobre Nosotros</a>
        </nav>
      </header>

      {/* FONDO BLOB */}
      <div className="rp-bg">
        <div className="rp-blob" />

        {/* CARD FORMULARIO */}
        <div className="rp-card">

          {/* IMAGEN SUPERIOR */}
          <div className="rp-card__img-wrap">
            <img src={paseadorImg} alt="Paseador" className="rp-card__img" />
            <div className="rp-card__img-overlay">
              <h2 className="rp-card__title">Registro de<br />Paseador</h2>
              <p className="rp-card__subtitle">
                Únete a nuestra red de paseadores y ayuda a cuidar a las mascotas de tu ciudad.
              </p>
            </div>
          </div>

          {/* FORMULARIO */}
          <form className="rp-form" onSubmit={handleSubmit}>

            {/* Fila 1 */}
            <div className="rp-form__row">
              <div className="rp-form__group">
                <label>Nombre completo*</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="rp-form__group">
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
            <div className="rp-form__row">
              <div className="rp-form__group">
                <label>Crea una contraseña*</label>
                <div className="rp-input-eye">
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
              <div className="rp-form__group">
                <label>Repite la contraseña*</label>
                <div className="rp-input-eye">
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
            <div className="rp-form__row">
              <div className="rp-form__group">
                <label>Teléfono (Opcional)</label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
              <div className="rp-form__group">
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
            <div className="rp-form__row">
              <div className="rp-form__group">
                <label>Tarifa por hora (Opcional)</label>
                <input
                  type="number"
                  name="tarifa"
                  placeholder="$ Tarifa"
                  value={form.tarifa}
                  onChange={handleChange}
                />
              </div>
              <div className="rp-form__group">
                <label>Disponibilidad (Opcional)</label>
                <input
                  type="text"
                  name="disponibilidad"
                  placeholder="Ej: Lunes a Viernes"
                  value={form.disponibilidad}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Fila 5 */}
            <div className="rp-form__row">
              <div className="rp-form__group rp-form__group--full">
                <label>Descripción (Opcional)</label>
                <textarea
                  name="descripcion"
                  placeholder="Cuéntanos un poco sobre ti y tu experiencia con mascotas..."
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            {/* Error */}
            {error && <p className="rp-error">{error}</p>}

            {/* Términos */}
            <div className="rp-terminos">
              <input
                type="checkbox"
                name="terminos"
                id="terminos"
                checked={form.terminos}
                onChange={handleChange}
              />
              <label htmlFor="terminos">
                Acepto los <span className="rp-link">términos y condiciones</span>
              </label>
            </div>

            {/* Botón */}
            <button type="submit" className="rp-btn">
              Registrarse
            </button>

            {/* Link login */}
            <p className="rp-login-link">
              ¿Ya tienes una cuenta?{' '}
              <span className="rp-link" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
