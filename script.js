(() => {
  const form = document.querySelector('#resume-form');
  const sections = [...document.querySelectorAll('.form-section')];
  const backButton = document.querySelector('#back-button');
  const nextButton = document.querySelector('#next-button');
  const progress = document.querySelector('#progress-bar');
  const progressLabel = document.querySelector('#progress-label');
  const toast = document.querySelector('#toast');
  const storageKey = 'digital-it-move-resume-v1';
  let currentSection = 0;
  let toastTimeout;

  const values = (name) => [...form.querySelectorAll(`[name="${name}"]`)].map((field) => field.value.trim());
  const escapeText = (value) => value;
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
  };

  function setSection(index) {
    currentSection = Math.max(0, Math.min(sections.length - 1, index));
    sections.forEach((section, i) => section.classList.toggle('active', i === currentSection));
    progress.style.width = `${((currentSection + 1) / sections.length) * 100}%`;
    progressLabel.textContent = `${currentSection + 1} of ${sections.length} sections`;
    backButton.disabled = currentSection === 0;
    nextButton.type = 'button';
    nextButton.innerHTML = currentSection === sections.length - 1 ? 'Send to Digital It Move <span>↗</span>' : 'Next section <span>→</span>';
  }

  function addEntry(type, data = {}) {
    const list = document.querySelector(`#${type}-list`);
    const isExperience = type === 'experience';
    const count = list.children.length + 1;
    const title = isExperience ? 'Role' : 'Education';
    const card = document.createElement('div');
    card.className = 'repeat-card';
    card.innerHTML = `<div class="repeat-card-top"><b>${title} ${count}</b><button class="remove-entry" type="button" aria-label="Remove ${title.toLowerCase()}" title="Remove">×</button></div>
      <div class="repeat-fields">
        <label class="field"><span>${isExperience ? 'Job title' : 'Degree or qualification'}</span><input name="${type}-role" placeholder="${isExperience ? 'e.g. Project Manager' : 'e.g. B.Sc. Computer Science'}" /></label>
        <label class="field"><span>${isExperience ? 'Company' : 'School or institution'}</span><input name="${type}-org" placeholder="${isExperience ? 'e.g. Acme Studio' : 'e.g. State University'}" /></label>
        <label class="field"><span>Start date</span><input name="${type}-start" placeholder="e.g. Jan 2022" /></label>
        <label class="field"><span>End date</span><input name="${type}-end" placeholder="e.g. Present" /></label>
        ${isExperience ? '<label class="field field-full"><span>What did you accomplish?</span><textarea name="experience-description" rows="3" placeholder="Describe your contribution and impact..."></textarea></label>' : '<label class="field field-full"><span>Additional detail</span><input name="education-detail" placeholder="e.g. Graduated with honors" /></label>'}
      </div>`;
    const names = isExperience
      ? [['experience-role', data.role], ['experience-org', data.org], ['experience-start', data.start], ['experience-end', data.end], ['experience-description', data.description]]
      : [['education-role', data.role], ['education-org', data.org], ['education-start', data.start], ['education-end', data.end], ['education-detail', data.detail]];
    for (const [name, value] of names) if (value) card.querySelector(`[name="${name}"]`).value = value;
    list.append(card);
    card.querySelector('.remove-entry').addEventListener('click', () => { card.remove(); updatePreview(); saveDraft(); });
    card.addEventListener('input', () => { updatePreview(); saveDraft(); });
  }

  function entries(type) {
    return [...document.querySelectorAll(`#${type}-list .repeat-card`)].map((card) => {
      const get = (name) => card.querySelector(`[name="${type}-${name}"]`)?.value.trim() || '';
      return { role: get('role'), org: get('org'), start: get('start'), end: get('end'), description: get(type === 'experience' ? 'description' : 'detail') };
    }).filter((item) => Object.values(item).some(Boolean));
  }

  function updatePreview() {
    return;
    /* Preview removed; retained only to keep saved-draft event handling simple. */
    const formData = new FormData(form);
    const get = (key) => String(formData.get(key) || '').trim();
    const setText = (key, fallback = '') => {
      const element = document.querySelector(`[data-preview="${key}"]`);
      if (element) element.textContent = get(key) || fallback;
    };
    setText('name', 'Your Name');
    setText('title', 'Your Professional Title');
    setText('email', 'your.email@example.com');
    setText('phone');
    setText('location');
    const site = document.querySelector('[data-preview="website"]');
    site.textContent = get('website').replace(/^https?:\/\//, '');
    setText('summary', 'Your professional summary will appear here. Share a little about your strengths, experience, and career goals.');
    for (const key of ['certifications', 'languages', 'extras']) setText(key);
    document.querySelector('#summary-count').textContent = get('summary').length;

    const expHost = document.querySelector('#preview-experience');
    const exp = entries('experience');
    expHost.replaceChildren();
    if (!exp.length) expHost.innerHTML = '<p class="empty-preview">Your experience will appear here.</p>';
    exp.forEach((item) => {
      const block = document.createElement('div'); block.className = 'preview-entry';
      const head = document.createElement('div'); head.className = 'preview-entry-head';
      const role = document.createElement('strong'); role.textContent = item.role || 'Position';
      const date = document.createElement('time'); date.textContent = [item.start, item.end].filter(Boolean).join(' — ');
      head.append(role, date); block.append(head);
      if (item.org) { const org = document.createElement('p'); org.className = 'entry-subtitle'; org.textContent = item.org; block.append(org); }
      if (item.description) { const description = document.createElement('p'); description.textContent = item.description; block.append(description); }
      expHost.append(block);
    });

    const eduHost = document.querySelector('#preview-education');
    const edu = entries('education'); eduHost.replaceChildren();
    if (!edu.length) eduHost.innerHTML = '<p class="empty-preview">Your education will appear here.</p>';
    edu.forEach((item) => {
      const block = document.createElement('div'); block.className = 'preview-entry';
      const head = document.createElement('div'); head.className = 'preview-entry-head';
      const role = document.createElement('strong'); role.textContent = item.role || 'Qualification';
      const date = document.createElement('time'); date.textContent = [item.start, item.end].filter(Boolean).join(' — ');
      head.append(role, date); block.append(head);
      if (item.org || item.description) { const detail = document.createElement('p'); detail.className = 'entry-subtitle'; detail.textContent = [item.org, item.description].filter(Boolean).join(' · '); block.append(detail); }
      eduHost.append(block);
    });
    const skillsHost = document.querySelector('#preview-skills');
    const skills = get('skills').split(',').map((skill) => skill.trim()).filter(Boolean);
    skillsHost.replaceChildren();
    if (!skills.length) skillsHost.innerHTML = '<p class="empty-preview">Add your skills to highlight what you do best.</p>';
    else { const pills = document.createElement('div'); pills.className = 'skills-pills'; skills.slice(0, 30).forEach((skill) => { const pill = document.createElement('span'); pill.textContent = skill; pills.append(pill); }); skillsHost.append(pills); }
  }

  function serializeForm() {
    const flat = {};
    for (const [key, value] of new FormData(form).entries()) flat[key] = value;
    return { flat, experience: entries('experience'), education: entries('education') };
  }

  function saveDraft() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(serializeForm()));
      document.querySelector('#save-status').innerHTML = '<i></i> Saved on this device';
    } catch {
      document.querySelector('#save-status').innerHTML = '<i></i> Draft stays in this tab';
    }
  }

  function restoreDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (!draft) return;
      Object.entries(draft.flat || {}).forEach(([name, value]) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (field) field.value = value;
      });
      (draft.experience || []).forEach((item) => addEntry('experience', item));
      (draft.education || []).forEach((item) => addEntry('education', item));
    } catch { localStorage.removeItem(storageKey); }
  }

  form.addEventListener('input', (event) => {
    if (event.target.matches('input,textarea')) { updatePreview(); saveDraft(); }
  });
  form.addEventListener('change', (event) => {
    if (event.target.matches('input,textarea')) { updatePreview(); saveDraft(); }
  });
  document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => {
    addEntry(button.dataset.add);
    updatePreview(); saveDraft();
    document.querySelector(`#${button.dataset.add}-list .repeat-card:last-child input`)?.focus();
  }));
  backButton.addEventListener('click', () => setSection(currentSection - 1));
  nextButton.addEventListener('click', () => {
    if (currentSection === 0) {
      const required = [...sections[0].querySelectorAll('[required]')];
      const firstInvalid = required.find((field) => !field.reportValidity());
      if (firstInvalid) return;
    }
    if (currentSection < sections.length - 1) setSection(currentSection + 1);
    else form.requestSubmit();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    if (!name || !email || !form.elements.email.checkValidity()) {
      setSection(0);
      if (!name) form.elements.name.focus(); else form.elements.email.focus();
      showToast('Add your name and a valid email address first.');
      return;
    }
    const data = serializeForm();
    const lines = [
      `Resume details for ${name}`, `Email: ${email}`,
      `Professional title: ${data.flat.title || 'Not provided'}`,
      `Phone: ${data.flat.phone || 'Not provided'}`,
      `Location: ${data.flat.location || 'Not provided'}`,
      `LinkedIn / portfolio: ${data.flat.website || 'Not provided'}`,
      '', 'PROFESSIONAL SUMMARY', data.flat.summary || 'Not provided', '', 'EXPERIENCE',
      ...(data.experience.length ? data.experience.map((item) => `${item.role || 'Role'} at ${item.org || 'Company'} (${[item.start, item.end].filter(Boolean).join(' — ')})\n${item.description || ''}`) : ['Not provided']),
      '', 'EDUCATION',
      ...(data.education.length ? data.education.map((item) => `${item.role || 'Qualification'} — ${item.org || 'Institution'} (${[item.start, item.end].filter(Boolean).join(' — ')})${item.description ? `\n${item.description}` : ''}`) : ['Not provided']),
      '', `SKILLS\n${data.flat.skills || 'Not provided'}`,
      '', `CERTIFICATIONS\n${data.flat.certifications || 'Not provided'}`,
      '', `LANGUAGES\n${data.flat.languages || 'Not provided'}`,
      '', `PROJECTS / AWARDS / VOLUNTEERING\n${data.flat.extras || 'Not provided'}`
    ];
    const subject = `Resume details — ${name}`;
    window.location.href = `mailto:avipatmase@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    const message = document.querySelector('#submit-message');
    message.className = 'submit-message success';
    message.textContent = 'Your email app should open with the details addressed to Digital It Move. Review and send the message there.';
  });
  const menu = document.querySelector('.menu-toggle');
  menu.addEventListener('click', () => {
    const open = document.querySelector('.topnav').classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.textContent = open ? '×' : '☰';
  });
  document.querySelectorAll('.topnav a').forEach((link) => link.addEventListener('click', () => document.querySelector('.topnav').classList.remove('open')));
  document.querySelector('#year').textContent = new Date().getFullYear();
  restoreDraft(); updatePreview(); setSection(0);
})();
