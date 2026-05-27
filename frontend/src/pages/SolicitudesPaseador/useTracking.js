import { useState, useRef, useCallback } from "react";

const TRACKING_URL = "http://localhost:3013/api/tracking";

  export function useTracking(solicitudId, initialActivo = false) {const [activo, setActivo] = useState(initialActivo);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const watchIdRef = useRef(null);
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // POST /api/tracking/:solicitudId/ubicacion
  const enviarUbicacion = useCallback(
    async (latitud, longitud) => {
      try {
        await fetch(`${TRACKING_URL}/${solicitudId}/ubicacion`, {
          method: "POST",
          headers,
          body: JSON.stringify({ latitud, longitud }),
        });
      } catch {
        // No interrumpir el tracking por un fallo puntual de red
      }
    },
    [solicitudId]
  );

  // POST /api/tracking/:solicitudId/iniciar
  const iniciarPaseo = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const res = await fetch(`${TRACKING_URL}/${solicitudId}/iniciar`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      if (!navigator.geolocation) {
        throw new Error("Este dispositivo no soporta geolocalización.");
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          enviarUbicacion(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          setError(`GPS: ${err.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );

      setActivo(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [solicitudId, enviarUbicacion]);

  // POST /api/tracking/:solicitudId/finalizar
  const finalizarPaseo = useCallback(async () => {
    setCargando(true);
    setError(null);

    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    try {
      const res = await fetch(`${TRACKING_URL}/${solicitudId}/finalizar`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      setActivo(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [solicitudId]);

  return { activo, cargando, error, iniciarPaseo, finalizarPaseo };
}