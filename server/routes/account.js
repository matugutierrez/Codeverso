const express = require('express')
const bcrypt = require('bcryptjs')
const { query } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { computeStreak } = require('../utils/streak')

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  const userId = req.session.user.id

  const savedCodesCount = await query('SELECT COUNT(*) FROM saved_codes WHERE user_id = $1 AND (code_source IS NULL OR code_source = $2)', [userId, 'editor'])
  const exercisesByLang = await query(
    `SELECT e.language_slug, COUNT(*) FILTER (WHERE p.status = 'completado') AS completados, COUNT(*) AS intentados
     FROM user_exercise_progress p JOIN exercises e ON e.id = p.exercise_id
     WHERE p.user_id = $1 GROUP BY e.language_slug ORDER BY completados DESC`,
    [userId]
  )
  const totalCompleted = await query(
    `SELECT COUNT(*) FROM user_exercise_progress WHERE user_id = $1 AND status = 'completado'`,
    [userId]
  )
  const activity = await query('SELECT activity_date FROM activity_log WHERE user_id = $1', [userId])
  const streak = computeStreak(activity.rows.map((r) => r.activity_date))

  const projects = await query('SELECT * FROM codeverso_projects WHERE user_id = $1 ORDER BY updated_at DESC', [userId])
  const goals = await query('SELECT * FROM learning_goals WHERE user_id = $1 ORDER BY created_at DESC', [userId])
  const errorsLog = await query('SELECT * FROM user_errors_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 25', [userId])

  const recentActivity = await query(
    `SELECT activity_date, count FROM activity_log WHERE user_id = $1 AND activity_date > CURRENT_DATE - INTERVAL '14 days' ORDER BY activity_date ASC`,
    [userId]
  )

  res.render('account', {
    savedCodesCount: savedCodesCount.rows[0].count,
    exercisesByLang: exercisesByLang.rows,
    totalCompleted: totalCompleted.rows[0].count,
    streak,
    projects: projects.rows,
    goals: goals.rows,
    errorsLog: errorsLog.rows,
    recentActivity: recentActivity.rows
  })
})

router.post('/proyectos', requireAuth, async (req, res) => {
  const { name, description, language_slug, status } = req.body
  await query(
    'INSERT INTO codeverso_projects (user_id, name, description, language_slug, status) VALUES ($1,$2,$3,$4,$5)',
    [req.session.user.id, name, description || null, language_slug || null, status || 'idea']
  )
  res.redirect('/cuenta')
})

router.post('/proyectos/:id/estado', requireAuth, async (req, res) => {
  await query('UPDATE codeverso_projects SET status = $1, updated_at = now() WHERE id = $2 AND user_id = $3', [req.body.status, req.params.id, req.session.user.id])
  res.redirect('/cuenta')
})

router.post('/proyectos/:id/eliminar', requireAuth, async (req, res) => {
  await query(
    `DELETE FROM saved_codes WHERE code_source = 'project' AND id IN (SELECT code_id FROM project_files WHERE project_id = $1)`,
    [req.params.id]
  )
  await query('DELETE FROM codeverso_projects WHERE id = $1 AND user_id = $2', [req.params.id, req.session.user.id])
  res.redirect('/cuenta')
})

router.post('/objetivos', requireAuth, async (req, res) => {
  const { language_slug, priority, notes } = req.body
  await query(
    'INSERT INTO learning_goals (user_id, language_slug, priority, notes) VALUES ($1,$2,$3,$4)',
    [req.session.user.id, language_slug, priority || 'media', notes || null]
  )
  res.redirect('/cuenta')
})

router.post('/objetivos/:id/eliminar', requireAuth, async (req, res) => {
  await query('DELETE FROM learning_goals WHERE id = $1 AND user_id = $2', [req.params.id, req.session.user.id])
  res.redirect('/cuenta')
})

router.post('/errores/:id/eliminar', requireAuth, async (req, res) => {
  await query('DELETE FROM user_errors_log WHERE id = $1 AND user_id = $2', [req.params.id, req.session.user.id])
  res.redirect('/cuenta')
})

router.post('/perfil/password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body
  const result = await query('SELECT * FROM users WHERE id = $1', [req.session.user.id])
  const u = result.rows[0]

  if (!u || !(await bcrypt.compare(current_password, u.password_hash))) {
    return res.redirect('/cuenta?error=password')
  }

  const hash = await bcrypt.hash(new_password, 10)
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.session.user.id])
  res.redirect('/cuenta')
})

module.exports = router
