const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Inicio — BookAR',
    page: 'home',
  });
});

module.exports = router;
