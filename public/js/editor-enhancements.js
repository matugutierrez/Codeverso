(function () {
  function measureCharWidth(fontStyle) {
    const probe = document.createElement('span')
    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    probe.style.whiteSpace = 'pre'
    probe.style.font = fontStyle
    probe.style.letterSpacing = 'normal'
    probe.textContent = '0'.repeat(40)
    document.body.appendChild(probe)
    const width = probe.getBoundingClientRect().width / 40
    document.body.removeChild(probe)
    return width || 8
  }

  function indentUnitLength(config) {
    return config.indentUnit === 'tabs' ? (config.indentSize || 1) : (config.indentSize || 2)
  }

  function countLeadingUnits(line, config) {
    if (config.indentUnit === 'tabs') {
      let n = 0
      while (line[n] === '\t') n++
      return n
    }
    const m = line.match(/^ */)
    const spaces = m ? m[0].length : 0
    const unit = config.indentSize || 2
    return Math.floor(spaces / unit)
  }

  function hexToRgba(hex, alpha) {
    let h = (hex || '#6c8ef5').replace('#', '')
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    const num = parseInt(h.slice(0, 6), 16) || 0
    const r = (num >> 16) & 255
    const g = (num >> 8) & 255
    const b = num & 255
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
  }

  const BRACKET_PAIRS = [['{', '}'], ['(', ')'], ['[', ']']]

  function searchForward(text, startIdx, open, close) {
    let depth = 0
    for (let i = startIdx; i < text.length; i++) {
      if (text[i] === open) depth++
      else if (text[i] === close) {
        depth--
        if (depth === 0) return [startIdx, i]
      }
    }
    return null
  }

  function searchBackward(text, startIdx, open, close) {
    let depth = 0
    for (let i = startIdx; i >= 0; i--) {
      if (text[i] === close) depth++
      else if (text[i] === open) {
        depth--
        if (depth === 0) return [i, startIdx]
      }
    }
    return null
  }

  function findMatchingBracket(text, pos) {
    const before = text[pos - 1]
    const after = text[pos]
    for (const pair of BRACKET_PAIRS) {
      const open = pair[0]
      const close = pair[1]
      if (after === open) return searchForward(text, pos, open, close)
      if (before === close) return searchBackward(text, pos - 1, open, close)
      if (after === close) return searchBackward(text, pos, open, close)
      if (before === open) return searchForward(text, pos - 1, open, close)
    }
    return null
  }

  function create(opts) {
    const { textareaEl, currentLineEl, indentGuidesEl, bracketMatchEl, getConfig } = opts
    let charWidth = 0
    let lineHeight = 0

    function remeasure() {
      const style = getComputedStyle(textareaEl)
      charWidth = measureCharWidth(style.font)
      lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.6
    }

    function paddingTop() { return parseFloat(getComputedStyle(textareaEl).paddingTop) || 16 }
    function paddingLeft() { return parseFloat(getComputedStyle(textareaEl).paddingLeft) || 20 }

    function render() {
      const config = getConfig()
      if (!config || !charWidth) return
      const text = textareaEl.value
      const lines = text.split('\n')
      const padTop = paddingTop()
      const padLeft = paddingLeft()

      if (currentLineEl) {
        const pos = textareaEl.selectionStart
        const rowOfPos = text.slice(0, pos).split('\n').length - 1
        currentLineEl.innerHTML = ''
        const bar = document.createElement('div')
        bar.className = 'current-line-bar'
        bar.style.top = (padTop + rowOfPos * lineHeight) + 'px'
        bar.style.height = lineHeight + 'px'
        currentLineEl.appendChild(bar)
      }

      if (indentGuidesEl) {
        indentGuidesEl.innerHTML = ''
        const guideColor = hexToRgba(config.accent, 0.18)
        const unitLen = indentUnitLength(config)
        const frag = document.createDocumentFragment()
        lines.forEach((line, idx) => {
          const units = countLeadingUnits(line, config)
          for (let d = 1; d <= units; d++) {
            const guide = document.createElement('div')
            guide.className = 'indent-guide-line'
            guide.style.left = (padLeft + (d - 1) * unitLen * charWidth) + 'px'
            guide.style.top = (padTop + idx * lineHeight) + 'px'
            guide.style.height = lineHeight + 'px'
            guide.style.background = guideColor
            frag.appendChild(guide)
          }
        })
        indentGuidesEl.appendChild(frag)
      }

      if (bracketMatchEl) {
        bracketMatchEl.innerHTML = ''
        const pos = textareaEl.selectionStart
        const match = findMatchingBracket(text, pos)
        if (match) {
          match.forEach((offset) => {
            const before = text.slice(0, offset)
            const row = before.split('\n').length - 1
            const col = before.length - before.lastIndexOf('\n') - 1
            const box = document.createElement('div')
            box.className = 'bracket-match-box'
            box.style.left = (padLeft + col * charWidth) + 'px'
            box.style.top = (padTop + row * lineHeight) + 'px'
            box.style.width = charWidth + 'px'
            box.style.height = lineHeight + 'px'
            bracketMatchEl.appendChild(box)
          })
        }
      }
    }

    remeasure()
    window.addEventListener('resize', () => { remeasure(); render() })

    return { render, remeasure }
  }

  window.CodeversoEditorEnhancements = { create }
})()
