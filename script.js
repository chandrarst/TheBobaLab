const CURRENCY_FORMATTER = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

function formatCurrency(value) {
    return CURRENCY_FORMATTER.format(value).replace(/\u00A0/g, ' ');
}

function initSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) {
        return;
    }

    const slides = slider.querySelectorAll('.slide');
    const texts = slider.querySelectorAll('.slide-text');
    const dots = slider.querySelectorAll('.dots-container .dot');
    const slidesContainer = slider.querySelector('.slides');

    if (!slides.length || !slidesContainer) {
        return;
    }

    let currentIndex = 0;
    const slideDuration = 4000;
    let intervalId;

    function showSlide(index) {
        slides.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === index);
        });
        texts.forEach((text, idx) => {
            text.classList.toggle('active', idx === index);
        });
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === index);
        });

        slidesContainer.style.transform = `translateX(${-index * 100}%)`;
    }

    function stopAutoPlay() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function startAutoPlay() {
        stopAutoPlay();
        intervalId = window.setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        }, slideDuration);
    }

    function goToSlide(index) {
        currentIndex = index;
        showSlide(currentIndex);
        startAutoPlay();
    }

    if (dots.length) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });
    }

    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);

    showSlide(currentIndex);
    startAutoPlay();
}

function initHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('header nav');

    if (!hamburger || !nav) {
        return;
    }

    hamburger.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
}

function highlightActiveNav() {
    const navLinks = document.querySelectorAll('header nav a[href]');

    if (!navLinks.length) {
        return;
    }

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) {
            return;
        }

        const normalizedHref = href.replace('./', '');
        if (normalizedHref === currentPath) {
            link.classList.add('active');
        }
    });
}

function createCartItemElement(item) {
    const listItem = document.createElement('li');
    listItem.className = 'cart-item';
    listItem.innerHTML = `
        <div class="item-info">
            <h4>${item.name}</h4>
            <span>${item.optionsLabel}</span>
        </div>
        <div class="item-meta">
            <div class="quantity-control" aria-label="Atur jumlah ${item.name}">
                <button type="button" class="qty-btn" data-action="decrease" data-key="${item.key}" aria-label="Kurangi ${item.name}">−</button>
                <span class="quantity">${item.quantity}</span>
                <button type="button" class="qty-btn" data-action="increase" data-key="${item.key}" aria-label="Tambah ${item.name}">+</button>
            </div>
            <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
        </div>
        <button type="button" class="remove-item" data-action="remove" data-key="${item.key}" aria-label="Hapus ${item.name} dari keranjang">✕</button>
    `;

    return listItem;
}

function buildOptionsLabel(options) {
    const readable = [options.ice, options.sweetness];
    if (options.topping && options.topping !== 'Tanpa Tambahan') {
        readable.push(options.topping);
    }

    return readable.join(' • ');
}

function initOrderExperience() {
    const menuCards = document.querySelectorAll('.menu-card');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCountElement = document.querySelector('.cart-count');
    const subtotalElement = document.querySelector('[data-subtotal]');
    const shippingElement = document.querySelector('[data-shipping]');
    const totalElement = document.querySelector('[data-total]');
    const discountRow = document.querySelector('.summary-row.discount');
    const discountValueElement = document.querySelector('[data-discount]');
    const checkoutButton = document.querySelector('.checkout-btn');
    const emptyCartMessage = document.querySelector('.empty-cart');
    const menuEmptyMessage = document.querySelector('.menu-empty');
    const searchInput = document.querySelector('#search');
    const tagButtons = document.querySelectorAll('.menu-tags .tag');
    const promoForm = document.querySelector('.promo-form');
    const promoInput = document.querySelector('#promo-code');
    const promoMessage = document.querySelector('.promo-message');

    if (!menuCards.length || !cartItemsContainer || !cartCountElement || !subtotalElement || !shippingElement || !totalElement) {
        return;
    }

    const SHIPPING_FEE = 8000;
    const PROMO_CODES = {
        BOBALAB10: {
            type: 'percentage',
            value: 0.1,
            message: 'Yeay! Diskon 10% telah diterapkan.'
        },
        LABFREESHIP: {
            type: 'shipping',
            value: 1,
            message: 'Gratis ongkir aktif untuk transaksi ini.'
        }
    };

    const cart = [];
    let activeFilter = 'all';
    let appliedPromo = null;

    menuCards.forEach(card => {
        const priceElement = card.querySelector('[data-price-display]');
        if (priceElement) {
            const price = Number(card.dataset.price) || 0;
            priceElement.textContent = formatCurrency(price);
        }
    });

    function getOptionsFromCard(card) {
        const ice = card.querySelector('select[name="ice"]');
        const sweetness = card.querySelector('select[name="sweetness"]');
        const topping = card.querySelector('select[name="topping"]');

        return {
            ice: ice ? ice.value : 'Normal Ice',
            sweetness: sweetness ? sweetness.value : 'Normal Sugar',
            topping: topping ? topping.value : 'Tanpa Tambahan'
        };
    }

    function buildKey(id, options) {
        return [id, options.ice, options.sweetness, options.topping].join('|').toLowerCase();
    }

    function updateCartUI() {
        const hasItems = cart.length > 0;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        let subtotal = 0;

        cartItemsContainer.innerHTML = '';

        if (hasItems) {
            cart.forEach(item => {
                subtotal += item.price * item.quantity;
                cartItemsContainer.appendChild(createCartItemElement(item));
            });
        }

        if (emptyCartMessage) {
            emptyCartMessage.hidden = hasItems;
        }

        cartCountElement.textContent = `${totalItems} item`;

        let discount = 0;
        let shippingFee = hasItems ? SHIPPING_FEE : 0;

        if (!hasItems) {
            appliedPromo = null;
            if (promoMessage) {
                promoMessage.textContent = '';
                promoMessage.classList.remove('error');
            }
            if (promoInput) {
                promoInput.value = '';
            }
        }

        if (appliedPromo && hasItems) {
            if (appliedPromo.type === 'percentage') {
                discount = Math.floor(subtotal * appliedPromo.value);
            } else if (appliedPromo.type === 'shipping') {
                shippingFee = 0;
            }
        }

        if (discountRow && discountValueElement) {
            if (discount > 0) {
                discountRow.hidden = false;
                discountValueElement.textContent = `-${formatCurrency(discount)}`;
            } else {
                discountRow.hidden = true;
                discountValueElement.textContent = `-${formatCurrency(0)}`;
            }
        }

        subtotalElement.textContent = formatCurrency(subtotal);
        shippingElement.textContent = formatCurrency(shippingFee);

        const total = Math.max(subtotal + shippingFee - discount, 0);
        totalElement.textContent = formatCurrency(total);

        if (checkoutButton) {
            checkoutButton.disabled = !hasItems;
            checkoutButton.textContent = hasItems ? 'Checkout Sekarang' : 'Keranjang masih kosong';
        }
    }

    function addItemToCart(card) {
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = Number(card.dataset.price) || 0;
        const options = getOptionsFromCard(card);

        if (!id || !name) {
            return;
        }

        const key = buildKey(id, options);
        const existing = cart.find(item => item.key === key);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price,
                options,
                optionsLabel: buildOptionsLabel(options),
                quantity: 1,
                key
            });
        }

        updateCartUI();
    }

    function removeItem(key) {
        const index = cart.findIndex(item => item.key === key);
        if (index !== -1) {
            cart.splice(index, 1);
            updateCartUI();
        }
    }

    function changeQuantity(key, delta) {
        const item = cart.find(cartItem => cartItem.key === key);
        if (!item) {
            return;
        }

        item.quantity += delta;

        if (item.quantity <= 0) {
            removeItem(key);
            return;
        }

        updateCartUI();
    }

    function applyFilter() {
        const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let visibleItems = 0;

        menuCards.forEach(card => {
            const name = card.dataset.name ? card.dataset.name.toLowerCase() : '';
            const tags = card.dataset.tags ? card.dataset.tags.toLowerCase() : '';
            const descriptionElement = card.querySelector('p');
            const description = descriptionElement ? descriptionElement.textContent.toLowerCase() : '';

            const matchesSearch = !searchValue || name.includes(searchValue) || description.includes(searchValue);
            const matchesTag = activeFilter === 'all' || tags.split(',').map(tag => tag.trim()).includes(activeFilter);
            const shouldShow = matchesSearch && matchesTag;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleItems += 1;
            }
        });

        if (menuEmptyMessage) {
            menuEmptyMessage.hidden = visibleItems > 0;
        }
    }

    menuCards.forEach(card => {
        const addButton = card.querySelector('.add-btn');
        if (!addButton) {
            return;
        }

        addButton.addEventListener('click', () => {
            addButton.disabled = true;
            addItemToCart(card);
            addButton.classList.add('added');
            addButton.textContent = 'Ditambahkan!';

            window.setTimeout(() => {
                addButton.disabled = false;
                addButton.classList.remove('added');
                addButton.textContent = 'Tambah';
            }, 900);
        });
    });

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', event => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            const action = target.dataset.action;
            const key = target.dataset.key;

            if (!action || !key) {
                return;
            }

            if (action === 'increase') {
                changeQuantity(key, 1);
            } else if (action === 'decrease') {
                changeQuantity(key, -1);
            } else if (action === 'remove') {
                removeItem(key);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
    }

    if (tagButtons.length) {
        tagButtons.forEach(button => {
            button.addEventListener('click', () => {
                tagButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                activeFilter = button.dataset.filter || 'all';
                applyFilter();
            });
        });
    }

    if (promoForm && promoInput && promoMessage) {
        promoForm.addEventListener('submit', event => {
            event.preventDefault();

            const rawCode = promoInput.value.trim();

            if (!rawCode) {
                if (appliedPromo) {
                    appliedPromo = null;
                    promoMessage.textContent = 'Kode promo dibatalkan.';
                    promoMessage.classList.remove('error');
                    updateCartUI();
                } else {
                    promoMessage.textContent = 'Masukkan kode promo terlebih dahulu.';
                    promoMessage.classList.add('error');
                }
                return;
            }

            const code = rawCode.toUpperCase();

            if (!cart.length) {
                promoMessage.textContent = 'Tambahkan menu ke keranjang sebelum menggunakan kode promo.';
                promoMessage.classList.add('error');
                return;
            }

            const promo = PROMO_CODES[code];

            if (!promo) {
                promoMessage.textContent = 'Kode promo tidak ditemukan. Coba periksa lagi ya!';
                promoMessage.classList.add('error');
                appliedPromo = null;
                updateCartUI();
                return;
            }

            appliedPromo = {
                ...promo,
                code
            };
            promoMessage.textContent = `${promo.message} (${code})`;
            promoMessage.classList.remove('error');
            updateCartUI();
        });
    }

    applyFilter();
    updateCartUI();
}

document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initHamburger();
    highlightActiveNav();

    if (document.body.classList.contains('order-page')) {
        initOrderExperience();
    }

    document.body.classList.add('loaded');
});
