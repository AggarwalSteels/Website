/* ═══════════════════════════════════════════
   Aggarwal Steels — SEO Pages Common JS
   Injects navbar, footer, enquiry form, and
   initializes Web3Forms on standalone pages.
   ═══════════════════════════════════════════ */

'use strict';

const WEB3_KEY = '582aaba0-a829-4b94-ac0e-e7055d8e4830';

/* ── Detect path depth (for correct relative links) ── */
function getBase() {
  const depth = (window.location.pathname.match(/\//g) || []).length - 1;
  const segs  = window.location.pathname.split('/');
  const inSub = segs.some(s => ['buy','blog'].includes(s));
  return inSub ? '../' : './';
}

/* ── Navbar ── */
function injectNav() {
  const el = document.getElementById('seo-nav');
  if (!el) return;
  const b = getBase();
  el.innerHTML = `
  <nav class="sn">
    <div class="container sn-inner">
      <a href="${b}index.html" class="sn-logo">
        <img src="${b}images/logo.png" alt="Aggarwal Steels" />
      </a>
      <div class="sn-links">
        <a href="${b}index.html">Home</a>
        <a href="${b}index.html#categories">Products</a>
        <a href="${b}blog.html">Blog</a>
        <a href="${b}index.html#contact">Contact</a>
      </div>
      <a href="${b}index.html" class="sn-cta">Shop Now →</a>
      <button class="sn-ham" onclick="document.getElementById('seo-mobile').classList.toggle('open')">☰</button>
    </div>
  </nav>
  <div class="sn-mobile" id="seo-mobile">
    <button class="sn-close" onclick="document.getElementById('seo-mobile').classList.remove('open')">✕</button>
    <a href="${b}index.html">🏠 Home</a>
    <a href="${b}index.html#categories">📦 Products</a>
    <a href="${b}blog.html">📰 Blog</a>
    <a href="${b}index.html#contact">📞 Contact</a>
    <a href="${b}index.html">🛒 Shop Now</a>
  </div>`;
}

/* ── Footer ── */
function injectFooter() {
  const el = document.getElementById('seo-footer');
  if (!el) return;
  const b = getBase();
  el.innerHTML = `
  <footer class="sf">
    <div class="container">
      <div class="sf-grid">
        <div class="sf-brand">
          <img src="${b}images/logo.png" alt="Aggarwal Steels" style="height:42px;width:auto;object-fit:contain" />
          <p>Faridabad's trusted steel supplier since 1990. Quality, reliability, and competitive pricing for India's manufacturing sector.</p>
          <div style="margin-top:14px;display:flex;gap:10px">
            <span class="sf-badge">ISI Certified</span>
            <span class="sf-badge">GST Registered</span>
          </div>
        </div>
        <div class="sf-col">
          <h4>Products</h4>
          <ul>
            <li><a href="${b}buy/hr-sheets-faridabad.html">HR Sheets & Coils</a></li>
            <li><a href="${b}buy/cr-sheets-delhi.html">CR Sheets & Coils</a></li>
            <li><a href="${b}buy/gp-sheets-delhi.html">Galvanised Plain (GP)</a></li>
            <li><a href="${b}buy/gpsp-sheets-delhi.html">GPSP Sheets</a></li>
            <li><a href="${b}buy/buy-hr-plates.html">PMP Plates</a></li>
            <li><a href="${b}buy/sailma-plates-supplier.html">HR Special Grade</a></li>
            <li><a href="${b}buy/stainless-steel-delhi.html">Stainless Steel</a></li>
          </ul>
        </div>
        <div class="sf-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="${b}blog.html">Blog & News</a></li>
            <li><a href="${b}blog/gp-sheet-buying-guide.html">GP Sheet Buying Guide</a></li>
            <li><a href="${b}blog/hr-vs-cr-steel-differences.html">HR vs CR Steel</a></li>
            <li><a href="${b}buy/steel-supplier-faridabad.html">Why Aggarwal Steels?</a></li>
          </ul>
        </div>
        <div class="sf-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="tel:+918800885195">📞 +91 8800885195</a></li>
            <li><a href="mailto:info@aggarwalsteels.com">✉ info@aggarwalsteels.com</a></li>
            <li>📍 Plot No. 680, Sec 59, Faridabad 121004</li>
            <li>🕐 Mon–Sat: 9 AM – 6 PM</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="sf-bottom">
      <div class="container">
        <p>© 2025 Aggarwal Steels. All rights reserved. GST: 06AAFPA0130J1ZG</p>
      </div>
    </div>
  </footer>`;
}

/* ── Enquiry Form (small inline) ── */
function injectEnquiryForm(containerSelector) {
  const el = document.querySelector(containerSelector);
  if (!el) return;
  el.innerHTML = `
  <form class="eq-form" onsubmit="submitSeoEnquiry(event, this)">
    <h3>Quick Enquiry</h3>
    <p class="eq-sub">Get the best price — we respond within 2 hours.</p>
    <input type="text" name="name" placeholder="Your Name *" required />
    <input type="tel"  name="phone" placeholder="Phone Number *" required />
    <input type="email" name="email" placeholder="Email" />
    <input type="text"  name="product" placeholder="Product Interest" value="${document.title.split('|')[0]?.trim() || ''}" />
    <textarea name="message" rows="3" placeholder="Describe your requirement (grade, thickness, quantity)..." required></textarea>
    <button type="submit">Send Enquiry →</button>
  </form>`;
}

/* ── Form Submission ── */
async function submitSeoEnquiry(e, form) {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const org = btn.textContent;
  btn.textContent = 'Sending...';

  const fd = new FormData(form);
  const data = {
    access_key: WEB3_KEY,
    subject: `SEO Enquiry: ${fd.get('product') || document.title}`,
    from_name: 'Aggarwal Steels Portal',
    Name: fd.get('name'),
    Phone: fd.get('phone'),
    Email: fd.get('email'),
    Product: fd.get('product'),
    Message: fd.get('message'),
    Page_URL: window.location.href
  };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      form.innerHTML = '<div class="eq-done">✅ Enquiry sent! We\'ll contact you within 2 hours.</div>';
    } else {
      btn.textContent = 'Failed — Try Again';
    }
  } catch {
    btn.textContent = 'Network Error — Try Again';
  }
}

/* ── Scroll effect ── */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.sn');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  injectNav();
  injectFooter();
  const eqEl = document.querySelector('[data-enquiry-form]');
  if (eqEl) injectEnquiryForm('[data-enquiry-form]');
});
