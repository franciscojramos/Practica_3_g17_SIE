#!/usr/bin/env node
/**
 * Crea la base (si no existe) y ejecuta sql/schema.sql (tablas + datos EMPRESA + 12 productos).
 * Requiere credenciales válidas en .env (sobre todo DB_PASSWORD si MariaDB no admite root sin clave).
 *
 * Uso: npm run db:setup
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SCHEMA = path.join(__dirname, '..', 'sql', 'schema.sql');

async function main() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const dbName = process.env.DB_NAME || 'bookar_p1';

  console.log(`Conectando a MariaDB (${user}@${host}:${port})…`);

  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });
  } catch (e) {
    if (e.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`
❌ Acceso denegado. MariaDB exige contraseña para '${user}'.

   Edita tu archivo .env y pon la contraseña real:
   DB_PASSWORD=tu_contraseña_mariadb

   Luego vuelve a ejecutar: npm run db:setup
`);
      process.exit(1);
    }
    throw e;
  }

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName.replace(/`/g, '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${dbName.replace(/`/g, '')}\``);

  const sql = fs.readFileSync(SCHEMA, 'utf8');
  console.log(`Ejecutando ${path.relative(process.cwd(), SCHEMA)}…`);
  await conn.query(sql);

  const [[empresa]] = await conn.query('SELECT COUNT(*) AS n FROM EMPRESA');
  const [[prod]] = await conn.query('SELECT COUNT(*) AS n FROM PRODUCTO');
  console.log(`✓ EMPRESA: ${empresa.n} fila(s). PRODUCTO: ${prod.n} fila(s).`);

  await conn.end();
  console.log('Listo. Reinicia la app (npm start) y recarga Inicio.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
