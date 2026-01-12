(function () {
  'use strict';
  const S = window.ShikiSDS;

  function inject() {
    const css = `
/* Modal shell */
.shikiSdsOverlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 999999;
}
.shikiSdsModal {
  width: min(1100px, 92vw);
  height: ${S.config.ui.modalHeight};
  background: var(--body-background, #141414);
  color: var(--text-color, #eee);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,.45);
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* Header */
.shikiSdsHeader {
  padding: 12px 14px;
  display: flex; gap: 10px; align-items: center; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.shikiSdsTabs { display: flex; gap: 8px; flex-wrap: wrap; }
.shikiSdsTab {
  padding: 6px 10px; border-radius: 10px; cursor: pointer;
  background: rgba(255,255,255,.06);
}
.shikiSdsTab.isActive { background: rgba(255,255,255,.14); }

/* Body: ВАЖНО для скролла */
.shikiSdsBody {
  flex: 1;
  min-height: 0;          /* <- критично для overflow внутри flex */
  overflow: auto;         /* <- скролл здесь */
  padding: 12px 14px;
}

/* Simple button */
.shikiSdsButton {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 12px; cursor: pointer;
  background: rgba(255,255,255,.10);
  user-select: none;
}
    `.trim();

    if (typeof GM_addStyle === 'function') GM_addStyle(css);
    else {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  S.styles = { inject };
})();
