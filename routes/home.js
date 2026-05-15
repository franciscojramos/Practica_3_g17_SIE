const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [empleados] = await pool.execute(
      `SELECT id_empleado, nombre, apellidos, foto_url, puesto, bio FROM EMPLEADO ORDER BY id_empleado`
    );
    res.render('index', {
      title: 'Inicio — BookAR',
      page: 'home',
      empleados,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
