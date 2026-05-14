/** Formato monetario único (euros, España) para vistas y mensajes. */
const eurFmt = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

function formatEur(value) {
  return eurFmt.format(Number(value));
}

module.exports = { formatEur };
