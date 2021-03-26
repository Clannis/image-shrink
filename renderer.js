const path = require('path')
const os = require('os')
const { ipcRenderer } = require('electron')

const form = document.getElementById('image-form')
const slider = document.getElementById('slider')
const img = document.getElementById('img')
const status = document.getElementById('submit')
const output = document.getElementById('output-path')

document.getElementById('dir-select').addEventListener('click', (e) => {
    e.preventDefault()
    window.postMessage({
        type: 'select-dirs',
    })
})

// On Directory select
ipcRenderer.on('dir:selected', (event, args) => {
    if (!args[0]) {
        output.value = ""
        output.classList.remove("valid")
    } else if (args[0].includes('/')) {
        output.value = args[0]
        output.classList.add("valid")
    }
})

// On submit
form.addEventListener('submit', e => {
    e.preventDefault()

    const imgPath = img.files[0].path
    const quality = slider.value
    const outputPath = output.value

    ipcRenderer.send('image:minimize', {
        imgPath,
        quality,
        outputPath
    })
})

// In Progress
ipcRenderer.on('image:shrinking', () => {
    status.value = "Processing"
    status.classList.remove("black")
    status.classList.add("blue")
    status.classList.add("active-process")
    status.style
})

// On done
ipcRenderer.on('image:done', () => {

    status.value = "Complete"
    status.classList.add("green")

    M.toast({
        html: `Image resized to ${slider.value}% quality`
    })

    setTimeout(function() {
        status.value = "Resize"
        status.classList.remove("green")
        status.classList.remove("active-process")
        status.classList.add("black")
    }, 3800)
})
