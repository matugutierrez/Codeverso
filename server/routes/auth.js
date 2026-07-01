const express = require('express')
const bcrypt = require('bcryptjs')
const { query } = require('../db')

const router = express.Router()

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/')
  res.render('login', { error: null })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const result = await query('SELECT * FROM users WHERE username = $1', [username])
  const u = result.rows[0]

  if (!u || !(await bcrypt.compare(password, u.password_hash))) {
    return res.render('login', { error: 'Usuario o contrasena incorrectos' })
  }

  req.session.user = { id: u.id, username: u.username, fullName: u.full_name }
  res.redirect('/')
})

router.get('/registro', (req, res) => {
  if (req.session.user) return res.redirect('/')
  res.render('register', { error: null })
})

router.post('/registro', async (req, res) => {
  const { username, password, full_name, email } = req.body

  if (!username || !password || !full_name) {
    return res.render('register', { error: 'Completa todos los campos obligatorios' })
  }

  const existing = await query('SELECT id FROM users WHERE username = $1', [username])
  if (existing.rows.length > 0) {
    return res.render('register', { error: 'Ese nombre de usuario ya existe' })
  }

  const hash = await bcrypt.hash(password, 10)
  const inserted = await query(
    'INSERT INTO users (username, password_hash, full_name, email) VALUES ($1,$2,$3,$4) RETURNING id',
    [username, hash, full_name, email || null]
  )

  req.session.user = { id: inserted.rows[0].id, username, fullName: full_name }
  res.redirect('/')
})

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'))
})

module.exports = router
