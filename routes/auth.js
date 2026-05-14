const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.clienteId) return res.redirect('/');
  res.render('login', {
    title: 'Ingresar — BookAR',
    error: null,
    page: 'login',
    next: req.query.next || '/carrito',
  });
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  const nextPath = req.body.next || '/carrito';
  try {
    const [rows] = await pool.execute(
      `SELECT id_cliente, email, password, nombre FROM CLIENTE WHERE email = :email`,
      { email: String(email || '').trim().toLowerCase() }
    );
    const cliente = rows[0];
    if (!cliente || !(await bcrypt.compare(String(password || ''), cliente.password))) {
      return res.status(401).render('login', {
        title: 'Ingresar — BookAR',
        error: 'Credenciales incorrectas.',
        page: 'login',
        next: nextPath,
      });
    }
    req.session.clienteId = cliente.id_cliente;
    req.session.clienteNombre = cliente.nombre;
    req.session.clienteEmail = cliente.email;
    return res.redirect(nextPath.startsWith('/') ? nextPath : '/carrito');
  } catch (err) {
    next(err);
  }
});

router.get('/registro', (req, res) => {
  if (req.session.clienteId) return res.redirect('/');
  res.render('registro', { title: 'Registro — BookAR', error: null, page: 'registro' });
});

router.post('/registro', async (req, res, next) => {
  const nombre = String(req.body.nombre || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const nif_cif = String(req.body.nif_cif || '').trim() || null;
  if (!nombre || !email || password.length < 6) {
    return res.status(400).render('registro', {
      title: 'Registro — BookAR',
      error: 'Complete nombre, email y una contraseña de al menos 6 caracteres.',
      page: 'registro',
    });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO CLIENTE (nombre, email, password, nif_cif) VALUES (:nombre, :email, :hash, :nif_cif)`,
      { nombre, email, hash, nif_cif }
    );
    req.session.clienteId = result.insertId;
    req.session.clienteNombre = nombre;
    req.session.clienteEmail = email;
    res.redirect('/catalogo');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).render('registro', {
        title: 'Registro — BookAR',
        error: 'Ese email ya está registrado.',
        page: 'registro',
      });
    }
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
