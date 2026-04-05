const express = require('express');
const cors = require('cors');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
require('dotenv').config();

require('./config/db');
const authService = require('./services/auth.service');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Google no devolvio el correo'), null);
          }

          const user = await authService.getUserByEmail(email);
          if (!user) {
            return done(null, false, {
              message: 'No existe una cuenta registrada con ese correo. Registrate primero.',
              code: 'USER_NOT_FOUND',
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  const googleRoutes = require('./routes/google.routes');
  app.use('/auth', googleRoutes);
} else {
  console.warn('Google OAuth no esta configurado: faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET.');
}

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

app.get('/', (_req, res) => {
  res.send('Auth Service funcionando');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Auth Service corriendo en http://localhost:${PORT}`);
});
