import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuRegistro from './pages/Registro/MenuRegistro/MenuRegistro';
import RegistroDueno from './pages/Registro/RegistroDueno/RegistroDueno';
import RegistroPaseador from './pages/Registro/RegistroPaseador/RegistroPaseador';
import RegistroVeterinario from './pages/Registro/RegistroVeterinario/RegistroVeterinario';
import Login from './pages/Login/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<Login />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/register"           element={<MenuRegistro />} />
        <Route path="/register/dueno"     element={<RegistroDueno />} />
        <Route path="/register/paseador"  element={<RegistroPaseador />} />
        <Route path="/register/veterinario" element={<RegistroVeterinario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
