const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `user_${req.params.id}_${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });
module.exports = upload;