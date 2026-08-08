(() => {
  const grid = document.getElementById("productGrid");
  const cartToggle = document.getElementById("cartToggle");
  const cartClose = document.getElementById("cartClose");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartBackdrop = document.getElementById("cartBackdrop");
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  const clearCart = document.getElementById("clearCart");
  const whatsappCheckout = document.getElementById("whatsappCheckout");
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const collectionTiles = document.querySelectorAll(".collection-tile");

  const modal = document.getElementById("productModal");
  const modalClose = document.getElementById("modalClose");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalPrice = document.getElementById("modalPrice");
  const modalCategory = document.getElementById("modalCategory");
  const modalAdd = document.getElementById("modalAdd");

  let cart = loadCart();
  let activeFilter = "all";
  let modalProduct = null;

  const categoryLabels = {
    silk: "Silk Butta",
    zari: "Zari Borders",
    contrast: "Contrast Pallu",
    softy: "Soft Cotton",
    patola: "Heritage Print",
    floral: "Soft Florals"
  };

  function formatPrice(n) {
    return "₹" + n.toLocaleString("en-IN");
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem("hera-cart") || "[]");
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem("hera-cart", JSON.stringify(cart));
  }

  function renderProducts() {
    grid.innerHTML = PRODUCTS.map((p) => {
      const hidden = activeFilter !== "all" && p.category !== activeFilter;
      return `
        <article class="product-card${hidden ? " is-hidden" : ""}" data-category="${p.category}" data-id="${p.id}">
          <div class="product-media" data-open="${p.id}">
            <img src="${p.image}" alt="${p.name}" style="object-position: ${p.focus}" loading="lazy" />
          </div>
          <div class="product-info">
            <span class="cat">${categoryLabels[p.category] || p.category}</span>
            <h3>${p.name}</h3>
            <div class="product-meta">
              <span class="price">${formatPrice(p.price)}</span>
              <button type="button" class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function findProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function addToCart(id, qty = 1) {
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.qty += qty;
    else cart.push({ id, qty });
    saveCart();
    renderCart();
  }

  function setQty(id, qty) {
    if (qty <= 0) cart = cart.filter((item) => item.id !== id);
    else {
      const item = cart.find((i) => i.id === id);
      if (item) item.qty = qty;
    }
    saveCart();
    renderCart();
  }

  function renderCart() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = String(count);

    if (!cart.length) {
      cartItems.innerHTML = `<p class="cart-empty">Your bag is empty. Add a saree you love.</p>`;
      cartTotal.textContent = formatPrice(0);
      whatsappCheckout.href = "https://wa.me/917090121198?text=" + encodeURIComponent("Hi Hera Alankar, I would like to know more about your sarees.");
      return;
    }

    let total = 0;
    const lines = [];

    cartItems.innerHTML = cart.map((item) => {
      const p = findProduct(item.id);
      if (!p) return "";
      total += p.price * item.qty;
      lines.push(`${item.qty}× ${p.name} (${formatPrice(p.price)})`);
      return `
        <div class="cart-row">
          <img src="${p.image}" alt="" style="object-position: ${p.focus}" />
          <div>
            <h4>${p.name}</h4>
            <p>${formatPrice(p.price)}</p>
            <div class="qty">
              <button type="button" data-dec="${p.id}" aria-label="Decrease">−</button>
              <span>${item.qty}</span>
              <button type="button" data-inc="${p.id}" aria-label="Increase">+</button>
            </div>
          </div>
          <strong>${formatPrice(p.price * item.qty)}</strong>
        </div>
      `;
    }).join("");

    cartTotal.textContent = formatPrice(total);
    const message = `Hi Hera Alankar,\nI would like to order:\n${lines.join("\n")}\nTotal: ${formatPrice(total)}`;
    whatsappCheckout.href = "https://wa.me/917090121198?text=" + encodeURIComponent(message);
  }

  function openCart() {
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartBackdrop.hidden = true;
    if (modal.hidden) document.body.style.overflow = "";
  }

  function openModal(id) {
    const p = findProduct(id);
    if (!p) return;
    modalProduct = p;
    modalImage.src = p.image;
    modalImage.alt = p.name;
    modalImage.style.objectPosition = p.focus;
    modalTitle.textContent = p.name;
    modalDesc.textContent = p.desc;
    modalPrice.textContent = formatPrice(p.price);
    modalCategory.textContent = categoryLabels[p.category] || p.category;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    modalProduct = null;
    if (!cartDrawer.classList.contains("is-open")) {
      document.body.style.overflow = "";
    }
  }

  function setFilter(filter) {
    activeFilter = filter;
    filterBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === filter);
    });
    renderProducts();
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  grid.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      addToCart(add.dataset.add);
      openCart();
      return;
    }
    const open = e.target.closest("[data-open]");
    if (open) openModal(open.dataset.open);
  });

  cartItems.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (inc) {
      const item = cart.find((i) => i.id === inc.dataset.inc);
      if (item) setQty(item.id, item.qty + 1);
    }
    if (dec) {
      const item = cart.find((i) => i.id === dec.dataset.dec);
      if (item) setQty(item.id, item.qty - 1);
    }
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  collectionTiles.forEach((tile) => {
    tile.addEventListener("click", () => setFilter(tile.dataset.filter));
  });

  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartBackdrop.addEventListener("click", closeCart);
  clearCart.addEventListener("click", () => {
    cart = [];
    saveCart();
    renderCart();
  });

  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    mobileNav.hidden = open;
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
    });
  });

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  modalAdd.addEventListener("click", () => {
    if (!modalProduct) return;
    addToCart(modalProduct.id);
    closeModal();
    openCart();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeCart();
    }
  });

  renderProducts();
  renderCart();
})();
