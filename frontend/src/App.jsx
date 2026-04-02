import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuRegistro      from './pages/MenuRegistro';
import RegistroDueno     from './pages/RegistroDueno';
import RegistroPaseador  from './pages/RegistroPaseador';
import RegistroVeterinario from './pages/RegistroVeterinario';
import Login from './pages/Login';

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
