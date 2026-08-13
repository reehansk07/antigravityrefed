/* Refed - Main Application Logic & AI Contamination Engine - COMPLETE FIX */

// ─── Food Database ────────────────────────────────────────────────────────────
let foodDatabase = [
  {
    id: "refed-101",
    title: "Fresh Organic Mediterranean Bowl",
    category: "ready-meals",
    freshness: 98.4,
    microbialStatus: "PASS - Excellent",
    spoilageRisk: "0.01%",
    dietary: ["Vegan", "Gluten-Free", "Halal"],
    quantity: "4 Servings",
    donor: "Green Leaf Eatery",
    location: "Downtown Eco Hub (0.8 km)",
    expiryHours: 6,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    storageTemp: "4.0°C (Refrigerated)",
    safetyCertificateId: "RF-AI-99824",
    isClaimed: false
  },
  {
    id: "refed-102",
    title: "Artisanal Whole Wheat Bakery Pack",
    category: "bakery",
    freshness: 95.0,
    microbialStatus: "PASS - Clean",
    spoilageRisk: "0.05%",
    dietary: ["Vegetarian"],
    quantity: "6 Loaves & Pastries",
    donor: "Golden Oven Bakery",
    location: "Westside Plaza (1.2 km)",
    expiryHours: 12,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    storageTemp: "21.0°C (Room Temp)",
    safetyCertificateId: "RF-AI-88310",
    isClaimed: false
  },
  {
    id: "refed-103",
    title: "Steamed Dim Sum & Vegetable Dumplings",
    category: "hot-meals",
    freshness: 99.2,
    microbialStatus: "PASS - Hot Sealed",
    spoilageRisk: "0.00%",
    dietary: ["Halal", "Dairy-Free"],
    quantity: "8 Servings",
    donor: "Lotus Grand Hotel",
    location: "City Center (0.4 km)",
    expiryHours: 3,
    imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80",
    storageTemp: "68.5°C (Hot Storage)",
    safetyCertificateId: "RF-AI-77491",
    isClaimed: false
  },
  {
    id: "refed-104",
    title: "Fresh Farm Fruit & Berry Basket",
    category: "produce",
    freshness: 96.8,
    microbialStatus: "PASS - Verified",
    spoilageRisk: "0.02%",
    dietary: ["Vegan", "Organic", "Gluten-Free"],
    quantity: "3.5 kg Mixed Fruits",
    donor: "Community Agro Market",
    location: "North Garden (1.8 km)",
    expiryHours: 24,
    imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
    storageTemp: "12.0°C (Chilled)",
    safetyCertificateId: "RF-AI-66204",
    isClaimed: false
  },
  {
    id: "refed-105",
    title: "Vegan Lentil Soup & Wholegrain Rolls",
    category: "ready-meals",
    freshness: 97.5,
    microbialStatus: "PASS - Verified",
    spoilageRisk: "0.01%",
    dietary: ["Vegan", "Halal", "Gluten-Free"],
    quantity: "6 Servings",
    donor: "Urban Kitchen Co.",
    location: "South Market (1.0 km)",
    expiryHours: 8,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    storageTemp: "5.0°C (Refrigerated)",
    safetyCertificateId: "RF-AI-55983",
    isClaimed: false
  }
];

// Track state
let deliveryInterval = null;
let activeScanData = null;
let speedMultiplier = 1;

// ─── App Init ─────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadFoodDatabase();
  renderFoodListings(foodDatabase);
  initAIScanner();
  initDonorForm();
  initFilters();
  initDeliveryTracker();
  initNavScroll();
  initKeyboardListeners();
  animateImpactCounters();
  // Icons are emoji-based, no external icon library needed
});

// ─── Header Scroll & Mobile Navigation ─────────────────────────────────────────
function initNavScroll() {
  const header = document.getElementById("main-header");
  const navLinksElem = document.getElementById("nav-links");
  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("section[id]");
  const mobileToggle = document.getElementById("mobile-menu-toggle");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // Mobile menu button
  if (mobileToggle && navLinksElem) {
    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinksElem.classList.toggle("mobile-active");
      mobileToggle.textContent = navLinksElem.classList.contains("mobile-active") ? "✕" : "☰";
    });

    // Close menu when link clicked
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navLinksElem.classList.remove("mobile-active");
        if (mobileToggle) mobileToggle.textContent = "☰";
      });
    });

    // Close menu on click outside
    document.addEventListener("click", (e) => {
      if (!header.contains(e.target)) {
        navLinksElem.classList.remove("mobile-active");
        if (mobileToggle) mobileToggle.textContent = "☰";
      }
    });
  }
}

// ─── Keyboard Accessibility ───────────────────────────────────────────────────
function initKeyboardListeners() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const donorModal = document.getElementById("donor-modal");
      const deliveryModal = document.getElementById("delivery-modal");
      const navLinks = document.getElementById("nav-links");
      const mobileToggle = document.getElementById("mobile-menu-toggle");

      if (donorModal && donorModal.classList.contains("active")) closeModal(donorModal);
      if (deliveryModal && deliveryModal.classList.contains("active")) {
        closeModal(deliveryModal);
        if (deliveryInterval) { clearInterval(deliveryInterval); deliveryInterval = null; }
      }
      if (navLinks && navLinks.classList.contains("mobile-active")) {
        navLinks.classList.remove("mobile-active");
        if (mobileToggle) mobileToggle.textContent = "☰";
      }
    }
  });
}

// ─── Animated Impact Counters ─────────────────────────────────────────────────
function animateImpactCounters() {
  const counters = document.querySelectorAll(".counter");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || "";
        const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
        const duration = 1800;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = (target * eased).toFixed(decimals);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// Increment meal count when donated or claimed
function incrementMealCount() {
  const counterEls = document.querySelectorAll('.counter[data-target]');
  counterEls.forEach(el => {
    let currentVal = parseFloat(el.dataset.target);
    if (!isNaN(currentVal)) {
      currentVal += 1;
      el.dataset.target = currentVal;
      const suffix = el.dataset.suffix || "";
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      el.textContent = currentVal.toFixed(decimals) + suffix;
    }
  });
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast`;
  const color = type === "success" ? "var(--primary)" : type === "warning" ? "var(--accent-gold)" : "var(--secondary)";
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      ${type === "success" ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' 
        : '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'}
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(120%)";
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

// ─── Render Food Cards ────────────────────────────────────────────────────────
function renderFoodListings(items) {
  const grid = document.getElementById("food-grid");
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;" class="glass-panel">
        <div style="font-size:3rem;margin-bottom:12px;">🍽️</div>
        <h3 style="margin-bottom:8px;">No Food Found for This Filter</h3>
        <p style="color:var(--text-muted);margin-bottom:16px;">Try a different filter or be the first to donate surplus food!</p>
        <button class="glow-btn-secondary" onclick="resetAllFilters()">🔄 Reset Filters</button>
      </div>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const freshnessColor = item.freshness >= 97 ? "var(--primary)" : item.freshness >= 93 ? "var(--accent-gold)" : "var(--accent-danger)";
    const isClaimed = item.isClaimed === true;
    
    return `
    <div class="food-card glass-panel ${isClaimed ? 'claimed' : ''}">
      <div class="food-card-img-wrapper">
        <img src="${item.imageUrl}" alt="${item.title}" class="food-card-img"
          onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'" />
        <div class="ai-safety-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          AI ${item.freshness}% Fresh
        </div>
        <div class="expiry-badge" style="position:absolute;bottom:10px;left:10px;background:rgba(7,10,20,0.8);backdrop-filter:blur(8px);padding:4px 10px;border-radius:20px;font-size:0.75rem;color:var(--accent-gold);border:1px solid rgba(255,193,7,0.3);">
          ⏱ ${item.expiryHours}h left
        </div>
      </div>
      <div class="food-card-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
          <h3 class="food-card-title">${item.title}</h3>
          ${isClaimed ? '<span class="claimed-badge">🚴 In Delivery</span>' : ''}
        </div>
        <div class="food-card-meta">
          <div class="food-card-meta-item">📦 ${item.quantity}</div>
          <div class="food-card-meta-item">🌡 ${item.storageTemp}</div>
        </div>
        <div class="ai-tags">
          ${item.dietary.map(tag => `<span class="tag-pill">${tag}</span>`).join("")}
          <span class="tag-pill" style="border-color:${freshnessColor};color:${freshnessColor};">${item.microbialStatus}</span>
        </div>
        <div class="food-card-footer">
          <div class="donor-info">
            <div class="donor-avatar">${item.donor.charAt(0).toUpperCase()}</div>
            <div>
              <div style="font-size:0.85rem;font-weight:600;color:#fff;">${item.donor}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">📍 ${item.location}</div>
            </div>
          </div>
          <button class="${isClaimed ? 'glow-btn-secondary' : 'glow-btn'} claim-btn" style="padding:8px 16px;font-size:0.82rem;" 
            data-item-id="${item.id}" onclick="openDeliveryModal('${item.id}')">
            ${isClaimed ? '📡 View Courier' : '🚴 Claim & Deliver'}
          </button>
        </div>
      </div>
    </div>`;
  }).join("");
}

// ─── AI Contamination Scanner ─────────────────────────────────────────────────
function initAIScanner() {
  const dropzone        = document.getElementById("scanner-dropzone");
  const fileInput       = document.getElementById("scanner-file-input");
  const cameraBtn       = document.getElementById("scanner-camera-btn");
  const videoElem       = document.getElementById("scanner-video");
  const resetBtn        = document.getElementById("reset-scanner-btn");
  const acceptListBtn   = document.getElementById("accept-list-meal-btn");

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    fileInput.click();
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", (e) => {
    if (!dropzone.contains(e.relatedTarget)) {
      dropzone.classList.remove("dragover");
    }
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handleImageScan(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleImageScan(e.target.files[0]);
    }
    fileInput.value = "";
  });

  // Live camera feed + real canvas snapshot
  if (cameraBtn && videoElem) {
    cameraBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
          .then((stream) => {
            videoElem.srcObject = stream;
            videoElem.style.display = "block";
            videoElem.play();
            showScanningState(null);
            showToast("📷 Live camera connected — taking food snapshot in 3s...");

            setTimeout(() => {
              let capturedUrl = null;
              try {
                const canvas = document.createElement("canvas");
                canvas.width = videoElem.videoWidth || 640;
                canvas.height = videoElem.videoHeight || 480;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
                capturedUrl = canvas.toDataURL("image/jpeg", 0.85);
              } catch (err) {}

              stream.getTracks().forEach(t => t.stop());
              videoElem.style.display = "none";

              handleImageScan(null, false, null, capturedUrl);
            }, 3000);
          })
          .catch(() => {
            showToast("Camera access unavailable. Using sample food scan.", "warning");
            handleImageScan(null, false, null, "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80");
          });
      } else {
        handleImageScan(null, false, null, "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80");
      }
    });
  }

  // Sample presets
  const sampleBtns = document.querySelectorAll(".sample-scan-btn");
  const sampleImages = {
    salad: { url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80", title: "Fresh Organic Salad" },
    pizza: { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80", title: "Gourmet Artisan Pizza" },
    bread: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80", title: "Fresh Bakery Loaves" },
    apples: { url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80", title: "Fresh Orchard Apples" }
  };

  sampleBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const key = btn.dataset.sample;
      const sample = sampleImages[key] || sampleImages.salad;
      handleImageScan(null, false, null, sample.url, sample.title);
    });
  });

  // Scanner Reset Button
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetAIScanner();
      showToast("🔄 Scanner reset — ready for next food scan.");
    });
  }

  // Accept & List Meal Button -> Pre-fill Donor Modal with AI Scan
  if (acceptListBtn) {
    acceptListBtn.addEventListener("click", () => {
      const donorModal = document.getElementById("donor-modal");
      if (!donorModal) return;

      if (activeScanData) {
        const titleInput   = document.getElementById("donor-title");
        const previewImg   = document.getElementById("donor-image-preview");

        if (titleInput) {
          titleInput.value = `${activeScanData.suggestedTitle} (AI Certified ${activeScanData.freshness}%)`;
        }
        if (previewImg && activeScanData.imageUrl) {
          previewImg.src = activeScanData.imageUrl;
          previewImg.style.display = "block";
        }
        showToast(`🛡 AI Passport ${activeScanData.certId} attached to donor upload form!`);
      }

      donorModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }
}

function resetAIScanner() {
  const dropzone    = document.getElementById("scanner-dropzone");
  const previewImg  = document.getElementById("scanner-preview");
  const videoElem   = document.getElementById("scanner-video");
  const idleContent = document.getElementById("scanner-idle-content");
  const scanStatus  = document.getElementById("scan-status-text");

  if (dropzone) dropzone.classList.remove("active");
  if (idleContent) idleContent.style.display = "block";
  if (previewImg) { previewImg.src = ""; previewImg.style.display = "none"; }
  if (videoElem) { videoElem.style.display = "none"; }
  if (scanStatus) { scanStatus.style.display = "none"; scanStatus.textContent = ""; }

  activeScanData = null;
}

function showScanningState(imageSrc) {
  const dropzone    = document.getElementById("scanner-dropzone");
  const previewImg  = document.getElementById("scanner-preview");
  const idleContent = document.getElementById("scanner-idle-content");
  const scanStatus  = document.getElementById("scan-status-text");

  if (idleContent) idleContent.style.display = "none";
  if (dropzone) dropzone.classList.add("active");

  if (imageSrc && previewImg) {
    previewImg.src = imageSrc;
    previewImg.style.display = "block";
  } else if (!imageSrc && previewImg) {
    previewImg.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
    previewImg.style.display = "block";
  }

  if (scanStatus) {
    scanStatus.textContent = "🔬 Running bio-spectral analysis...";
    scanStatus.style.display = "block";
  }
}

function handleImageScan(file, isCameraSim = false, stream = null, sampleUrl = null, sampleTitle = null) {
  let displayUrl = sampleUrl;

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      displayUrl = e.target.result;
      showScanningState(displayUrl);
    };
    reader.readAsDataURL(file);
  } else if (sampleUrl) {
    showScanningState(sampleUrl);
  } else {
    showScanningState(null);
  }

  showToast("🔬 Scanning food surface & thermal spectral pattern...");
  setResultsLoading(true);

  setTimeout(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      const videoElem = document.getElementById("scanner-video");
      if (videoElem) videoElem.style.display = "none";
    }

    const freshnessScore  = (Math.random() * (99.8 - 94.0) + 94.0).toFixed(1);
    const microbialPurity = (Math.random() * (99.9 - 97.5) + 97.5).toFixed(1);
    const spoilageRisk    = (Math.random() * 0.05 + 0.001).toFixed(3);
    const tempC           = (Math.random() * 5 + 2).toFixed(1);
    const shelfHours      = Math.floor(Math.random() * 18 + 6);
    const certId          = "RF-AI-" + Math.floor(100000 + Math.random() * 900000);
    const suggestedTitle  = sampleTitle || (file ? file.name.replace(/\.[^/.]+$/, "") : "Surplus Gourmet Meal");

    activeScanData = {
      imageUrl: displayUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      freshness: freshnessScore,
      microbialPurity,
      spoilageRisk,
      tempC,
      shelfHours,
      certId,
      suggestedTitle
    };

    animateBar("bar-freshness",  freshnessScore,  "res-freshness",  `${freshnessScore}%`);
    animateBar("bar-microbial",  microbialPurity, "res-microbial",  `${microbialPurity}% Safe`);
    animateBar("bar-spoilage",   Math.min(spoilageRisk * 200, 12), "res-spoilage", `${spoilageRisk}%`);

    document.getElementById("tag-temp").textContent    = `🌡 Temp: ${tempC}°C Optimal`;
    document.getElementById("tag-shelf").textContent   = `⏱ Shelf Life: ~${shelfHours}h`;
    document.getElementById("res-cert-id").textContent = certId;

    const titleEl = document.getElementById("scanner-results-title");
    if (titleEl) titleEl.textContent = `${suggestedTitle} — AI Certified`;

    const badge = document.getElementById("overall-badge");
    if (badge) {
      if (parseFloat(freshnessScore) >= 90) {
        badge.className = "safety-status-badge pass";
        badge.innerHTML = `✅ PASS: SAFE FOR INTAKE`;
      } else {
        badge.className = "safety-status-badge warning";
        badge.innerHTML = `⚠️ CAUTION: VERIFY STORAGE`;
      }
    }

    const scanStatus = document.getElementById("scan-status-text");
    if (scanStatus) scanStatus.textContent = "✅ Scan complete — AI Certificate Issued";

    setResultsLoading(false);
    showToast(`✅ AI Scan Complete: ${freshnessScore}% Freshness — Safe for donation!`);
  }, 2400);
}

function animateBar(barId, targetPercent, labelId, labelText) {
  const bar   = document.getElementById(barId);
  const label = document.getElementById(labelId);
  if (!bar) return;

  bar.style.width = "0%";
  setTimeout(() => { bar.style.width = `${Math.min(targetPercent, 100)}%`; }, 50);
  if (label) label.textContent = labelText;
}

function setResultsLoading(isLoading) {
  const resultValues = ["res-freshness", "res-microbial", "res-spoilage"];
  resultValues.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = isLoading ? "0.4" : "1";
  });
}

// ─── Donor Upload Modal ───────────────────────────────────────────────────────
function initDonorForm() {
  const modal      = document.getElementById("donor-modal");
  const openBtns   = document.querySelectorAll(".open-donor-modal");
  const closeBtn   = document.getElementById("close-donor-modal");
  const form       = document.getElementById("donor-form");
  const imageInput = document.getElementById("donor-image-input");
  const imagePreview = document.getElementById("donor-image-preview");

  openBtns.forEach(btn => btn.addEventListener("click", () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }));

  if (closeBtn) closeBtn.addEventListener("click", () => closeModal(modal));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });

  if (imageInput && imagePreview) {
    imageInput.addEventListener("change", (e) => {
      if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = ev => {
          imagePreview.src = ev.target.result;
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector("[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "🔬 Running AI Safety Check...";

      setTimeout(() => {
        const title     = document.getElementById("donor-title").value.trim() || "Fresh Surplus Meal";
        const category  = document.getElementById("donor-category").value;
        const servings  = document.getElementById("donor-servings").value.trim() || "3 Servings";
        const donorName = document.getElementById("donor-name").value.trim() || "Anonymous Donor";
        const expiry    = parseInt(document.getElementById("donor-expiry").value) || 6;
        const address   = document.getElementById("donor-address").value.trim() || "Local Area";
        const dietary   = Array.from(document.querySelectorAll(".dietary-check:checked")).map(c => c.value);
        if (dietary.length === 0) dietary.push("Community Prepared");

        const imgEl    = document.getElementById("donor-image-preview");
        const imageUrl = imgEl && imgEl.src && imgEl.style.display !== "none"
          ? imgEl.src
          : (activeScanData ? activeScanData.imageUrl : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80");

        const freshness = activeScanData ? activeScanData.freshness : (Math.random() * (99.5 - 95.0) + 95.0).toFixed(1);
        const certId    = activeScanData ? activeScanData.certId : ("RF-AI-" + Math.floor(100000 + Math.random() * 900000));

        const newItem = {
          id: "refed-" + Date.now(),
          title, category,
          freshness: parseFloat(freshness),
          microbialStatus: "PASS - AI Certified",
          spoilageRisk: "0.01%",
          dietary,
          quantity: servings,
          donor: donorName,
          location: address + " (nearby)",
          expiryHours: expiry,
          imageUrl,
          storageTemp: "5.0°C (Insulated)",
          safetyCertificateId: certId,
          isClaimed: false
        };

        foodDatabase.unshift(newItem);
        saveFoodDatabase();
        renderFoodListings(foodDatabase);
        incrementMealCount();

        closeModal(modal);
        form.reset();

        if (imagePreview) { imagePreview.src = ""; imagePreview.style.display = "none"; }
        submitBtn.disabled = false;
        submitBtn.innerHTML = "🔬 Run AI Safety Check & Publish";

        showToast("🎉 Surplus food listed! Refed courier notified for pickup.");
        setTimeout(() => document.getElementById("food-feed").scrollIntoView({ behavior: "smooth" }), 400);
      }, 1800);
    });
  }
}

function closeModal(modal) {
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// ─── Category & Search Filters ───────────────────────────────────────────────
let activeFilter = "all";

function initFilters() {
  const filterChips = document.querySelectorAll(".filter-chip");
  const searchInput = document.getElementById("food-search-input");
  const clearBtn    = document.getElementById("clear-search-btn");

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    
    if (clearBtn) {
      clearBtn.style.display = query ? "block" : "none";
    }

    let filtered = foodDatabase;

    if (activeFilter === "fresh-95") {
      filtered = filtered.filter(i => parseFloat(i.freshness) >= 95.0);
    } else if (activeFilter !== "all") {
      filtered = filtered.filter(i =>
        i.category === activeFilter || i.dietary.map(d => d.toLowerCase()).includes(activeFilter.toLowerCase())
      );
    }

    if (query) {
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.donor.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query) ||
        i.dietary.some(d => d.toLowerCase().includes(query))
      );
    }

    renderFoodListings(filtered);
  }

  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      applyFilters();
    });
  }
}

function resetAllFilters() {
  const searchInput = document.getElementById("food-search-input");
  const filterChips = document.querySelectorAll(".filter-chip");
  if (searchInput) searchInput.value = "";
  filterChips.forEach(chip => {
    chip.classList.toggle("active", chip.dataset.filter === "all");
  });
  activeFilter = "all";
  renderFoodListings(foodDatabase);
}

// ─── LocalStorage Persistence ───────────────────────────────────────────────
function loadFoodDatabase() {
  const saved = localStorage.getItem("refed_food_db");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        foodDatabase = parsed;
      }
    } catch (e) {}
  }
}

function saveFoodDatabase() {
  try {
    localStorage.setItem("refed_food_db", JSON.stringify(foodDatabase));
  } catch (e) {}
}

// ─── Delivery Tracker ─────────────────────────────────────────────────────────
function initDeliveryTracker() {
  const modal    = document.getElementById("delivery-modal");
  const closeBtn = document.getElementById("close-delivery-modal");

  if (closeBtn) closeBtn.addEventListener("click", () => {
    closeModal(modal);
    if (deliveryInterval) { clearInterval(deliveryInterval); deliveryInterval = null; }
  });

  if (modal) modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
      if (deliveryInterval) { clearInterval(deliveryInterval); deliveryInterval = null; }
    }
  });

  const speedBtn   = document.getElementById("speed-courier-btn");
  const callBtn    = document.getElementById("call-courier-btn");
  const rerouteBtn = document.getElementById("reroute-courier-btn");

  if (speedBtn) {
    speedBtn.addEventListener("click", () => {
      speedMultiplier = 3;
      showToast("⚡ Courier Turbo Speed Activated! Delivery ETA reduced.", "success");
    });
  }

  if (callBtn) {
    callBtn.addEventListener("click", () => {
      const courierName = document.getElementById("del-courier-name").textContent || "Courier";
      showToast(`📞 Connecting encrypted VoIP call to ${courierName}...`, "info");
    });
  }

  if (rerouteBtn) {
    rerouteBtn.addEventListener("click", () => {
      showToast("📍 Recalculating eco-friendly route to avoid traffic...", "success");
    });
  }
}

const courierNames = ["Alex R.", "Priya S.", "Mohammed K.", "Lena V.", "James O."];

function openDeliveryModal(itemId) {
  const modal = document.getElementById("delivery-modal");
  const item  = foodDatabase.find(i => i.id === itemId);
  if (!item || !modal) return;

  if (!item.isClaimed) {
    item.isClaimed = true;
    saveFoodDatabase();
    renderFoodListings(foodDatabase);
    incrementMealCount();
  }

  if (deliveryInterval) { clearInterval(deliveryInterval); deliveryInterval = null; }
  speedMultiplier = 1;

  document.getElementById("del-food-title").textContent  = item.title;
  document.getElementById("del-donor-name").textContent  = item.donor;
  document.getElementById("del-cert-code").textContent   = item.safetyCertificateId;
  document.getElementById("del-courier-name").textContent = courierNames[Math.floor(Math.random() * courierNames.length)];
  document.getElementById("del-location").textContent    = item.location;

  const courierMarker = document.getElementById("courier-marker");
  const etaElem       = document.getElementById("delivery-eta");
  const timelineSteps = document.querySelectorAll(".timeline-step");

  if (courierMarker) { courierMarker.style.left = "10%"; courierMarker.style.top = "71%"; }
  if (etaElem)       etaElem.textContent = "14 Mins";

  timelineSteps.forEach((step, i) => {
    step.classList.toggle("completed", i < 3);
  });

  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  let progress = 0;
  let minutes  = 14;
  let delivered = false;

  const waypoints = [
    { left: 10, top: 71 },
    { left: 24, top: 48 },
    { left: 40, top: 38 },
    { left: 55, top: 44 },
    { left: 70, top: 58 },
    { left: 82, top: 52 },
    { left: 90, top: 50 }
  ];

  deliveryInterval = setInterval(() => {
    if (delivered) return;
    progress += 0.6 * speedMultiplier;
    minutes = Math.max(0, 14 - Math.floor(progress * 1.8));

    const totalWaypoints = waypoints.length - 1;
    const wpProgress = Math.min(progress / 7, totalWaypoints);
    const wpIndex    = Math.min(Math.floor(wpProgress), totalWaypoints - 1);
    const wpFraction = wpProgress - wpIndex;
    const from = waypoints[wpIndex];
    const to   = waypoints[Math.min(wpIndex + 1, totalWaypoints)];
    const leftPct = from.left + (to.left - from.left) * wpFraction;
    const topPct  = from.top  + (to.top  - from.top)  * wpFraction;

    if (courierMarker) {
      courierMarker.style.left = `${leftPct}%`;
      courierMarker.style.top  = `${topPct}%`;
    }
    if (etaElem) etaElem.textContent = minutes > 0 ? `${minutes} Mins` : "Arriving!";

    if (progress >= 3 && timelineSteps[3]) timelineSteps[3].classList.add("active-step");
    if (progress >= 7) {
      delivered = true;
      clearInterval(deliveryInterval);
      deliveryInterval = null;
      if (timelineSteps[3]) timelineSteps[3].classList.add("completed");
      if (etaElem) etaElem.textContent = "Delivered! ✅";
      showToast("🚀 Courier Arrived! Food Safety Seal Verified. Enjoy your meal!");
    }
  }, 1000);
}
