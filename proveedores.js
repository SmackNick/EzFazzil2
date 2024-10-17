const apiUrl = 'https://prov0088.ezfazzil.workers.dev/';

// Pagination Variables
let currentPage = 1;
const rowsPerPage = 10;
let totalPages = 1;
let suppliersData = [];
let filteredData = [];
let showAllSuppliers = false;

// Helper function to normalize strings for comparison
function normalizeString(str) {
    return str.toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
}

// Fetch category filter from URL (if present)
const urlParams = new URLSearchParams(window.location.search);
const categoryFilterParam = urlParams.get('category') ? decodeURIComponent(urlParams.get('category')) : '';
console.log("Category filter param:", categoryFilterParam);

// Helper function to find the best matching category
function findBestMatchingCategory(categoryParam, categories) {
    const normalizedParam = normalizeString(categoryParam);
    let bestMatch = '';
    let highestSimilarity = 0;

    categories.forEach(category => {
        const normalizedCategory = normalizeString(category);
        if (normalizedCategory.includes(normalizedParam) || normalizedParam.includes(normalizedCategory)) {
            const similarity = Math.max(
                normalizedCategory.length / normalizedParam.length,
                normalizedParam.length / normalizedCategory.length
            );
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = category;
            }
        }
    });

    return bestMatch;
}

// Fetch the supplier data from Google Sheets
fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Data fetched successfully:", data);
        const rows = data.values;
        if (rows && rows.length > 1) {
            suppliersData = rows.slice(1); // Exclude header row
            suppliersData.sort((a, b) => parseFloat(b[12]) - parseFloat(a[12])); // Sort by rating (column 9)
            console.log("Sorted suppliersData:", suppliersData);

            populateFilters(suppliersData);  // Populate filter options

            if (categoryFilterParam) {
                console.log("Applying category filter:", categoryFilterParam);
                const categorySelect = document.querySelector('#filter-category');
                const categories = Array.from(categorySelect.options).map(option => option.value).filter(value => value !== '');
                const bestMatch = findBestMatchingCategory(categoryFilterParam, categories);
                
                if (bestMatch) {
                    categorySelect.value = bestMatch;
                    console.log("Category select value set to:", categorySelect.value);
                } else {
                    console.log("No matching category found for:", categoryFilterParam);
                }
                filterSuppliers();
            } else {
                console.log("No category filter, showing all suppliers");
                filteredData = [...suppliersData];
                currentPage = 1;
                totalPages = Math.ceil(filteredData.length / rowsPerPage);
                displaySuppliers(filteredData, currentPage);
                updatePagination();
            }
        } else {
            throw new Error('No data found or invalid data structure');
        }
    })
    .catch(error => {
        console.error('Error fetching supplier data:', error);
        displayErrorMessage('Failed to load supplier data. Please try again later.');
    });

// Display the supplier data in the table (pagination)
function displaySuppliers(data, page) {
    const tableBody = document.querySelector('#proveedores-table tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }
    
    tableBody.innerHTML = ''; // Clear existing data

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((row, index) => {
        if (row.length >= 9) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${start + index + 1}</td>
                <td><a href="perfil.html?supplierId=${row[0]}">${row[1]}</a></td>
                <td>${row[2]}</td>
                <td>${row[3]}</td>
                <td>${row[4]}</td>
                <td>${row[5]}</td>
                <td>${row[6]}</td>
                <td>${row[8]}</td>
                <td>${row[17] ? `<a href="https://www.instagram.com/explore/tags/${row[17].replace('#', '')}" target="_blank">${row[17]}</a>` : ''}</td>
                <td>${row[12]}</td>
            `;
            tableBody.appendChild(tr);
        }
    });
}

// Populate the filters with unique options
function populateFilters(data) {
    const cityFilter = document.querySelector('#filter-city');
    const regionFilter = document.querySelector('#filter-region');
    const categoryFilter = document.querySelector('#filter-category');

    if (!cityFilter || !regionFilter || !categoryFilter) {
        console.error('One or more filter elements not found');
        return;
    }

    const cities = new Set();
    const regions = new Set();
    const categories = new Set();

    data.forEach((row) => {
        if (row.length >= 6) {
            cities.add(row[3]);
            regions.add(row[4]);
            categories.add(row[5]);
        }
    });

    populateSelect(cityFilter, cities);
    populateSelect(regionFilter, regions);
    populateSelect(categoryFilter, categories);

    console.log("Filters populated:", {
        cities: Array.from(cities),
        regions: Array.from(regions),
        categories: Array.from(categories)
    });

    // Add event listeners to filter on change
    [cityFilter, regionFilter, categoryFilter].forEach(filter => 
        filter.addEventListener('change', filterSuppliers)
    );
}

// Helper function to populate select elements
function populateSelect(selectElement, options) {
    selectElement.innerHTML = '<option value="">Todos</option>'; // Reset and add default option
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Filter the suppliers based on selected filters
const filterSuppliers = debounce(() => {
    const cityFilter = document.querySelector('#filter-city').value;
    const regionFilter = document.querySelector('#filter-region').value;
    const categoryFilter = document.querySelector('#filter-category').value;
    const searchQuery = document.querySelector('#search-bar').value.toLowerCase();

    console.log("Filtering with - City:", cityFilter, "Region:", regionFilter, "Category:", categoryFilter, "Search:", searchQuery);

    if (!cityFilter && !regionFilter && !categoryFilter && !searchQuery) {
        // If all filters are empty, show all suppliers
        filteredData = [...suppliersData];
    } else {
        filteredData = suppliersData.filter(row => {
            if (row.length < 6) {
                console.warn("Row has insufficient data:", row);
                return false;
            }
            const matchesCity = normalizeString(row[3]).includes(normalizeString(cityFilter)) || cityFilter === '';
            const matchesRegion = normalizeString(row[4]).includes(normalizeString(regionFilter)) || regionFilter === '';
            const matchesCategory = normalizeString(row[5]).includes(normalizeString(categoryFilter)) || categoryFilter === '';
            const matchesSearch = row.slice(1, 7).some(cell => normalizeString(cell).includes(normalizeString(searchQuery)));

            return matchesCity && matchesRegion && matchesCategory && matchesSearch;
        });
    }

    console.log("Filtered data:", filteredData);

    currentPage = 1;
    totalPages = Math.ceil(filteredData.length / rowsPerPage);
    displaySuppliers(filteredData, currentPage);
    updatePagination();
}, 300);

// Add event listener for search input
document.getElementById('search-bar').addEventListener('input', filterSuppliers);

// Clear filters and reset the table
document.querySelector('.clear-filters').addEventListener('click', () => {
    document.querySelector('#filter-city').value = '';
    document.querySelector('#filter-region').value = '';
    document.querySelector('#filter-category').value = '';
    document.querySelector('#search-bar').value = '';

    filteredData = [...suppliersData]; // Use spread operator to create a new array
    currentPage = 1;
    totalPages = Math.ceil(filteredData.length / rowsPerPage);
    displaySuppliers(filteredData, currentPage);
    updatePagination();
});

// Pagination Controls
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displaySuppliers(filteredData, currentPage);
        updatePagination();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        displaySuppliers(filteredData, currentPage);
        updatePagination();
    }
});

// Update the pagination controls
function updatePagination() {
    const pageInfo = document.getElementById('page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    if (!pageInfo || !prevButton || !nextButton) {
        console.error('Pagination elements not found');
        return;
    }

    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// Toggle for hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
console.log(hamburger, navLinks);  // Check if these elements exist in the page

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
    });
}

// Function to display error messages
function displayErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('main').prepend(errorDiv);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Any additional initialization code can go here
});