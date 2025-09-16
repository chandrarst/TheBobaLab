const CURRENCY_FORMATTER = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

function formatCurrency(value) {
    return CURRENCY_FORMATTER.format(value).replace(/\u00A0/g, ' ');
}

function prettifyTag(tag) {
    return tag
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, character => character.toUpperCase());
}

function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');

    if (!loadingScreen) {
        document.body.classList.add('loaded');
        return null;
    }

    const progressBar = loadingScreen.querySelector('.loading-bar-fill');
    const statusText = loadingScreen.querySelector('.loading-status');
    let progress = 0;
    let completed = false;

    const updateProgress = value => {
        const upperBound = completed ? 100 : 96;
        const clampedValue = Math.min(value, upperBound);
        progress = Math.max(progress, clampedValue);

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (statusText) {
            statusText.textContent = `${Math.round(progress)}%`;
        }
    };

    const intervalId = window.setInterval(() => {
        if (completed || progress >= 96) {
            return;
        }

        const increment = Math.random() * 6 + 2;
        updateProgress(progress + increment);
    }, 180);

    const finalize = () => {
        if (completed) {
            return;
        }

        completed = true;
        window.clearInterval(intervalId);
        updateProgress(100);
        loadingScreen.setAttribute('aria-hidden', 'true');
        document.body.classList.add('loaded');

        window.setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 520);
    };

    if (document.readyState === 'complete') {
        window.setTimeout(finalize, 0);
    } else {
        window.addEventListener('load', finalize, { once: true });
    }

    return {
        advance(amount = 18) {
            if (completed) {
                return;
            }

            updateProgress(progress + amount);
        },
        complete: finalize
    };
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

function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');
    const header = document.querySelector('.site-header');

    if (!navToggle || !nav || !header) {
        return;
    }

    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }

    const closeNav = () => {
        if (!document.body.classList.contains('nav-open')) {
            return;
        }
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
    };

    const openNav = () => {
        if (document.body.classList.contains('nav-open')) {
            return;
        }
        document.body.classList.add('nav-open');
        navToggle.setAttribute('aria-expanded', 'true');
    };

    navToggle.addEventListener('click', () => {
        if (document.body.classList.contains('nav-open')) {
            closeNav();
        } else {
            openNav();
        }
    });

    overlay.addEventListener('click', closeNav);

    nav.addEventListener('click', event => {
        const target = event.target;
        if (target instanceof HTMLElement && target.tagName === 'A') {
            closeNav();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            closeNav();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
            closeNav();
            navToggle.focus();
        }
    });

    const updateHeaderElevation = () => {
        if (window.scrollY > 16) {
            header.classList.add('is-elevated');
        } else {
            header.classList.remove('is-elevated');
        }
    };

    updateHeaderElevation();
    window.addEventListener('scroll', updateHeaderElevation);
}

function highlightActiveNav() {
    const navLinks = document.querySelectorAll('.main-nav a[href]');

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

const modalCallbacks = new WeakMap();

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) {
        existing.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });

    window.setTimeout(() => {
        toast.classList.remove('visible');
        window.setTimeout(() => toast.remove(), 320);
    }, 3200);
}

function openModal(modal) {
    if (!modal) {
        return;
    }

    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
        modal.classList.add('is-open');
    });
    document.body.classList.add('modal-open');
}

function closeModal(modal) {
    if (!modal) {
        return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    const callback = modalCallbacks.get(modal);
    if (typeof callback === 'function') {
        callback();
    }

    window.setTimeout(() => {
        if (!modal.classList.contains('is-open')) {
            modal.setAttribute('hidden', '');
        }

        if (!document.querySelector('.modal.is-open')) {
            document.body.classList.remove('modal-open');
        }
    }, 250);
}

function attachModalDismiss(modal, onClose) {
    if (!modal) {
        return;
    }

    if (typeof onClose === 'function') {
        modalCallbacks.set(modal, onClose);
    }

    const dismissTriggers = modal.querySelectorAll('[data-close-modal]');
    dismissTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => closeModal(modal));
    });

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });
}

document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') {
        return;
    }

    const openModals = Array.from(document.querySelectorAll('.modal.is-open'));
    const lastModal = openModals.pop();
    if (lastModal) {
        closeModal(lastModal);
    }
});

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

function buildKey(id, options) {
    return [id, options.ice, options.sweetness, options.topping].join('|').toLowerCase();
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
    const customizeModal = document.querySelector('#customize-modal');
    const checkoutModal = document.querySelector('#checkout-modal');

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
    const totals = {
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0
    };
    let currentCustomization = null;
    let selectedPaymentMethod = 'qris';

    const customizeElements = customizeModal ? {
        title: customizeModal.querySelector('[data-modal-title]'),
        description: customizeModal.querySelector('[data-modal-description]'),
        image: customizeModal.querySelector('[data-modal-image]'),
        volume: customizeModal.querySelector('[data-modal-volume]'),
        basePrice: customizeModal.querySelector('[data-modal-price]'),
        total: customizeModal.querySelector('[data-modal-total]'),
        optionGroups: {
            ice: customizeModal.querySelector('[data-option-group="ice"]'),
            sweetness: customizeModal.querySelector('[data-option-group="sweetness"]'),
            topping: customizeModal.querySelector('[data-option-group="topping"]')
        },
        selectionLabels: {
            ice: customizeModal.querySelector('[data-selection-label="ice"]'),
            sweetness: customizeModal.querySelector('[data-selection-label="sweetness"]'),
            topping: customizeModal.querySelector('[data-selection-label="topping"]')
        },
        quantityValue: customizeModal.querySelector('[data-quantity-value]'),
        addButton: customizeModal.querySelector('[data-action="add-to-cart"]'),
        decreaseButton: customizeModal.querySelector('[data-quantity-action="decrease"]'),
        increaseButton: customizeModal.querySelector('[data-quantity-action="increase"]')
    } : null;

    const checkoutElements = checkoutModal ? {
        summaryList: checkoutModal.querySelector('[data-checkout-summary]'),
        promoMessage: checkoutModal.querySelector('[data-checkout-promo]'),
        subtotal: checkoutModal.querySelector('[data-checkout-subtotal]'),
        discountRow: checkoutModal.querySelector('[data-checkout-discount-row]'),
        discountValue: checkoutModal.querySelector('[data-checkout-discount]'),
        shipping: checkoutModal.querySelector('[data-checkout-shipping]'),
        total: checkoutModal.querySelector('[data-checkout-total]'),
        confirmButton: checkoutModal.querySelector('[data-action="confirm-checkout"]'),
        paymentOptions: checkoutModal.querySelectorAll('.payment-option'),
        paymentInfos: checkoutModal.querySelectorAll('.payment-info')
    } : null;

    attachModalDismiss(customizeModal, () => {
        currentCustomization = null;
    });
    attachModalDismiss(checkoutModal);

    if (customizeModal) {
        customizeModal.setAttribute('aria-hidden', 'true');
    }
    if (checkoutModal) {
        checkoutModal.setAttribute('aria-hidden', 'true');
    }

    const parseOptions = value => (value ? value.split('|').map(option => option.trim()).filter(Boolean) : []);

    function getMenuData(card) {
        const options = {
            ice: parseOptions(card.dataset.iceOptions),
            sweetness: parseOptions(card.dataset.sweetnessOptions),
            topping: parseOptions(card.dataset.toppingOptions)
        };
        const defaults = {
            ice: card.dataset.defaultIce || options.ice[0] || 'Normal Ice',
            sweetness: card.dataset.defaultSweetness || options.sweetness[0] || 'Normal Sugar',
            topping: card.dataset.defaultTopping || options.topping[0] || 'Tanpa Tambahan'
        };
        const imageElement = card.querySelector('.menu-image img');
        const descriptionElement = card.querySelector('.menu-info p');
        const volumeElement = card.querySelector('.menu-volume');

        return {
            id: card.dataset.id,
            name: card.dataset.name,
            price: Number(card.dataset.price) || 0,
            image: imageElement ? imageElement.getAttribute('src') : '',
            description: descriptionElement ? descriptionElement.textContent : '',
            volume: volumeElement ? volumeElement.textContent : '',
            options,
            defaults
        };
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

        totals.subtotal = subtotal;
        totals.shipping = shippingFee;
        totals.discount = discount;
        totals.total = total;

        if (checkoutButton) {
            checkoutButton.disabled = !hasItems;
            checkoutButton.textContent = hasItems ? 'Checkout Sekarang' : 'Keranjang masih kosong';
        }
    }

    function addItemToCart(itemData, selectedOptions, quantity = 1) {
        if (!itemData) {
            return;
        }

        const normalizedOptions = {
            ice: selectedOptions?.ice || itemData.defaults.ice,
            sweetness: selectedOptions?.sweetness || itemData.defaults.sweetness,
            topping: selectedOptions?.topping || itemData.defaults.topping
        };

        const key = buildKey(itemData.id, normalizedOptions);
        const existing = cart.find(item => item.key === key);

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                id: itemData.id,
                name: itemData.name,
                price: itemData.price,
                options: { ...normalizedOptions },
                optionsLabel: buildOptionsLabel(normalizedOptions),
                quantity,
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
        const priceElement = card.querySelector('[data-price-display]');
        if (priceElement) {
            const price = Number(card.dataset.price) || 0;
            priceElement.textContent = formatCurrency(price);
        }

        const tags = card.dataset.tags ? card.dataset.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
        const tagContainer = card.querySelector('[data-taglist]');
        if (tagContainer && !tagContainer.children.length && tags.length) {
            const fragment = document.createDocumentFragment();
            tags.slice(0, 3).forEach(tag => {
                const badge = document.createElement('span');
                badge.textContent = prettifyTag(tag);
                fragment.appendChild(badge);
            });
            tagContainer.appendChild(fragment);
        }

        const addButton = card.querySelector('.add-btn');
        if (!addButton) {
            return;
        }

        addButton.addEventListener('click', () => {
            openCustomizeModal(card);
        });
    });

    function updateCustomizeTotal() {
        if (!currentCustomization || !customizeElements) {
            return;
        }

        const total = currentCustomization.data.price * currentCustomization.quantity;
        if (customizeElements.total) {
            customizeElements.total.textContent = formatCurrency(total);
        }
    }

    function updateOptionGroup(type) {
        if (!currentCustomization || !customizeElements) {
            return;
        }

        const group = customizeElements.optionGroups[type];
        const label = customizeElements.selectionLabels[type];
        if (!group) {
            return;
        }

        const values = currentCustomization.data.options[type] || [];
        const section = group.closest('.option-group');

        if (!values.length) {
            if (section) {
                section.hidden = true;
            }
            return;
        }

        if (section) {
            section.hidden = false;
        }

        group.innerHTML = '';
        values.forEach(optionValue => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = optionValue;
            button.className = 'option-pill';
            if (optionValue === currentCustomization.selected[type]) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentCustomization.selected[type] = optionValue;
                updateOptionGroup(type);
                updateCustomizeTotal();
            });
            group.appendChild(button);
        });

        if (label) {
            label.textContent = currentCustomization.selected[type] || '—';
        }
    }

    function renderCustomizeModal(menuData) {
        if (!customizeElements) {
            return;
        }

        if (customizeElements.title) {
            customizeElements.title.textContent = menuData.name;
        }
        if (customizeElements.description) {
            customizeElements.description.textContent = menuData.description;
        }
        if (customizeElements.image) {
            customizeElements.image.src = menuData.image || '';
            customizeElements.image.alt = menuData.name || '';
        }
        if (customizeElements.volume) {
            customizeElements.volume.textContent = menuData.volume || '';
        }
        if (customizeElements.basePrice) {
            customizeElements.basePrice.textContent = formatCurrency(menuData.price);
        }
        if (customizeElements.quantityValue) {
            customizeElements.quantityValue.textContent = String(currentCustomization.quantity);
        }

        updateOptionGroup('ice');
        updateOptionGroup('sweetness');
        updateOptionGroup('topping');
        updateCustomizeTotal();
    }

    function openCustomizeModal(card) {
        const data = getMenuData(card);
        if (!customizeModal || !customizeElements) {
            addItemToCart(data, data.defaults, 1);
            showToast(`${data.name} ditambahkan ke keranjang.`);
            return;
        }

        currentCustomization = {
            data,
            selected: { ...data.defaults },
            quantity: 1
        };

        renderCustomizeModal(data);
        openModal(customizeModal);
    }

    if (customizeElements) {
        if (customizeElements.decreaseButton) {
            customizeElements.decreaseButton.addEventListener('click', () => {
                if (!currentCustomization || currentCustomization.quantity <= 1) {
                    return;
                }
                currentCustomization.quantity -= 1;
                if (customizeElements.quantityValue) {
                    customizeElements.quantityValue.textContent = String(currentCustomization.quantity);
                }
                updateCustomizeTotal();
            });
        }

        if (customizeElements.increaseButton) {
            customizeElements.increaseButton.addEventListener('click', () => {
                if (!currentCustomization) {
                    return;
                }
                currentCustomization.quantity += 1;
                if (customizeElements.quantityValue) {
                    customizeElements.quantityValue.textContent = String(currentCustomization.quantity);
                }
                updateCustomizeTotal();
            });
        }

        if (customizeElements.addButton) {
            customizeElements.addButton.addEventListener('click', () => {
                if (!currentCustomization) {
                    return;
                }
                addItemToCart(currentCustomization.data, currentCustomization.selected, currentCustomization.quantity);
                closeModal(customizeModal);
                showToast(`${currentCustomization.data.name} ditambahkan ke keranjang.`);
                currentCustomization = null;
            });
        }
    }

    function updatePaymentDetail(method) {
        if (!checkoutElements) {
            return;
        }

        selectedPaymentMethod = method;

        checkoutElements.paymentOptions.forEach(option => {
            const input = option.querySelector('input[type="radio"]');
            const isActive = input && input.value === method;
            if (input) {
                input.checked = isActive;
            }
            option.classList.toggle('selected', Boolean(isActive));
        });

        checkoutElements.paymentInfos.forEach(info => {
            info.hidden = info.dataset.method !== method;
        });
    }

    function populateCheckoutModal() {
        if (!checkoutElements) {
            return;
        }

        if (checkoutElements.summaryList) {
            checkoutElements.summaryList.innerHTML = '';

            cart.forEach(item => {
                const li = document.createElement('li');
                li.className = 'checkout-item';
                li.innerHTML = `
                    <div class="item-info">
                        <strong>${item.name}</strong>
                        <span>${item.optionsLabel}</span>
                    </div>
                    <div class="item-totals">
                        <span class="item-quantity">x${item.quantity}</span>
                        <span class="item-total">${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `;
                checkoutElements.summaryList.appendChild(li);
            });
        }

        if (checkoutElements.promoMessage) {
            if (appliedPromo && totals.discount > 0) {
                checkoutElements.promoMessage.hidden = false;
                const promoText = appliedPromo.code ? `${appliedPromo.message} (${appliedPromo.code})` : appliedPromo.message;
                checkoutElements.promoMessage.textContent = promoText || '';
            } else {
                checkoutElements.promoMessage.hidden = true;
                checkoutElements.promoMessage.textContent = '';
            }
        }

        if (checkoutElements.subtotal) {
            checkoutElements.subtotal.textContent = formatCurrency(totals.subtotal);
        }
        if (checkoutElements.shipping) {
            checkoutElements.shipping.textContent = formatCurrency(totals.shipping);
        }
        if (checkoutElements.total) {
            checkoutElements.total.textContent = formatCurrency(totals.total);
        }
        if (checkoutElements.discountRow && checkoutElements.discountValue) {
            if (totals.discount > 0) {
                checkoutElements.discountRow.hidden = false;
                checkoutElements.discountValue.textContent = `-${formatCurrency(totals.discount)}`;
            } else {
                checkoutElements.discountRow.hidden = true;
            }
        }
    }

    if (checkoutElements && checkoutElements.paymentOptions.length) {
        checkoutElements.paymentOptions.forEach(option => {
            const input = option.querySelector('input[type="radio"]');
            if (!input) {
                return;
            }

            input.addEventListener('change', () => {
                updatePaymentDetail(input.value);
            });

            option.addEventListener('click', event => {
                if (event.target !== input) {
                    input.checked = true;
                    updatePaymentDetail(input.value);
                }
            });
        });

        updatePaymentDetail(selectedPaymentMethod);
    }

    if (checkoutButton && checkoutModal && checkoutElements) {
        checkoutButton.addEventListener('click', () => {
            if (!cart.length) {
                return;
            }
            populateCheckoutModal();
            updatePaymentDetail(selectedPaymentMethod);
            openModal(checkoutModal);
        });
    }

    if (checkoutElements && checkoutElements.confirmButton) {
        checkoutElements.confirmButton.addEventListener('click', () => {
            if (!cart.length) {
                closeModal(checkoutModal);
                return;
            }

            const paymentMessages = {
                qris: 'Scan kode QR untuk menyelesaikan pembayaran.',
                transfer: 'Transfer ke rekening BCA 123 456 7890 (a.n. The Boba Lab).',
                cod: 'Bayar langsung saat pesanan diterima atau diambil.'
            };

            const paymentNote = paymentMessages[selectedPaymentMethod] || 'Pesananmu sedang diproses.';
            showToast(`Pesananmu sedang diproses. ${paymentNote}`);

            cart.length = 0;
            updateCartUI();
            closeModal(checkoutModal);
        });
    }

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

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    navigator.serviceWorker.register('service-worker.js').catch(error => {
        console.warn('Service worker registration failed:', error);
    });
}

const loadingController = initLoadingScreen();

document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initNavigation();
    highlightActiveNav();

    if (document.body.classList.contains('order-page')) {
        initOrderExperience();
    }

    if (loadingController) {
        loadingController.advance(28);
    }

    registerServiceWorker();
});
