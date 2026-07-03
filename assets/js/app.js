const DATA_URL = './data/cv.json';

const iconMap = {
  GitHub: 'GH',
  LinkedIn: 'in',
  Web: '↗',
  terminal: '⌘',
  clock: '◷',
  server: '▤',
  ai: '✦'
};

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);

  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;

  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        node.setAttribute(key, value);
      }
    });
  }

  children.forEach((child) => {
    if (typeof child === 'string') {
      node.appendChild(document.createTextNode(child));
    } else if (child) {
      node.appendChild(child);
    }
  });

  return node;
}

function clear(node) {
  if (!node) return;
  while (node.firstChild) node.removeChild(node.firstChild);
}

function setText(selector, value) {
  const node = qs(selector);
  if (node) node.textContent = value || '';
}

function compactJoin(parts, separator = ' · ') {
  return parts.filter(Boolean).join(separator);
}

function renderProfile(profile) {
  const pageTitle = `${profile.name || 'CV'} — CV`;

  document.title = pageTitle;
  setText('#nav-name', profile.name);
  setText('#profile-title', profile.title);
  setText('#profile-summary', profile.summary);
  setText('#profile-location', profile.location);

  const metaDescription = qs('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', `${profile.name || 'CV'} — ${profile.title || ''}`.trim());
  }

  const aboutText = qs('#about-text');
  clear(aboutText);
  (profile.about || []).forEach((paragraph) => {
    aboutText.appendChild(el('p', { text: paragraph }));
  });

  renderLinks(profile.links || []);
}

function renderLinks(links) {
  const container = qs('#profile-links');
  clear(container);

  links.forEach((link) => {
    const anchor = el('a', {
      className: 'profile-link',
      attrs: {
        href: link.url,
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }, [
      el('span', { className: 'link-icon', text: iconMap[link.icon] || '↗', attrs: { 'aria-hidden': 'true' } }),
      el('span', { text: link.label })
    ]);

    container.appendChild(anchor);
  });
}

function renderExperience(experience) {
  const container = qs('#experience-list');
  clear(container);

  experience.forEach((item) => {
    const descriptionList = el('ul', { className: 'experience-list' });

    (item.description || []).forEach((line) => {
      descriptionList.appendChild(el('li', { text: line }));
    });

    const contentChildren = [
      el('h3', { text: item.role }),
      el('p', { className: 'experience-meta', text: compactJoin([item.company, item.location]) }),
      descriptionList
    ];

    if (item.tools && item.tools.length) {
      const tools = el('div', { className: 'experience-tools' }, [
        el('span', { className: 'experience-tools-label', text: 'Tools & platforms' })
      ]);

      const chips = el('div', { className: 'chips experience-tool-chips' });
      item.tools.forEach((tool) => chips.appendChild(el('span', { className: 'chip', text: tool })));
      tools.appendChild(chips);
      contentChildren.push(tools);
    }

    const content = el('div', {}, contentChildren);

    const children = [
      el('div', { className: 'experience-period', text: item.period }),
      content
    ];

    if (item.mode || item.location) {
      children.push(el('span', { className: 'badge', text: item.mode || item.location }));
    }

    container.appendChild(el('article', { className: 'experience-card' }, children));
  });
}

function renderProjects(projects) {
  const container = qs('#project-list');
  clear(container);

  projects.forEach((project) => {
    const chips = el('div', { className: 'chips' });
    (project.stack || []).forEach((tech) => chips.appendChild(el('span', { className: 'chip', text: tech })));

    const top = el('div', { className: 'project-top' }, [
      el('div', { className: 'project-icon', text: iconMap[project.icon] || '◇', attrs: { 'aria-hidden': 'true' } }),
      el('div', {}, [el('h3', { text: project.name })])
    ]);

    const children = [
      top,
      el('p', { className: 'project-description', text: project.description }),
      chips
    ];

    if (project.url) {
      children.push(el('a', {
        className: 'project-link no-print',
        text: 'View Project →',
        attrs: {
          href: project.url,
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }));
    }

    container.appendChild(el('article', { className: 'project-card' }, children));
  });
}

function renderSkills(skills) {
  const container = qs('#skills-list');
  clear(container);

  Object.entries(skills || {}).forEach(([group, items]) => {
    const chips = el('div', { className: 'chips' });
    items.forEach((skill) => chips.appendChild(el('span', { className: 'chip', text: skill })));

    container.appendChild(el('article', { className: 'skill-group' }, [
      el('h3', { text: group }),
      chips
    ]));
  });
}

function renderEducation(education = [], certifications = []) {
  const container = qs('#education-list');
  clear(container);

  if (!container) return;

  const groups = [
    { title: 'Education', items: education },
    { title: 'Certifications', items: certifications }
  ];

  groups.forEach((group) => {
    if (!group.items || group.items.length === 0) return;

    const list = el('div', { className: 'credential-list' });

    group.items.forEach((item) => {
      list.appendChild(el('article', { className: 'credential-item' }, [
        el('div', { className: 'credential-period', text: item.period || '' }),
        el('div', {}, [
          el('h3', { text: item.name }),
          el('p', { className: 'credential-issuer', text: item.issuer || '' })
        ])
      ]));
    });

    container.appendChild(el('section', { className: 'credential-group' }, [
      el('h3', { text: group.title }),
      list
    ]));
  });
}

function renderLanguages(languages) {
  const container = qs('#languages-list');
  clear(container);

  (languages || []).forEach((language) => {
    container.appendChild(el('div', { className: 'language-item' }, [
      el('span', { className: 'language-name', text: language.name }),
      el('span', { className: 'language-level', text: language.level })
    ]));
  });
}

function renderContact(contact = {}, profile = {}) {
  setText('#contact-title', contact.headline || 'Get in Touch');
  setText('#contact-summary', contact.summary || 'Open to new opportunities and interesting projects.');
  setText('#copyright', contact.copyright || '');

  const container = qs('#contact-details');
  clear(container);

  const email = contact.email || profile.email;
  const location = contact.location || profile.location;

  if (email) {
    container.appendChild(el('a', {
      className: 'contact-row',
      attrs: { href: `mailto:${email}` }
    }, [
      el('span', { text: '✉', attrs: { 'aria-hidden': 'true' } }),
      el('span', { text: email })
    ]));
  }

  if (location) {
    container.appendChild(el('span', { className: 'contact-row' }, [
      el('span', { text: '⌖', attrs: { 'aria-hidden': 'true' } }),
      el('span', { text: location })
    ]));
  }
}

function setupPrintButton() {
  document.querySelectorAll('[data-print-button]').forEach((button) => {
    button.addEventListener('click', () => window.print());
  });
}

function setupMobileMenu() {
  const button = qs('.menu-button');
  const nav = qs('#nav-menu');

  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      nav.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

function renderError(error) {
  const main = qs('#main');
  const box = el('div', { className: 'error-box' }, [
    el('strong', { text: 'Could not load CV data.' }),
    el('p', { text: 'Check whether data/cv.json exists and the site is being served through a local server or GitHub Pages.' }),
    el('code', { text: error.message })
  ]);

  main.prepend(box);
}

async function loadCV() {
  document.body.classList.add('is-loading');

  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading ${DATA_URL}`);
    }

    const cv = await response.json();

    renderProfile(cv.profile || {});
    renderExperience(cv.experience || []);
    renderProjects(cv.projects || []);
    renderSkills(cv.skills || {});
    renderEducation(cv.education || [], cv.certifications || []);
    renderLanguages(cv.languages || []);
    renderContact(cv.contact || {}, cv.profile || {});
  } catch (error) {
    renderError(error);
    console.error(error);
  } finally {
    document.body.classList.remove('is-loading');
  }
}

setupPrintButton();
setupMobileMenu();
loadCV();
