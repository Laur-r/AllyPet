import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Login/Login';
import MenuRegistro from './pages/Registro/MenuRegistro/MenuRegistro';
import RegistroDueno from './pages/Registro/RegistroDueno/RegistroDueno';
import RegistroPaseador from './pages/Registro/RegistroPaseador/RegistroPaseador';
import RegistroVeterinario from './pages/Registro/RegistroVeterinario/RegistroVeterinario';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                       element={<LandingPage />} />
        <Route path="/login"                  element={<Login />} />
        <Route path="/register"               element={<MenuRegistro />} />
        <Route path="/register/dueno"         element={<RegistroDueno />} />
        <Route path="/register/paseador"      element={<RegistroPaseador />} />
        <Route path="/register/veterinario"   element={<RegistroVeterinario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
