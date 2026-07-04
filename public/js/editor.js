(function () {
  const VOID_TAGS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']

  const state = {
    languages: [],
    byName: new Map(),
    bySlug: new Map(),
    current: null,
    savedId: null,
    indentHelp: true,
    autoClose: true
  }

  const els = {}

  function $(id) { return document.getElementById(id) }

  function indentString(config) {
    return config.indentUnit === 'tabs' ? '\t'.repeat(config.indentSize || 1) : ' '.repeat(config.indentSize || 2)
  }

  function leadingWhitespace(line) {
    const m = line.match(/^[ \t]*/)
    return m ? m[0] : ''
  }

  function updateLineNumbers() {
    const lineCount = els.codeInput.value.split('\n').length
    let out = ''
    for (let i = 1; i <= lineCount; i++) out += i + '\n'
    els.lineNumbers.textContent = out.trim().length ? out : '1'
  }

  function renderHighlight() {
    const html = window.CodeversoHighlight.tokenizeToHtml(els.codeInput.value, state.current)
    els.highlightCode.innerHTML = html + '\n'
    updateLineNumbers()
    syncScroll()
    if (state.enhancements) state.enhancements.render()
  }

  function applyScrollSync() {
    els.highlightLayer.scrollTop = els.codeInput.scrollTop
    els.highlightLayer.scrollLeft = els.codeInput.scrollLeft
    els.lineNumbers.scrollTop = els.codeInput.scrollTop
    if (els.currentLineOverlay) els.currentLineOverlay.scrollTop = els.codeInput.scrollTop
    if (els.indentGuidesOverlay) {
      els.indentGuidesOverlay.scrollTop = els.codeInput.scrollTop
      els.indentGuidesOverlay.scrollLeft = els.codeInput.scrollLeft
    }
    if (els.bracketMatchOverlay) {
      els.bracketMatchOverlay.scrollTop = els.codeInput.scrollTop
      els.bracketMatchOverlay.scrollLeft = els.codeInput.scrollLeft
    }
  }

  // When typing near the right edge, the browser scrolls the textarea
  // internally to keep the caret visible. That internal scroll adjustment
  // sometimes lands one frame after the 'input' event fires, so reading
  // scrollLeft synchronously can capture a stale (too small) value. That
  // makes the highlighted layer fall a little further behind the real
  // caret on every keystroke, growing into a visible gap over time.
  // Re-applying the sync on the next animation frame (after the browser
  // has actually committed its own scroll adjustment) closes that gap
  // every time, so it never has a chance to accumulate.
  let pendingScrollSync = null
  function syncScroll() {
    applyScrollSync()
    if (pendingScrollSync) cancelAnimationFrame(pendingScrollSync)
    pendingScrollSync = requestAnimationFrame(() => {
      pendingScrollSync = null
      applyScrollSync()
    })
  }

  function setStatus(msg) {
    els.status.textContent = msg
    setTimeout(() => { if (els.status.textContent === msg) els.status.textContent = '' }, 3000)
  }

  function applyLanguage(config, keepContent) {
    const prev = state.current
    state.current = config
    document.documentElement.style.setProperty('--accent', config.accent)
    const wrapper = document.getElementById('code-editor-wrapper')
    if (wrapper) {
      if (prev && prev.slug) wrapper.classList.remove('lang-' + prev.slug)
      wrapper.classList.add('lang-' + config.slug)
      wrapper.dataset.lang = config.slug
    }
    const chip = $('language-info-chip')
    if (chip) chip.textContent = config.slug
    $('language-info-name').textContent = config.name
    const unit = config.indentUnit === 'tabs' ? 'tabulaciones' : 'espacios'
    $('language-info-detail').textContent = 'indentacion: ' + config.indentSize + ' ' + unit
    els.langSelect.value = config.name
    if (!keepContent) {
      els.codeInput.value = ''
    }
    renderHighlight()
  }


  function resolveLanguageFromInput(text) {
    const byName = state.byName.get(text.trim().toLowerCase())
    if (byName) return byName
    const bySlug = state.bySlug.get(text.trim().toLowerCase())
    if (bySlug) return bySlug
    return null
  }

  function handleTabKey(e) {
    e.preventDefault()
    const ta = els.codeInput
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const unit = indentString(state.current)
    ta.value = ta.value.slice(0, start) + unit + ta.value.slice(end)
    ta.selectionStart = ta.selectionEnd = start + unit.length
    renderHighlight()
  }

  function endsWithIncreaseTrigger(lineTrimmed, config) {
    return (config.increaseIndentAfter || []).some((token) => lineTrimmed.endsWith(token))
  }

  function startsWithDecreaseTrigger(text, config) {
    return (config.decreaseIndentBefore || []).some((token) => text.startsWith(token))
  }

  function handleEnterKey(e) {
    if (!state.indentHelp) return
    e.preventDefault()
    const ta = els.codeInput
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = ta.value.slice(0, start)
    const after = ta.value.slice(end)
    const currentLine = before.slice(before.lastIndexOf('\n') + 1)
    const trimmed = currentLine.trim()
    const base = leadingWhitespace(currentLine)
    const unit = indentString(state.current)

    let newIndent = base
    if (endsWithIncreaseTrigger(trimmed, state.current)) {
      newIndent = base + unit
    }

    let insertion = '\n' + newIndent
    let cursorOffset = insertion.length

    if (startsWithDecreaseTrigger(after.trimStart(), state.current) && newIndent.length >= unit.length) {
      const closingIndent = base
      insertion = '\n' + newIndent + '\n' + closingIndent
      cursorOffset = ('\n' + newIndent).length
    }

    ta.value = before + insertion + after
    ta.selectionStart = ta.selectionEnd = start + cursorOffset
    renderHighlight()
  }

  function findAutoClose(char) {
    return (state.current.autoClosePairs || []).find((pair) => pair[0] === char)
  }

  function findAutoCloseByClosing(char) {
    return (state.current.autoClosePairs || []).find((pair) => pair[1] === char)
  }

  function handleAutoClose(e) {
    if (!state.autoClose) return false
    const ta = els.codeInput
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const char = e.key

    const closingPair = findAutoCloseByClosing(char)
    if (closingPair && start === end && ta.value[start] === char) {
      e.preventDefault()
      ta.selectionStart = ta.selectionEnd = start + 1
      return true
    }

    const pair = findAutoClose(char)
    if (pair && start === end) {
      e.preventDefault()
      ta.value = ta.value.slice(0, start) + pair[0] + pair[1] + ta.value.slice(end)
      ta.selectionStart = ta.selectionEnd = start + 1
      renderHighlight()
      return true
    }
    return false
  }

  function handleHtmlAutoCloseTag() {
    const isMarkup = state.current.extension === 'html'
    if (!isMarkup) return
    const ta = els.codeInput
    const pos = ta.selectionStart
    const before = ta.value.slice(0, pos)
    const match = before.match(/<([a-zA-Z][a-zA-Z0-9-]*)([^<>]*)>$/)
    if (!match) return
    const tagName = match[1].toLowerCase()
    const attrs = match[2] || ''
    if (attrs.trim().endsWith('/')) return
    if (VOID_TAGS.indexOf(tagName) !== -1) return

    const closing = '</' + match[1] + '>'
    ta.value = ta.value.slice(0, pos) + closing + ta.value.slice(pos)
    ta.selectionStart = ta.selectionEnd = pos
    renderHighlight()
  }

  function handleBackspace(e) {
    const ta = els.codeInput
    const start = ta.selectionStart
    const end = ta.selectionEnd
    if (start !== end) return
    const before = ta.value[start - 1]
    const after = ta.value[start]
    const pair = (state.current.autoClosePairs || []).find((p) => p[0] === before && p[1] === after)
    if (pair) {
      e.preventDefault()
      ta.value = ta.value.slice(0, start - 1) + ta.value.slice(start + 1)
      ta.selectionStart = ta.selectionEnd = start - 1
      renderHighlight()
    }
  }

  function renderSavedList(list) {
    els.savedList.innerHTML = ''
    if (list.length === 0) {
      const li = document.createElement('li')
      li.className = 'saved-codes-empty'
      li.textContent = 'Todavia no guardaste ningun codigo.'
      els.savedList.appendChild(li)
      return
    }
    list.forEach((c) => {
      const li = document.createElement('li')
      li.className = 'saved-code-item'
      li.dataset.id = c.id
      li.innerHTML = '<span class="saved-code-title"></span><span class="saved-code-lang"></span><button class="saved-code-delete" title="Eliminar">&times;</button>'
      li.querySelector('.saved-code-title').textContent = c.title
      li.querySelector('.saved-code-lang').textContent = c.language_slug
      els.savedList.appendChild(li)
    })
  }

  async function loadSavedCode(id) {
    const res = await fetch('/codear/api/codigos/' + id)
    if (!res.ok) return
    const code = await res.json()
    const config = state.bySlug.get(code.language_slug)
    if (config) applyLanguage(config, true)
    els.codeInput.value = code.content
    els.titleInput.value = code.title
    state.savedId = code.id
    renderHighlight()
    setStatus('Codigo cargado')
  }

  async function saveCode(asNew) {
    const payload = {
      title: els.titleInput.value || 'Sin titulo',
      language_slug: state.current.slug,
      content: els.codeInput.value,
      id: asNew ? undefined : state.savedId
    }
    const res = await fetch('/codear/api/codigos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) { setStatus('No se pudo guardar'); return }
    const saved = await res.json()
    state.savedId = saved.id
    setStatus('Guardado con exito')
    refreshSavedList()
  }

  async function refreshSavedList() {
    const res = await fetch('/codear/api/codigos/' + state.savedId).catch(() => null)
    const listRes = await fetch('/codear')
    if (!listRes.ok) return
  }

  async function init() {
    els.langSelect = $('language-select')
    els.langMenu = $('language-select-menu')
    els.indentToggle = $('indent-help-toggle')
    els.autoCloseToggle = $('autoclose-toggle')
    els.titleInput = $('code-title')
    els.btnSave = $('btn-save')
    els.btnSaveAs = $('btn-save-as')
    els.codeInput = $('code-input')
    els.highlightLayer = $('highlight-layer')
    els.highlightCode = $('highlight-code')
    els.lineNumbers = $('line-numbers')
    els.status = $('editor-status')
    els.savedList = $('saved-codes-list')
    els.currentLineOverlay = $('current-line-overlay')
    els.indentGuidesOverlay = $('indent-guides-overlay')
    els.bracketMatchOverlay = $('bracket-match-overlay')

    state.enhancements = window.CodeversoEditorEnhancements.create({
      textareaEl: els.codeInput,
      currentLineEl: els.currentLineOverlay,
      indentGuidesEl: els.indentGuidesOverlay,
      bracketMatchEl: els.bracketMatchOverlay,
      getConfig: () => state.current
    })

    const res = await fetch('/codear/api/lenguajes')
    state.languages = await res.json()
    state.languages.forEach((l) => {
      state.byName.set(l.name.toLowerCase(), l)
      state.bySlug.set(l.slug.toLowerCase(), l)
    })

    const initial = state.bySlug.get((window.CODEVERSO_DEFAULT_LANG || 'javascript').toLowerCase()) || state.languages[0]
    applyLanguage(initial, false)

    // Load a saved code when the URL includes ?open=<id>
    const openId = new URLSearchParams(window.location.search).get('open')
    if (openId) {
      try { await loadSavedCode(openId) } catch (e) { setStatus('No se pudo abrir el archivo') }
    }

    window.CodeversoLangDropdown.create({
      inputEl: els.langSelect,
      menuEl: els.langMenu,
      languages: state.languages,
      onSelect: (found) => applyLanguage(found, true)
    })

    els.langSelect.addEventListener('blur', () => {
      setTimeout(() => {
        const found = resolveLanguageFromInput(els.langSelect.value)
        if (found && found !== state.current) applyLanguage(found, true)
        else if (state.current) els.langSelect.value = state.current.name
      }, 150)
    })

    els.indentToggle.addEventListener('change', () => { state.indentHelp = els.indentToggle.checked })
    els.autoCloseToggle.addEventListener('change', () => { state.autoClose = els.autoCloseToggle.checked })

    els.codeInput.addEventListener('input', renderHighlight)
    els.codeInput.addEventListener('scroll', syncScroll)
    els.codeInput.addEventListener('click', () => { if (state.enhancements) state.enhancements.render() })
    els.codeInput.addEventListener('keyup', (e) => {
      if (e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') {
        if (state.enhancements) state.enhancements.render()
      }
    })

    els.codeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') return handleTabKey(e)
      if (e.key === 'Enter') return handleEnterKey(e)
      if (e.key === 'Backspace') return handleBackspace(e)
      if (e.key.length === 1) {
        const handled = handleAutoClose(e)
        if (!handled && e.key === '>') {
          setTimeout(handleHtmlAutoCloseTag, 0)
        }
      }
    })

    els.btnSave.addEventListener('click', () => saveCode(false))
    els.btnSaveAs.addEventListener('click', () => {
      state.savedId = null
      saveCode(true)
    })

    els.savedList.addEventListener('click', async (e) => {
      const item = e.target.closest('.saved-code-item')
      if (!item) return
      if (e.target.classList.contains('saved-code-delete')) {
        await fetch('/codear/api/codigos/' + item.dataset.id + '/eliminar', { method: 'POST' })
        item.remove()
        return
      }
      loadSavedCode(item.dataset.id)
    })

    const btnDelAll = document.getElementById('btn-delete-all-saved')
    const modal = document.getElementById('confirm-delete-all-modal')
    const btnCancel = document.getElementById('btn-cancel-delete-all')
    const btnConfirm = document.getElementById('btn-confirm-delete-all')
    function openModal() { if (modal) modal.style.display = 'flex' }
    function closeModal() { if (modal) modal.style.display = 'none' }
    if (btnDelAll) btnDelAll.addEventListener('click', openModal)
    if (btnCancel) btnCancel.addEventListener('click', closeModal)
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal() })
    if (btnConfirm) btnConfirm.addEventListener('click', async () => {
      btnConfirm.disabled = true
      try {
        await fetch('/codear/api/codigos/eliminar-todos', { method: 'POST' })
        els.savedList.innerHTML = '<li class="saved-codes-empty">Todavia no guardaste ningun codigo.</li>'
        state.savedId = null
      } finally {
        btnConfirm.disabled = false
        closeModal()
      }
    })
  }

  document.addEventListener('DOMContentLoaded', init)
})()
