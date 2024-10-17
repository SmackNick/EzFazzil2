const urlParams = new URLSearchParams(window.location.search);
const supplierId = urlParams.get('supplierId');

const apiUrl = 'https://prov0088.ezfazzil.workers.dev/';

// Fetch supplier details and reviews from Google Sheets
fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const rows = data.values;
        const supplier = rows.find(row => row[0] === supplierId); // Find supplier by ID
        if (supplier) {
            displaySupplierDetails(supplier);
            displaySupplierReviews(supplier);
        } else {
            console.error('Supplier not found.');
        }
    })
    .catch(error => {
        console.error('Error fetching supplier data:', error);
    });

function displaySupplierDetails(supplier) {
    const supplierTitle = document.getElementById('supplier-title');
    const detailsSection = document.getElementById('supplier-details');

    // Display supplier name in the title
    supplierTitle.textContent = `${supplier[1]}`;

    // Display other supplier details
    detailsSection.innerHTML = `
        <div class="info-item">
            <div class="info-label">Nombre Contacto</div>
            <div class="info-value">${supplier[2]}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Teléfono</div>
            <div class="info-value">${supplier[10]}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Correo Electrónico</div>
            <div class="info-value">${supplier[9]}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Categoría</div>
            <div class="info-value">${supplier[5]}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Especialidad 1</div>
            <div class="info-value">${supplier[6]}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Especialidad 2</div>
            <div class="info-value">${supplier[7]}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Ciudad</div>
            <div class="info-value">${supplier[3]}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Región</div>
            <div class="info-value">${supplier[4]}</div>
        </div>
        <div class="info-item" style="grid-column: span 3;">
            <div class="info-label">Instagram</div>
            <div class="info-value"><a href="https://www.instagram.com/explore/tags/${supplier[17].replace('#', '')}" target="_blank">${supplier[17]}</a></div>
        </div>
    `;
}

// Display the last 5 reviews with star ratings
function displaySupplierReviews(supplier) {
    const reviewsList = document.querySelector('.custom-testimonial-slider');
    let reviewItems = '';

    // Loop over reviews and stars (columns 16 to 25)
    for (let i = 20; i <= 28; i += 2) {
        const stars = supplier[i];     // Review stars
        const reviewText = supplier[i + 1]; // Review details

        if (reviewText) {
            reviewItems += `
                <div class="custom-testimonial-item">
                    <div class="review-stars">${generateStars(stars)}</div> <!-- Generate star icons -->
                    <p>${reviewText}</p>
                </div>
            `;
        }
    }

    if (reviewItems) {
        reviewsList.innerHTML = reviewItems;
        initCustomTestimonialSlider();  // Initialize the slider functionality
    } else {
        reviewsList.innerHTML = '<p>Este proveedor no tiene reseñas</p>';
    }
}

// Generate star icons based on the number of stars
function generateStars(stars) {
    let starIcons = '';
    const totalStars = 5;
    const filledStars = parseInt(stars, 10); // Convert the stars to an integer

    for (let i = 0; i < filledStars; i++) {
        starIcons += '&#9733;'; // Filled star (★)
    }
    for (let i = filledStars; i < totalStars; i++) {
        starIcons += '&#9734;'; // Empty star (☆)
    }
    return starIcons;
}

// Initialize slider functionality
function initCustomTestimonialSlider() {
    const testimonials = document.querySelectorAll('.custom-testimonial-item');
    let currentIndex = 0;

    function showTestimonial(index) {
        testimonials.forEach((item, i) => {
            item.style.display = i === index ? 'block' : 'none';
        });
    }

    // Show the first testimonial
    if (testimonials.length > 0) {
        showTestimonial(currentIndex);

        // Set an interval to automatically change the testimonial every 5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 5000);
    }
}
