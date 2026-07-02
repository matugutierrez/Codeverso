CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  language_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  language_slug TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'facil',
  type TEXT NOT NULL DEFAULT 'practica',
  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  starter_code TEXT NOT NULL DEFAULT '',
  tips JSONB NOT NULL DEFAULT '[]',
  common_errors JSONB NOT NULL DEFAULT '[]',
  solution_hint TEXT
);

CREATE TABLE IF NOT EXISTS user_exercise_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'en_progreso',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_code TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

CREATE TABLE IF NOT EXISTS user_errors_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  language_slug TEXT NOT NULL,
  description TEXT NOT NULL,
  code_snippet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS codeverso_projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  language_slug TEXT,
  status TEXT NOT NULL DEFAULT 'idea',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  language_slug TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'media',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_saved_codes_user ON saved_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_lang_diff ON exercises(language_slug, difficulty);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_exercise_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_errors_user ON user_errors_log(user_id);
CREATE INDEX IF NOT EXISTS idx_codeverso_projects_user ON codeverso_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON learning_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
