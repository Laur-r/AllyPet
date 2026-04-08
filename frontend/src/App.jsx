import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage         from './pages/Landing/LandingPage';
import Login               from './pages/Login/Login';
import MenuRegistro        from './pages/Registro/MenuRegistro/MenuRegistro';
import RegistroDueno       from './pages/Registro/RegistroDueno/RegistroDueno';
import RegistroPaseador    from './pages/Registro/RegistroPaseador/RegistroPaseador';
import RegistroVeterinario from './pages/Registro/RegistroVeterinario/RegistroVeterinario';

import MenuDueno      from './pages/Menu/MenuDueno/MenuDueno';
import MenuPaseador   from './pages/Menu/MenuPaseador/MenuPaseador';
import MenuVeterinario from './pages/Menu/MenuVeterinario/MenuVeterinario';

import Mascotas          from './pages/Mascotas/Mascotas';
import PerfilVeterinario from './pages/PerfilVeterinario/PerfilVeterinario';
import PerfilPaseador    from './pages/PerfilPaseador/PerfilPaseador';

// Nuevas páginas admin
import MenuAdmin from './pages/MenuAdmin/MenuAdmin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Acceso */}
        <Route path="/login" element={<Login />} />

        {/* Registro */}
        <Route path="/register"             element={<MenuRegistro />} />
        <Route path="/register/dueno"       element={<RegistroDueno />} />
        <Route path="/register/paseador"    element={<RegistroPaseador />} />
        <Route path="/register/veterinario" element={<RegistroVeterinario />} />

        {/* Menú Dueño con rutas anidadas */}
        <Route path="/menu/dueno" element={<MenuDueno />}>
          <Route index element={<h2>Bienvenido dueño</h2>} />
          <Route path="mascotas" element={<Mascotas />} />
        </Route>

        {/* Menú Paseador con rutas anidadas */}
        <Route path="/menu/paseador" element={<MenuPaseador />}>
          <Route index element={<h2>Bienvenido paseador</h2>} />
          <Route path="perfil"        element={<PerfilPaseador />} />
          <Route path="reservas"      element={<h2>Reservas</h2>} />
          <Route path="mensajes"      element={<h2>Mensajes</h2>} />
          <Route path="configuracion" element={<h2>Configuración</h2>} />
        </Route>

        {/* Menú Veterinario con rutas anidadas */}
        <Route path="/menu/veterinario" element={<MenuVeterinario />}>
          <Route index element={<h2>Bienvenido veterinario</h2>} />
          <Route path="perfil"        element={<PerfilVeterinario />} />
          <Route path="citas"         element={<h2>Citas</h2>} />
          <Route path="mensajes"      element={<h2>Mensajes</h2>} />
          <Route path="configuracion" element={<h2>Configuración</h2>} />
        </Route>

        <Route 
          path="/menu/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <MenuAdmin />
            </ProtectedRoute>
          } 
        />

        {/* Redirección Dashboard genérico */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
