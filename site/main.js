const root = document.documentElement
const themeButton = document.querySelector(".theme-toggle")
const menuButton = document.querySelector(".menu-toggle")
const navigation = document.querySelector("#navigation")

function applyTheme(theme) {
    root.dataset.theme = theme
    themeButton.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`)
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#0b0c0e" : "#eaf0f3"
}

try {
    const savedTheme = localStorage.getItem("dashowboard-site-theme")
    if (savedTheme === "light" || savedTheme === "dark") applyTheme(savedTheme)
} catch {
    // Browsers can deny storage; the theme toggle remains usable for this visit.
}

themeButton.addEventListener("click", () => {
    const theme = root.dataset.theme === "dark" ? "light" : "dark"
    applyTheme(theme)
    try { localStorage.setItem("dashowboard-site-theme", theme) } catch { /* Storage is optional. */ }
})

function closeMenu() {
    navigation.classList.remove("is-open")
    menuButton.setAttribute("aria-expanded", "false")
    menuButton.setAttribute("aria-label", "Open navigation")
}

menuButton.addEventListener("click", () => {
    const open = navigation.classList.toggle("is-open")
    menuButton.setAttribute("aria-expanded", String(open))
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation")
})
navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu))
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
        closeMenu()
        menuButton.focus()
    }
})
