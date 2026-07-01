require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { pool } = require('./db')
const exercises = require('./data/exercises')

async function run() {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8')
  await pool.query(schema)

  const count = await pool.query('SELECT count(*) FROM exercises')
  if (Number(count.rows[0].count) === 0) {
    for (const ex of exercises) {
      await pool.query(
        `INSERT INTO exercises (language_slug, difficulty, type, title, statement, starter_code, tips, common_errors, solution_hint)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [ex.languageSlug, ex.difficulty, ex.type, ex.title, ex.statement, ex.starterCode, JSON.stringify(ex.tips), JSON.stringify(ex.commonErrors), ex.solutionHint]
      )
    }
    console.log(`${exercises.length} ejercicios cargados.`)
  } else {
    console.log('Los ejercicios ya estaban cargados, no se vuelven a insertar.')
  }

  console.log('Migracion completa.')
  await pool.end()
}

run().catch((err) => {
  console.error('Error en la migracion', err)
  process.exit(1)
})
