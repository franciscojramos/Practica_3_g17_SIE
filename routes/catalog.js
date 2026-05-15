const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

router.get('/catalogo', async (req, res, next) => {
  const q          = String(req.query.q          || '').trim();
  const asignatura = String(req.query.asignatura || '').trim();

  try {
    const conditions = [];
    const params     = {};

    if (q) {
      conditions.push('nombre_producto LIKE :q');
      params.q = `%${q}%`;
    }
    if (asignatura) {
      conditions.push('asignatura = :asignatura');
      params.asignatura = asignatura;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [productos] = await pool.execute(
      `SELECT gtin, nombre_producto, asignatura, precio, stock_actual, imagen_url
       FROM PRODUCTO
       ${where}
       ORDER BY nombre_producto ASC`,
      params
    );

    const [asigRows] = await pool.execute(
      `SELECT DISTINCT asignatura FROM PRODUCTO WHERE asignatura IS NOT NULL ORDER BY asignatura`
    );

    res.render('catalogo', {
      title: 'Catálogo — BookAR',
      productos,
      asignaturas: asigRows.map((r) => r.asignatura),
      filtroQ: q,
      filtroAsignatura: asignatura,
      page: 'catalogo',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
