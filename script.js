/* =========================================================
   AGGARWAL STEELS — Main Application Script
   ========================================================= */

'use strict';

// ─── Firebase Initialization ──────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyChpQzNBc1Ww7SRFIl-Vci8_7hwI9jW3RY",
  authDomain: "aggarwal-steel.firebaseapp.com",
  databaseURL: "https://aggarwal-steel-default-rtdb.firebaseio.com",
  projectId: "aggarwal-steel",
  storageBucket: "aggarwal-steel.firebasestorage.app",
  messagingSenderId: "1031124402234",
  appId: "1:1031124402234:web:5199ca852c149356147503"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ─── State ───────────────────────────────────────────────
let cart            = JSON.parse(localStorage.getItem('as_cart') || '[]');
let prices          = null; // Loaded from Firebase
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

// ─── Product Categories (Broad) ───────────────────────────
const CATEGORIES = {
  hot_rolled: {
    id: 'hot_rolled', name: 'HR (Hot Rolled)',
    tagline: 'Sheets, Coils, Plates & Special Grades',
    icon: '🔩', image: 'images/hr.png', color: '#e8a000',
    products: ['hr', 'pmp', 'hrpo', 'hrsg', 'ar', 'hr_slit']
  },
  cold_rolled: {
    id: 'cold_rolled', name: 'CRCA (Cold Rolled)',
    tagline: 'Sheets, Coils, Slit & Special Grades',
    icon: '🔧', image: 'images/cr.png', color: '#409cff',
    products: ['cr', 'cr_slit', 'cr_special']
  },
  coated: {
    id: 'coated', name: 'Coated Steel',
    tagline: 'GP, GPSP, Galvalume, ZAM & Colour Coated',
    icon: '🛡️', image: 'images/gp.png', color: '#34c759',
    products: ['gp', 'gpsp', 'galvalume', 'zam', 'ppgi']
  },
  stainless: {
    id: 'stainless', name: 'Stainless Steel (SS)',
    tagline: 'Sheets, Coils & Plates — 202/304/316/430',
    icon: '✨', image: 'images/ss.png', color: '#af52de',
    products: ['ss']
  }
};

// ─── Product Catalogue ────────────────────────────────────
const PRODUCTS = {
  hr: {
    id: 'hr', category: 'hot_rolled',
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
    id: 'cr', category: 'cold_rolled',
    name: 'CRCA Sheets & Coils',
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
    id: 'gp', category: 'coated',
    name: 'GP / GI Sheets',
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
    id: 'gpsp', category: 'coated',
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
    id: 'pmp', category: 'hot_rolled',
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
    id: 'hrsg', category: 'hot_rolled',
    name: 'Sailma / Tiston (High Tensile)',
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
    id: 'ss', category: 'stainless',
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
  },

  // ━━━ NEW: HRPO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hrpo: {
    id: 'hrpo', category: 'hot_rolled',
    name: 'HRPO Coil / Sheets',
    fullName: 'Hot Rolled Pickled & Oiled (HRPO) Sheets & Coils',
    standard: 'IS 10748:2004',
    icon: '🧪', image: 'images/hrpo.png', hsn: '7208',
    defaultPrice: 55000, color: '#e8a000',
    description: {
      summary: 'HRPO steel is hot rolled steel that has been pickled in acid to remove oxide scale and then oiled to prevent rust. It offers a clean, smooth surface ideal for painting or powder coating.',
      features: ['Acid-pickled surface — free from mill scale', 'Oiled for temporary corrosion protection', 'Superior surface for painting and coating', 'Tight thickness tolerances vs. standard HR', 'Grades: E250, E300, E350 per IS 2062', 'Available in coils and cut sheets']
    },
    specs: [['Standard', 'IS 10748:2004, IS 2062'], ['Thickness Range', '1.6 mm – 12 mm'], ['Width Range', '900 mm – 1500 mm'], ['Surface', 'Pickled & Oiled (P&O)'], ['Edge', 'Trim Edge / Slit Edge'], ['Coil ID', '610 mm']],
    applications: ['Automotive Chassis', 'LPG Cylinders', 'Compressor Parts', 'Wheel Rims', 'Structural Tubes', 'Precision Fabrication'],
    fields: [
      { id: 'grade', label: 'Grade', type: 'select', options: ['E250A (CQ)', 'E250B (DQ)', 'E300', 'E350'], priceAdj: [0, 500, 1500, 3000] },
      { id: 'thickness', label: 'Thickness (mm)', type: 'select', options: ['1.6', '2.0', '2.5', '3.0', '4.0', '5.0', '6.0', '8.0', '10.0', '12.0'], priceAdj: [800, 500, 200, 0, 0, 0, 200, 400, 800, 1200] },
      { id: 'width', label: 'Width (mm)', type: 'select', options: ['900', '1000', '1219', '1250', '1500'], priceAdj: [0, 0, 0, 0, 500] }
    ]
  },

  // ━━━ NEW: Abrasion Resistant ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ar: {
    id: 'ar', category: 'hot_rolled',
    name: 'Abrasion Resistant Steel',
    fullName: 'Abrasion Resistant (AR) Steel Plates',
    standard: 'IS 2831 / EN 10029',
    icon: '🛡️', image: 'images/ar.png', hsn: '7208',
    defaultPrice: 95000, color: '#e8a000',
    description: {
      summary: 'Abrasion Resistant (AR) steel plates are heat-treated, high-hardness plates for severe wear environments. Brands include SAIL Rockhard, Hardox (SSAB), Tiscral (Tata), and Sail Hard.',
      features: ['Brinell Hardness: HB300/HB360/HB400/HB450/HB500', 'Brands: Rockhard / Hardox / Sail Hard / Tiscral', 'Through-hardened or surface-hardened', 'Excellent impact and wear resistance', 'Weldable with low-hydrogen electrodes', 'MTC with hardness test report']
    },
    specs: [['Standard', 'IS 2831, EN 10029, Proprietary'], ['Thickness', '6 mm – 80 mm'], ['Width', '1500 mm – 3000 mm'], ['Hardness Range', 'HB300 – HB500'], ['Brands', 'Rockhard / Hardox / Sail Hard / Tiscral'], ['Heat Treatment', 'Quenched & Tempered']],
    applications: ['Mining & Quarrying', 'Cement Plants', 'Bulldozer Blades', 'Dump Truck Liners', 'Crusher Jaws', 'Chutes & Hoppers'],
    fields: [
      { id: 'grade', label: 'Hardness Grade', type: 'select', options: ['HB300 (Mild Wear)', 'HB360 (Medium Wear)', 'HB400 (Heavy Wear)', 'HB450 (Severe Wear)', 'HB500 (Extreme Wear)'], priceAdj: [0, 5000, 10000, 18000, 28000] },
      { id: 'thickness', label: 'Thickness (mm)', type: 'select', options: ['6', '8', '10', '12', '16', '20', '25', '32', '40', '50', '60', '80'], priceAdj: [0, 0, 0, 0, 500, 1000, 2000, 3000, 5000, 8000, 12000, 18000] },
      { id: 'width', label: 'Width (mm)', type: 'select', options: ['1500', '2000', '2500', '3000'], priceAdj: [0, 500, 1000, 2000] }
    ]
  },

  // ━━━ NEW: HR Slit Coils ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hr_slit: {
    id: 'hr_slit', category: 'hot_rolled',
    name: 'HR Slit Coils',
    fullName: 'Hot Rolled Slit Coils (Custom Width)',
    standard: 'IS 2062:2011',
    icon: '🔄', image: 'images/hr-slit.png', hsn: '7208',
    defaultPrice: 53500, color: '#e8a000',
    description: {
      summary: 'HR Slit Coils are produced by slitting wide HR mother coils into narrower widths using precision rotary slitting lines. Ideal for tube mills, roll forming, and narrow-width structural applications.',
      features: ['Custom slit from HR mother coils', 'Minimum slit width from 25 mm', 'Tight width tolerances (±0.2 mm)', 'Slit edge — burr-free on request', 'Grades: E250A, E250B, E300, E350', 'Coil ID: 508 mm or 610 mm']
    },
    specs: [['Standard', 'IS 2062:2011'], ['Thickness', '1.6 mm – 12 mm'], ['Slit Width', '25 mm – 500 mm'], ['Mother Coil Width', '900 mm – 1500 mm'], ['Edge', 'Slit Edge (burr-free available)'], ['Coil ID', '508 mm / 610 mm']],
    applications: ['ERW Tube Mills', 'Roll Forming', 'Automotive Strips', 'Narrow Structural Sections', 'Spring Steel', 'Shutter Strips'],
    fields: [
      { id: 'grade', label: 'Grade', type: 'select', options: ['E250A (Fe 410-S)', 'E250B (Fe 410-W)', 'E300', 'E350'], priceAdj: [0, 500, 1200, 2500] },
      { id: 'thickness', label: 'Thickness (mm)', type: 'select', options: ['1.6', '2.0', '2.5', '3.0', '4.0', '5.0', '6.0', '8.0', '10.0', '12.0'], priceAdj: [0, 0, 0, 0, 0, 0, 200, 400, 800, 1200] },
      { id: 'width', label: 'Slit Width (mm)', type: 'select', options: ['25–50', '50–100', '100–200', '200–300', '300–500'], priceAdj: [3000, 2000, 1000, 500, 0] }
    ]
  },

  // ━━━ NEW: CR Slit Coils ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cr_slit: {
    id: 'cr_slit', category: 'cold_rolled',
    name: 'CR Slit Coils',
    fullName: 'Cold Rolled Slit Coils (Custom Width)',
    standard: 'IS 513:2008',
    icon: '🔄', image: 'images/cr-slit.png', hsn: '7209',
    defaultPrice: 62000, color: '#409cff',
    description: {
      summary: 'CR Slit Coils are precision-slit from CRCA mother coils to achieve narrow custom widths. The bright, smooth surface of cold-rolled steel is preserved during slitting.',
      features: ['Precision slit from CRCA master coils', 'Width tolerance ±0.1 mm achievable', 'Burr-free edges on request', 'Available in all CR grades (CR1–CR5)', 'Ideal for stamping, forming, roll-forming', 'Coil ID: 508 mm standard']
    },
    specs: [['Standard', 'IS 513:2008'], ['Thickness', '0.4 mm – 3.0 mm'], ['Slit Width', '20 mm – 500 mm'], ['Surface', 'Matte / Bright Annealed'], ['Edge', 'Slit Edge (burr-free available)'], ['Coil ID', '508 mm / 610 mm']],
    applications: ['Stamping Dies', 'Roll Formed Sections', 'Cable Trays', 'Auto Components', 'Electrical Connectors', 'Spring Washers'],
    fields: [
      { id: 'grade', label: 'Grade', type: 'select', options: ['CR1 (CQ)', 'CR2 (DQ)', 'CR3 (DDQ)', 'CR4 (EDDQ)'], priceAdj: [0, 1000, 2500, 4000] },
      { id: 'thickness', label: 'Thickness (mm)', type: 'select', options: ['0.40', '0.50', '0.63', '0.80', '1.00', '1.20', '1.50', '2.00', '2.50', '3.00'], priceAdj: [1000, 800, 600, 400, 0, 0, 0, 0, -200, -300] },
      { id: 'width', label: 'Slit Width (mm)', type: 'select', options: ['20–50', '50–100', '100–200', '200–300', '300–500'], priceAdj: [3500, 2500, 1200, 600, 0] }
    ]
  },

  // ━━━ NEW: CR Special Grades ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cr_special: {
    id: 'cr_special', category: 'cold_rolled',
    name: 'CR Special Grades',
    fullName: 'CR Special Grades — IF / Dual Phase / AHSS',
    standard: 'IS 15814 / JIS G3135',
    icon: '⚡', image: 'images/cr-special.png', hsn: '7209',
    defaultPrice: 70000, color: '#409cff',
    description: {
      summary: 'Advanced CR grades including Interstitial Free (IF) steel for ultra-deep drawing and Dual Phase (DP) / AHSS grades for high-strength automotive applications.',
      features: ['IF Steel — Ultra-low carbon, superior formability', 'DP 380/440/590/780/980 — Dual Phase AHSS', 'High strength-to-weight ratio', 'Excellent crash energy absorption (automotive)', 'Tight thickness and flatness tolerances', 'Available with corrosion-resistant coatings']
    },
    specs: [['Standard', 'IS 15814, JIS G3135, VDA 239-100'], ['Thickness', '0.5 mm – 2.5 mm'], ['Width', '900 mm – 1500 mm'], ['IF Grades', 'IF-CQ / IF-DQ / IF-DDQ / IF-EDDQ'], ['DP Grades', 'DP 380 / DP 440 / DP 590 / DP 780 / DP 980'], ['Tensile Strength', '270 MPa – 1000 MPa']],
    applications: ['Automotive Body Panels', 'BIW (Body in White)', 'Crash Structures', 'Door Inners/Outers', 'Bumper Reinforcements', 'Seat Structures'],
    fields: [
      { id: 'grade', label: 'Grade', type: 'select', options: ['IF Steel (CQ)', 'IF Steel (DDQ)', 'DP 380', 'DP 440', 'DP 590', 'DP 780', 'DP 980'], priceAdj: [0, 2000, 3000, 5000, 8000, 14000, 22000] },
      { id: 'thickness', label: 'Thickness (mm)', type: 'select', options: ['0.50', '0.60', '0.80', '1.00', '1.20', '1.50', '1.80', '2.00', '2.50'], priceAdj: [1000, 800, 400, 0, 0, 0, 0, -200, -400] },
      { id: 'width', label: 'Width (mm)', type: 'select', options: ['900', '1000', '1219', '1250', '1500'], priceAdj: [0, 0, 0, 0, 500] }
    ]
  },

  // ━━━ NEW: Galvalume ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  galvalume: {
    id: 'galvalume', category: 'coated',
    name: 'Galvalume / GL',
    fullName: 'Galvalume (GL) — Aluminium-Zinc Coated Steel',
    standard: 'IS 15961:2012',
    icon: '🔆', image: 'images/galvalume.png', hsn: '7210',
    defaultPrice: 78000, color: '#34c759',
    description: {
      summary: 'Galvalume steel is coated with 55% Aluminium, 43.5% Zinc, 1.5% Silicon alloy. It offers 2–6x longer life than standard galvanised steel, especially in coastal and industrial environments.',
      features: ['55% Al-Zn alloy coating (superior corrosion resistance)', 'Coating: AZ070, AZ100, AZ150, AZ185', '2–6x life of standard GP in corrosive environments', 'Excellent heat reflectivity', 'Tight bend radius for profiling', 'Perfect base for colour coating (PPGL)']
    },
    specs: [['Standard', 'IS 15961:2012, ASTM A792'], ['Base Metal', 'Cold Rolled Steel'], ['Thickness', '0.30 mm – 1.60 mm'], ['Width', '914 mm – 1250 mm'], ['Coating', 'AZ070 / AZ100 / AZ150 / AZ185'], ['Surface', 'Regular / Anti-Fingerprint (AFP)']],
    applications: ['Metal Roofing', 'Wall Cladding', 'Solar Panel Frames', 'HVAC Ducting', 'Prefab Structures', 'Industrial Sheds'],
    fields: [
      { id: 'coating', label: 'Al-Zn Coating', type: 'select', options: ['AZ070', 'AZ100', 'AZ150', 'AZ185'], priceAdj: [0, 1500, 3000, 5000] },
      { id: 'thickness', label: 'Thickness (mm)', type: 'select', options: ['0.30', '0.40', '0.45', '0.50', '0.55', '0.63', '0.80', '1.00', '1.20', '1.60'], priceAdj: [2000, 1500, 1000, 600, 300, 0, 0, 0, -200, -500] },
      { id: 'width', label: 'Width (mm)', type: 'select', options: ['914', '1000', '1219', '1250'], priceAdj: [0, 0, 0, 200] }
    ]
  },

  // ━━━ NEW: ZAM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  zam: {
    id: 'zam', category: 'coated',
    name: 'ZAM (Magnelis / Magsure)',
    fullName: 'ZAM — Zinc-Aluminium-Magnesium Alloy Coated Steel',
    standard: 'Proprietary (EN 10346 base)',
    icon: '💎', image: 'images/zam.png', hsn: '7210',
    defaultPrice: 85000, color: '#34c759',
    description: {
      summary: 'ZAM® is next-generation coated steel with a Zn-Al-Mg alloy layer. It provides 5–10x corrosion resistance vs. standard GI, with self-healing capability at cut edges. Brands: Magnelis (ArcelorMittal), Magsure (Tata).',
      features: ['Zn-Al-Mg ternary alloy coating', '5–10x corrosion resistance vs. standard GI', 'Self-healing at cut edges and scratches', 'Thinner coating = same protection (weight saving)', 'Excellent for outdoor/aggressive environments', 'Brands: ZAM / Magnelis / Magsure / SuperDyma']
    },
    specs: [['Standard', 'Proprietary (EN 10346 base)'], ['Coating Composition', 'Zn – 6% Al – 3% Mg (typical)'], ['Thickness', '0.4 mm – 2.0 mm'], ['Width', '900 mm – 1250 mm'], ['Coating Weight', '60 – 275 g/m²'], ['Surface', 'Smooth / Anti-Fingerprint']],
    applications: ['Solar Structures', 'Telecom Towers', 'Highway Guardrails', 'Cable Trays', 'Agricultural Equipment', 'Outdoor Enclosures'],
    fields: [
      { id: 'coating', label: 'Coating Weight (g/m²)', type: 'select', options: ['ZM060 (60 g/m²)', 'ZM090 (90 g/m²)', 'ZM120 (120 g/m²)', 'ZM180 (180 g/m²)', 'ZM275 (275 g/m²)'], priceAdj: [0, 1000, 2500, 4500, 8000] },
      { id: 'thickness', label: 'Thickness (mm)', type: 'select', options: ['0.40', '0.50', '0.63', '0.80', '1.00', '1.20', '1.50', '2.00'], priceAdj: [1500, 1000, 500, 200, 0, 0, -200, -500] },
      { id: 'width', label: 'Width (mm)', type: 'select', options: ['900', '1000', '1219', '1250'], priceAdj: [0, 0, 0, 200] }
    ]
  },

  // ━━━ NEW: Colour Coated (PPGI/PPGL) ━━━━━━━━━━━━━━━━━━━
  ppgi: {
    id: 'ppgi', category: 'coated',
    name: 'Colour Coated (PPGI/PPGL)',
    fullName: 'Pre-Painted Steel — PPGI & PPGL Coils',
    standard: 'IS 14772:2000',
    icon: '🎨', image: 'images/ppgi.png', hsn: '7210',
    defaultPrice: 82000, color: '#34c759',
    description: {
      summary: 'Colour Coated steel (PPGI = Pre-Painted GI, PPGL = Pre-Painted Galvalume) is factory-coated with polyester, SMP, PVDF, or PVC plastisol paint. Available in RAL colour shades.',
      features: ['PPGI (GI base) and PPGL (Galvalume base) available', 'Paint systems: Regular PE / SMP / PVDF / HDP', 'Top coat thickness: 15–25 µm standard', 'RAL / custom colour shades available', 'Reverse side: primer or full paint', 'Excellent weathering resistance (10–25 yr warranty)']
    },
    specs: [['Standard', 'IS 14772:2000, ASTM A755'], ['Base Metal', 'GI (GP) or Galvalume (GL)'], ['Thickness', '0.23 mm – 1.00 mm (TCT)'], ['Width', '914 mm – 1250 mm'], ['Paint System', 'Regular PE / SMP / PVDF / HDP'], ['Top Paint', '15 / 20 / 25 µm']],
    applications: ['Metal Roofing & Cladding', 'Sandwich Panels', 'Rolling Shutters', 'Container Houses', 'Modular Buildings', 'Signage & Fascia'],
    fields: [
      { id: 'base', label: 'Base Metal', type: 'select', options: ['PPGI (Galvanised base)', 'PPGL (Galvalume base)'], priceAdj: [0, 4000] },
      { id: 'paint', label: 'Paint System', type: 'select', options: ['Regular Polyester (PE)', 'SMP (Silicon Modified)', 'PVDF (Premium Weather)', 'HDP (High Durability)'], priceAdj: [0, 3000, 8000, 5000] },
      { id: 'thickness', label: 'Thickness TCT (mm)', type: 'select', options: ['0.23', '0.30', '0.35', '0.40', '0.45', '0.47', '0.50', '0.60', '0.80', '1.00'], priceAdj: [2500, 2000, 1500, 1000, 500, 300, 0, 0, -300, -600] },
      { id: 'width', label: 'Width (mm)', type: 'select', options: ['914', '1000', '1090', '1219', '1250'], priceAdj: [0, 0, 0, 0, 200] }
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

function initFirebaseSync() {
  db.ref('prices').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      prices = data;
    } else {
      prices = getDefaultPrices();
    }
    
    // Live-update UI components if they are active
    initTicker();
    
    const productPage = document.getElementById('page-product');
    if (currentProduct && productPage && productPage.classList.contains('active')) {
      renderProductPage(currentProduct);
    }
    
    const adminPage = document.getElementById('page-admin');
    if (adminPage && adminPage.classList.contains('active')) {
      renderAdminPanel();
    }
  });
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
    { name: 'HR (IS 2062)', price: p.hr },
    { name: 'HRPO (Pickled)', price: p.hrpo },
    { name: 'CRCA (IS 513)', price: p.cr },
    { name: 'GP (Galvanised)', price: p.gp },
    { name: 'Galvalume (AZ150)', price: p.galvalume },
    { name: 'Colour Coated', price: p.ppgi },
    { name: 'PMP Plates', price: p.pmp },
    { name: 'Sailma (High Tensile)', price: p.hrsg },
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
  grid.innerHTML = Object.values(CATEGORIES).map(cat => `
    <div class="cat-card cat-card-broad" onclick="openSubCategory('${cat.id}')" role="button" tabindex="0" 
         onkeydown="if(event.key==='Enter')openSubCategory('${cat.id}')">
      <div class="cat-img"><img src="${cat.image}" alt="${cat.name}" loading="lazy" /></div>
      <div class="cat-name">${cat.name}</div>
      <div class="cat-sub">${cat.tagline}</div>
      <div class="cat-count">${cat.products.length} product${cat.products.length > 1 ? 's' : ''}</div>
      <div class="cat-arrow">Browse →</div>
    </div>
  `).join('');
}

// ─── Sub-Category Page ────────────────────────────────────
function openSubCategory(catId) {
  const cat = CATEGORIES[catId];
  if (!cat) return;
  // If category has only 1 product, go directly to it
  if (cat.products.length === 1) {
    openProduct(cat.products[0]);
    return;
  }
  renderSubCategoryPage(cat);
  showPage('subcategory');
}

function renderSubCategoryPage(cat) {
  document.getElementById('subcatTitle').textContent = cat.name;
  document.getElementById('subcatDesc').textContent = cat.tagline;
  document.getElementById('subcatBackBtn').onclick = () => showPage('home');

  const grid = document.getElementById('subcatGrid');
  const prices = getPrices();
  grid.innerHTML = cat.products.map(prodId => {
    const p = PRODUCTS[prodId];
    if (!p) return '';
    const price = prices[p.id] || p.defaultPrice;
    return `
      <div class="subcat-card" onclick="openProduct('${p.id}')" role="button" tabindex="0"
           onkeydown="if(event.key==='Enter')openProduct('${p.id}')">
        <div class="subcat-img"><img src="${p.image}" alt="${p.name}" loading="lazy" /></div>
        <div class="subcat-body">
          <div class="subcat-icon">${p.icon}</div>
          <h3 class="subcat-name">${p.name}</h3>
          <div class="subcat-standard">${p.standard}</div>
          <p class="subcat-summary">${p.description.summary.substring(0, 120)}...</p>
          <div class="subcat-price">From ₹${formatNum(price)}/MT</div>
          <div class="subcat-arrow">Configure & Order →</div>
        </div>
      </div>
    `;
  }).join('');
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
    <button class="btn btn-full btn-lg" onclick="generatePDFQuote()" style="margin-top:20px;display:flex;align-items:center;justify-content:center;gap:8px;background:transparent;border:2px solid var(--blue);color:var(--blue);font-weight:600;">
      📄 Download PDF Quote
    </button>
  `;
}

// ─── PDF Quotation Generator ──────────────────────────────
async function generatePDFQuote() {
  if (cart.length === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }
  
  showToast('Generating PDF Quotation...', 'info');
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN');
  const quoteNo = 'AS-' + today.getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  
  const subtotal = cart.reduce((sum, i) => sum + i.pricePerMT * i.qty, 0);
  const gst = subtotal * GST_RATE;
  const grand = subtotal + gst;
  
  // Build table rows
  const rows = cart.map((item, idx) => {
    const amount = item.pricePerMT * item.qty;
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;">
          <strong>${item.name}</strong><br>
          <span style="font-size:0.78rem;color:#666;">${item.specs}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;">${item.make || '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;text-align:center;">${item.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;text-align:right;">₹${formatNum(item.pricePerMT)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;text-align:right;">₹${formatNum(amount)}</td>
      </tr>`;
  }).join('');
  
  // Build a fully self-contained HTML string (no CSS variables, no external dependencies)
  const html = `
  <div style="width:750px;background:#fff;color:#000;font-family:Inter,Helvetica,Arial,sans-serif;padding:40px;box-sizing:border-box;">
    
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
      <div>
        <div style="font-size:1.9rem;font-weight:800;color:#1d1d60;letter-spacing:-0.5px;">Aggarwal Steels</div>
        <div style="font-size:0.85rem;color:#888;margin-top:2px;">Quality Steel Since 1990</div>
      </div>
      <div style="text-align:right;font-size:0.88rem;line-height:1.6;color:#444;">
        <strong>Office &amp; Yard:</strong><br>
        Plot No. 680, Sector 59<br>
        Faridabad, Haryana 121004<br>
        <strong>GSTIN:</strong> 06AAFPA0130J1ZG
      </div>
    </div>
    
    <!-- Blue divider -->
    <hr style="border:0;border-top:3px solid #0071e3;margin:18px 0 24px;">
    
    <!-- Title row -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;">
      <h2 style="font-family:Inter,sans-serif;font-weight:700;margin:0;color:#1d1d60;font-size:1.5rem;letter-spacing:-0.3px;">PROFORMA QUOTATION</h2>
      <div style="text-align:right;font-size:0.9rem;color:#333;">
        <strong>Date:</strong> ${dateStr}<br>
        <strong>Quote No:</strong> ${quoteNo}
      </div>
    </div>
    
    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:0.88rem;">
      <thead>
        <tr>
          <th style="background:#f0f0f5;padding:11px 12px;text-align:left;border-bottom:2px solid #ccc;color:#111;font-weight:600;" width="7%">S.No.</th>
          <th style="background:#f0f0f5;padding:11px 12px;text-align:left;border-bottom:2px solid #ccc;color:#111;font-weight:600;" width="40%">Description of Goods</th>
          <th style="background:#f0f0f5;padding:11px 12px;text-align:left;border-bottom:2px solid #ccc;color:#111;font-weight:600;" width="14%">Origin / Make</th>
          <th style="background:#f0f0f5;padding:11px 12px;text-align:center;border-bottom:2px solid #ccc;color:#111;font-weight:600;" width="10%">Qty (MT)</th>
          <th style="background:#f0f0f5;padding:11px 12px;text-align:right;border-bottom:2px solid #ccc;color:#111;font-weight:600;" width="13%">Rate (₹/MT)</th>
          <th style="background:#f0f0f5;padding:11px 12px;text-align:right;border-bottom:2px solid #ccc;color:#111;font-weight:600;" width="16%">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    
    <!-- Totals box -->
    <div style="width:320px;margin-left:auto;border:1px solid #ddd;padding:18px 20px;border-radius:8px;margin-bottom:36px;background:#fafafa;">
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:0.92rem;color:#333;">
        <span>Subtotal (Excl. GST)</span>
        <span>₹${formatNum(subtotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:0.92rem;color:#333;">
        <span>Integrated GST (18%)</span>
        <span>₹${formatNum(gst)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0 0;margin-top:8px;border-top:2px solid #111;font-size:1.05rem;">
        <span style="font-weight:800;color:#000;">Grand Total</span>
        <span style="font-weight:800;color:#1d1d60;">₹${formatNum(grand)}</span>
      </div>
      <div style="text-align:right;font-size:0.75rem;color:#888;margin-top:4px;">(Amounts in INR)</div>
    </div>
    
    <!-- Terms -->
    <div style="font-size:0.82rem;color:#444;line-height:1.65;margin-bottom:36px;padding:18px 0;border-top:1px dashed #ccc;">
      <div style="margin-bottom:6px;font-weight:700;color:#111;">Terms &amp; Conditions:</div>
      <div style="padding-left:6px;">
        1. <strong>Validity:</strong> Prices quoted are valid for 24 hours from the date of quotation and subject to market fluctuations.<br>
        2. <strong>Availability:</strong> Material is offered subject to prior sale. Please confirm stock before placing the order.<br>
        3. <strong>Freight:</strong> Prices are Ex-Godown Faridabad. Transportation and cutting charges will be extra as applicable.<br>
        4. <strong>GST:</strong> GST @ 18% is applicable. The estimate above applies flat 18% IGST. Final invoice will reflect CGST/SGST based on your state.
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;font-size:0.78rem;color:#999;border-top:1px solid #eee;padding-top:18px;">
      This is a system-generated quotation and does not require a physical signature.<br>
      For order confirmation or queries, call <strong>+91-XXXXXXXXXX</strong> or visit <strong>www.aggarwalsteels.com</strong>
    </div>
  </div>`;
  
  // Create a temporary offscreen container for html2canvas to render
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  
  // Wait one animation frame so the browser completes layout
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  
  try {
    const opt = {
      margin:       [0.4, 0.4, 0.4, 0.4],
      filename:     'Aggarwal_Steels_Quotation.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    await window.html2pdf().set(opt).from(wrapper.firstElementChild).save();
    showToast('PDF downloaded successfully! ✅', 'success');
  } catch (error) {
    console.error('PDF Generation error:', error);
    showToast('Failed to generate PDF. Please try again.', 'error');
  } finally {
    document.body.removeChild(wrapper);
  }
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
  
  db.ref('prices').set(prices)
    .then(() => {
      const now = new Date().toISOString();
      localStorage.setItem('as_price_updated', now);
      document.getElementById('lastUpdatedTime').textContent = new Date(now).toLocaleString('en-IN');

      const tag = document.getElementById('savedTag_' + prodId);
      tag.classList.add('show');
      setTimeout(() => tag.classList.remove('show'), 2500);
      showToast(`Global price updated for ${PRODUCTS[prodId].name}`, 'success');
    })
    .catch((error) => {
      console.error(error);
      showToast('Error syncing price to cloud!', 'error');
    });
}

function resetPrices() {
  if (!confirm('Reset all prices to factory defaults globally?')) return;
  prices = getDefaultPrices();
  db.ref('prices').set(prices)
    .then(() => {
      localStorage.removeItem('as_price_updated');
      document.getElementById('lastUpdatedTime').textContent = '—';
      showToast('All prices reset to factory defaults globally', 'info');
    })
    .catch((error) => {
      console.error(error);
      showToast('Error resetting prices in cloud', 'error');
    });
}

// ─── Utilities ────────────────────────────────────────────
function formatNum(n) {
  if (isNaN(n) || n === null) return '0';
  return Math.round(n).toLocaleString('en-IN');
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFirebaseSync();
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
