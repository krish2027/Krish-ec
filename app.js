(() => {
  const CART_KEY = "novax-cart";
  const TAX_RATE = 0.10;

  const DEMO_CART = [
    {
      id: "air-max-2024",
      title: "Air Max 2024",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
      variant: "Size: 8",
      qty: 1
    },
    {
      id: "soundpro-x1",
      title: "SoundPro X1",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
      variant: "Black",
      qty: 1
    },
    {
      id: "vision-watch",
      title: "Vision Watch",
      price: 249.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
      variant: "Silver",
      qty: 1
    }
  ];

  function loadCart() {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.warn("Novax cart could not be loaded.", error);
    }
    saveCart(DEMO_CART);
    return DEMO_CART.map(item => ({ ...item }));
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCounters(cart);
  }

  function totalUnits(cart = loadCart()) {
    return cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  }

  function updateCounters(cart = loadCart()) {
    const count = totalUnits(cart);
    document.querySelectorAll("#cart-counter, #nav-badge").forEach(el => {
      el.textContent = count;
      el.classList.add("scale-125");
      setTimeout(() => el.classList.remove("scale-125"), 180);
    });
  }

  function showToast(message) {
    let toast = document.getElementById("novax-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "novax-toast";
      toast.style.cssText = `
        position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);
        z-index:9999;background:rgba(20,23,34,.96);color:#fff;padding:12px 20px;
        border:1px solid rgba(138,75,255,.45);border-radius:14px;
        box-shadow:0 12px 35px rgba(0,0,0,.6);font:600 13px 'Plus Jakarta Sans',sans-serif;
        opacity:0;transition:all .25s ease;backdrop-filter:blur(12px);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });
    clearTimeout(window.__novaxToastTimer);
    window.__novaxToastTimer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(20px)";
    }, 2000);
  }

  function addProductToCart(product, quantity = 1) {
    const qty = Math.max(1, Number(quantity) || 1);
    const cart = loadCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ ...product, qty });
    }

    saveCart(cart);
    showToast(`${qty} × ${product.title} added to cart ✓`);
  }

  window.addToCart = (amount = 1) => {
    addProductToCart(DEMO_CART[0], typeof amount === "number" ? amount : 1);
  };

  window.handleAddToCart = () => {
    const qty = Number(document.getElementById("qty-val")?.textContent || 1);
    const activeSize = document.querySelector(".size-btn.active")?.textContent?.trim() || "8";
    const product = { ...DEMO_CART[0], variant: `Size: ${activeSize}` };
    addProductToCart(product, qty);
  };

  function wireNavigation() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    // Setup active styles for current page link
    document.querySelectorAll("header nav a").forEach(a => {
      const href = a.getAttribute("href");
      if (href === currentPath) {
        a.classList.add("text-purple-400", "font-semibold");
        a.classList.remove("text-gray-300", "text-gray-400");
      }
    });

    // Mobile hamburger menu toggle
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileNav = document.getElementById("mobile-nav");
    if (menuBtn && mobileNav) {
      menuBtn.addEventListener("click", () => {
        mobileNav.classList.toggle("hidden");
      });
    }

    // CTA routing
    document.querySelectorAll(".explore-btn").forEach(btn => {
      btn.onclick = () => location.href = "shop.html";
    });
  }

  function cardToProduct(card) {
    const title = card.querySelector("h3")?.textContent.trim() || "Product";
    const priceText = card.querySelector("p")?.textContent.replace(/[^0-9.]/g, "") || "0";
    const image = card.querySelector("img")?.src || "";
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    return {
      id,
      title,
      price: Number(priceText),
      image,
      variant: card.dataset.variant || "Standard"
    };
  }

  function wireShopCards() {
    document.querySelectorAll(".product-card").forEach(card => {
      const product = cardToProduct(card);
      const imgWrap = card.querySelector("img")?.parentElement;

      if (imgWrap) {
        imgWrap.style.cursor = "pointer";
        imgWrap.title = "View product";
        imgWrap.addEventListener("click", () => location.href = "product.html");
      }

      const btn = [...card.querySelectorAll("button")].find(b => /Add to Cart/i.test(b.textContent));
      if (btn) {
        btn.onclick = (e) => {
          e.stopPropagation();
          addProductToCart(product, 1);
        };
      }
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderCartPage() {
    const container = document.getElementById("cart-items-container");
    if (!container) return;

    const cart = loadCart();

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-item-card rounded-2xl p-10 text-center">
          <div class="mx-auto mb-4 w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 8h14l-1 11H6L5 8zm3 0a4 4 0 018 0"></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white">Your cart is empty</h3>
          <p class="text-sm text-gray-400 mt-2">Add something from the catalog and it will appear here.</p>
          <a href="shop.html" class="inline-flex mt-6 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-semibold transition">Browse Products</a>
        </div>`;
      calculateTotals(cart);
      return;
    }

    container.innerHTML = cart.map((item, index) => `
      <div id="item-${escapeHtml(item.id)}" class="cart-item-card rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
        <div class="flex items-center space-x-4 sm:space-x-5 min-w-0">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-b from-[#181d2a]/50 to-transparent flex items-center justify-center overflow-hidden shrink-0">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="max-h-14 sm:max-h-16 max-w-full object-contain">
          </div>
          <div class="min-w-0">
            <h3 class="text-sm sm:text-base font-semibold text-white tracking-tight truncate">${escapeHtml(item.title)}</h3>
            <p class="text-xs text-gray-400 mt-0.5">${escapeHtml(item.variant || "Standard")}</p>
            <p class="text-sm font-semibold text-white mt-1">$${Number(item.price).toFixed(2)}</p>
          </div>
        </div>

        <div class="flex items-center space-x-3 sm:space-x-4 shrink-0">
          <div class="inline-flex items-center bg-[#0b0d13] border border-white/10 rounded-xl px-2 py-1 space-x-2.5">
            <button data-cart-action="minus" data-cart-index="${index}" class="text-gray-400 hover:text-white transition px-1 font-bold text-sm" aria-label="Decrease quantity">−</button>
            <span class="text-xs font-semibold text-white min-w-[14px] text-center">${Number(item.qty)}</span>
            <button data-cart-action="plus" data-cart-index="${index}" class="text-gray-400 hover:text-white transition px-1 font-bold text-sm" aria-label="Increase quantity">+</button>
          </div>
          <button data-cart-action="remove" data-cart-index="${index}" class="text-gray-500 hover:text-red-400 transition p-1" aria-label="Remove item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 01-1-1h-4a1 1 0 01-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join("");

    container.querySelectorAll("[data-cart-action]").forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.cartIndex);
        const action = button.dataset.cartAction;
        if (action === "plus") updateCartQty(index, 1);
        if (action === "minus") updateCartQty(index, -1);
        if (action === "remove") removeCartItem(index);
      });
    });

    calculateTotals(cart);
  }

  function calculateTotals(cart = loadCart()) {
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const subtotalEl = document.getElementById("summary-subtotal");
    const taxEl = document.getElementById("summary-tax");
    const totalEl = document.getElementById("summary-total");

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    updateCounters(cart);
  }

  function updateCartQty(index, delta) {
    const cart = loadCart();
    if (!cart[index]) return;

    const newQty = Number(cart[index].qty) + delta;
    if (newQty <= 0) {
      removeCartItem(index);
      return;
    }

    cart[index].qty = newQty;
    saveCart(cart);
    renderCartPage();
  }

  function removeCartItem(index) {
    const cart = loadCart();
    if (!cart[index]) return;

    const removedName = cart[index].title;
    cart.splice(index, 1);
    saveCart(cart);
    renderCartPage();
    showToast(`${removedName} removed from cart`);
  }

  window.updateQty = updateCartQty;
  window.removeItem = removeCartItem;

  function wireContact() {
    const form = document.querySelector("#contact-form");
    if (form && !form.dataset.novaxWired) {
      form.dataset.novaxWired = "1";
      form.addEventListener("submit", e => {
        e.preventDefault();
        showToast("Message sent! Our team will contact you shortly ✓");
        form.reset();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const cart = loadCart();
    updateCounters(cart);
    wireNavigation();
    wireShopCards();
    wireContact();
    renderCartPage();
  });
})();