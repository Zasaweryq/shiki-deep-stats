(function () {
  'use strict';
  const S = window.ShikiSDS;

  function isProfilePage() {
    // На Shikimori профиль часто в корне: /<nickname>
    // Считаем профилем: 1 сегмент и не "animes/mangas/..." (можно расширять)
    const seg = location.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
    if (!seg.length) return false;
    const first = seg[0];
    const blocked = new Set(['animes','mangas','ranobe','forum','clubs','collections','reviews','articles','users','contests','calendar','api']);
    return seg.length >= 1 && !blocked.has(first);
  }

  function mountButton(onClick) {
    const btn = document.createElement('div');
    btn.className = 'shikiSdsButton';
    btn.textContent = 'Deep Stats';
    btn.addEventListener('click', onClick);

    // Пытаемся вставиться в хедер профиля; если не нашли — фиксируем внизу справа
    const target =
      document.querySelector('.profile-head, .b-user, header .menu, .l-content') ||
      document.body;

    target.appendChild(btn);

    if (target === document.body) {
      btn.style.position = 'fixed';
      btn.style.right = '18px';
      btn.style.bottom = '18px';
      btn.style.zIndex = '999999';
    }
  }

  function openModal({ title = 'Deep Stats', tabs = [] }) {
    closeModal();

    const overlay = document.createElement('div');
    overlay.className = 'shikiSdsOverlay';

    const modal = document.createElement('div');
    modal.className = 'shikiSdsModal';

    const header = document.createElement('div');
    header.className = 'shikiSdsHeader';

    const hTitle = document.createElement('div');
    hTitle.textContent = title;

    const tabsEl = document.createElement('div');
    tabsEl.className = 'shikiSdsTabs';

    const close = document.createElement('div');
    close.className = 'shikiSdsTab';
    close.textContent = '✕';
    close.addEventListener('click', () => closeModal());

    const body = document.createElement('div');
    body.className = 'shikiSdsBody';

    header.append(hTitle, tabsEl, close);
    modal.append(header, body);
    overlay.append(modal);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    document.body.appendChild(overlay);

    function activateTab(idx) {
      tabsEl.querySelectorAll('.shikiSdsTab').forEach((t, i) => t.classList.toggle('isActive', i === idx));
      body.innerHTML = '';
      tabs[idx]?.render?.(body);
    }

    tabs.forEach((t, idx) => {
      const tab = document.createElement('div');
      tab.className = 'shikiSdsTab';
      tab.textContent = t.name;
      tab.addEventListener('click', () => activateTab(idx));
      tabsEl.appendChild(tab);
    });

    if (tabs.length) activateTab(0);

    S._ui = { overlay, modal, body, activateTab };
  }

  function closeModal() {
    const el = document.querySelector('.shikiSdsOverlay');
    if (el) el.remove();
    S._ui = null;
  }

  S.ui = { isProfilePage, mountButton, openModal, closeModal };
})();
