const express = require('express')
const { query } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { languages } = require('../data/languages')
const { logActivity } = require('../utils/activity')

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  const langsWithExercises = await query('SELECT DISTINCT language_slug FROM exercises ORDER BY language_slug ASC')
  res.render('exercises', { availableLanguages: langsWithExercises.rows.map((r) => r.language_slug) })
})

router.get('/api/aleatorio', requireAuth, async (req, res) => {
  const { language, difficulty, exclude } = req.query
  if (!language) return res.status(400).json({ error: 'Falta el lenguaje' })

  const params = [language]
  let sql = 'SELECT * FROM exercises WHERE language_slug = $1'

  if (difficulty && difficulty !== 'todas') {
    params.push(difficulty)
    sql += ` AND difficulty = $${params.length}`
  }

  const excludeIds = (exclude || '').split(',').map((x) => Number(x)).filter((x) => !isNaN(x) && x > 0)
  if (excludeIds.length > 0) {
    params.push(excludeIds)
    sql += ` AND id != ALL($${params.length}::int[])`
  }

  sql += ' ORDER BY random() LIMIT 1'

  const result = await query(sql, params)
  if (result.rows.length === 0) {
    const retry = await query(
      'SELECT * FROM exercises WHERE language_slug = $1 ORDER BY random() LIMIT 1',
      [language]
    )
    if (retry.rows.length === 0) {
      return res.json({ empty: true, message: 'Todavia no hay ejercicios cargados para este lenguaje. Prueba con otro mientras se suman mas.' })
    }
    return res.json(retry.rows[0])
  }

  res.json(result.rows[0])
})

router.post('/api/completar', requireAuth, async (req, res) => {
  const { exercise_id, status, code } = req.body

  await query(
    `INSERT INTO user_exercise_progress (user_id, exercise_id, status, attempts, last_code, completed_at)
     VALUES ($1, $2, $3, 1, $4, CASE WHEN $3 = 'completado' THEN now() ELSE NULL END)
     ON CONFLICT (user_id, exercise_id) DO UPDATE
       SET status = $3, attempts = user_exercise_progress.attempts + 1, last_code = $4,
           completed_at = CASE WHEN $3 = 'completado' THEN now() ELSE user_exercise_progress.completed_at END`,
    [req.session.user.id, exercise_id, status, code || null]
  )

  if (status === 'completado') await logActivity(req.session.user.id)
  res.json({ ok: true })
})

router.post('/api/errores', requireAuth, async (req, res) => {
  const { language_slug, description, code_snippet } = req.body
  if (!description) return res.status(400).json({ error: 'Falta la descripcion del error' })

  const inserted = await query(
    'INSERT INTO user_errors_log (user_id, language_slug, description, code_snippet) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.session.user.id, language_slug, description, code_snippet || null]
  )
  res.json(inserted.rows[0])
})

module.exports = router
