import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage         from './pages/Landing/LandingPage';
import ProfilePage         from './pages/Profiles/ProfileOwner/Profilepage';
import Login               from './pages/Login/Login';
import MenuRegistro        from './pages/Registro/MenuRegistro/MenuRegistro';
import RegistroDueno       from './pages/Registro/RegistroDueno/RegistroDueno';
import RegistroPaseador    from './pages/Registro/RegistroPaseador/RegistroPaseador';
import RegistroVeterinario from './pages/Registro/RegistroVeterinario/RegistroVeterinario';
import MenuDueno           from './pages/Menu/MenuDueno/MenuDueno';
import MenuPaseador        from './pages/Menu/MenuPaseador/MenuPaseador';
import MenuVeterinario     from './pages/Menu/MenuVeterinario/MenuVeterinario';
import Mascotas            from './pages/Mascotas/Mascotas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/"        element={<LandingPage />} />

        {/* Perfil */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Acceso */}
        <Route path="/login"   element={<Login />} />

        {/* Registro */}
        <Route path="/register"                 element={<MenuRegistro />} />
        <Route path="/register/dueno"           element={<RegistroDueno />} />
        <Route path="/register/paseador"        element={<RegistroPaseador />} />
        <Route path="/register/veterinario"     element={<RegistroVeterinario />} />

        {/* Menús */}
        <Route path="/menu/dueno" element={<MenuDueno />}>
          <Route index element={<h2>Bienvenido dueño</h2>} />
          <Route path="mascotas" element={<Mascotas />} />
        </Route>
        <Route path="/menu/paseador"    element={<MenuPaseador />} />
        <Route path="/menu/veterinario" element={<MenuVeterinario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;