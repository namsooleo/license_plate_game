
document.querySelectorAll('.license-plate').forEach(plate => {
    const img = plate.querySelector('img');
    plate.setAttribute('data-state', img.getAttribute('data-state'));
});