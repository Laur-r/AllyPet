import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage              from './pages/Landing/LandingPage';
import Login                   from './pages/Login/Login';
import MenuRegistro             from './pages/Registro/MenuRegistro/MenuRegistro';
import RegistroDueno            from './pages/Registro/RegistroDueno/RegistroDueno';
import RegistroPaseador         from './pages/Registro/RegistroPaseador/RegistroPaseador';
import BusquedaPaseadores       from './pages/Busqueda/BusquedaPaseadores/BusquedaPaseadores';
import PerfilPublicoPaseador    from './pages/PerfilPublicoPaseador/PerfilPublicoPaseador';
import RegistroVeterinario      from './pages/Registro/RegistroVeterinario/RegistroVeterinario';
import BusquedaVeterinarias     from './pages/Busqueda/BusquedaVeterinarias/BusquedaVeterinarias';
import PerfilPublicoVeterinaria from './pages/PerfilPublicoVeterinaria/PerfilPublicoVeterinaria';
import RegistroCuidador from './pages/Registro/RegistroCuidador/RegistroCuidador';

import MenuDueno       from './pages/Menu/MenuDueno/MenuDueno';
import MenuPaseador    from './pages/Menu/MenuPaseador/MenuPaseador';
import MenuVeterinario from './pages/Menu/MenuVeterinario/MenuVeterinario';
import MenuCuidador from './pages/Menu/MenuCuidador/MenuCuidador';

import Pacientes from './pages/Pacientes/Pacientes';
import CarnetVet from './pages/Pacientes/CarnetVet';

import Mascotas          from './pages/Mascotas/Mascotas';
import PerfilVeterinario from './pages/PerfilVeterinario/PerfilVeterinario';
import PerfilPaseador    from './pages/PerfilPaseador/PerfilPaseador';
import PerfilDueno       from './pages/Profiles/ProfileOwner/Profilepage';

import MenuAdmin           from './pages/MenuAdmin/MenuAdmin';
import ProtectedRoute      from './components/ProtectedRoute';
import SolicitarPaseo      from './pages/SolicitarPaseo/SolicitarPaseo';
import SolicitudesPaseador from './pages/SolicitudesPaseador/SolicitudesPaseador';
import HistorialDueno      from './pages/HistorialDueno/HistorialDueno';
import HistorialPaseador   from './pages/HistorialPaseador/HistorialPaseador';
import HistorialMedico     from './pages/HistorialMedico/HistorialMedico';
import Carnet              from './pages/Carnet/Carnet';
import Calificaciones      from './pages/Calificaciones/Calificaciones';
import Configuracion         from './pages/Configuracion/ConfiguracionPerfil';
import DashboardDueno      from './pages/DashboardDueno/DashboardDueno';
import Mensajes            from './pages/Mensajes/Mensajes';
import Notificaciones      from './pages/Notificaciones/Notificaciones';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Acceso */}
        <Route path="/login"   element={<Login />} />
        <Route path="/profile" element={<PerfilDueno />} />

        {/* Registro */}
        <Route path="/register"             element={<MenuRegistro />} />
        <Route path="/register/dueno"       element={<RegistroDueno />} />
        <Route path="/register/paseador"    element={<RegistroPaseador />} />
        <Route path="/register/veterinario" element={<RegistroVeterinario />} />
        <Route path="/register/cuidador"    element={<RegistroCuidador />} />

        {/* ── Menú Dueño ── */}
        <Route path="/menu/dueno" element={<MenuDueno />}>
          <Route index element={<DashboardDueno />} />
          <Route path="mascotas"                    element={<Mascotas />} />
          <Route path="mascotas/:petId/carnet"      element={<Carnet />} />
          <Route path="mascotas/:petId/historial"   element={<HistorialMedico />} />
          <Route path="historial-solicitudes"       element={<HistorialDueno />} />
          <Route path="buscar/paseadores"           element={<BusquedaPaseadores />} />
          <Route path="buscar/veterinarias"         element={<BusquedaVeterinarias />} />
          <Route path="paseador/:usuarioId"         element={<PerfilPublicoPaseador />} />
          <Route path="veterinaria/:usuarioId"      element={<PerfilPublicoVeterinaria />} />
          <Route path="solicitar-paseo/:paseadorId" element={<SolicitarPaseo />} />
          <Route path="calificaciones"              element={<Calificaciones />} />
          <Route path="configuracion"               element={<Configuracion />} />
          <Route path="mensajes"                    element={<Mensajes />} />
          <Route path="notificaciones"              element={<Notificaciones />} />
        </Route>

        {/* ── Menú Paseador ── */}
        <Route path="/menu/paseador" element={<MenuPaseador />}>
          <Route index element={<h2>Bienvenido paseador</h2>} />
          <Route path="perfil"         element={<PerfilPaseador />} />
          <Route path="solicitudes"    element={<SolicitudesPaseador />} />
          <Route path="historial"      element={<HistorialPaseador />} />
          <Route path="reservas"       element={<h2>Reservas</h2>} />
          <Route path="configuracion"               element={<Configuracion />} />
          <Route path="mensajes"       element={<Mensajes />} />
          <Route path="notificaciones" element={<Notificaciones />} />
        </Route>

        {/* ── Menú Veterinario ── */}
        <Route path="/menu/veterinario" element={<MenuVeterinario />}>
          <Route index element={<h2>Bienvenido veterinario</h2>} />
          <Route path="perfil"           element={<PerfilVeterinario />} />
          <Route path="pacientes"        element={<Pacientes />} />
          <Route path="pacientes/:petId" element={<CarnetVet />} />
          <Route path="citas"            element={<h2>Citas</h2>} />
          <Route path="configuracion"               element={<Configuracion />} />
          <Route path="mensajes"         element={<Mensajes />} />
          <Route path="notificaciones"   element={<Notificaciones />} />
        </Route>

        {/* ── Menú Cuidador ── */}
        <Route path="/menu/cuidador" element={<MenuCuidador />}>
          <Route index element={<h2>Bienvenido cuidador</h2>} />
          <Route path="perfil"         element={<h2>Mi Perfil Comercial</h2>} />
          <Route path="solicitudes"    element={<h2>Solicitudes recibidas</h2>} />
          <Route path="configuracion"  element={<Configuracion />} />
          <Route path="mensajes"       element={<Mensajes />} />
          <Route path="notificaciones" element={<Notificaciones />} />
        </Route>

        {/* Admin */}
        <Route
          path="/menu/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <MenuAdmin />
            </ProtectedRoute>
          }
        />

        {/* Redirección */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;