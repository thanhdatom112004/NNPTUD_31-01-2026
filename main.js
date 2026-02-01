const API_URL = 'https://api.escuelajs.co/api/v1/products';

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let perPage = 10;
let sortBy = null; // 'price-asc' | 'price-desc' | 'title-asc' | 'title-desc'

const tableBody = document.getElementById('tableBody');
const paginationEl = document.getElementById('pagination');
const searchInput = document.getElementById('search');
const perPageSelect = document.getElementById('perPage');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

/**
 * Lấy toàn bộ sản phẩm từ API (hàm getall của dashboard)
 */
async function getAll() {
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Lỗi khi tải dữ liệu');
        allProducts = await res.json();
        applyFiltersAndRender();
    } catch (err) {
        errorEl.textContent = err.message || 'Không thể tải sản phẩm.';
        errorEl.style.display = 'block';
        tableBody.innerHTML = '';
    } finally {
        loadingEl.style.display = 'none';
    }
}

function filterByTitle(list, keyword) {
    if (!keyword || !keyword.trim()) return list;
    const k = keyword.trim().toLowerCase();
    return list.filter(p => (p.title || '').toLowerCase().includes(k));
}

function sortList(list) {
    if (!sortBy) return [...list];
    const arr = [...list];
    switch (sortBy) {
        case 'price-asc':
            return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
        case 'price-desc':
            return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
        case 'title-asc':
            return arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        case 'title-desc':
            return arr.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        default:
            return arr;
    }
}

function applyFiltersAndRender() {
    const keyword = searchInput.value;
    filteredProducts = filterByTitle(allProducts, keyword);
    filteredProducts = sortList(filteredProducts);
    currentPage = 1;
    renderTable();
    renderPagination();
}

function getPageData() {
    const start = (currentPage - 1) * perPage;
    return filteredProducts.slice(start, start + perPage);
}

function renderTable() {
    const pageData = getPageData();
    tableBody.innerHTML = pageData.map(p => {
        const imgUrl = (p.images && p.images[0]) ? p.images[0] : '';
        const categoryName = (p.category && p.category.name) ? p.category.name : '-';
        return `
            <tr>
                <td>${p.id}</td>
                <td class="img-cell"><img src="${imgUrl}" alt="${(p.title || '').replace(/"/g, '&quot;')}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22>No image</text></svg>'"></td>
                <td>${escapeHtml(p.title || '-')}</td>
                <td>${typeof p.price === 'number' ? p.price : '-'}</td>
                <td>${escapeHtml(categoryName)}</td>
            </tr>
        `;
    }).join('');

    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">Không có sản phẩm nào.</td></tr>';
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderPagination() {
    const total = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    currentPage = Math.min(currentPage, totalPages);

    let html = '';
    if (totalPages > 1) {
        html += `<button type="button" ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">Trước</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button type="button" class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        html += `<button type="button" ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Sau</button>`;
    }
    html += `<span class="pagination-info">Trang ${currentPage}/${totalPages} (${total} sản phẩm)</span>`;
    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll('button[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page, 10);
            renderTable();
            renderPagination();
        });
    });
}

// --- Event listeners ---
searchInput.addEventListener('input', () => applyFiltersAndRender());

perPageSelect.addEventListener('change', () => {
    perPage = parseInt(perPageSelect.value, 10);
    currentPage = 1;
    applyFiltersAndRender();
});

document.getElementById('sort-price-asc').addEventListener('click', () => {
    sortBy = 'price-asc';
    applyFiltersAndRender();
});
document.getElementById('sort-price-desc').addEventListener('click', () => {
    sortBy = 'price-desc';
    applyFiltersAndRender();
});
document.getElementById('sort-title-asc').addEventListener('click', () => {
    sortBy = 'title-asc';
    applyFiltersAndRender();
});
document.getElementById('sort-title-desc').addEventListener('click', () => {
    sortBy = 'title-desc';
    applyFiltersAndRender();
});

// Khởi chạy
getAll();
