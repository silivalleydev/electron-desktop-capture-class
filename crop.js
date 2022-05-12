

document.getElementById('clickCapture').addEventListener('click', () => {
    alert("???")
})

document.getElementById('clickCapture').addEventListener('mouseover', () => {
    if (document.getElementById('dragg').classList.contains('dragg_start')) {
        document.getElementById('dragg').classList.remove('dragg_start');
    }
})

document.getElementById('clickCapture').addEventListener('mouseleave', () => {
    if (!document.getElementById('dragg').classList.contains('dragg_start')) {
        document.getElementById('dragg').classList.add('dragg_start');
    }
})
document.getElementById('closeCaptureWin').addEventListener('mouseover', () => {
    if (document.getElementById('dragg').classList.contains('dragg_start')) {
        document.getElementById('dragg').classList.remove('dragg_start');
    }
})

document.getElementById('closeCaptureWin').addEventListener('mouseleave', () => {
    if (!document.getElementById('dragg').classList.contains('dragg_start')) {
        document.getElementById('dragg').classList.add('dragg_start');
    }
})