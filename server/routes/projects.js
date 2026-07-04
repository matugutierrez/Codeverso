const express = require('express')
const path = require('path')
const multer = require('multer')
const AdmZip = require('adm-zip')
const { query } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 2000 }
})

const EXT_TO_LANG = {
  html: 'html', htm: 'html',
  css: 'css', scss: 'css', sass: 'css', less: 'css',
  js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript', jsx: 'javascript',
  py: 'python', java: 'java',
  c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp',
  cs: 'csharp', php: 'php', rb: 'ruby', go: 'go', rs: 'rust',
  kt: 'kotlin', swift: 'swift',
  sh: 'bash', bash: 'bash', zsh: 'bash',
  sql: 'sql', json: 'json', yaml: 'yaml', yml: 'yaml',
  md: 'markdown', markdown: 'markdown',
  xml: 'xml', svg: 'xml',
  ejs: 'html', hbs: 'html', pug: 'html',
  vue: 'html', astro: 'html',
  toml: 'otros', ini: 'otros', env: 'otros', conf: 'otros', cfg: 'otros',
  txt: 'otros', log: 'otros', csv: 'otros',
  lock: 'otros', gitignore: 'otros', dockerfile: 'otros'
}

const MIME_BY_EXT = {
  html: 'text/html; charset=utf-8', htm: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8', mjs: 'application/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml',
  xml: 'application/xml; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  md: 'text/markdown; charset=utf-8'
}

function detectLang(filename) {
  const base = (filename || '').split('/').pop() || ''
  const ext = path.extname(base).toLowerCase().replace('.', '')
  if (EXT_TO_LANG[ext]) return EXT_TO_LANG[ext]
  return 'otros'
}

function isLikelyText(buf) {
  const sample = buf.slice(0, Math.min(buf.length, 8000))
  for (let i = 0; i < sample.length; i++) {
    const b = sample[i]
    if (b === 0) return false
    if (b < 9) return false
  }
  return true
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

async function insertSavedCode(userId, lang, title, content, source) {
  try {
    return await query(
      'INSERT INTO saved_codes (user_id, code_source, language_slug, title, content) VALUES ($1,$2,$3,$4,$5) RETURNING id, title, language_slug',
      [userId, source || 'editor', lang, title, content || '']
    )
  } catch (err) {
    if (err && err.code === '42703') {
      return query(
        'INSERT INTO saved_codes (user_id, language_slug, title, content) VALUES ($1,$2,$3,$4) RETURNING id, title, language_slug',
        [userId, lang, title, content || '']
      )
    }
    throw err
  }
}

async function insertSavedCodesBulk(userId, items, source) {
  const codeParams = []
  const codeValues = []
  items.forEach((it, i) => {
    const base = i * 5
    codeValues.push(`($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5})`)
    codeParams.push(userId, source || 'editor', it.lang, it.filename, it.content)
  })
  try {
    return await query(
      `INSERT INTO saved_codes (user_id, code_source, language_slug, title, content) VALUES ${codeValues.join(',')} RETURNING id`,
      codeParams
    )
  } catch (err) {
    if (!err || err.code !== '42703') throw err
    const fallbackParams = []
    const fallbackValues = []
    items.forEach((it, i) => {
      const base = i * 4
      fallbackValues.push(`($${base + 1},$${base + 2},$${base + 3},$${base + 4})`)
      fallbackParams.push(userId, it.lang, it.filename, it.content)
    })
    return query(
      `INSERT INTO saved_codes (user_id, language_slug, title, content) VALUES ${fallbackValues.join(',')} RETURNING id`,
      fallbackParams
    )
  }
}

async function addFileToProject(userId, projectId, filename, content, lang) {
  const inserted = await insertSavedCode(userId, lang, filename, content, 'project')
  await query(
    'INSERT INTO project_files (project_id, code_id, filename) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
    [projectId, inserted.rows[0].id, filename]
  )
}

// Upsert by (project_id, filename): update existing saved_codes.content, insert new otherwise.
// This prevents duplicates when the user re-uploads the same zip.
async function addFilesToProjectBulk(userId, projectId, items) {
  if (!items.length) return { added: 0, updated: 0 }
  // 1) fetch existing filenames -> code_id in this project
  const existingRes = await query(
    `SELECT pf.filename, pf.code_id FROM project_files pf WHERE pf.project_id=$1`,
    [projectId]
  )
  const existing = new Map()
  for (const r of existingRes.rows) existing.set(r.filename, r.code_id)

  const toUpdate = []
  const toInsert = []
  for (const it of items) {
    if (existing.has(it.filename)) toUpdate.push({ ...it, code_id: existing.get(it.filename) })
    else toInsert.push(it)
  }

  // 2) update in-place (one query per file — usually few on re-upload deltas)
  for (const u of toUpdate) {
    await query(
      'UPDATE saved_codes SET content=$1, language_slug=$2, updated_at=now() WHERE id=$3',
      [u.content, u.lang, u.code_id]
    )
  }

  // 3) bulk insert new ones
  const CHUNK = 200
  for (let start = 0; start < toInsert.length; start += CHUNK) {
    const chunk = toInsert.slice(start, start + CHUNK)
    const codeRes = await insertSavedCodesBulk(userId, chunk, 'project')
    const pfParams = []
    const pfValues = []
    codeRes.rows.forEach((row, i) => {
      const base = i * 3
      pfValues.push(`($${base + 1},$${base + 2},$${base + 3})`)
      pfParams.push(projectId, row.id, chunk[i].filename)
    })
    await query(
      `INSERT INTO project_files (project_id, code_id, filename) VALUES ${pfValues.join(',')} ON CONFLICT DO NOTHING`,
      pfParams
    )
  }
  return { added: toInsert.length, updated: toUpdate.length }
}

// Remove duplicate project_files rows (same project_id + filename), keeping the oldest.
// Also removes orphaned saved_codes rows that were pointed to by dropped project_files.
async function dedupeProjectFiles(projectId) {
  const dupRes = await query(
    `SELECT filename, MIN(id) AS keep_id, array_agg(id) AS all_ids, array_agg(code_id) AS all_code_ids
       FROM project_files WHERE project_id=$1
      GROUP BY filename HAVING COUNT(*) > 1`,
    [projectId]
  )
  for (const row of dupRes.rows) {
    const dropIds = row.all_ids.filter((id) => id !== row.keep_id)
    if (dropIds.length === 0) continue
    // find the code_ids of dropped rows to garbage-collect saved_codes
    const dropCodesRes = await query(
      `SELECT code_id FROM project_files WHERE id = ANY($1::int[])`,
      [dropIds]
    )
    const dropCodeIds = dropCodesRes.rows.map((r) => r.code_id)
    await query(`DELETE FROM project_files WHERE id = ANY($1::int[])`, [dropIds])
    if (dropCodeIds.length) {
      await query(
        `DELETE FROM saved_codes WHERE id = ANY($1::int[])
           AND id NOT IN (SELECT code_id FROM project_files WHERE code_id = ANY($1::int[]))`,
        [dropCodeIds]
      )
    }
  }
}




// Minimal markdown renderer (headings, bold/italic, inline code, code blocks, lists, links, paragraphs)
function renderMarkdown(md) {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const lines = String(md || '').replace(/\r\n/g, '\n').split('\n')
  let out = '', inCode = false, inList = false, para = []
  const flushPara = () => { if (para.length) { out += '<p>' + inline(para.join(' ')) + '</p>\n'; para = [] } }
  const closeList = () => { if (inList) { out += '</ul>\n'; inList = false } }
  function inline(s) {
    s = esc(s)
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    return s
  }
  for (const raw of lines) {
    const line = raw
    if (line.startsWith('```')) {
      flushPara(); closeList()
      if (!inCode) { out += '<pre><code>'; inCode = true } else { out += '</code></pre>\n'; inCode = false }
      continue
    }
    if (inCode) { out += esc(line) + '\n'; continue }
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) { flushPara(); closeList(); out += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>\n`; continue }
    const li = line.match(/^\s*[-*]\s+(.*)$/)
    if (li) { flushPara(); if (!inList) { out += '<ul>\n'; inList = true } out += `<li>${inline(li[1])}</li>\n`; continue }
    if (line.trim() === '') { flushPara(); closeList(); continue }
    para.push(line)
  }
  if (inCode) out += '</code></pre>\n'
  flushPara(); closeList()
  return out
}

function titleize(value) {
  return String(value || 'Proyecto')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase()) || 'Proyecto'
}

function unique(values) {
  const out = []
  const seen = new Set()
  for (const v of values) {
    const clean = String(v || '').trim()
    if (!clean || seen.has(clean.toLowerCase())) continue
    seen.add(clean.toLowerCase())
    out.push(clean)
  }
  return out
}

function summarizeProject(files) {
  const getPath = (f) => f.filename || f.title || ''
  const packageFiles = files
    .filter((f) => /(^|\/)package\.json$/i.test(getPath(f)) && !/node_modules\//i.test(getPath(f)))
    .sort((a, b) => getPath(a).length - getPath(b).length)
  let pkg = null
  for (const f of packageFiles) {
    try { pkg = JSON.parse(f.content || '{}'); break } catch (_) {}
  }
  const readme = files.find((f) => /(^|\/)readme\.md$/i.test(getPath(f)))
  const readmeTitle = readme && String(readme.content || '').match(/^#\s+(.+)$/m)
  const firstFolder = (getPath(files.find((f) => getPath(f).includes('/')) || {}) || '').split('/')[0]
  const rawName = (pkg && pkg.name) || (readmeTitle && readmeTitle[1]) || firstFolder || 'Proyecto fullstack'
  const combined = files.map((f) => (getPath(f) + '\n' + String(f.content || '').slice(0, 6000))).join('\n').toLowerCase()
  const deps = Object.assign({}, (pkg && pkg.dependencies) || {}, (pkg && pkg.devDependencies) || {})
  const depNames = Object.keys(deps).join(' ').toLowerCase()
  const hay = combined + '\n' + depNames

  const stack = []
  if (/react|\.tsx|\.jsx|vite|next/.test(hay)) stack.push(/next/.test(hay) ? 'Next/React' : 'React')
  if (/vue|\.vue/.test(hay)) stack.push('Vue')
  if (/svelte/.test(hay)) stack.push('Svelte')
  if (/express|fastify|koa|nest/.test(hay)) stack.push(/nest/.test(hay) ? 'Nest/Node' : 'Node/Express')
  if (/django|flask|fastapi/.test(hay)) stack.push('Python API')
  if (/laravel|symfony/.test(hay)) stack.push('PHP backend')
  if (/rails|sinatra/.test(hay)) stack.push('Ruby backend')
  if (/prisma|postgres|pg\b|sequelize|typeorm|mongoose|mongodb|sqlite/.test(hay)) stack.push('Base de datos')
  if (/tailwind|bootstrap|sass|scss/.test(hay)) stack.push(/tailwind/.test(hay) ? 'Tailwind' : 'CSS UI')
  if (/socket|websocket|realtime|sync|collab|cursor/.test(hay)) stack.push('Tiempo real')
  if (stack.length === 0) stack.push('Fullstack')

  let topic = 'dashboard'
  if (/chat|message|mensaje|conversation/.test(hay)) topic = 'chat'
  if (/editor|document|block|toolbar|cursor|diff|sync|presence|avatar/.test(hay)) topic = 'editor'
  if (/shop|cart|product|checkout|order|payment/.test(hay)) topic = 'commerce'
  if (/task|todo|kanban|issue|ticket/.test(hay)) topic = 'tasks'
  if (/login|auth|session|user|account/.test(hay)) topic = 'auth'

  const routes = []
  for (const f of files) {
    const p = getPath(f)
    const lower = p.toLowerCase()
    const content = String(f.content || '').slice(0, 20000)
    let m
    const routeRegexes = [
      /(?:app|router)\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g,
      /createFileRoute\(\s*['"`]([^'"`]+)['"`]/g,
      /Route::(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g,
      /@(app|router)\.route\(\s*['"`]([^'"`]+)['"`]/g
    ]
    for (const rx of routeRegexes) {
      while ((m = rx.exec(content))) routes.push(m[2] || m[1])
    }
    if (/\/(pages|app|routes)\//.test(lower) && /\.(tsx|jsx|js|ts)$/.test(lower)) {
      let route = lower.replace(/^.*\/(pages|app|routes)\//, '/').replace(/\.(tsx|jsx|js|ts)$/, '')
      route = route.replace(/\/page$/, '').replace(/\/index$/, '').replace(/^index$/, '').replace(/\[(.*?)\]/g, ':$1')
      routes.push(route === '' ? '/' : '/' + route.replace(/^\/+/, ''))
    }
  }

  const components = unique(files
    .filter((f) => /\.(tsx|jsx|vue|svelte)$/i.test(getPath(f)))
    .map((f) => titleize((getPath(f).split('/').pop() || '').replace(/\.(tsx|jsx|vue|svelte)$/i, ''))))
    .slice(0, 8)
  const textLabels = []
  for (const f of files) {
    if (!/\.(tsx|jsx|vue|svelte|html|ejs)$/i.test(getPath(f))) continue
    const content = String(f.content || '').slice(0, 14000)
    let m
    const labelRx = />\s*([A-ZÁÉÍÓÚÑa-záéíóúñ][^<>{}\n]{2,38})\s*</g
    while ((m = labelRx.exec(content)) && textLabels.length < 12) textLabels.push(m[1])
  }

  return {
    name: titleize(rawName),
    stack: unique(stack).slice(0, 5),
    topic,
    routes: unique(routes).slice(0, 8),
    components,
    labels: unique(textLabels).slice(0, 8),
    scripts: pkg && pkg.scripts ? Object.keys(pkg.scripts).slice(0, 5) : [],
    fileCount: files.length
  }
}

function getPathName(f) {
  return f.filename || f.title || ''
}

function parseJsonSafe(value) {
  try { return JSON.parse(value || '{}') } catch (_) { return null }
}

function findBestPackage(files) {
  const packages = files
    .filter((f) => /(^|\/)package\.json$/i.test(getPathName(f)) && !/node_modules\//i.test(getPathName(f)))
    .map((f) => ({ file: f, pkg: parseJsonSafe(f.content) }))
    .filter((x) => x.pkg)
  if (!packages.length) return null
  let best = packages[0]
  let bestScore = -1
  for (const item of packages) {
    const scripts = item.pkg.scripts || {}
    const deps = Object.assign({}, item.pkg.dependencies || {}, item.pkg.devDependencies || {})
    const names = Object.keys(deps).join(' ').toLowerCase()
    let score = 0
    if (scripts.dev) score += 6
    if (scripts.start) score += 4
    if (scripts.preview) score += 4
    if (scripts.build) score += 3
    if (/vite|react|vue|svelte|next|nuxt|astro/.test(names)) score += 8
    if (/express|fastify|koa|nest|flask|django|fastapi|laravel|rails/.test(names)) score += 3
    const p = getPathName(item.file).toLowerCase()
    if (/\/(client|frontend|web|app)\/package\.json$/.test(p)) score += 5
    if (p === 'package.json') score += 1
    if (score > bestScore) { bestScore = score; best = item }
  }
  const packagePath = getPathName(best.file)
  return { pkg: best.pkg, packagePath, rootDir: packagePath.split('/').slice(0, -1).join('/') }
}

function detectPackageManager(files) {
  const names = files.map((f) => getPathName(f).toLowerCase())
  if (names.some((n) => /(^|\/)pnpm-lock\.yaml$/.test(n))) return 'pnpm'
  if (names.some((n) => /(^|\/)yarn\.lock$/.test(n))) return 'yarn'
  if (names.some((n) => /(^|\/)bun\.lockb?$/.test(n))) return 'bun'
  return 'npm'
}

function installCommand(pm) {
  if (pm === 'pnpm') return 'pnpm install'
  if (pm === 'yarn') return 'yarn install'
  if (pm === 'bun') return 'bun install'
  return 'npm install'
}

function runScriptCommand(pm, script) {
  if (!script) return ''
  if (pm === 'npm') return script === 'start' ? 'npm start' : `npm run ${script}`
  if (pm === 'pnpm') return script === 'start' ? 'pnpm start' : `pnpm run ${script}`
  if (pm === 'yarn') return script === 'start' ? 'yarn start' : `yarn ${script}`
  if (pm === 'bun') return script === 'start' ? 'bun start' : `bun run ${script}`
  return `npm run ${script}`
}

function withCd(cmd, rootDir) {
  return rootDir ? `cd ${rootDir} && ${cmd}` : cmd
}

function defaultLocalUrl(files, pkgInfo) {
  const pkg = (pkgInfo && pkgInfo.pkg) || {}
  const deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {})
  const hay = (Object.keys(deps).join(' ') + ' ' + files.map((f) => getPathName(f) + ' ' + String(f.content || '').slice(0, 3000)).join(' ')).toLowerCase()
  if (/astro/.test(hay)) return 'http://localhost:4321'
  if (/vite|sveltekit|vue|react/.test(hay)) return 'http://localhost:5173'
  if (/next|nuxt|react-scripts/.test(hay)) return 'http://localhost:3000'
  if (/flask|fastapi/.test(hay)) return 'http://localhost:8000'
  return 'http://localhost:3000'
}

function needsLocalRuntime(files) {
  const getPath = getPathName
  const landing = files.find((f) => /(^|\/)index\.html$/i.test(getPath(f))) || files.find((f) => /\.(ejs|html|htm)$/i.test(getPath(f)))
  const hasPackage = files.some((f) => /(^|\/)package\.json$/i.test(getPath(f)))
  const hasBackend = files.some((f) => /\/(server|api|routes|controllers|middleware)\//i.test(getPath(f)) || /\.(py|php|rb|go|rs|java|cs)$/i.test(getPath(f)))
  const hasFrameworkSource = files.some((f) => {
    const p = getPath(f).toLowerCase()
    if (/node_modules|\.config\.|vite\.config|tsconfig|postcss\.config/.test(p)) return false
    return /\/(src|app|pages|components|client)\/.*\.(tsx|jsx|ts|js|vue|svelte|astro)$/i.test(p)
  })
  if (!landing) return hasPackage || hasBackend || hasFrameworkSource
  const html = String(landing.content || '')
  const visibleText = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const mountOnly = /id=["'](?:root|app|__next)["']/i.test(html) && /<script\b[^>]+\bsrc=/i.test(html)
  return hasPackage && hasFrameworkSource && (mountOnly || visibleText.length < 30 || hasBackend)
}

function buildPreviewPlan(files) {
  const pkgInfo = findBestPackage(files)
  const pm = detectPackageManager(files)
  const scripts = (pkgInfo && pkgInfo.pkg && pkgInfo.pkg.scripts) || {}
  const buildScript = scripts.build ? 'build' : null
  const liveScript = scripts.dev ? 'dev' : (scripts.preview ? 'preview' : (scripts.start ? 'start' : null))
  const commands = [withCd(installCommand(pm), pkgInfo && pkgInfo.rootDir)]
  if (buildScript) commands.push(withCd(runScriptCommand(pm, buildScript), pkgInfo && pkgInfo.rootDir))
  commands.push(withCd(runScriptCommand(pm, liveScript || 'dev'), pkgInfo && pkgInfo.rootDir))
  return {
    needsLocal: needsLocalRuntime(files),
    packageManager: pm,
    rootDir: (pkgInfo && pkgInfo.rootDir) || '',
    installCommand: commands[0],
    buildCommand: commands[1] || '',
    runCommand: commands[commands.length - 1],
    commands: unique(commands),
    localUrl: defaultLocalUrl(files, pkgInfo),
    reason: 'Este proyecto necesita instalar dependencias y levantar su servidor local para verse completo.'
  }
}

function buildLocalRuntimeDemo(files) {
  const p = summarizeProject(files)
  const plan = buildPreviewPlan(files)
  const commandBlocks = plan.commands.map((cmd, i) => `<div class="cmd"><small>${i + 1}</small><code>${escapeHtml(cmd)}</code></div>`).join('')
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(p.name)} - preview local</title>
<style>*{box-sizing:border-box}html,body{height:100%;overflow:hidden;margin:0;background:#090d16;color:#edf2ff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}.wrap{height:100vh;display:grid;grid-template-columns:minmax(320px,430px) 1fr}.wrap.show-stage .panel{display:none}.wrap.show-stage .stage{grid-column:1/-1}.panel{padding:34px;background:#111827;border-right:1px solid #273244;overflow-y:auto}.panel-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.panel-head h1{font-size:32px;line-height:1.05;margin:10px 0 12px}.panel-head .close-btn{background:none;border:none;color:#94a3b8;font-size:26px;cursor:pointer;line-height:1;padding:2px 4px;margin-top:6px;transition:color .15s}.panel-head .close-btn:hover{color:#fff}.kicker{color:#93c5fd;font-size:12px;text-transform:uppercase;letter-spacing:.08em;font-weight:800}.panel p{color:#cbd5e1;line-height:1.5}.cmds{display:flex;flex-direction:column;gap:10px;margin:22px 0}.cmd{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:center;background:#030712;border:1px solid #334155;border-radius:8px;padding:10px}.cmd small{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#2563eb;color:#fff;font-weight:800}.cmd code{white-space:pre-wrap;word-break:break-word;color:#86efac;font:13px/1.35 'Share Tech Mono',Consolas,monospace}.url{display:flex;gap:8px;margin-top:16px}.url input{min-width:0;flex:1;border:1px solid #334155;background:#020617;color:#fff;border-radius:7px;padding:11px}.url button,.copy,.full-btn{border:1px solid #2563eb;background:#2563eb;color:white;border-radius:7px;padding:11px 13px;font-weight:800;cursor:pointer}.copy{width:100%;margin-top:8px;background:#1f2937;border-color:#475569}.full-btn{width:100%;margin-top:6px;background:#1f2937;border-color:#475569}.stage{background:#020617;display:grid;place-items:center;padding:18px;overflow:hidden;transition:padding .25s}.wrap.show-stage .stage{padding:0}.empty{border:1px dashed #334155;border-radius:12px;width:min(720px,100%);padding:34px;text-align:center;color:#94a3b8}.live{width:100%;height:100%;border:0;background:white;display:none;min-height:0}.badge{position:fixed;right:10px;bottom:10px;background:#020617;color:#86efac;border-radius:5px;padding:6px 9px;font:11px 'Share Tech Mono',Consolas,monospace}@media(max-width:850px){.wrap{grid-template-columns:1fr}.stage{min-height:420px}.live{height:70vh}}</style></head><body><div class="wrap" id="wrap"><aside class="panel" id="panel"><div class="kicker">Preview local requerido</div><div class="panel-head"><h1>${escapeHtml(p.name)}</h1><button class="close-btn" id="close-panel" type="button" aria-label="Cerrar panel">&times;</button></div><p>No se puede renderizar esta app fullstack como HTML suelto: necesita dependencias, build y servidor. Ejecuta estos comandos en tu maquina y despues abre la URL local aca.</p><div class="cmds">${commandBlocks}</div><button class="copy" type="button" id="copy">Copiar comandos</button><div class="url"><input id="url" value="${escapeHtml(plan.localUrl)}" spellcheck="false"><button id="open" type="button">Abrir</button></div><button class="full-btn" id="fullscreen" type="button">&#x26F6; Fullscreen</button></aside><main class="stage" id="stage"><iframe class="live" id="live" title="Preview local" allowfullscreen></iframe><div class="empty" id="empty"><h2>Esperando servidor local</h2><p>Cuando ejecutes los comandos, pega la URL local y se vera en este recuadro.</p></div></main></div><div class="badge">preview local</div><script>var cmds=${JSON.stringify(plan.commands.join('\n'))};document.getElementById('copy').onclick=function(){navigator.clipboard&&navigator.clipboard.writeText(cmds)};document.getElementById('open').onclick=function(){var u=document.getElementById('url').value.trim();if(!u)return;document.getElementById('empty').style.display='none';var f=document.getElementById('live');f.style.display='block';f.src=u};document.getElementById('close-panel').onclick=function(){document.getElementById('wrap').classList.add('show-stage')};document.getElementById('fullscreen').onclick=function(){var p=window.parent;if(p){var el=p.document.getElementById('preview-wrap')||p.document.getElementById('project-preview');if(el&&el.requestFullscreen)el.requestFullscreen()}};</script></body></html>`
}

function buildFullstackSimulationDemo(files) {
  const p = summarizeProject(files)
  const nav = (p.routes.length ? p.routes : ['/', '/dashboard', '/api', '/settings']).slice(0, 6)
  const chips = p.stack.map((s) => `<span>${escapeHtml(s)}</span>`).join('')
  const components = (p.components.length ? p.components : ['App', 'Panel', 'API', 'Usuarios']).slice(0, 6)
  const componentCards = components.map((c, i) => `<article class="mini"><b>${escapeHtml(c)}</b><small>${['Activo', 'Sincronizado', 'Listo', 'Renderizado'][i % 4]}</small></article>`).join('')
  const routeItems = nav.map((r, i) => `<button class="nav-item ${i === 0 ? 'active' : ''}" type="button">${escapeHtml(r)}</button>`).join('')
  const apiRows = (p.routes.length ? p.routes : ['/api/status', '/api/users', '/api/data']).slice(0, 5).map((r, i) => `<tr><td>${i % 2 ? 'POST' : 'GET'}</td><td>${escapeHtml(r)}</td><td><span class="ok">200</span></td></tr>`).join('')
  const scripts = (p.scripts.length ? p.scripts : ['dev', 'start', 'build']).map((s) => `<span class="script">npm run ${escapeHtml(s)}</span>`).join('')
  const labels = (p.labels.length ? p.labels : ['Panel principal', 'Guardar', 'Configuracion', 'Usuarios conectados']).slice(0, 5)
  const titleByTopic = {
    editor: 'Workspace colaborativo', chat: 'Centro de mensajes', commerce: 'Panel de tienda', tasks: 'Tablero operativo', auth: 'Portal de usuarios', dashboard: 'Panel principal'
  }
  const screen = p.topic === 'editor'
    ? `<div class="app-window"><div class="window-top"><span></span><span></span><span></span><strong>${escapeHtml(p.name)}</strong></div><div class="workspace"><aside>${routeItems}</aside><section class="doc"><div class="toolrow"><button>Guardar</button><button>Compartir</button><button>Deploy</button></div><h2>${escapeHtml(titleByTopic[p.topic])}</h2><p>${escapeHtml(labels[0] || 'Documento activo')}</p><div class="editor-lines"><i></i><i></i><i></i><i></i><i></i></div><div class="avatars"><b>A</b><b>M</b><b>+</b></div></section></div></div>`
    : `<div class="app-window"><div class="window-top"><span></span><span></span><span></span><strong>${escapeHtml(p.name)}</strong></div><div class="workspace"><aside>${routeItems}</aside><section class="doc"><h2>${escapeHtml(titleByTopic[p.topic] || titleByTopic.dashboard)}</h2><p>${escapeHtml(labels[0] || 'Vista principal generada')}</p><div class="cards"><div><b>${p.fileCount}</b><small>archivos</small></div><div><b>${p.stack.length}</b><small>capas</small></div><div><b>${nav.length}</b><small>rutas</small></div></div><div class="table"><div>${escapeHtml(labels[1] || 'Usuarios')}</div><div>${escapeHtml(labels[2] || 'Datos')}</div><div>${escapeHtml(labels[3] || 'Acciones')}</div></div></section></div></div>`

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(p.name)} - demo</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#eef1f5;color:#151922}button{font:inherit}.shell{min-height:100vh;display:grid;grid-template-columns:230px 1fr}.side{background:#111827;color:#e5e7eb;padding:22px 16px;display:flex;flex-direction:column;gap:18px}.brand{font-weight:800;font-size:18px;letter-spacing:.3px}.brand small{display:block;color:#9ca3af;font-weight:500;font-size:11px;margin-top:3px}.nav-item{width:100%;border:0;background:transparent;color:#cbd5e1;text-align:left;padding:9px 10px;border-radius:7px;margin:2px 0}.nav-item.active,.nav-item:hover{background:#2563eb;color:white}.stack{display:flex;flex-wrap:wrap;gap:6px}.stack span,.script{font-size:11px;background:rgba(255,255,255,.08);color:#dbeafe;border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:5px 8px}.main{padding:28px;display:flex;flex-direction:column;gap:18px}.hero{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.hero h1{margin:0;font-size:34px;line-height:1.05;letter-spacing:0}.hero p{margin:8px 0 0;color:#64748b;max-width:680px}.actions{display:flex;gap:8px}.actions button,.toolrow button{border:1px solid #cbd5e1;background:white;border-radius:7px;padding:8px 12px;color:#111827}.actions button:first-child,.toolrow button:first-child{background:#2563eb;color:#fff;border-color:#2563eb}.grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.8fr);gap:18px}.app-window,.panel{background:white;border:1px solid #d8dee8;border-radius:8px;overflow:hidden;box-shadow:0 18px 55px rgba(15,23,42,.11)}.window-top{height:42px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:7px;padding:0 14px;color:#64748b}.window-top span{width:10px;height:10px;border-radius:50%;background:#ef4444}.window-top span:nth-child(2){background:#f59e0b}.window-top span:nth-child(3){background:#22c55e}.window-top strong{margin-left:8px;font-size:12px}.workspace{display:grid;grid-template-columns:170px 1fr;min-height:440px}.workspace aside{background:#f8fafc;border-right:1px solid #e2e8f0;padding:12px}.workspace aside .nav-item{color:#475569}.workspace aside .nav-item.active{color:white}.doc{padding:24px;position:relative}.doc h2{font-size:28px;margin:0 0 8px}.doc p{color:#64748b;margin:0 0 20px}.toolrow{display:flex;gap:8px;margin-bottom:20px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}.cards div,.mini{border:1px solid #e2e8f0;background:#f8fafc;border-radius:8px;padding:14px}.cards b{display:block;font-size:26px}.cards small,.mini small{display:block;color:#64748b;margin-top:4px}.table{border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}.table div{padding:13px 14px;border-bottom:1px solid #e2e8f0}.table div:last-child{border-bottom:0}.editor-lines{display:flex;flex-direction:column;gap:10px;background:#111827;border-radius:8px;padding:18px;margin-top:18px}.editor-lines i{height:13px;border-radius:999px;background:linear-gradient(90deg,#60a5fa,#93c5fd 48%,transparent 48%)}.editor-lines i:nth-child(2){width:83%}.editor-lines i:nth-child(3){width:68%;background:linear-gradient(90deg,#34d399,#86efac 55%,transparent 55%)}.editor-lines i:nth-child(4){width:76%}.editor-lines i:nth-child(5){width:58%;background:linear-gradient(90deg,#fbbf24,#fde68a 42%,transparent 42%)}.avatars{position:absolute;right:24px;top:24px;display:flex}.avatars b{width:31px;height:31px;margin-left:-7px;border-radius:50%;background:#2563eb;color:white;display:grid;place-items:center;border:2px solid white;font-size:12px}.panel{padding:18px}.panel h3{margin:0 0 12px;font-size:14px;text-transform:uppercase;color:#475569}.mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}table{width:100%;border-collapse:collapse;font-size:12px}td{padding:8px;border-bottom:1px solid #e2e8f0}.ok{color:#16a34a;font-weight:700}.scripts{display:flex;flex-wrap:wrap;gap:6px}.scripts .script{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe}.badge{position:fixed;right:10px;bottom:10px;background:#020617;color:#86efac;border-radius:5px;padding:6px 9px;font:11px 'Share Tech Mono',Consolas,monospace}@media(max-width:820px){.shell{grid-template-columns:1fr}.side{display:none}.grid{grid-template-columns:1fr}.hero{flex-direction:column}.workspace{grid-template-columns:1fr}.workspace aside{display:none}.main{padding:18px}.hero h1{font-size:28px}}
</style></head><body><div class="shell"><aside class="side"><div class="brand">${escapeHtml(p.name)}<small>demo.html generado</small></div><nav>${routeItems}</nav><div class="stack">${chips}</div></aside><main class="main"><header class="hero"><div><h1>${escapeHtml(titleByTopic[p.topic] || titleByTopic.dashboard)}</h1><p>Vista previa simulada de la app completa generada desde archivos frontend, backend, rutas y configuracion del proyecto.</p></div><div class="actions"><button>Preview</button><button>Refresh</button></div></header><section class="grid"><div>${screen}</div><aside class="panel"><h3>Modulos detectados</h3><div class="mini-grid">${componentCards}</div><h3>Backend / rutas</h3><table>${apiRows}</table><h3 style="margin-top:18px">Comandos</h3><div class="scripts">${scripts}</div></aside></section></main></div><div class="badge">demo.html - simulacion fullstack</div><script>document.querySelectorAll('.nav-item').forEach(function(b){b.onclick=function(){document.querySelectorAll('.nav-item').forEach(function(x){x.classList.remove('active')});b.classList.add('active')}})</script></body></html>`
}

// ---- Tree helpers ----

function buildTree(files) {
  const root = { dirs: {}, files: [] }
  for (const f of files) {
    const full = f.filename || f.title || 'archivo'
    const parts = full.split('/').filter(Boolean)
    let node = root
    for (let i = 0; i < parts.length - 1; i++) {
      node.dirs[parts[i]] = node.dirs[parts[i]] || { dirs: {}, files: [] }
      node = node.dirs[parts[i]]
    }
    node.files.push({ name: parts[parts.length - 1] || 'archivo', full, meta: f })
  }
  return root
}

function renderSidebarTree(node) {
  const dirNames = Object.keys(node.dirs).sort()
  let h = '<ul class="ft-list">'
  for (const d of dirNames) {
    h += `<li class="ft-folder"><div class="ft-row ft-folder-row"><span class="ft-caret">&#x25B8;</span><span class="ft-icon">&#128193;</span><span class="ft-name">${escapeHtml(d)}</span></div>${renderSidebarTree(node.dirs[d])}</li>`
  }
  for (const f of node.files.sort((a, b) => a.name.localeCompare(b.name))) {
    const m = f.meta
    h += `<li class="ft-file" data-pf-id="${m.pf_id}" data-filename="${escapeHtml(m.filename || m.title)}" data-lang="${escapeHtml(m.language_slug)}"><div class="ft-row ft-file-row"><span class="ft-icon">&#128196;</span><span class="ft-name">${escapeHtml(f.name)}</span><span class="ft-lang">${escapeHtml(m.language_slug)}</span></div></li>`
  }
  h += '</ul>'
  return h
}

function renderDemoTree(node) {
  const dirNames = Object.keys(node.dirs).sort()
  let h = '<ul>'
  for (const d of dirNames) {
    h += `<li class="folder"><span class="toggle">${escapeHtml(d)}</span>${renderDemoTree(node.dirs[d])}</li>`
  }
  for (const f of node.files.sort((a, b) => a.name.localeCompare(b.name))) {
    h += `<li><a href="${escapeHtml(f.full)}" data-path="${escapeHtml(f.full)}">${escapeHtml(f.name)}</a></li>`
  }
  h += '</ul>'
  return h
}

function buildDemoHtml(files) {
  const getPath = (f) => f.filename || f.title || ''
  const baseName = (p) => (p.split('/').pop() || '').toLowerCase()
  const isView = (f) => /\.(ejs|html|htm)$/i.test(getPath(f))

  // Pick a landing view: index.html > login/home/index.ejs > first view file (skip partials)
  const findFile = (predicate) => files.find(predicate)
  const nonPartial = (f) => !/\/partials?\//i.test(getPath(f))
  let landing =
    findFile((f) => baseName(getPath(f)) === 'index.html') ||
    findFile((f) => baseName(getPath(f)) === 'index.ejs' && nonPartial(f)) ||
    findFile((f) => baseName(getPath(f)) === 'login.ejs' && nonPartial(f)) ||
    findFile((f) => baseName(getPath(f)) === 'home.ejs' && nonPartial(f)) ||
    findFile((f) => isView(f) && nonPartial(f)) ||
    findFile(isView)

  if (!landing) return needsLocalRuntime(files) ? buildLocalRuntimeDemo(files) : buildFullstackSimulationDemo(files)

  const landingContent = String(landing.content || '')
  const visibleLandingText = landingContent
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const hasPackage = files.some((f) => /(^|\/)package\.json$/i.test(getPath(f)))
  const hasComponentSources = files.some((f) => /\.(tsx|jsx|ts|js|vue|svelte|astro)$/i.test(getPath(f)) && /\/(src|app|pages|components|client)\//i.test(getPath(f)))
  const isFrameworkMountOnly = /id=["'](?:root|app|__next)["']/i.test(landingContent) && /<script\b[^>]+\bsrc=/i.test(landingContent)
  if ((hasComponentSources || hasPackage) && (isFrameworkMountOnly || visibleLandingText.length < 30)) {
    return needsLocalRuntime(files) ? buildLocalRuntimeDemo(files) : buildFullstackSimulationDemo(files)
  }



  // Resolve EJS includes recursively (best effort — Express-like resolution)
  function findPartial(name, currentDir) {
    const clean = name.replace(/^\.\//, '')
    const tries = []
    if (currentDir) {
      tries.push(currentDir + '/' + clean, currentDir + '/' + clean + '.ejs')
    }
    tries.push('views/' + clean, 'views/' + clean + '.ejs')
    tries.push(clean, clean + '.ejs')
    for (const t of tries) {
      const exact = files.find((f) => getPath(f) === t)
      if (exact) return exact
      const suffix = files.find((f) => getPath(f).endsWith('/' + t))
      if (suffix) return suffix
    }
    return null
  }

  function renderEjs(content, currentPath, depth) {
    if (depth > 6 || !content) return content || ''
    const currentDir = (currentPath || '').split('/').slice(0, -1).join('/')
    // includes: <%- include('name', {...}) %>
    content = content.replace(/<%-\s*include\(\s*['"]([^'"]+)['"][^)]*\)\s*-?%>/g, (_, name) => {
      const p = findPartial(name, currentDir)
      if (!p) return `<!-- include no encontrado: ${name} -->`
      return renderEjs(p.content || '', getPath(p), depth + 1)
    })
    // strip control blocks <% ... %> (not = or -)
    content = content.replace(/<%(?![=\-])[\s\S]*?%>/g, '')
    // <%= expr %> / <%- expr %> — best-effort: keep string literals, fallback to empty
    content = content.replace(/<%[=\-]\s*([\s\S]*?)\s*-?%>/g, (_, expr) => {
      const strMatch = expr.match(/^['"`]([^'"`]*)['"`]$/)
      if (strMatch) return strMatch[1]
      const fallback = expr.match(/\|\|\s*['"`]([^'"`]+)['"`]/)
      if (fallback) return fallback[1]
      const lastStr = expr.match(/['"`]([^'"`]+)['"`]\s*$/)
      if (lastStr) return lastStr[1]
      return ''
    })
    return content
  }

  let html = renderEjs(landing.content || '', getPath(landing), 0)

  // Inline every CSS file (bundled) and every browser-side JS (skip server code)
  const cssFiles = files.filter((f) => f.language_slug === 'css')
  const jsFiles = files.filter((f) => {
    if (f.language_slug !== 'javascript') return false
    const p = getPath(f).toLowerCase()
    // heuristic: skip node/server bundles
    if (/\/(server|api|routes|middleware|migrations?)\//.test(p)) return false
    if (/\b(server|migrate)\.[cm]?js$/.test(p)) return false
    return true
  })

  const cssBundle = cssFiles.map((f) => `/* ${getPath(f)} */\n${f.content || ''}`).join('\n\n')
  const jsBundle = jsFiles.map((f) => `/* ${getPath(f)} */\ntry{\n${f.content || ''}\n}catch(__e){console.warn('[demo]', ${JSON.stringify(getPath(f))}, __e);}`).join('\n\n')

  // Remove existing <link rel=stylesheet> and <script src> — we inline everything
  html = html.replace(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi, '')
  html = html.replace(/<script\b[^>]*\bsrc=[^>]*><\/script>/gi, '')

  const styleTag = cssBundle ? `<style data-demo-css>\n${cssBundle}\n</style>` : ''
  const scriptTag = jsBundle ? `<script data-demo-js>\n${jsBundle}\n<\/script>` : ''
  const banner = `<div style="position:fixed;bottom:8px;right:8px;z-index:2147483647;background:rgba(0,0,0,.75);color:#8fdd8f;font:11px/1 'Share Tech Mono',Consolas,monospace;padding:5px 9px;border-radius:4px;pointer-events:none">demo.html - simulacion</div>`

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, styleTag + '</head>')
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/<html[^>]*>/i, (m) => m + '<head>' + styleTag + '</head>')
  } else {
    html = '<head>' + styleTag + '</head>' + html
  }
  if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, scriptTag + banner + '</body>')
  } else {
    html = html + scriptTag + banner
  }
  if (!/^<!doctype/i.test(html.trim())) html = '<!doctype html>\n' + html

  return html
}


async function regenerateDemoIfNeeded(userId, projectId) {
  // dedupe first so old duplicated files from previous re-uploads disappear
  await dedupeProjectFiles(projectId)
  const r = await query(
    `SELECT pf.id AS pf_id, pf.filename, sc.id AS code_id, sc.title, sc.language_slug, sc.content
       FROM project_files pf JOIN saved_codes sc ON sc.id=pf.code_id
      WHERE pf.project_id=$1`,
    [projectId]
  )
  const files = r.rows
  const demo = files.find((f) => (f.filename || f.title) === 'demo.html')
  const others = files.filter((f) => (f.filename || f.title) !== 'demo.html')
  if (others.length === 0) return
  // ALWAYS generate a bundled demo (even when index.html exists) so the preview
  // shows the whole page compacted, like Lovable/Render.
  const content = buildDemoHtml(others)
  if (demo) {
    await query('UPDATE saved_codes SET content=$1, updated_at=now() WHERE id=$2', [content, demo.code_id])
  } else {
    const ins = await insertSavedCode(userId, 'html', 'demo.html', content, 'project')
    await query(
      'INSERT INTO project_files (project_id, code_id, filename) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      [projectId, ins.rows[0].id, 'demo.html']
    )
  }
}


// List projects
router.get('/', async (req, res) => {
  const r = await query(
    `SELECT p.id, p.name, p.description, p.updated_at,
            COUNT(pf.id)::int AS files_count
       FROM codeverso_projects p
       LEFT JOIN project_files pf ON pf.project_id = p.id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.updated_at DESC`,
    [req.session.user.id]
  )
  res.render('projects_list', { projects: r.rows, error: null })
})

router.post('/', async (req, res) => {
  const { name, description } = req.body
  if (!name || !name.trim()) return res.redirect('/proyectos')
  const r = await query(
    'INSERT INTO codeverso_projects (user_id, name, description) VALUES ($1,$2,$3) RETURNING id',
    [req.session.user.id, name.trim(), description || null]
  )
  res.redirect('/proyectos/' + r.rows[0].id)
})

router.post('/:id/eliminar', async (req, res) => {
  await query('DELETE FROM codeverso_projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.user.id])
  res.redirect('/proyectos')
})

async function loadProject(userId, projectId) {
  const p = await query('SELECT * FROM codeverso_projects WHERE id=$1 AND user_id=$2', [projectId, userId])
  if (p.rows.length === 0) return null
  const files = await query(
    `SELECT pf.id AS pf_id, pf.filename, pf.position,
            sc.id AS code_id, sc.title, sc.language_slug, sc.content
       FROM project_files pf
       JOIN saved_codes sc ON sc.id = pf.code_id
      WHERE pf.project_id = $1
      ORDER BY pf.position ASC, pf.id ASC`,
    [projectId]
  )
  return { project: p.rows[0], files: files.rows }
}

router.get('/:id', async (req, res) => {
  const data = await loadProject(req.session.user.id, req.params.id)
  if (!data) return res.status(404).render('error', { message: 'Proyecto no encontrado' })
  const available = await query(
    `SELECT id, title, language_slug FROM saved_codes
      WHERE user_id = $1
        AND id NOT IN (SELECT code_id FROM project_files WHERE project_id = $2)
        AND NOT EXISTS (SELECT 1 FROM project_files pf_any WHERE pf_any.code_id = saved_codes.id)
      ORDER BY updated_at DESC`,
    [req.session.user.id, req.params.id]
  )
  let uploadInfo = null
  if (req.query.added !== undefined) {
    uploadInfo = {
      added: Number(req.query.added) || 0,
      skipped: (req.query.skipped || '').split('|').filter(Boolean)
    }
  }
  const tree = buildTree(data.files)
  const treeHtml = renderSidebarTree(tree)
  const previewFiles = data.files.filter((f) => (f.filename || f.title) !== 'demo.html')
  const previewPlan = buildPreviewPlan(previewFiles)
  res.render('project_detail', {
    project: data.project,
    files: data.files,
    available: available.rows,
    uploadInfo,
    treeHtml,
    previewPlan
  })
})

router.post('/:id/archivos', async (req, res) => {
  const { code_id, filename } = req.body
  const own = await query('SELECT id FROM codeverso_projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.user.id])
  if (own.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })
  const code = await query('SELECT id, title FROM saved_codes WHERE id=$1 AND user_id=$2', [code_id, req.session.user.id])
  if (code.rows.length === 0) return res.status(404).json({ error: 'Codigo no encontrado' })
  await query(
    'INSERT INTO project_files (project_id, code_id, filename) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
    [req.params.id, code_id, filename || code.rows[0].title]
  )
  await query('UPDATE codeverso_projects SET updated_at=now() WHERE id=$1', [req.params.id])
  await regenerateDemoIfNeeded(req.session.user.id, req.params.id)
  res.redirect('/proyectos/' + req.params.id)
})

router.post('/:id/archivos/:fileId/eliminar', async (req, res) => {
  const own = await query('SELECT id FROM codeverso_projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.user.id])
  if (own.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })
  await query('DELETE FROM project_files WHERE id=$1 AND project_id=$2', [req.params.fileId, req.params.id])
  await regenerateDemoIfNeeded(req.session.user.id, req.params.id)
  res.redirect('/proyectos/' + req.params.id)
})

router.post('/:id/upload', upload.array('files', 2000), async (req, res) => {
  const own = await query('SELECT id FROM codeverso_projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.user.id])
  if (own.rows.length === 0) return res.status(404).render('error', { message: 'Proyecto no encontrado' })

  const results = { added: 0, skipped: [] }
  const uploaded = req.files || []
  const toInsert = []
  const seen = new Set()

  for (const file of uploaded) {
    const name = file.originalname
    const ext = path.extname(name).toLowerCase()

    if (ext === '.zip') {
      try {
        const zip = new AdmZip(file.buffer)
        const entries = zip.getEntries()
        for (const entry of entries) {
          if (entry.isDirectory) continue
          let relPath = entry.entryName
          if (!relPath || relPath.includes('..')) continue
          const base = relPath.split('/').pop()
          if (!base) continue
          if (entry.header.size > 8 * 1024 * 1024) { results.skipped.push(relPath + ' (>8MB)'); continue }
          const buf = entry.getData()
          if (!isLikelyText(buf)) { results.skipped.push(relPath + ' (binario)'); continue }
          if (seen.has(relPath)) continue
          seen.add(relPath)
          toInsert.push({ filename: relPath, content: buf.toString('utf8'), lang: detectLang(base) })
        }
      } catch (e) {
        results.skipped.push(name + ' (zip invalido)')
      }
    } else {
      if (!isLikelyText(file.buffer)) { results.skipped.push(name + ' (binario)'); continue }
      if (seen.has(name)) continue
      seen.add(name)
      toInsert.push({ filename: name, content: file.buffer.toString('utf8'), lang: detectLang(name) })
    }
  }

  const bulk = await addFilesToProjectBulk(req.session.user.id, req.params.id, toInsert)
  results.added = bulk.added + bulk.updated


  await query('UPDATE codeverso_projects SET updated_at=now() WHERE id=$1', [req.params.id])
  await regenerateDemoIfNeeded(req.session.user.id, req.params.id)

  const q = new URLSearchParams({ added: String(results.added), skipped: results.skipped.slice(0, 6).join('|') }).toString()
  res.redirect('/proyectos/' + req.params.id + '?' + q)
})

router.get('/:id/archivos/:pfId/raw', async (req, res) => {
  const r = await query(
    `SELECT sc.content, sc.language_slug, pf.filename
       FROM project_files pf
       JOIN saved_codes sc ON sc.id = pf.code_id
       JOIN codeverso_projects p ON p.id = pf.project_id
      WHERE pf.id=$1 AND pf.project_id=$2 AND p.user_id=$3`,
    [req.params.pfId, req.params.id, req.session.user.id]
  )
  if (r.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })
  res.json(r.rows[0])
})

router.put('/:id/archivos/:pfId/contenido', express.json({ limit: '8mb' }), async (req, res) => {
  const own = await query(
    `SELECT sc.id AS code_id
       FROM project_files pf
       JOIN saved_codes sc ON sc.id = pf.code_id
       JOIN codeverso_projects p ON p.id = pf.project_id
      WHERE pf.id=$1 AND pf.project_id=$2 AND p.user_id=$3`,
    [req.params.pfId, req.params.id, req.session.user.id]
  )
  if (own.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })
  await query('UPDATE saved_codes SET content=$1, updated_at=now() WHERE id=$2', [req.body.content || '', own.rows[0].code_id])
  await query('UPDATE codeverso_projects SET updated_at=now() WHERE id=$1', [req.params.id])
  await regenerateDemoIfNeeded(req.session.user.id, req.params.id)
  res.json({ ok: true })
})

router.post('/:id/archivos/:pfId/guardar-en-codear', express.json({ limit: '8mb' }), async (req, res) => {
  const own = await query(
    `SELECT sc.content, sc.language_slug, pf.filename
       FROM project_files pf
       JOIN saved_codes sc ON sc.id = pf.code_id
       JOIN codeverso_projects p ON p.id = pf.project_id
      WHERE pf.id=$1 AND pf.project_id=$2 AND p.user_id=$3`,
    [req.params.pfId, req.params.id, req.session.user.id]
  )
  if (own.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })
  const file = own.rows[0]
  const content = req.body && typeof req.body.content === 'string' ? req.body.content : file.content
  const inserted = await insertSavedCode(req.session.user.id, file.language_slug, file.filename || 'archivo', content || '', 'editor')
  res.json({ ok: true, code: inserted.rows[0] })
})

// Manual demo.html regeneration
router.post('/:id/demo/regenerar', async (req, res) => {
  const own = await query('SELECT id FROM codeverso_projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.user.id])
  if (own.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })
  await regenerateDemoIfNeeded(req.session.user.id, req.params.id)
  const data = await loadProject(req.session.user.id, req.params.id)
  const files = data ? data.files.filter((f) => (f.filename || f.title) !== 'demo.html') : []
  res.json({ ok: true, previewPlan: buildPreviewPlan(files) })
})

router.get('/:id/download', async (req, res) => {
  const data = await loadProject(req.session.user.id, req.params.id)
  if (!data) return res.status(404).send('No encontrado')
  const zip = new AdmZip()
  for (const f of data.files) {
    const relPath = f.filename || f.title || ('archivo_' + f.code_id)
    zip.addFile(relPath, Buffer.from(f.content || '', 'utf8'))
  }
  const safeName = (data.project.name || 'proyecto').replace(/[^a-z0-9._-]+/gi, '_')
  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', 'attachment; filename="' + safeName + '.zip"')
  res.send(zip.toBuffer())
})

router.get('/:id/f/*', async (req, res) => {
  const data = await loadProject(req.session.user.id, req.params.id)
  if (!data) return res.status(404).send('Not found')
  const target = req.params[0]
  const file = data.files.find((f) => (f.filename || f.title) === target)
    || data.files.find((f) => ((f.filename || f.title) || '').split('/').pop() === target.split('/').pop())
  if (!file) return res.status(404).send('File not found: ' + target)
  const ext = path.extname(target).toLowerCase().replace('.', '')
  const mime = MIME_BY_EXT[ext] || 'text/plain; charset=utf-8'
  res.setHeader('Content-Type', mime)
  res.setHeader('Cache-Control', 'no-store')
  res.send(file.content)
})

router.get('/:id/preview', async (req, res) => {
  await regenerateDemoIfNeeded(req.session.user.id, req.params.id)
  const data = await loadProject(req.session.user.id, req.params.id)
  if (!data) return res.status(404).send('Proyecto no encontrado')

  const others = data.files.filter((f) => (f.filename || f.title) !== 'demo.html')
  if (others.length === 0) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send(`<!doctype html><meta charset="utf-8"><body style="font-family:'Share Tech Mono',Consolas,monospace;padding:24px;color:#666;background:#fafafa">
      <p>Proyecto vacio. Sube archivos para ver la vista previa.</p></body>`)
  }

  // Always serve the bundled demo (one self-contained HTML with CSS/JS inlined),
  // and set <base> so relative images/fonts still resolve to the project files.
  let html = buildDemoHtml(others)
  const baseTag = `<base href="/proyectos/${req.params.id}/f/">`
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => m + baseTag)
  } else {
    html = html.replace(/<html[^>]*>/i, (m) => m + '<head>' + baseTag + '</head>')
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Content-Security-Policy', "default-src 'self' data: blob:; frame-src 'self' http://localhost:* https://localhost:* http://127.0.0.1:* http://0.0.0.0:*; style-src 'self' 'unsafe-inline' *; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:; font-src * data:;")
  res.send(html)
})


module.exports = router
