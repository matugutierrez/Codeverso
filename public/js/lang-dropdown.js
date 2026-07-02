(function () {
  function normalize(s) {
    return (s || '').trim().toLowerCase()
  }

  function create(opts) {
    const { inputEl, menuEl, languages, onSelect } = opts
    let activeIndex = -1

    function groupByCategory(list) {
      const groups = new Map()
      list.forEach((l) => {
        const key = l.category || 'Otros'
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key).push(l)
      })
      return groups
    }

    function render(filterText) {
      const q = normalize(filterText)
      const filtered = q
        ? languages.filter((l) => normalize(l.name).indexOf(q) !== -1 || normalize(l.slug).indexOf(q) !== -1)
        : languages

      menuEl.innerHTML = ''
      const flatItems = []
      const flatLangs = []

      if (filtered.length === 0) {
        const empty = document.createElement('div')
        empty.className = 'lang-dropdown-empty'
        empty.textContent = 'Sin resultados'
        menuEl.appendChild(empty)
      } else {
        const groups = groupByCategory(filtered)
        groups.forEach((list, category) => {
          const heading = document.createElement('div')
          heading.className = 'lang-dropdown-category'
          heading.textContent = category
          menuEl.appendChild(heading)
          list.forEach((langConfig) => {
            const item = document.createElement('button')
            item.type = 'button'
            item.className = 'lang-dropdown-item'
            const dot = document.createElement('span')
            dot.className = 'lang-dropdown-dot'
            dot.style.background = langConfig.accent
            const name = document.createElement('span')
            name.className = 'lang-dropdown-name'
            name.textContent = langConfig.name
            item.appendChild(dot)
            item.appendChild(name)
            item.addEventListener('mousedown', (e) => {
              e.preventDefault()
              select(langConfig)
            })
            menuEl.appendChild(item)
            flatItems.push(item)
            flatLangs.push(langConfig)
          })
        })
      }

      activeIndex = -1
      menuEl._flatItems = flatItems
      menuEl._flatLangs = flatLangs
    }

    function select(langConfig) {
      inputEl.value = langConfig.name
      close()
      onSelect(langConfig)
    }

    function open() {
      render(inputEl.value)
      menuEl.classList.add('open')
    }

    function close() {
      menuEl.classList.remove('open')
      activeIndex = -1
    }

    function isOpen() {
      return menuEl.classList.contains('open')
    }

    function moveActive(delta) {
      const flat = menuEl._flatItems || []
      if (flat.length === 0) return
      if (activeIndex >= 0) flat[activeIndex].classList.remove('active')
      activeIndex = (activeIndex + delta + flat.length) % flat.length
      flat[activeIndex].classList.add('active')
      flat[activeIndex].scrollIntoView({ block: 'nearest' })
    }

    inputEl.addEventListener('focus', open)
    inputEl.addEventListener('input', () => {
      open()
      render(inputEl.value)
    })
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isOpen()) open()
        moveActive(1)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isOpen()) open()
        moveActive(-1)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const flatLangs = menuEl._flatLangs || []
        if (activeIndex >= 0 && flatLangs[activeIndex]) {
          select(flatLangs[activeIndex])
        } else {
          const q = normalize(inputEl.value)
          const match = languages.find((l) => normalize(l.name) === q || normalize(l.slug) === q)
          if (match) select(match)
        }
        return
      }
      if (e.key === 'Escape') {
        close()
        inputEl.blur()
      }
    })
    document.addEventListener('click', (e) => {
      if (e.target === inputEl || menuEl.contains(e.target)) return
      close()
    })

    return {
      close,
      resolve(text) {
        const q = normalize(text)
        return languages.find((l) => normalize(l.name) === q || normalize(l.slug) === q) || null
      }
    }
  }

  window.CodeversoLangDropdown = { create }
})()
