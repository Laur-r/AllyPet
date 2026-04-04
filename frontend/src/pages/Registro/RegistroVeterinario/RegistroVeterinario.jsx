// frontend/src/pages/RegistroVeterinario.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './RegistroVeterinario.css';


import logo from '../../../assets/logo-allypet.png';
import veterinarioImg from "../../../assets/register/formulario-veterinario.png";

import logo from '../../../assets/logo-allypet.png';
import veterinarioImg from '../../../assets/register/formulario-veterinario.png';


export default function RegistroVeterinario() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre:                 '',
    correo:                 '',
    contrasena:             '',
    confirmar:              '',
    telefono:               '',
    ciudad:                 '',
    nombre_establecimiento: '',
    direccion:              '',
    servicios:              '',
    horarios:               '',
    terminos:               false,
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

    if (!form.nombre || !form.correo || !form.contrasena || !form.confirmar || !form.nombre_establecimiento) {
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
    <div className="rv-wrapper">

      {/* NAVBAR */}
      <header className="rv-navbar">
        <div className="rv-navbar__brand" onClick={() => navigate('/')}>
          <img src={logo} alt="AllyPet" className="rv-navbar__logo" />
          <span className="rv-navbar__name"><strong>Ally</strong>Pet</span>
        </div>
        <nav className="rv-navbar__links">
          <a href="#">Servicios</a>
          <a href="#">Paseadores</a>
          <a href="#">Veterinarios</a>
          <a href="#">Sobre Nosotros</a>
        </nav>
      </header>

      {/* FONDO BLOB */}
      <div className="rv-bg">
        <div className="rv-blob" />

        {/* CARD FORMULARIO */}
        <div className="rv-card">

          {/* IMAGEN SUPERIOR */}
          <div className="rv-card__img-wrap">
            <img src={veterinarioImg} alt="Veterinario" className="rv-card__img" />
            <div className="rv-card__img-overlay">
              <h2 className="rv-card__title">Registro de<br />Veterinaria</h2>
              <p className="rv-card__subtitle">
                Únete a nuestra red de veterinarios y brinda atención profesional a las mascotas de tu ciudad.
              </p>
            </div>
          </div>

          {/* FORMULARIO */}
          <form className="rv-form" onSubmit={handleSubmit}>

            {/* Fila 1 */}
            <div className="rv-form__row">
              <div className="rv-form__group">
                <label>Nombre completo*</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="rv-form__group">
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
            <div className="rv-form__row">
              <div className="rv-form__group">
                <label>Crea una contraseña*</label>
                <div className="rv-input-eye">
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
              <div className="rv-form__group">
                <label>Repite la contraseña*</label>
                <div className="rv-input-eye">
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
            <div className="rv-form__row">
              <div className="rv-form__group">
                <label>Nombre del establecimiento*</label>
                <input
                  type="text"
                  name="nombre_establecimiento"
                  placeholder="Nombre de la clínica o consultorio"
                  value={form.nombre_establecimiento}
                  onChange={handleChange}
                />
              </div>
              <div className="rv-form__group">
                <label>Teléfono (Opcional)</label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Fila 4 */}
            <div className="rv-form__row">
              <div className="rv-form__group">
                <label>Ciudad (Opcional)</label>
                <input
                  type="text"
                  name="ciudad"
                  placeholder="Ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                />
              </div>
              <div className="rv-form__group">
                <label>Dirección (Opcional)</label>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Dirección del establecimiento"
                  value={form.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Fila 5 */}
            <div className="rv-form__row">
              <div className="rv-form__group">
                <label>Horarios de atención (Opcional)</label>
                <input
                  type="text"
                  name="horarios"
                  placeholder="Ej: Lunes a Viernes 8am - 6pm"
                  value={form.horarios}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Fila 6 */}
            <div className="rv-form__row">
              <div className="rv-form__group rv-form__group--full">
                <label>Servicios ofrecidos (Opcional)</label>
                <textarea
                  name="servicios"
                  placeholder="Ej: Consulta general, vacunación, cirugía, grooming..."
                  value={form.servicios}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            {/* Error */}
            {error && <p className="rv-error">{error}</p>}

            {/* Términos */}
            <div className="rv-terminos">
              <input
                type="checkbox"
                name="terminos"
                id="terminos"
                checked={form.terminos}
                onChange={handleChange}
              />
              <label htmlFor="terminos">
                Acepto los <span className="rv-link">términos y condiciones</span>
              </label>
            </div>

            {/* Botón */}
            <button type="submit" className="rv-btn">
              Registrarse
            </button>

            {/* Link login */}
            <p className="rv-login-link">
              ¿Ya tienes una cuenta?{' '}
              <span className="rv-link" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
