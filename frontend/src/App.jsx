import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import MenuRegistro from './pages/Registro/MenuRegistro/MenuRegistro';
import RegistroDueno from './pages/Registro/RegistroDueno/RegistroDueno';
import RegistroPaseador from './pages/Registro/RegistroPaseador/RegistroPaseador';
import RegistroVeterinario from './pages/Registro/RegistroVeterinario/RegistroVeterinario';
import MenuDueno from './pages/Menu/MenuDueno/MenuDueno';
import MenuPaseador from './pages/Menu/MenuPaseador/MenuPaseador';
import MenuVeterinario from './pages/Menu/MenuVeterinario/MenuVeterinario';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Acceso */}
        <Route path="/"                     element={<Login />} />
        <Route path="/login"                element={<Login />} />

        {/* Registro */}
        <Route path="/register"             element={<MenuRegistro />} />
        <Route path="/register/dueno"       element={<RegistroDueno />} />
        <Route path="/register/paseador"    element={<RegistroPaseador />} />
        <Route path="/register/veterinario" element={<RegistroVeterinario />} />

        {/* Menús post-login */}
        <Route path="/menu/dueno"           element={<MenuDueno />} />
        <Route path="/menu/paseador"        element={<MenuPaseador />} />
        <Route path="/menu/veterinario"     element={<MenuVeterinario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;