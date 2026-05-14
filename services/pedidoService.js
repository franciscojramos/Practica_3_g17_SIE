const { withTransaction } = require('../config/database');

/**
 * Cierre de ciclo atómico: INSERT VENTA + DETALLE_VENTA + UPDATE PRODUCTO.stock_actual
 * en una sola transacción (BEGIN → COMMIT / ROLLBACK).
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {number} idCliente
 * @param {{ gtin: string, cantidad: number }[]} lineasCarrito
 * @returns {Promise<{ id_venta: number, total: string }>}
 */
async function crearPedidoAtomico(pool, idCliente, lineasCarrito) {
  if (!lineasCarrito?.length) {
    const err = new Error('El carrito está vacío.');
    err.code = 'CART_EMPTY';
    throw err;
  }

  return withTransaction(async (conn) => {
    const gtins = [...new Set(lineasCarrito.map((l) => String(l.gtin)))];
    const cantidadPorGtin = new Map();
    for (const linea of lineasCarrito) {
      const g = String(linea.gtin);
      const prev = cantidadPorGtin.get(g) || 0;
      cantidadPorGtin.set(g, prev + linea.cantidad);
    }

    const productos = new Map();
    for (const gtin of gtins) {
      const [rows] = await conn.execute(
        `SELECT gtin, nombre_producto, precio, stock_actual
         FROM PRODUCTO
         WHERE gtin = :gtin
         FOR UPDATE`,
        { gtin }
      );
      const row = rows[0];
      if (!row) {
        const err = new Error(`Producto no encontrado (GTIN ${gtin}).`);
        err.code = 'PRODUCT_NOT_FOUND';
        throw err;
      }
      const necesario = cantidadPorGtin.get(gtin);
      if (necesario > row.stock_actual) {
        const err = new Error(
          `Stock insuficiente para «${row.nombre_producto}». Disponible: ${row.stock_actual}, solicitado: ${necesario}.`
        );
        err.code = 'INSUFFICIENT_STOCK';
        throw err;
      }
      productos.set(gtin, {
        precio: Number(row.precio),
        nombre: row.nombre_producto,
        cantidad: necesario,
      });
    }

    let total = 0;
    for (const [, p] of productos) {
      total += p.precio * p.cantidad;
    }
    const totalFixed = total.toFixed(2);

    const [ventaRes] = await conn.execute(
      `INSERT INTO VENTA (id_cliente, total)
       VALUES (:id_cliente, :total)`,
      { id_cliente: idCliente, total: totalFixed }
    );
    const id_venta = ventaRes.insertId;

    for (const [gtin, p] of productos) {
      await conn.execute(
        `INSERT INTO DETALLE_VENTA (id_venta, gtin_producto, cantidad, precio_unitario)
         VALUES (:id_venta, :gtin_producto, :cantidad, :precio_unitario)`,
        {
          id_venta,
          gtin_producto: gtin,
          cantidad: p.cantidad,
          precio_unitario: p.precio.toFixed(2),
        }
      );

      const [upd] = await conn.execute(
        `UPDATE PRODUCTO
         SET stock_actual = stock_actual - :cant
         WHERE gtin = :gtin AND stock_actual >= :cant`,
        { cant: p.cantidad, gtin }
      );
      if (upd.affectedRows !== 1) {
        const err = new Error('No se pudo actualizar el stock. Reintente.');
        err.code = 'STOCK_UPDATE_FAILED';
        throw err;
      }
    }

    return { id_venta, total: totalFixed };
  });
}

module.exports = { crearPedidoAtomico };
