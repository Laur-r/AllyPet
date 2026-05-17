import { useState, useEffect, useRef } from "react";
import { getMe, updateBasicInfo, updateFoto, updatePassword } from "../../services/user.service";
import "./ConfiguracionPerfil.css";

const BASE_URL = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3004";

// Genera iniciales para el avatar placeholder
const toInitials = (nombre = "") =>
  nombre.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();

// Componente de alerta reutilizable
const Alert = ({ tipo, mensaje }) =>
  mensaje ? (
    <div className={`config-alert ${tipo}`}>
      {tipo === "success" ? "✅" : "❌"} {mensaje}
    </div>
  ) : null;

export default function ConfiguracionPerfil() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Foto
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile]       = useState(null);
  const [fotoStatus, setFotoStatus]   = useState({ tipo: "", msg: "" });
  const [guardandoFoto, setGuardandoFoto] = useState(false);
  const fotoRef = useRef();

  // Info básica
  const [info, setInfo]             = useState({ telefono: "", ciudad: "" });
  const [infoStatus, setInfoStatus] = useState({ tipo: "", msg: "" });
  const [guardandoInfo, setGuardandoInfo] = useState(false);

  // Contraseña
  const [pass, setPass]             = useState({ passwordActual: "", passwordNuevo: "", confirmar: "" });
  const [passStatus, setPassStatus] = useState({ tipo: "", msg: "" });
  const [guardandoPass, setGuardandoPass] = useState(false);

  // ── Carga inicial ────────────────────────────────────────────────────────────
  useEffect(() => {
    getMe()
      .then((u) => {
        setUsuario(u);
        setInfo({ telefono: u.telefono ?? "", ciudad: u.ciudad ?? "" });
        if (u.foto_perfil) setFotoPreview(`${BASE_URL}${u.foto_perfil}`);
      })
      .catch(() => setInfoStatus({ tipo: "error", msg: "No se pudo cargar el perfil" }))
      .finally(() => setCargando(false));
  }, []);

  // ── Foto ─────────────────────────────────────────────────────────────────────
  const handleSeleccionarFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
    setFotoStatus({ tipo: "", msg: "" });
  };

 const handleGuardarFoto = async () => {
  if (!fotoFile) return;
  setGuardandoFoto(true);
  setFotoStatus({ tipo: "", msg: "" });
  try {
    const updated = await updateFoto(fotoFile);
    setUsuario((u) => ({ ...u, foto_perfil: updated.foto_perfil }));
    setFotoFile(null);
    setFotoStatus({ tipo: "success", msg: "Foto actualizada correctamente" });

    const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
    updatedUser.foto_perfil = updated.foto_perfil;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("userUpdated"));

  } catch (err) {
    setFotoStatus({ tipo: "error", msg: err.message });
  } finally {
    setGuardandoFoto(false);
  }
};

  // ── Info básica ───────────────────────────────────────────────────────────────
  const handleGuardarInfo = async () => {
    setGuardandoInfo(true);
    setInfoStatus({ tipo: "", msg: "" });
    try {
      const updated = await updateBasicInfo(info);
      setUsuario((u) => ({ ...u, ...updated }));
      setInfoStatus({ tipo: "success", msg: "Información actualizada correctamente" });
    } catch (err) {
      setInfoStatus({ tipo: "error", msg: err.message });
    } finally {
      setGuardandoInfo(false);
    }
  };

  // ── Contraseña ────────────────────────────────────────────────────────────────
  const handleGuardarPassword = async () => {
    if (pass.passwordNuevo !== pass.confirmar) {
      setPassStatus({ tipo: "error", msg: "Las contraseñas nuevas no coinciden" });
      return;
    }
    if (pass.passwordNuevo.length < 6) {
      setPassStatus({ tipo: "error", msg: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }
    setGuardandoPass(true);
    setPassStatus({ tipo: "", msg: "" });
    try {
      await updatePassword({ passwordActual: pass.passwordActual, passwordNuevo: pass.passwordNuevo });
      setPass({ passwordActual: "", passwordNuevo: "", confirmar: "" });
      setPassStatus({ tipo: "success", msg: "Contraseña actualizada correctamente" });
    } catch (err) {
      setPassStatus({ tipo: "error", msg: err.message });
    } finally {
      setGuardandoPass(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="config-page">
        <div className="config-container">
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-page">
      <div className="config-container">

        <div className="config-header">
          <h1>Configuración de cuenta</h1>
          <p>Administra tu información personal y seguridad</p>
        </div>

        {/* ── Foto de perfil ─────────────────────────────────────────────────── */}
        <div className="config-card">
          <h2>📷 Foto de perfil</h2>
          <div className="foto-section">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Foto de perfil" className="foto-avatar" />
            ) : (
              <div className="foto-placeholder">{toInitials(usuario?.nombre)}</div>
            )}
            <div className="foto-actions">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={fotoRef}
                style={{ display: "none" }}
                onChange={handleSeleccionarFoto}
              />
              <button className="btn-outline" onClick={() => fotoRef.current.click()}>
                Seleccionar imagen
              </button>
              {fotoFile && (
                <button
                  className="btn-primary"
                  onClick={handleGuardarFoto}
                  disabled={guardandoFoto}
                >
                  {guardandoFoto ? "Guardando..." : "Guardar foto"}
                </button>
              )}
              <small>JPG, PNG o WebP · máx. 5 MB</small>
            </div>
          </div>
          <Alert tipo={fotoStatus.tipo} mensaje={fotoStatus.msg} />
        </div>

        {/* ── Información básica ─────────────────────────────────────────────── */}
        <div className="config-card">
          <h2>👤 Información básica</h2>
          <div className="config-field">
            <label>Nombre</label>
            <input type="text" value={usuario?.nombre ?? ""} disabled />
          </div>
          <div className="config-field">
            <label>Correo electrónico</label>
            <input type="email" value={usuario?.correo ?? ""} disabled />
          </div>
          <div className="config-row">
            <div className="config-field">
              <label>Teléfono</label>
              <input
                type="tel"
                placeholder="Ej: 3001234567"
                value={info.telefono}
                onChange={(e) => setInfo({ ...info, telefono: e.target.value })}
              />
            </div>
            <div className="config-field">
              <label>Ciudad</label>
              <input
                type="text"
                placeholder="Ej: Cali"
                value={info.ciudad}
                onChange={(e) => setInfo({ ...info, ciudad: e.target.value })}
              />
            </div>
          </div>
          <button className="btn-primary" onClick={handleGuardarInfo} disabled={guardandoInfo}>
            {guardandoInfo ? "Guardando..." : "Guardar cambios"}
          </button>
          <Alert tipo={infoStatus.tipo} mensaje={infoStatus.msg} />
        </div>

        {/* ── Cambiar contraseña ─────────────────────────────────────────────── */}
        <div className="config-card">
          <h2>🔒 Cambiar contraseña</h2>
          <div className="config-field">
            <label>Contraseña actual</label>
            <input
              type="password"
              value={pass.passwordActual}
              onChange={(e) => setPass({ ...pass, passwordActual: e.target.value })}
            />
          </div>
          <div className="config-field">
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={pass.passwordNuevo}
              onChange={(e) => setPass({ ...pass, passwordNuevo: e.target.value })}
            />
          </div>
          <div className="config-field">
            <label>Confirmar nueva contraseña</label>
            <input
              type="password"
              value={pass.confirmar}
              onChange={(e) => setPass({ ...pass, confirmar: e.target.value })}
            />
          </div>
          <button className="btn-primary" onClick={handleGuardarPassword} disabled={guardandoPass}>
            {guardandoPass ? "Cambiando..." : "Cambiar contraseña"}
          </button>
          <Alert tipo={passStatus.tipo} mensaje={passStatus.msg} />
        </div>

      </div>
    </div>
  );
}