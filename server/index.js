require('dotenv').config()
const express = require('express')
require('express-async-errors')
const path = require('path')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)

const { pool } = require('./db')
const { attachUser } = require('./middleware/auth')

const authRoutes = require('./routes/auth')
const editorRoutes = require('./routes/editor')
const exerciseRoutes = require('./routes/exercises')
const accountRoutes = require('./routes/account')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', 'views'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use(
  session({
    store: new pgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'codeverso-secreto',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }
  })
)
app.use(attachUser)

app.use('/', authRoutes)
app.get('/', (req, res) => res.redirect(req.session.user ? '/codear' : '/login'))
app.use('/codear', editorRoutes)
app.use('/ejercicios', exerciseRoutes)
app.use('/cuenta', accountRoutes)

app.use((req, res) => {
  res.status(404).render('error', { message: 'Pagina no encontrada' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).render('error', { message: 'Ocurrio un error inesperado' })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Codeverso corriendo en el puerto ${port}`)
})
