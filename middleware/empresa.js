const { pool } = require('../config/database');

const FALLBACK_BRAND = {
  nombre: 'BookAR',
  color_primario: '#004B7A',
  color_secundario: '#F58220',
};

/**
 * Carga la fila de EMPRESA (misión/visión/socios + colores SSOT) en cada petición.
 */
async function cargarEmpresa(req, res, next) {
  res.locals.empresaDbError = null;
  try {
    const [rows] = await pool.execute(
      `SELECT id_empresa, nombre, mision, vision, socios, color_primario, color_secundario
       FROM EMPRESA
       ORDER BY id_empresa ASC
       LIMIT 1`
    );
    const row = rows[0];
    res.locals.empresa = row || null;
    res.locals.brand = row
      ? {
          nombre: row.nombre || FALLBACK_BRAND.nombre,
          color_primario: row.color_primario || FALLBACK_BRAND.color_primario,
          color_secundario: row.color_secundario || FALLBACK_BRAND.color_secundario,
        }
      : FALLBACK_BRAND;
  } catch (err) {
    console.error('[cargarEmpresa]', err.code || '', err.message);
    res.locals.empresa = null;
    res.locals.empresaDbError = err.message || String(err);
    res.locals.brand = FALLBACK_BRAND;
  }
  next();
}

module.exports = { cargarEmpresa };
