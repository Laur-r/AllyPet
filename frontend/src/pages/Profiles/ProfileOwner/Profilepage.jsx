// src/pages/Profile/ProfilePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// ── Componente principal ──────────────────────────────────────
export default function ProfilePage() {
  const navigate   = useNavigate();
  const [mode, setMode]       = useState('view');   // 'view' | 'edit' | 'delete'
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  const [profile, setProfile] = useState(null);
  const [form,    setForm]    = useState({});

  // ID del usuario — reemplazar con authContext.user.id cuando se integre JWT
  const userId = 1;

  // ── Cargar datos al montar ──────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_URL}/users/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile(data);
      setForm({
        nombre:      data.nombre      || '',
        telefono:    data.telefono    || '',
        ciudad:      data.ciudad      || '',
        direccion:   data.direccion   || '',
        foto_perfil: data.foto_perfil || '',
      });
    } catch (err) {
      setError('No se pudo cargar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Guardar cambios ─────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res  = await fetch(`${API_URL}/users/${userId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile(data); // ✅ CORREGIDO: el backend devuelve el objeto directo
      setMode('view');
    } catch (err) {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar cuenta ─────────────────────────────────────────
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      navigate('/');
    } catch {
      setError('No se pudo eliminar la cuenta. Intenta de nuevo.');
      setMode('view');
    }
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Renders ─────────────────────────────────────────────────
  if (loading) return <div className="profile-loading">Cargando perfil...</div>;

  return (
    <div className="profile-page">

      {/* ── Encabezado ── */}
      <div className="profile-header">
        <button className="profile-back" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <div>
          <h1 className="profile-title">Mi perfil</h1>
          <p className="profile-subtitle">Gestiona tu información personal</p>
        </div>
      </div>

      {error && <div className="profile-error">{error}</div>}

      {/* ── Tarjeta principal ── */}
      <div className="profile-card">

        {/* Avatar + nombre */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {profile?.foto_perfil
              ? <img src={profile.foto_perfil} alt="Foto de perfil" />
              : <span>{profile?.nombre?.[0]?.toUpperCase() || '?'}</span>
            }
          </div>
          {mode === 'view' && (
            <div className="profile-avatar-info">
              <h2>{profile?.nombre}</h2>
              <span className="profile-rol">Dueño de mascotas</span>
            </div>
          )}
        </div>

        {/* ── MODO VER ── */}
        {mode === 'view' && (
          <>
            <div className="profile-fields">
              <Field label="Correo electrónico" value={profile?.correo}             icon="✉️" />
              <Field label="Teléfono"            value={profile?.telefono  || '—'}  icon="📱" />
              <Field label="Ciudad"              value={profile?.ciudad    || '—'}  icon="📍" />
              <Field label="Dirección"           value={profile?.direccion || '—'}  icon="🏠" />
              <Field
                label="Miembro desde"
                value={new Date(profile?.fecha_registro).toLocaleDateString('es-CO', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
                icon="📅"
              />
            </div>

            <div className="profile-actions">
              <button className="btn-edit"   onClick={() => setMode('edit')}>
                Editar perfil
              </button>
              <button className="btn-delete" onClick={() => setMode('delete')}>
                Eliminar cuenta
              </button>
            </div>
          </>
        )}

        {/* ── MODO EDITAR ── */}
        {mode === 'edit' && (
          <>
            <div className="profile-form">
              <FormField
                label="Nombre completo"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
              />
              <FormField
                label="Teléfono"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="300 000 0000"
                type="tel"
              />
              <FormField
                label="Ciudad"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                placeholder="Tu ciudad"
              />
              <FormField
                label="Dirección"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Tu dirección"
              />
              <FormField
                label="URL foto de perfil"
                name="foto_perfil"
                value={form.foto_perfil}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="profile-actions">
              <button
                className="btn-edit"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                className="btn-cancel"
                onClick={() => { setMode('view'); setError(null); }}
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {/* ── MODO CONFIRMAR ELIMINACIÓN ── */}
        {mode === 'delete' && (
          <div className="profile-delete-confirm">
            <div className="delete-icon">⚠️</div>
            <h3>¿Eliminar tu cuenta?</h3>
            <p>
              Esta acción es permanente. Se eliminarán todos tus datos,
              mascotas registradas y reservas activas.
            </p>
            <div className="profile-actions">
              <button className="btn-delete-confirm" onClick={handleDelete}>
                Sí, eliminar mi cuenta
              </button>
              <button className="btn-cancel" onClick={() => setMode('view')}>
                Cancelar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Subcomponentes ────────────────────────────────────────────
function Field({ label, value, icon }) {
  return (
    <div className="profile-field">
      <span className="field-icon">{icon}</span>
      <div className="field-content">
        <span className="field-label">{label}</span>
        <span className="field-value">{value}</span>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}