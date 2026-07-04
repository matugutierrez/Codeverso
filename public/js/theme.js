(function () {
  var btn = document.getElementById('theme-toggle')
  var html = document.documentElement
  function setTheme(theme) {
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark')
    } else {
      html.removeAttribute('data-theme')
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
