import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const iconPaseador = L.divIcon({
  html: `<div class="mapa-marker-paseador">🐾</div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function MapaRastreo({ latitud, longitud, nombreMascota }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const lat = latitud ?? 3.4516;
    const lng = longitud ?? -76.5319;

    mapInstanceRef.current = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    markerRef.current = L.marker([lat, lng], { icon: iconPaseador })
      .addTo(mapInstanceRef.current)
      .bindPopup(
        `<div class="mapa-popup"><strong>${nombreMascota ?? "Tu mascota"}</strong><br/>Ubicación en tiempo real</div>`,
        { closeButton: false }
      )
      .openPopup();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || latitud == null || longitud == null) return;

    const nuevaPos = [latitud, longitud];
    markerRef.current.setLatLng(nuevaPos);
    mapInstanceRef.current.panTo(nuevaPos, { animate: true, duration: 0.8 });
  }, [latitud, longitud]);

  return <div ref={mapRef} className="mapa-rastreo-container" />;
}