function requireCliente(req, res, next) {
  if (!req.session?.clienteId) {
    const nextUrl = encodeURIComponent(req.originalUrl || '/carrito');
    return res.redirect(`/login?next=${nextUrl}`);
  }
  next();
}

module.exports = { requireCliente };
