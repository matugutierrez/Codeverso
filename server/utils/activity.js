const { query } = require('../db')

async function logActivity(userId) {
  await query(
    `INSERT INTO activity_log (user_id, activity_date, count)
     VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (user_id, activity_date) DO UPDATE SET count = activity_log.count + 1`,
    [userId]
  )
}

module.exports = { logActivity }
