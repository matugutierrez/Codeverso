function computeStreak(dates) {
  if (dates.length === 0) return 0
  const daySet = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)))
  let streak = 0
  let cursor = new Date()

  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (daySet.has(key)) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

module.exports = { computeStreak }
