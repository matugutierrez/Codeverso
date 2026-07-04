const express = require('express')
const { query } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { languages } = require('../data/languages')
const { logActivity } = require('../utils/activity')

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  const codes = await query(
    `SELECT id, language_slug, title, updated_at
       FROM saved_codes
      WHERE user_id = $1
        AND code_source IS DISTINCT FROM 'project'
        AND NOT EXISTS (SELECT 1 FROM project_files pf WHERE pf.code_id = saved_codes.id)
      ORDER BY updated_at DESC`,
    [req.session.user.id]
  )
  res.render('editor', { savedCodes: codes.rows, defaultLanguage: req.query.lang || 'javascript' })
})

router.get('/api/codigos/:id', requireAuth, async (req, res) => {
  const result = await query('SELECT * FROM saved_codes WHERE id = $1 AND user_id = $2', [req.params.id, req.session.user.id])
  if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })
  res.json(result.rows[0])
})

router.post('/api/codigos', requireAuth, async (req, res) => {
  const { title, language_slug, content, id } = req.body

  if (id) {
    const result = await query(
      'UPDATE saved_codes SET title=$1, language_slug=$2, content=$3, updated_at=now() WHERE id=$4 AND user_id=$5 RETURNING *',
      [title, language_slug, content, id, req.session.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })
    await logActivity(req.session.user.id)
    return res.json(result.rows[0])
  }

  const inserted = await query(
    'INSERT INTO saved_codes (user_id, language_slug, title, content) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.session.user.id, language_slug, title || 'Sin titulo', content || '']
  )
  await logActivity(req.session.user.id)
  res.json(inserted.rows[0])
})

router.post('/api/codigos/:id/eliminar', requireAuth, async (req, res) => {
  await query('DELETE FROM saved_codes WHERE id = $1 AND user_id = $2', [req.params.id, req.session.user.id])
  res.json({ ok: true })
})

router.post('/api/codigos/eliminar-todos', requireAuth, async (req, res) => {
  const result = await query(
    `DELETE FROM saved_codes
      WHERE user_id = $1
        AND code_source IS DISTINCT FROM 'project'
        AND NOT EXISTS (SELECT 1 FROM project_files pf WHERE pf.code_id = saved_codes.id)`,
    [req.session.user.id]
  )
  res.json({ ok: true, deleted: result.rowCount || 0 })
})

router.get('/api/lenguajes', requireAuth, (req, res) => {
  res.json(languages)
})

module.exports = router
