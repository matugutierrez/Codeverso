(function () {
  const DIFFICULTY_ORDER = ['facil', 'media', 'dificil']

  const state = {
    languages: [],
    byName: new Map(),
    bySlug: new Map(),
    current: null,
    exercise: null,
    seenIds: [],
    difficulty: 'todas'
  }

  const els = {}
  function $(id) { return document.getElementById(id) }

  function renderHighlight() {
    if (!state.current || !els.exCodeInput) return
    const html = window.CodeversoHighlight.tokenizeToHtml(els.exCodeInput.value, state.current)
    els.exHighlightCode.innerHTML = html + '\n'
    const lineCount = els.exCodeInput.value.split('\n').length
    let out = ''
    for (let i = 1; i <= lineCount; i++) out += i + '\n'
    els.exLineNumbers.textContent = out.trim().length ? out : '1'
  }

  function syncScroll() {
    els.exHighlightLayer.scrollTop = els.exCodeInput.scrollTop
    els.exHighlightLayer.scrollLeft = els.exCodeInput.scrollLeft
    els.exLineNumbers.scrollTop = els.exCodeInput.scrollTop
  }

  function setButtonsEnabled(enabled) {
    els.btnSkip.disabled = !enabled
    els.btnMasDificil.disabled = !enabled
    els.btnMenosDificil.disabled = !enabled
  }

  function resolveLanguageFromInput(text) {
    const key = text.trim().toLowerCase()
    return state.byName.get(key) || state.bySlug.get(key) || null
  }

  async function fetchExercise(overrideDifficulty) {
    const lang = resolveLanguageFromInput(els.langSelect.value)
    if (!lang) {
      alert('Elegi un lenguaje valido de la lista.')
      return
    }
    state.current = lang
    const difficulty = overrideDifficulty || els.difficultySelect.value
    const exclude = state.exercise && state.exercise.language_slug === lang.slug ? state.seenIds.join(',') : ''

    const params = new URLSearchParams({ language: lang.slug, difficulty, exclude })
    const res = await fetch('/ejercicios/api/aleatorio?' + params.toString())
    const data = await res.json()

    if (data.empty) {
      els.emptyCard.style.display = 'block'
      els.emptyCard.querySelector('p').textContent = data.message
      els.exerciseCard.style.display = 'none'
      return
    }

    state.exercise = data
    if (state.seenIds.indexOf(data.id) === -1) state.seenIds.push(data.id)

    els.emptyCard.style.display = 'none'
    els.exerciseCard.style.display = 'block'
    $('exercise-title').textContent = data.title
    $('exercise-statement').textContent = data.statement
    $('exercise-badge-type').textContent = data.type === 'debug' ? 'Arreglar codigo' : 'Practica'
    $('exercise-badge-diff').textContent = data.difficulty
    els.exCodeInput.value = data.starter_code || ''
    renderHighlight()

    $('tips-list').innerHTML = (data.tips || []).map((t) => '<li></li>').map((li, i) => li).join('')
    const tipsList = $('tips-list')
    tipsList.innerHTML = ''
    ;(data.tips || []).forEach((t) => {
      const li = document.createElement('li')
      li.textContent = t
      tipsList.appendChild(li)
    })
    const errorsList = $('errors-list')
    errorsList.innerHTML = ''
    ;(data.common_errors || []).forEach((t) => {
      const li = document.createElement('li')
      li.textContent = t
      errorsList.appendChild(li)
    })
    $('solution-hint').textContent = data.solution_hint || ''
    $('exercise-tips').style.display = 'none'

    setButtonsEnabled(true)
  }

  function shiftDifficulty(direction) {
    if (!state.exercise) return
    const idx = DIFFICULTY_ORDER.indexOf(state.exercise.difficulty)
    const nextIdx = Math.min(DIFFICULTY_ORDER.length - 1, Math.max(0, idx + direction))
    fetchExercise(DIFFICULTY_ORDER[nextIdx])
  }

  async function markStatus(status) {
    if (!state.exercise) return
    await fetch('/ejercicios/api/completar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_id: state.exercise.id, status, code: els.exCodeInput.value })
    })
  }

  async function reportError() {
    if (!state.exercise) return
    const description = prompt('Describi brevemente el error que cometiste:')
    if (!description) return
    await fetch('/ejercicios/api/errores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language_slug: state.exercise.language_slug, description, code_snippet: els.exCodeInput.value })
    })
    alert('Guardado en tu registro de errores, dentro de Mi cuenta.')
  }

  async function init() {
    els.langSelect = $('ex-language-select')
    els.langMenu = $('ex-language-select-menu')
    els.difficultySelect = $('ex-difficulty-select')
    els.btnNuevo = $('btn-nuevo-ejercicio')
    els.btnSkip = $('btn-skip')
    els.btnMasDificil = $('btn-mas-dificil')
    els.btnMenosDificil = $('btn-menos-dificil')
    els.emptyCard = $('exercise-empty')
    els.exerciseCard = $('exercise-card')
    els.exCodeInput = $('ex-code-input')
    els.exHighlightLayer = $('ex-highlight-layer')
    els.exHighlightCode = $('ex-highlight-code')
    els.exLineNumbers = $('ex-line-numbers')
    els.btnMarcarCompletado = $('btn-marcar-completado')
    els.btnVerTips = $('btn-ver-tips')
    els.btnReportarError = $('btn-reportar-error')

    const res = await fetch('/codear/api/lenguajes')
    const allLanguages = await res.json()
    const allowed = new Set(window.CODEVERSO_EXERCISE_LANGUAGES || [])
    state.languages = allLanguages.filter((l) => allowed.has(l.slug))
    state.languages.forEach((l) => {
      state.byName.set(l.name.toLowerCase(), l)
      state.bySlug.set(l.slug.toLowerCase(), l)
    })

    window.CodeversoLangDropdown.create({
      inputEl: els.langSelect,
      menuEl: els.langMenu,
      languages: state.languages,
      onSelect: () => {}
    })

    els.btnNuevo.addEventListener('click', () => { state.seenIds = []; fetchExercise() })
    els.btnSkip.addEventListener('click', () => fetchExercise())
    els.btnMasDificil.addEventListener('click', () => shiftDifficulty(1))
    els.btnMenosDificil.addEventListener('click', () => shiftDifficulty(-1))
    els.btnMarcarCompletado.addEventListener('click', () => { markStatus('completado'); alert('Genial, lo marcamos como resuelto. Segui asi!') })
    els.btnVerTips.addEventListener('click', () => {
      const box = $('exercise-tips')
      box.style.display = box.style.display === 'none' ? 'block' : 'none'
    })
    els.btnReportarError.addEventListener('click', reportError)

    els.exCodeInput.addEventListener('input', renderHighlight)
    els.exCodeInput.addEventListener('scroll', syncScroll)
    els.exCodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = els.exCodeInput.selectionStart
        const end = els.exCodeInput.selectionEnd
        const unit = state.current && state.current.indentUnit === 'tabs' ? '\t' : '  '
        els.exCodeInput.value = els.exCodeInput.value.slice(0, start) + unit + els.exCodeInput.value.slice(end)
        els.exCodeInput.selectionStart = els.exCodeInput.selectionEnd = start + unit.length
        renderHighlight()
      }
    })
  }

  document.addEventListener('DOMContentLoaded', init)
})()
