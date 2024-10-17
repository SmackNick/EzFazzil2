const categories = [
    { id: 'mantenciones', name: 'Mantenciones y <br> Reparaciones', icon: '🔧' },
    { id: 'construccion', name: 'Construcción y <br> Remodelación', icon: '🏗️' },
    { id: 'profesionales', name: 'Servicios <br> Profesionales', icon: '💼' },
    { id: 'mascotas', name: 'Servicios para <br> Mascotas', icon: '🐾' },
    { id: 'tecnicos', name: 'Servicios <br> Técnicos', icon: '🔌' },
    { id: 'transporte', name: 'Transporte y <br> Logística', icon: '🚚' },
    { id: 'salud', name: 'Salud y <br> Bienestar', icon: '🏥' },
    { id: 'eventos', name: 'Eventos y <br> Entretenimiento', icon: '🎉' }
];

function displayCategories() {
    const grid = document.querySelector('.categories-grid');
    categories.forEach(category => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <div class="icon">${category.icon}</div>
            <h3>${category.name}</h3>
            <button class="btn" data-category="${category.id}">Ver Proveedores</button>
        `;
        grid.appendChild(item);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.category-item .btn').forEach(button => {
        button.addEventListener('click', () => {
            const categoryId = button.getAttribute('data-category');
            window.location.href = `proveedores.html?category=${categoryId}`;
        });
    });
}

document.addEventListener('DOMContentLoaded', displayCategories);