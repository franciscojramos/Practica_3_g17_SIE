const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

router.post('/carrito/agregar', async (req, res, next) => {
  const gtin = String(req.body.gtin || '').trim();
  const cantidad = Math.max(1, parseInt(req.body.cantidad, 10) || 1);
  if (!gtin || gtin.length > 14) return res.redirect('/catalogo');

  try {
    const [rows] = await pool.execute(
      `SELECT gtin, stock_actual FROM PRODUCTO WHERE gtin = :gtin`,
      { gtin }
    );
    const p = rows[0];
    if (!p) return res.redirect('/catalogo');

    const cart = getCart(req);
    const existing = cart.find((l) => String(l.gtin) === gtin);
    const actual = (existing ? existing.cantidad : 0) + cantidad;
    if (actual > p.stock_actual) {
      req.session.flash = `Stock insuficiente para este producto (máx. ${p.stock_actual}).`;
      return res.redirect('/catalogo');
    }
    if (existing) existing.cantidad = actual;
    else cart.push({ gtin, cantidad });
    res.redirect('/carrito');
  } catch (err) {
    next(err);
  }
});

router.post('/carrito/actualizar', (req, res) => {
  const cart = getCart(req);
  for (const key of Object.keys(req.body)) {
    if (!key.startsWith('qty_')) continue;
    const gtin = key.slice(4);
    const qty = Math.max(0, parseInt(req.body[key], 10) || 0);
    const line = cart.find((l) => String(l.gtin) === gtin);
    if (line) line.cantidad = qty;
  }
  req.session.cart = cart.filter((l) => l.cantidad > 0);
  res.redirect('/carrito');
});

router.get('/carrito', async (req, res, next) => {
  const cart = getCart(req);

  if (!cart.length) {
    return res.render('carrito', {
      title: 'Carrito — BookAR',
      lineas: [],
      total: '0.00',
      page: 'carrito',
    });
  }

  try {
    const gtins = cart.map((l) => l.gtin);
    const placeholders = gtins.map(() => '?').join(',');
    const [productos] = await pool.query(
      `SELECT gtin, nombre_producto, precio, stock_actual FROM PRODUCTO WHERE gtin IN (${placeholders})`,
      gtins
    );
    const map = new Map(productos.map((p) => [String(p.gtin), p]));
    const lineas = [];
    let total = 0;
    for (const line of cart) {
      const p = map.get(String(line.gtin));
      if (!p) continue;
      const precio = Number(p.precio);
      const sub = precio * line.cantidad;
      total += sub;
      lineas.push({
        gtin: line.gtin,
        nombre: p.nombre_producto,
        cantidad: line.cantidad,
        precio_unitario: precio.toFixed(2),
        subtotal: sub.toFixed(2),
        stock_actual: p.stock_actual,
      });
    }
    res.render('carrito', {
      title: 'Carrito — BookAR',
      lineas,
      total: total.toFixed(2),
      page: 'carrito',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
