import { useState } from 'react';

function App() {

  const [mensaje, setMensaje] = useState("");

  const crearUsuario = () => {
    fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: "Valentina",
        email: "vale@test.com",
        password: "123456"
      })
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.message);
      })
      .catch(error => {
        console.error(error);
        setMensaje("Error al crear usuario ❌");
      });
  };

  return (
    <div>
      <h1>AllyPet 🐾</h1>

      <button onClick={crearUsuario}>
        Crear usuario
      </button>

      <p>{mensaje}</p>
    </div>
  );
}

export default App;