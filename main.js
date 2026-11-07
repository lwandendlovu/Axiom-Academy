// Axiom Academy: page behaviour (menu, tabs, form checks, WhatsApp hand-off, optional database save)
(() => {
  const CFG = window.AXIOM_CONFIG || {};

  // ---------- Contact details from config ----------
  document.getElementById('yr').textContent = new Date().getFullYear();
  const waUrl = text =>
    (CFG.whatsappNumber ? 'https://wa.me/' + CFG.whatsappNumber : 'https://wa.me/') +
    '?text=' + encodeURIComponent(text);
  if (CFG.whatsappDisplay) document.getElementById('waText').textContent = CFG.whatsappDisplay;
  if (CFG.email) document.getElementById('mailText').textContent = CFG.email;
  document.getElementById('waGeneral').href = waUrl('Hi Axiom Academy, I have a question about ');

  // ---------- Mobile menu ----------
  const menuBtn = document.getElementById('menuBtn');
  const links = document.getElementById('links');
  menuBtn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', false);
    })
  );

  // ---------- Tabs (enrolment / booking) ----------
  const tabs = { enrol: document.getElementById('tab-enrol'), book: document.getElementById('tab-book') };
  function showTab(key) {
    for (const [name, tab] of Object.entries(tabs)) {
      const on = name === key;
      tab.setAttribute('aria-selected', on);
      document.getElementById('panel-' + name).hidden = !on;
    }
  }
  tabs.enrol.addEventListener('click', () => showTab('enrol'));
  tabs.book.addEventListener('click', () => showTab('book'));
  document.querySelectorAll('[data-open]').forEach(a => a.addEventListener('click', () => showTab(a.dataset.open)));

  // ---------- Booking form extras ----------
  const bDate = document.getElementById('b-date');
  bDate.min = new Date(Date.now() + 864e5).toISOString().slice(0, 10); // from tomorrow
  const bService = document.getElementById('b-service');
  const sizeWrap = document.getElementById('b-size-wrap');
  bService.addEventListener('change', () => {
    sizeWrap.hidden = !/talk|workshop|Masterclass/i.test(bService.value);
  });

  // ---------- Validation ----------
  const saPhone = v => /^(\+?27|0)[6-8]\d{8}$/.test(v.replace(/[\s-]/g, ''));

  function validate(form) {
    let ok = true, first = null;
    form.querySelectorAll('.field').forEach(f => {
      if (f.hidden) return;
      let bad = false;
      const ctl = f.querySelector('input:not([type=radio]):not([type=checkbox]), select, textarea');
      const chips = f.querySelector('.chips[data-required]');
      const consent = f.querySelector('input[type=checkbox][required]');
      if (chips) bad = !chips.querySelector('input:checked');
      else if (consent) bad = !consent.checked;
      else if (ctl) {
        const v = ctl.value.trim();
        if (ctl.required && !v) bad = true;
        else if (v && ctl.type === 'tel') bad = !saPhone(v);
        else if (v && ctl.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        else if (v && ctl.type === 'date') bad = v < ctl.min;
      }
      f.classList.toggle('invalid', bad);
      if (bad) { ok = false; if (!first) first = f; }
    });
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return ok;
  }

  // Returns { label: value } for every filled-in field
  function collect(form) {
    const data = {};
    form.querySelectorAll('.field').forEach(f => {
      if (f.hidden) return;
      const chips = f.querySelector('.chips');
      if (chips) {
        const vals = [...chips.querySelectorAll('input:checked')].map(i => i.value);
        if (vals.length) data[chips.dataset.group] = vals.join(', ');
        return;
      }
      const ctl = f.querySelector('input:not([type=checkbox]), select, textarea');
      if (ctl && ctl.name && ctl.value.trim()) data[ctl.name] = ctl.value.trim();
    });
    return data;
  }

  // Optional: save to Supabase via the Vercel function in /api/submit.js
  async function saveToDatabase(type, data, honeypot) {
    if (!CFG.saveToDatabase) return null;
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, company: honeypot }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ---------- Form submit ----------
  function wire(id, type, heading, thanks) {
    const form = document.getElementById('form-' + id);
    const done = document.getElementById('done-' + id);
    const submitBtn = form.querySelector('button[type=submit]');

    const clear = e => { const f = e.target.closest('.field'); if (f) f.classList.remove('invalid'); };
    form.addEventListener('input', clear);
    form.addEventListener('change', clear);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate(form)) return;

      const data = collect(form);
      submitBtn.disabled = true;
      const saved = await saveToDatabase(type, data, form.company.value);
      submitBtn.disabled = false;

      const msg = heading + '\n\n' +
        Object.entries(data).map(([k, v]) => k + ': ' + v).join('\n') +
        '\n\nConsent given (POPIA): yes';

      done.innerHTML = '';
      const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };

      const wa = el('a', 'btn btn-gold', 'Open WhatsApp');
      wa.href = waUrl(msg); wa.target = '_blank'; wa.rel = 'noopener';

      const note = el('span', 'copied');
      const copy = el('button', 'btn btn-navy', 'Copy details');
      copy.type = 'button';
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(msg); note.textContent = 'Copied'; }
        catch { note.textContent = 'Select the text above to copy it'; }
      });

      const back = el('button', 'btn', 'Edit details');
      back.type = 'button'; back.style.background = 'transparent';
      back.addEventListener('click', () => { done.classList.remove('show'); form.hidden = false; });

      const row = el('div', 'row');
      row.append(wa, copy, back, note);

      const intro = saved === true
        ? 'We have received your details. To speed things up, you can also send them to us on WhatsApp.'
        : thanks;

      done.append(
        el('div', 'tick', '✓'),
        el('h3', '', saved === true ? 'Thank you, we have your details' : 'Almost done: send it on WhatsApp'),
        el('p', '', intro),
        el('div', 'summary', msg),
        row
      );
      form.hidden = true;
      done.classList.add('show');
      done.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  wire('enrol', 'tutoring', '*New tutoring enrolment, Axiom Academy*',
    'Your details are ready. Tap Open WhatsApp and press send, and we will confirm your free diagnostic session within 24 hours.');
  wire('book', 'mentorship', '*New mentorship booking, Axiom Academy*',
    'Your booking request is ready. Tap Open WhatsApp and press send, and we will confirm a time slot within 24 hours.');
})();
