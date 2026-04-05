const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('google callback error:', err);
      const redirectUrl = new URL(`${FRONTEND_URL}/login`);
      redirectUrl.searchParams.set('error', 'google');
      redirectUrl.searchParams.set('message', 'No se pudo completar el inicio de sesion con Google.');
      return res.redirect(redirectUrl.toString());
    }

    if (!user) {
      const redirectUrl = new URL(`${FRONTEND_URL}/login`);
      redirectUrl.searchParams.set('error', info?.code || 'google_user_not_found');
      redirectUrl.searchParams.set(
        'message',
        info?.message || 'No existe una cuenta registrada con ese correo. Registrate primero.'
      );
      return res.redirect(redirectUrl.toString());
    }

    req.user = user;
    return authController.googleCallbackHandler(req, res);
  })(req, res, next);
});

module.exports = router;

