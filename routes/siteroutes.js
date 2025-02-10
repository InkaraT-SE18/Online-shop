const express = require('express');
const path = require('path');
const router = express.Router();

router.use(express.static(path.join(__dirname, '..', 'public')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

router.get('/bag', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'bag.html'));
});

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});
router.get('/catalog', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'catalog.html'));
});
router.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'Gallery.html'));
});

module.exports = router;