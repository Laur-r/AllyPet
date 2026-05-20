const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

/* Asegura que exista la carpeta destino */
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext    = path.extname(file.originalname);
    const nombre = `pas_${req.params.usuarioId}_${file.fieldname}_${Date.now()}${ext}`;
    cb(null, nombre);
  },
});

const fileFilter = (req, file, cb) => {
  const permitidos = /jpeg|jpg|png|webp/;
  const esValido   = permitidos.test(path.extname(file.originalname).toLowerCase())
                  && permitidos.test(file.mimetype);
  esValido ? cb(null, true) : cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
});

module.exports = upload;