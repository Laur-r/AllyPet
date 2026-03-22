# AllyPet
Tu aliado digital para el cuidado y bienestar de tus mascotas.

**Descripción**
AllyPet es una plataforma que conecta a dueños de mascotas con servicios de cuidado, veterinarios y una comunidad apasionada por el bienestar animal. Desde agendar citas veterinarias hasta encontrar paseadores de confianza, AllyPet centraliza todo lo que tu mascota necesita en un solo lugar.

**Funcionalidades**
Citas veterinarias — Agenda y gestiona consultas con veterinarios cercanos
Paseadores — Encuentra paseadores verificados en tu zona
Historial médico — Lleva el registro de vacunas, desparasitaciones y tratamientos
Tienda — Productos y alimentos recomendados por veterinarios
Comunidad — Conecta con otros dueños de mascotas

**Tecnologías**
Capa - Tecnología
Frontend - React + Vite
Backend - Node.js + Express
Base de datos - PostgreSQL
Autenticación - JWT
Estilos - Tailwind CSS

**Instalación y uso**
Requisitos previos:

Node.js v18 o superior
PostgreSQL 14+
npm o yarn

**Pasos**
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/AllyPet.git
cd AllyPet

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita el archivo .env con tus credenciales

# 4. Correr migraciones de base de datos
npm run db:migrate

# 5. Iniciar en modo desarrollo
npm run dev

La aplicación estará disponible en http://localhost:3000.

**Estructura del proyecto**
AllyPet/
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── pages/            # Páginas de la aplicación
│   ├── services/         # Lógica de negocio y llamadas a API
│   ├── hooks/            # Custom hooks de React
│   └── utils/            # Funciones utilitarias
├── server/
│   ├── routes/           # Rutas de la API
│   ├── controllers/      # Controladores
│   ├── models/           # Modelos de base de datos
│   └── middleware/       # Middlewares
├── public/               # Archivos estáticos
├── .env.example          # Variables de entorno de ejemplo
├── .gitignore
└── README.md

**Cómo contribuir**
¡Las contribuciones son bienvenidas! Sigue estos pasos:

1. Haz un fork del repositorio
   
2. Crea una rama para tu función: git checkout -b feature/nombre-de-la-funcion

3. Realiza tus cambios y haz commit: git commit -m "feat: agrega nueva funcionalidad"

4. Sube los cambios a tu fork: git push origin feature/nombre-de-la-funcion

5. Abre un Pull Request hacia la rama develop

**Convención de commits**
Usamos Conventional Commits:
Prefijo - Uso
feat: - Nueva funcionalidad
fix: - Corrección de bug
docs: - Cambios en documentación\
style: - Formato, sin cambios de lógica 
refactor: - Refactorización de código
test: - Agregar o modificar tests

**Reportar problemas**
Si encuentras un bug o tienes una sugerencia, por favor abre un issue con la mayor cantidad de detalles posible.

Hecho con ❤️ por el equipo de AllyPet.
