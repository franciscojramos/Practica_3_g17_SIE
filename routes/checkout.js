const express = require('express');
const { pool } = require('../config/database');
const { requireCliente } = require('../middleware/auth');
const { crearPedidoAtomico } = require('../services/pedidoService');
const { formatEur } = require('../utils/currency');

const router = express.Router();

router.post('/checkout', requireCliente, async (req, res, next) => {
  const cart = req.session.cart || [];
  try {
    const lineas = cart.map((l) => ({
      gtin: String(l.gtin),
      cantidad: l.cantidad,
    }));
    const resultado = await crearPedidoAtomico(pool, req.session.clienteId, lineas);
    req.session.cart = [];
    req.session.flash = `Venta #${resultado.id_venta} confirmada. Total: ${formatEur(resultado.total)}`;
    res.redirect('/carrito');
  } catch (err) {
    if (err.code === 'CART_EMPTY') {
      req.session.flash = err.message;
      return res.redirect('/carrito');
    }
    if (err.code === 'INSUFFICIENT_STOCK' || err.code === 'PRODUCT_NOT_FOUND') {
      req.session.flash = err.message;
      return res.redirect('/carrito');
    }
    next(err);
  }
});

module.exports = router;
