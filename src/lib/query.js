if (!window['$']) {
    window['$'] = (selector) => document.querySelector(selector)
    window['$$'] = (selector) => document.querySelectorAll(selector)
}

if (!window['$id']) {
    window['$id'] = (id) => document.getElementById(id)
}
