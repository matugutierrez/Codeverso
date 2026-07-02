(function () {
  const CONSTANT_WORDS = new Set(['true', 'false', 'null', 'undefined', 'none', 'nil', 'nullptr'])

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function buildTokenRegex(config) {
    const groups = []

    if (config.blockCommentStart && config.blockCommentEnd) {
      groups.push('(?<comment>' + escapeRegExp(config.blockCommentStart) + '[\\s\\S]*?' + escapeRegExp(config.blockCommentEnd) + ')')
    }
    if (config.lineComment) {
      groups.push('(?<linecomment>' + escapeRegExp(config.lineComment) + '.*)')
    }

    const strings = config.strings || []
    strings.filter((s) => s.length === 3).forEach((q, idx) => {
      groups.push('(?<triple' + idx + '>' + escapeRegExp(q) + '[\\s\\S]*?' + escapeRegExp(q) + ')')
    })
    strings.filter((s) => s.length === 1).forEach((q, idx) => {
      const esc = escapeRegExp(q)
      groups.push('(?<str' + idx + '>' + esc + '(?:\\\\.|[^\\\\' + esc + '])*' + esc + ')')
    })

    const isStyle = config.extension === 'css' || config.extension === 'scss' || config.slug === 'css'
    if (isStyle) {
      groups.push('(?<hexcolor>#[0-9a-fA-F]{3,8}\\b)')
    }

    groups.push('(?<number>\\b\\d+(?:\\.\\d+)?\\b)')

    const isMarkup = config.extension === 'html' || config.extension === 'xml' || config.slug === 'xml'
    if (isMarkup) {
      groups.push('(?<tag><\\/?[a-zA-Z][a-zA-Z0-9-]*)')
      groups.push('(?<closer>\\/?>)')
      groups.push('(?<attr>\\b[a-zA-Z-]+(?=\\s*=))')
    }

    if (config.keywords && config.keywords.length > 0) {
      const kws = config.keywords.slice().sort((a, b) => b.length - a.length).map(escapeRegExp)
      groups.push('(?<keyword>\\b(?:' + kws.join('|') + ')\\b)')
    }
    if (config.types && config.types.length > 0) {
      const tys = config.types.slice().sort((a, b) => b.length - a.length).map(escapeRegExp)
      groups.push('(?<type>\\b(?:' + tys.join('|') + ')\\b)')
    }

    groups.push('(?<func>\\b[a-zA-Z_][a-zA-Z0-9_]*(?=\\())')
    groups.push('(?<op>[+\\-*/%=<>!&|^~]+)')

    return new RegExp(groups.join('|'), 'g')
  }

  function classFor(groupName, text) {
    if (groupName === 'comment' || groupName === 'linecomment') return 'tok-comment'
    if (groupName.indexOf('str') === 0 || groupName.indexOf('triple') === 0) return 'tok-string'
    if (groupName === 'hexcolor') return 'tok-hexcolor'
    if (groupName === 'number') return 'tok-number'
    if (groupName === 'keyword') return CONSTANT_WORDS.has((text || '').toLowerCase()) ? 'tok-constant' : 'tok-keyword'
    if (groupName === 'type') return 'tok-type'
    if (groupName === 'func') return 'tok-function'
    if (groupName === 'tag') return 'tok-tag'
    if (groupName === 'closer') return 'tok-tag'
    if (groupName === 'attr') return 'tok-attr'
    if (groupName === 'op') return 'tok-operator'
    return null
  }

  const regexCache = new Map()

  function tokenizeToHtml(code, config) {
    if (!config) return escapeHtml(code)

    let regex = regexCache.get(config.slug)
    if (!regex) {
      regex = buildTokenRegex(config)
      regexCache.set(config.slug, regex)
    }
    regex.lastIndex = 0

    let out = ''
    let lastIndex = 0
    let match

    while ((match = regex.exec(code)) !== null) {
      if (match.index > lastIndex) {
        out += escapeHtml(code.slice(lastIndex, match.index))
      }
      const groups = match.groups || {}
      let cls = null
      let rawText = match[0]
      for (const key in groups) {
        if (groups[key] !== undefined) {
          cls = classFor(key, groups[key])
          break
        }
      }
      const text = escapeHtml(rawText)
      if (cls === 'tok-hexcolor') {
        out += '<span class="tok-hexcolor"><span class="tok-color-swatch" style="background:' + text + '"></span>' + text + '</span>'
      } else {
        out += cls ? '<span class="' + cls + '">' + text + '</span>' : text
      }
      lastIndex = match.index + match[0].length
      if (match[0].length === 0) regex.lastIndex++
    }
    if (lastIndex < code.length) out += escapeHtml(code.slice(lastIndex))
    return out
  }

  window.CodeversoHighlight = { tokenizeToHtml, escapeHtml }
})()
