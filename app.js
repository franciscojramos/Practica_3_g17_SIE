require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const { cargarEmpresa } = require('./middleware/empresa');
const { formatEur } = require('./utils/currency');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    name: 'bookar.sid',
    secret: process.env.SESSION_SECRET || 'solo-desarrollo-no-produccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.use((req, res, next) => {
  /** Evita ReferenceError en EJS (p. ej. error.ejs) si una vista no pasa `page`. */
  res.locals.page = null;
  res.locals.formatEur = formatEur;
  res.locals.cliente =
    req.session && req.session.clienteId
      ? {
          id: req.session.clienteId,
          nombre: req.session.clienteNombre,
          email: req.session.clienteEmail,
        }
      : null;
  if (req.session && req.session.flash) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  }
  next();
});

app.use(cargarEmpresa);

app.use('/', require('./routes/home'));
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/catalog'));
app.use('/', require('./routes/cart'));
app.use('/', require('./routes/checkout'));

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'No encontrado',
    message: 'La página solicitada no existe.',
    status: 404,
    page: 'error',
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).render('error', {
    title: 'Error',
    message: app.get('env') === 'development' ? err.message : 'Ocurrió un error en el servidor.',
    status,
    page: 'error',
  });
});

app.listen(PORT, () => {
  console.log(`BookAR tienda http://localhost:${PORT}`);
});
