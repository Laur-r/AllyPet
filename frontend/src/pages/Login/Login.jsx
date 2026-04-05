// frontend/src/pages/Login.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

import logo from '../../assets/login/allypet-logo-login.png';
import loginImage from '../../assets/login/login-side-image.png';
import googleLogo from '../../assets/login/google-logo.png';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    correo: '',
    contrasena: '',
    recordar: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.correo,
          password: form.contrasena,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const backendMessage = data?.message || 'Datos incorrectos';
        alert(backendMessage);
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      const successMessage =
        data.message ||
        `Inicio de sesión exitoso. Bienvenido ${data.user?.nombre || data.user?.email} (${
          data.user?.rol || 'usuario'
        }).`;
      alert(successMessage);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Error conectando con el servidor');
    }
  };

  return (
    <div className="lg-wrapper">
      {/* NAVBAR */}
      <header className="lg-navbar">
        <div className="lg-navbar__brand" onClick={() => navigate('/')}>
          <img src={logo} alt="AllyPet" className="lg-navbar__logo" />
        </div>

        <div className="lg-navbar__right">
          <nav className="lg-navbar__links">
            <a href="#servicios">Servicios</a>
            <a href="#paseadores">Paseadores</a>
            <a href="#veterinarios">Veterinarios</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <button className="lg-navbar__btn" onClick={() => navigate('/register')}>
            Registrarse
          </button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="lg-main">
        <section className="lg-card">
          {/* COLUMNA IZQUIERDA */}
          <article className="lg-card__image-side">
            <img src={loginImage} alt="Familia con mascotas" className="lg-card__image" />
          </article>

          {/* COLUMNA DERECHA */}
          <article className="lg-card__form-side">
            <form className="lg-form" onSubmit={handleSubmit}>
              <div className="lg-form__brand">
                <img src={logo} alt="AllyPet" className="lg-form__brand-logo" />
              </div>

              <h1 className="lg-form__title">Inicia Sesion</h1>
              <p className="lg-form__subtitle">Conecta con servicios para tu mascota</p>

              <div className="lg-form__group">
                <label htmlFor="correo">Correo electronico</label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="Correo electronico"
                  value={form.correo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="lg-form__group">
                <label htmlFor="contrasena">Contrasena</label>
                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  placeholder="Contrasena"
                  value={form.contrasena}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="lg-form__extras">
                <label className="lg-form__check">
                  <input
                    type="checkbox"
                    name="recordar"
                    checked={form.recordar}
                    onChange={handleChange}
                  />
                  Recordarme
                </label>
                <a href="#recuperar">Olvidaste tu contrasena?</a>
              </div>

              <button type="submit" className="lg-form__btn-main">
                Iniciar sesion
              </button>

              <div className="lg-form__separator">
                <span>o</span>
              </div>

              <button type="button" className="lg-form__btn-google">
                <img src={googleLogo} alt="" aria-hidden="true" />
                Continuar con Google
              </button>
            </form>
          </article>
        </section>
      </main>
    </div>
  );
}
