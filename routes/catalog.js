const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

router.get('/catalogo', async (req, res, next) => {
  try {
    const [productos] = await pool.execute(
      `SELECT gtin, nombre_producto, asignatura, precio, stock_actual, imagen_url
       FROM PRODUCTO
       ORDER BY nombre_producto ASC`
    );
    res.render('catalogo', {
      title: 'Catálogo — BookAR',
      productos,
      page: 'catalogo',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
