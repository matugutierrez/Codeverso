(function () {
  var btn = document.getElementById('theme-toggle')
  var html = document.documentElement
  function setTheme(theme) {
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark')
      if (btn) btn.textContent = '\uD83D\uDCA1'
    } else {
      html.removeAttribute('data-theme')
      if (btn) btn.textContent = '\uD83C\uDF19'
    }
    try { localStorage.setItem('codeverso-theme', theme) } catch (e) {}
  }
  if (btn) {
    btn.addEventListener('click', function () {
      var next = html.hasAttribute('data-theme') ? 'light' : 'dark'
      setTheme(next)
    })
  }
})()
