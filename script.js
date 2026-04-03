/* =========================================================
   AGGARWAL STEELS — Main Application Script
   ========================================================= */

'use strict';

// ─── State ───────────────────────────────────────────────
let cart            = JSON.parse(localStorage.getItem('as_cart') || '[]');
let prices          = JSON.parse(localStorage.getItem('as_prices') || 'null');
let currentProduct  = null;
let adminLoggedIn   = false;
let phoneVerified   = false;
let emailVerified   = false;
const ADMIN_PASS    = 'steel2025';
const GST_RATE      = 0.18;

// Manufacturer/Make logos (public CDN URLs for real logos)
const MAKERS = [
  { id: 'amns', name: 'AM/NS India', logo: 'images/make-amns.png' },
  { id: 'sail', name: 'SAIL', logo: 'images/make-sail.png' },
  { id: 'tata', name: 'Tata Steel', logo: 'images/make-tata.png' },
  { id: 'jspl', name: 'Jindal Steel', logo: 'images/make-jindal.png' },
  { id: 'jsla', name: 'Jindal Stainless', logo: 'images/make-jsla.png' }
];

// ─── Product Catalogue ────────────────────────────────────
const PRODUCTS = {
  hr: {
    id: 'hr',
    name: 'HR Sheets & Coils',
    fullName: 'Hot Rolled Sheets & Coils',
    standard: 'IS 2062:2011 / IS 1079:2009',
    icon: '🔩',
    image: 'images/hr.png',
    hsn: '7208',
    defaultPrice: 52000,
    color: '#e8a000',
    description: {
      summary: 'Hot Rolled (HR) steel is produced by rolling steel at high temperatures above the recrystallization temperature. Suitable for structural, engineering, and fabrication applications.',
      features: [
        'High strength with fine surface quality',
        'Available in E250A, E250B, E300, E350 grades',
        'Coil or sheet forms available',
        'Mill edge / slit edge options',
        'Available pickled & oiled (P&O) on request',
        'Suitable for forming, welding and fabrication'
      ]
    },
    specs: [
      ['Standard', 'IS 2062:2011, IS 3502'],
      ['Thickness Range', '1.6 mm – 20 mm'],
      ['Width Range', '650 mm – 2000 mm'],
      ['Coil Weight', '5 – 25 MT (typical)'],
      ['Surface', 'As Rolled / Pickled'],
      ['Edge', 'Mill Edge / Slit Edge']
    ],
    applications: ['Structural Fabrication', 'General Engineering', 'Pipes & Tubes', 'Automotive', 'Construction', 'Pressure Vessels', 'Ship Building'],
    fields: [
      {
        id: 'grade', label: 'Grade', type: 'select',
        options: ['E250A (Fe 410-S)', 'E250B (Fe 410-W)', 'E300 (Fe 440)', 'E350 (Fe 490)', 'E410 (Fe 540)'],
        priceAdj: [0, 500, 1200, 2500, 4000]
      },
      {
        id: 'thickness', label: 'Thickness (mm)', type: 'select',
        options: ['1.6', '2.0', '2.5', '3.0', '4.0', '5.0', '6.0', '8.0', '10.0', '12.0', '16.0', '20.0'],
        priceAdj: [0, 0, 0, 0, 0, 0, 200, 400, 800, 1200, 2000, 3000]
      },
      {
        id: 'width', label: 'Width (mm)', type: 'select',
        options: ['650', '914', '1000', '1219', '1250', '1500', '1800', '2000'],
        priceAdj: [0, 0, 0, 0, 0, 500, 800, 1200]
      },
      {
        id: 'form', label: 'Form', type: 'select',
        options: ['Sheet', 'Coil', 'Slit Coil'],
        priceAdj: [0, -500, 200]
      }
    ]
  },

  cr: {
    id: 'cr',
    name: 'CR Sheets & Coils',
    fullName: 'Cold Rolled Sheets & Coils',
    standard: 'IS 513:2008 (CRCA)',
    icon: '🔧',
    image: 'images/cr.png',
    hsn: '7209',
    defaultPrice: 60000,
    description: {
      summary: 'Cold Rolled (CR) steel, also known as CRCA, is produced by further rolling HR steel at room temperature. It offers better surface finish, dimensional accuracy and mechanical properties.',
      features: [
        'Superior surface finish (Matte or Bright)',
        'Tight dimensional tolerances',
        'Grades: CR1/CR2/CR3/CR4/CR5',
        'Available full hard, half hard, quarter hard',
        'Excellent formability for deep drawing',
        'Low yield ratio, high ductility'
      ]
    },
    specs: [
      ['Standard', 'IS 513:2008, IS 11513'],
      ['Thickness Range', '0.4 mm – 3.2 mm'],
      ['Width Range', '650 mm – 1500 mm'],
      ['Surface', 'Matte / Bright Annealed'],
      ['Temper', 'Full Hard / Half Hard / Soft (CQ/DQ/DDQ)'],
      ['Coil ID', '508 mm / 610 mm']
    ],
    applications: ['Automobile Bodies', 'White Goods / Appliances', 'Electrical Equipment', 'Roofing & Cladding', 'Furniture', 'Precision Fabrication'],
    fields: [
      {
        id: 'grade', label: 'Grade / Temper', type: 'select',
        options: ['CR1 (Commercial Quality)', 'CR2 (Drawing Quality)', 'CR3 (Deep Drawing Quality)', 'CR4 (Extra Deep Drawing)', 'CR5 (Ultra DQ - IF Grade)'],
        priceAdj: [0, 1000, 2500, 4000, 6000]
      },
      {
        id: 'thickness', label: 'Thickness (mm)', type: 'select',
        options: ['0.40', '0.50', '0.63', '0.80', '1.00', '1.20', '1.50', '1.60', '2.00', '2.50', '3.00', '3.15'],
        priceAdj: [1000, 800, 600, 400, 0, 0, 0, 0, 0, -200, -300, -400]
      },
      {
        id: 'width', label: 'Width (mm)', type: 'select',
        options: ['650', '900', '1000', '1219', '1250', '1500'],
        priceAdj: [0, 0, 0, 0, 0, 500]
      },
      {
        id: 'finish', label: 'Surface Finish', type: 'select',
        options: ['Matte (Mill Finish)', 'Bright Annealed (BA)', 'Skin Pass (SP)'],
        priceAdj: [0, 1500, 800]
      }
    ]
  },

  gp: {
    id: 'gp',
    name: 'Galvanised Plain (GP)',
    fullName: 'Galvanised Plain (GP) Sheets & Coils',
    standard: 'IS 277:2008',
    icon: '🪣',
    image: 'images/gp.png',
    hsn: '7210',
    defaultPrice: 72000,
    description: {
      summary: 'Galvanised Plain (GP) sheets are cold rolled steel coated with zinc by the hot-dip process. The zinc coating provides excellent corrosion resistance for outdoor and industrial applications.',
      features: [
        'Zinc coating by continuous hot-dip process',
        'Coating grades: Z90, Z120, Z180, Z275',
        'Long-lasting corrosion protection',
        'Available in coils and cut sheets',
        'Excellent paintability post-treatment',
        'IS 277 compliant material'
      ]
    },
    specs: [
      ['Standard', 'IS 277:2008'],
      ['Base Metal', 'Cold Rolled Steel'],
      ['Thickness (base)', '0.14 mm – 2.0 mm'],
      ['Width', '600 mm – 1500 mm'],
      ['Zinc Coating (both sides)', 'Z90 to Z275 (g/m²)'],
      ['Surface Treatment', 'Chromated / Passivated / Oiled']
    ],
    applications: ['Roofing & Cladding', 'Duct Work (HVAC)', 'Automotive Parts', 'Electrical Enclosures', 'Agriculture Equipment', 'Cold Storage Panels'],
    fields: [
      {
        id: 'coating', label: 'Zinc Coating (g/m²)', type: 'select',
        options: ['Z90 (90 g/m²)', 'Z120 (120 g/m²)', 'Z140 (140 g/m²)', 'Z180 (180 g/m²)', 'Z275 (275 g/m²)'],
        priceAdj: [0, 1500, 2500, 4000, 7000]
      },
      {
        id: 'thickness', label: 'Thickness (mm)', type: 'select',
        options: ['0.18', '0.20', '0.25', '0.40', '0.50', '0.63', '0.80', '1.00', '1.20', '1.50', '2.00'],
        priceAdj: [2000, 1800, 1500, 800, 500, 200, 0, 0, 0, -200, -400]
      },
      {
        id: 'width', label: 'Width (mm)', type: 'select',
        options: ['600', '760', '900', '1000', '1200', '1250', '1500'],
        priceAdj: [0, 0, 0, 0, 0, 200, 600]
      },
      {
        id: 'surface', label: 'Surface Treatment', type: 'select',
        options: ['Regular Spangle + Passivated', 'Zero Spangle + Chromated', 'Phosphated + Oiled (for painting)'],
        priceAdj: [0, 800, 1200]
      }
    ]
  },

  gpsp: {
    id: 'gpsp',
    name: 'GPSP Sheets',
    fullName: 'Galvanised Plain Skin Pass (GPSP) Sheets',
    standard: 'IS 14358:1996',
    icon: '🛡️',
    image: 'images/gpsp.png',
    hsn: '7210',
    defaultPrice: 76000,
    description: {
      summary: 'GPSP (Galvanised Plain Skin Pass) sheets are premium quality hot-dip galvanised sheets with controlled surface finish via skin-pass rolling. The skin-pass process improves flatness, surface quality, and formability.',
      features: [
        'Skin-pass rolled for superior surface finish',
        'Controlled chemistry for weldability',
        'Higher zinc coating uniformity',
        'For automotive panels & structural glazing',
        'Double side passivation treatment',
        'Stringent flatness and waviness tolerances'
      ]
    },
    specs: [
      ['Standard', 'IS 14358:1996'],
      ['Base Metal', 'Special Drawing Quality CR'],
      ['Thickness', '0.4 mm – 2.0 mm'],
      ['Width', '600 mm – 1500 mm'],
      ['Min. Coating Weight', 'Z140, Z180, Z275 (per IS 277)'],
      ['Tolerance', 'Per IS 14358']
    ],
    applications: ['Automotive Panels', 'Structural Glazing', 'Architectural Cladding', 'White Goods', 'Precision Stamping', 'Deep Drawn Parts'],
    fields: [
      {
        id: 'coating', label: 'Coating Weight (g/m²)', type: 'select',
        options: ['Z140', 'Z180', 'Z275'],
        priceAdj: [0, 2000, 5000]
      },
      {
        id: 'thickness', label: 'Thickness (mm)', type: 'select',
        options: ['0.40', '0.50', '0.63', '0.80', '1.00', '1.20', '1.50', '2.00'],
        priceAdj: [1000, 600, 200, 0, 0, 0, -300, -600]
      },
      {
        id: 'width', label: 'Width (mm)', type: 'select',
        options: ['600', '900', '1000', '1250', '1500'],
        priceAdj: [0, 0, 0, 200, 600]
      }
    ]
  },

  pmp: {
    id: 'pmp',
    name: 'PMP Plates',
    fullName: 'Pressure & Mild Steel Plates (PMP)',
    standard: 'IS 2002:2009 / IS 2062',
    icon: '⚙️',
    image: 'images/pmp.png',
    hsn: '7208',
    defaultPrice: 58000,
    description: {
      summary: 'Pressure and Mild Steel Plates (PMP) are heavy-thickness HR plates used in pressure vessels, structural fabrication, bridges and heavy machinery. Available in a wide thickness range.',
      features: [
        'Thickness from 6mm up to 100mm',
        'Grades: E250, E300, E350, E410',
        'Weldable and machinable quality',
        'Cut-to-size and flat bar cutting available',
        'Ultrasonic testing on request',
        'Mill edge or gas-cut edge'
      ]
    },
    specs: [
      ['Standard', 'IS 2062:2011, IS 2002:2009'],
      ['Thickness Range', '6 mm – 100 mm'],
      ['Width', '1500 mm – 3500 mm'],
      ['Length', '5000 mm – 12000 mm'],
      ['Grade', 'E250 / E300 / E350 / E410'],
      ['Heat Treatment', 'As Rolled / Normalised']
    ],
    applications: ['Pressure Vessels', 'Boilers', 'Heavy Machinery', 'Bridges & Structures', 'Shipbuilding', 'Mining Equipment', 'Storage Tanks'],
    fields: [
      {
        id: 'grade', label: 'Grade', type: 'select',
        options: ['E250A (Mild Steel)', 'E300', 'E350', 'E410'],
        priceAdj: [0, 1500, 3000, 5000]
      },
      {
        id: 'thickness', label: 'Thickness (mm)', type: 'select',
        options: ['6', '8', '10', '12', '16', '20', '25', '32', '40', '50', '63', '80', '100'],
        priceAdj: [0, 0, 0, 0, 300, 600, 1200, 2000, 3000, 5000, 8000, 12000, 18000]
      },
      {
        id: 'width', label: 'Width (mm)', type: 'select',
        options: ['1500', '1800', '2000', '2500', '3000', '3500'],
        priceAdj: [0, 0, 500, 1000, 1500, 2500]
      },
      {
        id: 'length', label: 'Length (mm)', type: 'select',
        options: ['5000', '6000', '8000', '10000', '12000', 'Cut to Size'],
        priceAdj: [0, 0, 0, 0, 0, 2000]
      }
    ]
  },

  hrsg: {
    id: 'hrsg',
    name: 'HR Special Grade',
    fullName: 'HR Special Grade Plates (Sailma / Boiler / Tiston)',
    standard: 'IS 2062 / IS 2002 / IRS T77',
    icon: '🔥',
    image: 'images/hrsg.png',
    hsn: '7208',
    defaultPrice: 72000,
    description: {
      summary: 'HR Special Grade includes high-strength structural steel (Sailma), boiler quality plates (BQ), and abrasion/wear-resistant steel (Tiston/Hardox equivalent). Used in demanding industrial and infrastructure applications.',
      features: [
        'Sailma 350 / 410 / 450 — High Tensile Structural',
        'BQ IS 2002 / IS 2041 — Boiler Quality (elevated temperature)',
        'IS 2831 — Tiston / Abrasion Resistant',
        'Excellent weldability and toughness',
        'Charpy impact tested',
        'MTC (Material Test Certificate) available'
      ]
    },
    specs: [
      ['Standard', 'IS 2062, IS 2002, IS 2830, IRS T77'],
      ['Thickness', '6 mm – 100 mm'],
      ['Width', '1500 mm – 3500 mm'],
      ['Sailma Grades', 'Sailma 350 / Sailma 410 / Sailma 450'],
      ['Boiler Grades', 'IS 2002 Gr.1 / Gr.2 / IS 2041'],
      ['Abrasion Grades', 'HB300 / HB360 / HB400']
    ],
    applications: ['Railway Wagons', 'Boilers & Pressure Vessels', 'Mining Equipment', 'Cranes & Lifting Gear', 'Earth Moving Equipment', 'Defence & Defence Vehicles'],
    fields: [
      {
        id: 'grade', label: 'Grade / Type', type: 'select',
        options: [
          'Sailma 350 (High Tensile)',
          'Sailma 410 (High Tensile)',
          'Sailma 450 (High Tensile)',
          'BQ IS 2002 Gr.1 (Boiler)',
          'BQ IS 2002 Gr.2 (Boiler - High Temp)',
          'IS 2041 (Boiler - Pressure Vessel)',
          'Tiston / HB300 (Abrasion Resistant)',
          'Tiston / HB360 (Abrasion Resistant)',
          'Tiston / HB400 (Abrasion Resistant)'
        ],
        priceAdj: [0, 2000, 4000, 3000, 5000, 6000, 8000, 12000, 16000]
      },
      {
        id: 'thickness', label: 'Thickness (mm)', type: 'select',
        options: ['6', '8', '10', '12', '16', '20', '25', '32', '40', '50', '63'],
        priceAdj: [0, 0, 0, 0, 300, 600, 1200, 2000, 3000, 5000, 8000]
      },
      {
        id: 'width', label: 'Width (mm)', type: 'select',
        options: ['1500', '1800', '2000', '2500', '3000', '3500'],
        priceAdj: [0, 0, 500, 1000, 1500, 2500]
      }
    ]
  },

  ss: {
    id: 'ss',
    name: 'Stainless Steel',
    fullName: 'Stainless Steel Sheets, Coils & Plates',
    standard: 'IS 6911 / ASTM A240',
    icon: '✨',
    image: 'images/ss.png',
    hsn: '7219',
    defaultPrice: 180000,
    description: {
      summary: 'Stainless Steel (SS) offers excellent corrosion and oxidation resistance. Grade 304 is the most popular; Grade 316 offers superior marine and chemical resistance. Available in a range of finishes.',
      features: [
        'Grades: SS 202, SS 304, SS 304L, SS 316, SS 316L, SS 430',
        'Finishes: 2B, BA, No.4 (Brushed), Mirror (No.8)',
        'Mill edge or trim edge available',
        'Excellent hygiene properties (food-safe)',
        'Heat and oxidation resistant',
        'Available in CR Sheet, HR Sheet, Plate forms'
      ]
    },
    specs: [
      ['Standard', 'IS 6911, ASTM A240, EN 10088'],
      ['Grades', '202 / 304 / 304L / 316 / 316L / 430'],
      ['Thickness', '0.4 mm – 50 mm (grade dependent)'],
      ['Width', '1000 mm – 2000 mm'],
      ['Finishes', '2B, BA, No.4, Hair Line (HL), Mirror'],
      ['Edge', 'Mill / Trim / Cut to Size']
    ],
    applications: ['Food Processing Equipment', 'Pharmaceutical Machinery', 'Architecture & Cladding', 'Chemical Plants', 'Kitchen Equipment', 'Dairy Industry', 'Marine Applications'],
    fields: [
      {
        id: 'grade', label: 'Grade', type: 'select',
        options: ['SS 202 (Economical)', 'SS 304 (General Purpose)', 'SS 304L (Low Carbon)', 'SS 316 (Marine/Chemical)', 'SS 316L (Low Carbon Marine)', 'SS 430 (Ferritic)'],
        priceAdj: [-20000, 0, 5000, 30000, 35000, -10000]
      },
      {
        id: 'finish', label: 'Surface Finish', type: 'select',
        options: ['2B (Mill Finish - Standard)', 'BA (Bright Annealed)', 'No.4 (Brushed / Satin)', 'HL (Hair Line)', 'No.8 (Mirror Polish)'],
        priceAdj: [0, 5000, 8000, 10000, 18000]
      },
      {
        id: 'thickness', label: 'Thickness (mm)', type: 'select',
        options: ['0.40', '0.50', '0.80', '1.00', '1.20', '1.50', '2.00', '2.50', '3.00', '4.00', '5.00', '6.00', '8.00', '10.00'],
        priceAdj: [25000, 20000, 12000, 8000, 5000, 2000, 0, 0, -1000, -2000, -3000, -3000, -4000, -5000]
      },
      {
        id: 'width', label: 'Width (mm)', type: 'select',
        options: ['1000', '1219', '1250', '1500', '2000'],
        priceAdj: [0, 0, 0, 2000, 6000]
      }
    ]
  }
};

// ─── Default Prices map ───────────────────────────────────
function getDefaultPrices() {
  const p = {};
  for (const [id, prod] of Object.entries(PRODUCTS)) {
    p[id] = prod.defaultPrice;
  }
  return p;
}

function getPrices() {
  if (!prices) {
    prices = getDefaultPrices();
  }
  return prices;
}

function saveCartToStorage() {
  localStorage.setItem('as_cart', JSON.stringify(cart));
}

// ─── Page Routing ─────────────────────────────────────────
function showPage(pageId, scrollTo) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }

  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navEl = document.getElementById('nav-' + pageId);
  if (navEl) navEl.classList.add('active');

  if (pageId === 'cart') renderCart();
  if (pageId === 'checkout') { renderCheckoutSummary(); resetOtpState(); }
  if (pageId === 'admin') renderAdminPanel();
  if (pageId === 'home') renderCategoriesGrid();

  // Update hash for admin secret URL
  if (pageId === 'admin') {
    window.location.hash = '#admin-panel-secret';
  } else {
    if (window.location.hash === '#admin-panel-secret') window.location.hash = '';
  }

  if (scrollTo) {
    setTimeout(() => {
      const el = document.querySelector(scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

function openProduct(catId) {
  currentProduct = PRODUCTS[catId];
  if (!currentProduct) return;
  renderProductPage(currentProduct);
  showPage('product');
}

// ─── Mobile Menu ──────────────────────────────────────────
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('show');
}

// ─── Navbar Scroll Effect ─────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// ─── Toast Notifications ──────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ─── Price Ticker ─────────────────────────────────────────
function initTicker() {
  const p = getPrices();
  const items = [
    { name: 'HR (IS 2062 E250A)', price: p.hr },
    { name: 'CR (IS 513 CR2)', price: p.cr },
    { name: 'GP (Z120)', price: p.gp },
    { name: 'GPSP (Z180)', price: p.gpsp },
    { name: 'PMP Plates (E250)', price: p.pmp },
    { name: 'HR Sailma 350', price: p.hrsg },
    { name: 'SS 304 (2B)', price: p.ss }
  ];

  // Build doubled list for seamless loop
  const allItems = [...items, ...items];
  const ticker = document.getElementById('tickerInner');
  if (!ticker) return;
  ticker.innerHTML = allItems.map(item => {
    const delta = (Math.random() * 400 - 200).toFixed(0);
    const isUp = delta >= 0;
    return `
      <div class="ticker-item">
        <span class="ti-name">${item.name}</span>
        <span class="ti-price">₹${formatNum(item.price)}/MT</span>
        <span class="ti-change ${isUp ? 'ti-up' : 'ti-down'}">${isUp ? '▲' : '▼'} ₹${Math.abs(Number(delta))}</span>
      </div>
      <span style="color:rgba(255,255,255,.2)">|</span>
    `;
  }).join('');
}

// ─── Categories Grid ──────────────────────────────────────
function renderCategoriesGrid() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  grid.innerHTML = Object.values(PRODUCTS).map(p => `
    <div class="cat-card" onclick="openProduct('${p.id}')" role="button" tabindex="0" 
         onkeydown="if(event.key==='Enter')openProduct('${p.id}')">
      <div class="cat-img"><img src="${p.image}" alt="${p.name}" loading="lazy" /></div>
      <div class="cat-name">${p.name}</div>
      <div class="cat-sub">${p.standard}</div>
      <div class="cat-arrow">Explore →</div>
    </div>
  `).join('');
}

// ─── Product Page ─────────────────────────────────────────
function renderProductPage(prod) {
  document.getElementById('breadcrumbCat').textContent = prod.name;
  document.getElementById('productCategoryTag').textContent = prod.name;
  document.getElementById('productTitle').textContent = prod.fullName;
  document.getElementById('productStandard').textContent = `Standard: ${prod.standard} | HSN: ${prod.hsn}`;

  // Product hero image
  const imgEl = document.getElementById('productHeroImg');
  if (imgEl) { imgEl.src = prod.image; imgEl.alt = prod.fullName; }

  // Price
  const p = getPrices();
  document.getElementById('confPricePerMT').textContent = `₹${formatNum(p[prod.id])}`;
  document.getElementById('confPriceUpd').textContent = 'per MT (ex-Faridabad, excl. GST)';

  // Description
  const descEl = document.getElementById('productDesc');
  descEl.innerHTML = `
    <h4>${prod.fullName}</h4>
    <p style="margin-bottom:14px;color:var(--text-mid);font-size:.9rem">${prod.description.summary}</p>
    <ul>${prod.description.features.map(f => `<li>${f}</li>`).join('')}</ul>
  `;

  // Maker logos strip
  const makerEl = document.getElementById('makerLogos');
  if (makerEl) {
    makerEl.innerHTML = `
      <h4 style="margin-bottom:14px;color:var(--text);font-size:.95rem">Available Makes</h4>
      <div class="maker-strip">
        ${MAKERS.map(m => `
          <div class="maker-logo-item">
            <img src="${m.logo}" alt="${m.name}" title="${m.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
            <div class="maker-fallback" style="display:none">${m.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Specs Table
  const specsEl = document.getElementById('specsTable');
  specsEl.innerHTML = prod.specs.map(([k, v]) => `
    <tr><td>${k}</td><td>${v}</td></tr>
  `).join('');

  // Applications
  const appsEl = document.getElementById('applicationsGrid');
  appsEl.innerHTML = prod.applications.map(a => `<div class="app-chip">${a}</div>`).join('');

  // Configurator Fields — now includes Make dropdown
  const fieldsEl = document.getElementById('configuratorFields');
  const makeField = `
    <div class="form-group">
      <label class="form-label" for="field_make">Make / Manufacturer</label>
      <select class="form-control" id="field_make" onchange="updatePriceCalc()">
        ${MAKERS.map((m, i) => `<option value="${i}">${m.name}</option>`).join('')}
      </select>
    </div>
  `;
  fieldsEl.innerHTML = makeField + prod.fields.map((field, idx) => `
    <div class="form-group">
      <label class="form-label" for="field_${field.id}">${field.label}</label>
      <select class="form-control" id="field_${field.id}" onchange="updatePriceCalc()">
        ${field.options.map((opt, oi) => `<option value="${oi}">${opt}</option>`).join('')}
      </select>
    </div>
  `).join('');

  updatePriceCalc();
}

function getConfiguredPrice() {
  if (!currentProduct) return 0;
  const p   = getPrices();
  let price = p[currentProduct.id];
  currentProduct.fields.forEach(field => {
    const el = document.getElementById('field_' + field.id);
    if (el) {
      const idx = parseInt(el.value, 10);
      price += (field.priceAdj[idx] || 0);
    }
  });
  return Math.max(price, 0);
}

function updatePriceCalc() {
  if (!currentProduct) return;
  const basePrice = getConfiguredPrice();
  const qty       = parseFloat(document.getElementById('confQty').value) || 0;
  const subtotal  = basePrice * qty;
  const gst       = subtotal * GST_RATE;
  const total     = subtotal + gst;

  document.getElementById('psBase').textContent    = `₹${formatNum(basePrice)}/MT`;
  document.getElementById('psQty').textContent     = `${qty} MT`;
  document.getElementById('psSubtotal').textContent = `₹${formatNum(subtotal)}`;
  document.getElementById('psGst').textContent     = `₹${formatNum(gst)}`;
  document.getElementById('psTotal').textContent   = `₹${formatNum(total)}`;
}

function getFieldSummary() {
  if (!currentProduct) return '';
  return currentProduct.fields.map(field => {
    const el = document.getElementById('field_' + field.id);
    if (!el) return '';
    return `${field.label}: ${field.options[parseInt(el.value, 10)]}`;
  }).filter(Boolean).join(' | ');
}

function getSelectedMake() {
  const el = document.getElementById('field_make');
  if (!el) return 'AM/NS India';
  return MAKERS[parseInt(el.value, 10)]?.name || 'AM/NS India';
}

function addToCart() {
  if (!currentProduct) return;
  const qty       = parseFloat(document.getElementById('confQty').value) || 0;
  const basePrice = getConfiguredPrice();

  if (qty <= 0) { showToast('Please enter a valid quantity', 'error'); return; }

  const item = {
    id:        Date.now(),
    productId: currentProduct.id,
    name:      currentProduct.fullName,
    make:      getSelectedMake(),
    specs:     getFieldSummary(),
    pricePerMT: basePrice,
    qty:       qty,
    hsn:       currentProduct.hsn
  };

  cart.push(item);
  saveCartToStorage();
  updateCartBadge();
  updateFloatingCart();
  showToast(`✓ ${currentProduct.name} added to cart!`, 'success');
}

// ─── Cart ──────────────────────────────────────────────────
function updateCartBadge() {
  const count  = cart.length;
  const badge  = document.getElementById('cartBadge');
  const itemCount = document.getElementById('cartItemCount');

  badge.textContent = count;
  badge.classList.toggle('show', count > 0);
  if (itemCount) itemCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
}

function updateFloatingCart() {
  const fcp   = document.getElementById('floating-cart-preview');
  const fcpI  = document.getElementById('fcpItems');
  const fcpT  = document.getElementById('fcpTotal');
  if (!fcp) return;

  if (cart.length === 0) {
    fcp.classList.remove('show');
    return;
  }
  const total = cart.reduce((sum, i) => sum + i.pricePerMT * i.qty, 0);
  const withGst = total * (1 + GST_RATE);
  fcpI.textContent = `${cart.length} item${cart.length !== 1 ? 's' : ''} in cart`;
  fcpT.textContent = `₹${formatNum(withGst)} (incl. GST)`;
  fcp.classList.add('show');
}

function renderCart() {
  const listEl = document.getElementById('cartItemsList');
  const emptyEl = document.getElementById('cartEmpty');
  if (!listEl) return;

  if (cart.length === 0) {
    emptyEl.classList.add('show');
    listEl.innerHTML = '';
    document.getElementById('osSub').textContent = '₹0';
    document.getElementById('osGst').textContent = '₹0';
    document.getElementById('osTotal').textContent = '₹0';
    document.getElementById('gstBreakdown').innerHTML = '';
    return;
  }

  emptyEl.classList.remove('show');
  listEl.innerHTML = cart.map((item, idx) => {
    const subtotal = item.pricePerMT * item.qty;
    const gst      = subtotal * GST_RATE;
    const total    = subtotal + gst;
    return `
      <div class="cart-item">
        <div class="ci-meta">
          <h4>${item.name}</h4>
          <div class="ci-specs">${item.make ? '<strong>Make:</strong> ' + item.make + ' | ' : ''}${item.specs}</div>
          <div class="ci-price-per">₹${formatNum(item.pricePerMT)}/MT × ${item.qty} MT (excl. GST)</div>
        </div>
        <div class="ci-right">
          <div class="ci-total">₹${formatNum(total)}</div>
          <div class="ci-gst">incl. 18% GST (₹${formatNum(gst)})</div>
          <button class="ci-remove" onclick="removeFromCart(${idx})" title="Remove item">🗑</button>
        </div>
      </div>
    `;
  }).join('');

  updateCartSummary();
  updateCartBadge();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveCartToStorage();
  renderCart();
  updateCartBadge();
  updateFloatingCart();
  showToast('Item removed from cart', 'info');
}

function updateCartSummary() {
  const stateEl  = document.getElementById('deliveryState');
  const state    = stateEl ? stateEl.value : '';
  const isHaryana = state === 'HR';
  const hasState  = state !== '';

  const subtotal = cart.reduce((sum, i) => sum + i.pricePerMT * i.qty, 0);
  const totalGst = subtotal * GST_RATE;
  const grandTotal = subtotal + totalGst;

  document.getElementById('osSub').textContent  = `₹${formatNum(subtotal)}`;
  document.getElementById('osGst').textContent  = `₹${formatNum(totalGst)}`;
  document.getElementById('osTotal').textContent = `₹${formatNum(grandTotal)}`;

  // GST breakdown
  const gbEl = document.getElementById('gstBreakdown');
  if (hasState && isHaryana) {
    gbEl.innerHTML = `
      <div class="os-row"><span>CGST (9%)</span><span>₹${formatNum(totalGst/2)}</span></div>
      <div class="os-row"><span>SGST (9%)</span><span>₹${formatNum(totalGst/2)}</span></div>
    `;
    document.getElementById('gstTypeHint').textContent = 'Within Haryana: CGST (9%) + SGST (9%)';
  } else if (hasState) {
    gbEl.innerHTML = `
      <div class="os-row"><span>IGST (18%)</span><span>₹${formatNum(totalGst)}</span></div>
    `;
    document.getElementById('gstTypeHint').textContent = 'Inter-state supply: IGST (18%)';
  } else {
    gbEl.innerHTML = '';
    document.getElementById('gstTypeHint').textContent = 'Select state to determine GST type';
  }
}

// ─── Checkout ─────────────────────────────────────────────
function renderCheckoutSummary() {
  const body = document.getElementById('checkoutSummaryBody');
  if (!body) return;

  const subtotal   = cart.reduce((sum, i) => sum + i.pricePerMT * i.qty, 0);
  const gst        = subtotal * GST_RATE;
  const grand      = subtotal + gst;

  body.innerHTML = `
    ${cart.map(item => {
      const sub = item.pricePerMT * item.qty;
      return `
        <div class="cs-item">
          <div class="cs-name">${item.name}</div>
          <div class="cs-detail">${item.qty} MT × ₹${formatNum(item.pricePerMT)}/MT</div>
          <div class="cs-price">₹${formatNum(sub)}</div>
        </div>
      `;
    }).join('')}
    <hr class="cs-divider" />
    <div class="cs-total-row"><span>Subtotal</span><span>₹${formatNum(subtotal)}</span></div>
    <div class="cs-total-row"><span>GST (18%)</span><span>₹${formatNum(gst)}</span></div>
    <div class="cs-total-row cs-grand"><span>Grand Total</span><span class="cs-val">₹${formatNum(grand)}</span></div>
  `;
}

function validateCheckout() {
  let valid = true;
  const fields = [
    { id: 'coName',    errId: 'coNameErr',    check: v => v.trim().length >= 2 },
    { id: 'buyerName', errId: 'buyerNameErr', check: v => v.trim().length >= 2 },
    { id: 'buyerPhone',errId: 'buyerPhoneErr',check: v => /^[+]?[0-9]{10,13}$/.test(v.replace(/\s/g,'')) },
    { id: 'buyerEmail',errId: 'buyerEmailErr',check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'delAddress',errId: 'delAddressErr',check: v => v.trim().length >= 10 },
    { id: 'delPincode',errId: 'delPincodeErr',check: v => /^[0-9]{6}$/.test(v) },
    { id: 'delState',  errId: 'delStateErr',  check: v => v !== '' }
  ];

  // Validate GSTIN if provided
  const gstinVal = document.getElementById('gstin').value.trim();
  if (gstinVal && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstinVal)) {
    document.getElementById('gstin').classList.add('error');
    document.getElementById('gstinErr').classList.add('show');
    valid = false;
  } else {
    document.getElementById('gstin').classList.remove('error');
    document.getElementById('gstinErr').classList.remove('show');
  }

  fields.forEach(({ id, errId, check }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!el) return;
    const ok = check(el.value);
    el.classList.toggle('error', !ok);
    err.classList.toggle('show', !ok);
    if (!ok) valid = false;
  });

  return valid;
}

async function submitOrder(e) {
  e.preventDefault();
  if (cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
  if (!phoneVerified) { showToast('Please verify your phone number with OTP first.', 'error'); return; }
  if (!emailVerified) { showToast('Please verify your email address with OTP first.', 'error'); return; }
  if (!validateCheckout()) { showToast('Please fill all required fields correctly.', 'error'); return; }

  // Generate order
  const orderId = 'AGS-' + Date.now().toString().slice(-6);
  const order = {
    orderId,
    timestamp: new Date().toISOString(),
    company:   document.getElementById('coName').value,
    buyer:     document.getElementById('buyerName').value,
    phone:     document.getElementById('buyerPhone').value,
    email:     document.getElementById('buyerEmail').value,
    gstin:     document.getElementById('gstin').value,
    address:   document.getElementById('delAddress').value,
    pincode:   document.getElementById('delPincode').value,
    state:     document.getElementById('delState').value,
    notes:     document.getElementById('orderNotes').value,
    items:     [...cart],
    subtotal:  cart.reduce((s, i) => s + i.pricePerMT * i.qty, 0)
  };
  order.gst   = order.subtotal * GST_RATE;
  order.total = order.subtotal + order.gst;

  const btn = document.getElementById('submitOrderBtn');
  const orgText = btn ? btn.innerHTML : '';
  if (btn) btn.innerHTML = 'Processing...';

  try {
    let itemsText = order.items.map(i => `${i.name} - ${i.qty} MT @ ₹${i.pricePerMT} (Make: ${i.make || 'N/A'})`).join('\n');
    let emailData = {
      access_key: "582aaba0-a829-4b94-ac0e-e7055d8e4830",
      subject: `New Steel Order: ${orderId} from ${order.company}`,
      from_name: "Aggarwal Steels Portal",
      Order_ID: orderId,
      Company: order.company,
      Contact_Person: order.buyer,
      Phone: order.phone,
      Email: order.email,
      GSTIN: order.gstin,
      Address: `${order.address}, PIN: ${order.pincode}, State: ${order.state}`,
      Order_Notes: order.notes,
      Items_Summary: itemsText,
      Subtotal: `₹${order.subtotal}`,
      GST: `₹${order.gst}`,
      Total_Value: `₹${order.total}`
    };

    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(emailData)
    });
  } catch (err) {
    console.error("Web3Forms error:", err);
  }

  if (btn) btn.innerHTML = orgText;

  // Save order
  const orders = JSON.parse(localStorage.getItem('as_orders') || '[]');
  orders.push(order);
  localStorage.setItem('as_orders', JSON.stringify(orders));

  // Clear cart
  cart = [];
  saveCartToStorage();
  updateCartBadge();
  updateFloatingCart();

  // Show confirmation
  document.getElementById('confirmOrderId').textContent = orderId;
  document.getElementById('checkoutLayout').style.display = 'none';
  document.getElementById('orderConfirm').classList.add('show');
  window.scrollTo(0, 0);
  showToast('Order placed successfully! 🎉', 'success');
}

// ─── Contact Form ─────────────────────────────────────────
async function submitContactForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orgText = btn.textContent;
  btn.textContent = 'Sending...';

  const data = {
    access_key: '582aaba0-a829-4b94-ac0e-e7055d8e4830',
    subject: 'New Website Enquiry',
    from_name: 'Aggarwal Steels Portal',
    Name: document.getElementById('cName').value,
    Phone: document.getElementById('cPhone').value,
    Email: document.getElementById('cEmail').value,
    Product_Interest: document.getElementById('cProduct').value,
    Message: document.getElementById('cMsg').value,
  };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showToast('Enquiry sent! We will contact you within 24 hours.', 'success');
      e.target.reset();
    } else {
      showToast('Failed to send enquiry. Please try again.', 'error');
    }
  } catch (err) {
    showToast('Failed to send enquiry via network.', 'error');
  } finally {
    btn.textContent = orgText;
  }
}

// ─── Admin Panel ──────────────────────────────────────────
function adminLogin() {
  const pass   = document.getElementById('adminPass').value;
  const errEl  = document.getElementById('adminPassErr');
  if (pass === ADMIN_PASS) {
    adminLoggedIn = true;
    document.getElementById('adminLoginCard').style.display = 'none';
    document.getElementById('adminPanel').style.display     = 'block';
    renderAdminTable();
    showToast('Logged in to Admin Panel', 'success');
  } else {
    errEl.classList.add('show');
    document.getElementById('adminPass').classList.add('error');
  }
}

function adminLogout() {
  adminLoggedIn = false;
  document.getElementById('adminLoginCard').style.display = 'block';
  document.getElementById('adminPanel').style.display     = 'none';
  document.getElementById('adminPass').value = '';
}

function renderAdminPanel() {
  if (adminLoggedIn) {
    document.getElementById('adminLoginCard').style.display = 'none';
    document.getElementById('adminPanel').style.display     = 'block';
    renderAdminTable();
  } else {
    document.getElementById('adminLoginCard').style.display = 'block';
    document.getElementById('adminPanel').style.display     = 'none';
  }
}

function renderAdminTable() {
  const p = getPrices();
  const lastUpd = localStorage.getItem('as_price_updated');
  if (lastUpd) {
    document.getElementById('lastUpdatedTime').textContent = new Date(lastUpd).toLocaleString('en-IN');
  }

  const tbody = document.getElementById('adminTableBody');
  tbody.innerHTML = Object.values(PRODUCTS).map(prod => `
    <tr>
      <td><strong>${prod.name}</strong></td>
      <td style="color:var(--text-light);font-size:.82rem">${prod.fullName}</td>
      <td><span class="badge badge-navy">${prod.hsn}</span></td>
      <td>
        <div class="price-input-cell">
          <span style="font-weight:600;color:var(--text-light)">₹</span>
          <input type="number" value="${p[prod.id]}" min="1000" max="5000000" step="100"
            id="adminPrice_${prod.id}" />
          <span class="saved-tag" id="savedTag_${prod.id}">✓ Saved</span>
        </div>
      </td>
      <td>
        <button class="save-price-btn" onclick="savePrice('${prod.id}')">Save</button>
      </td>
    </tr>
  `).join('');
}

function savePrice(prodId) {
  const input = document.getElementById('adminPrice_' + prodId);
  const val   = parseInt(input.value, 10);
  if (isNaN(val) || val < 1000) { showToast('Enter a valid price (min ₹1,000)', 'error'); return; }

  prices = getPrices();
  prices[prodId] = val;
  localStorage.setItem('as_prices', JSON.stringify(prices));
  const now = new Date().toISOString();
  localStorage.setItem('as_price_updated', now);
  document.getElementById('lastUpdatedTime').textContent = new Date(now).toLocaleString('en-IN');

  const tag = document.getElementById('savedTag_' + prodId);
  tag.classList.add('show');
  setTimeout(() => tag.classList.remove('show'), 2500);
  showToast(`Price updated for ${PRODUCTS[prodId].name}`, 'success');
  initTicker(); // Refresh ticker
}

function resetPrices() {
  if (!confirm('Reset all prices to factory defaults?')) return;
  prices = getDefaultPrices();
  localStorage.setItem('as_prices', JSON.stringify(prices));
  localStorage.removeItem('as_price_updated');
  document.getElementById('lastUpdatedTime').textContent = '—';
  renderAdminTable();
  initTicker();
  showToast('Prices reset to defaults', 'info');
}

// ─── Utilities ────────────────────────────────────────────
function formatNum(n) {
  if (isNaN(n) || n === null) return '0';
  return Math.round(n).toLocaleString('en-IN');
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  getPrices();
  renderCategoriesGrid();
  initTicker();
  updateCartBadge();
  updateFloatingCart();
  if (cart.length > 0) updateFloatingCart();

  // Secret admin URL: #admin-panel-secret
  if (window.location.hash === '#admin-panel-secret') {
    showPage('admin');
  }
});

// Listen for hash change (secret admin URL)
window.addEventListener('hashchange', () => {
  if (window.location.hash === '#admin-panel-secret') {
    showPage('admin');
  }
});

// ─── OTP Verification Functions ──────────────────────────
// NOTE: These are placeholder functions. Replace the send/verify
// logic with your actual OTP API integration.

function resetOtpState() {
  phoneVerified = false;
  emailVerified = false;
  ['phoneOtpSection', 'phoneVerifiedBadge', 'emailOtpSection', 'emailVerifiedBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  ['phoneOtpStatus', 'phoneVerifyStatus', 'emailOtpStatus', 'emailVerifyStatus'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.className = 'otp-status'; }
  });
  document.querySelectorAll('.phone-otp-digit, .email-otp-digit').forEach(i => i.value = '');
  const phoneBtn = document.getElementById('phoneOtpSendBtn');
  const emailBtn = document.getElementById('emailOtpSendBtn');
  if (phoneBtn) { phoneBtn.disabled = false; phoneBtn.textContent = 'Send OTP'; }
  if (emailBtn) { emailBtn.disabled = false; emailBtn.textContent = 'Send OTP'; }
}

function sendPhoneOtp() {
  const phone = document.getElementById('buyerPhone').value.replace(/\s/g, '');
  if (!/^[+]?[0-9]{10,13}$/.test(phone)) {
    showToast('Enter a valid phone number first', 'error');
    return;
  }
  // TODO: Replace with actual API call
  // e.g., fetch('/api/send-otp', { method: 'POST', body: JSON.stringify({ phone }) })
  const btn = document.getElementById('phoneOtpSendBtn');
  btn.disabled = true; btn.textContent = 'Sent ✓';
  document.getElementById('phoneOtpSection').style.display = 'block';
  const status = document.getElementById('phoneOtpStatus');
  status.textContent = 'OTP sent to ' + phone + ' (demo mode — enter any 6 digits)';
  status.className = 'otp-status sent';
  // Auto-focus first digit
  const firstDigit = document.querySelector('.phone-otp-digit');
  if (firstDigit) firstDigit.focus();
}

function sendEmailOtp() {
  const email = document.getElementById('buyerEmail').value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Enter a valid email address first', 'error');
    return;
  }
  // TODO: Replace with actual API call
  const btn = document.getElementById('emailOtpSendBtn');
  btn.disabled = true; btn.textContent = 'Sent ✓';
  document.getElementById('emailOtpSection').style.display = 'block';
  const status = document.getElementById('emailOtpStatus');
  status.textContent = 'OTP sent to ' + email + ' (demo mode — enter any 6 digits)';
  status.className = 'otp-status sent';
  const firstDigit = document.querySelector('.email-otp-digit');
  if (firstDigit) firstDigit.focus();
}

function handleOtpInput(el, type) {
  // Auto-advance to next input
  if (el.value.length === 1) {
    const next = el.nextElementSibling;
    if (next && next.tagName === 'INPUT') next.focus();
  }
}

function verifyPhoneOtp() {
  const digits = document.querySelectorAll('.phone-otp-digit');
  const code = Array.from(digits).map(d => d.value).join('');
  if (code.length < 6) { showToast('Enter all 6 digits', 'error'); return; }

  // TODO: Replace with actual API verification
  // For now, any 6-digit code is accepted (demo mode)
  phoneVerified = true;
  document.getElementById('phoneOtpSection').style.display = 'none';
  document.getElementById('phoneVerifiedBadge').style.display = 'block';
  const status = document.getElementById('phoneOtpStatus');
  status.textContent = '';
  showToast('Phone number verified! ✓', 'success');
}

function verifyEmailOtp() {
  const digits = document.querySelectorAll('.email-otp-digit');
  const code = Array.from(digits).map(d => d.value).join('');
  if (code.length < 6) { showToast('Enter all 6 digits', 'error'); return; }

  // TODO: Replace with actual API verification
  emailVerified = true;
  document.getElementById('emailOtpSection').style.display = 'none';
  document.getElementById('emailVerifiedBadge').style.display = 'block';
  const status = document.getElementById('emailOtpStatus');
  status.textContent = '';
  showToast('Email verified! ✓', 'success');
}
