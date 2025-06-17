(function() {
  'use strict';

  console.log('🚀 trusted-ad-beacon.js geladen');

  // ===== Konfiguration via data-Attribute =====
  const script = document.currentScript;
  const slotId = script.dataset.slotId || '';
  const campaignId = script.dataset.campaignId || '';
  const creativeId = script.dataset.creativeId || '';
  const apiEndpoint = script.dataset.apiEndpoint || '';
  const threshold = parseFloat(script.dataset.threshold || '0.5');
  const minViewTime = parseInt(script.dataset.minViewTime || '2000');

  // ===== State =====
  let interacted = false;
  let clickCount = 0;
  let hoverDuration = 0;
  let hoverStart = 0;

  // ===== Ad-Element suchen =====
  const adElement = document.querySelector('.ad-slot');
  if (!adElement) {
    console.warn('⚠️ .ad-slot nicht gefunden – Beacon deaktiviert');
    return;
  }

  // ===== Interaction-Listener =====
  adElement.addEventListener('click', () => {
    interacted = true;
    clickCount++;
    console.log('💡 click detected, count=', clickCount);
  });
  adElement.addEventListener('mouseenter', () => {
    hoverStart = Date.now();
  });
  adElement.addEventListener('mouseleave', () => {
    if (hoverStart) {
      hoverDuration += Date.now() - hoverStart;
      console.log('💡 hoverDuration=', hoverDuration);
      hoverStart = 0;
    }
  });

  // ===== SHA-256 Hash =====
  async function hashPayload(obj) {
    const msg = JSON.stringify(obj);
    const buf = new TextEncoder().encode(msg);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ===== Viewability messen =====
  function measure() {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;

        console.log('💡 Ad entered viewport:', entry);
        const startTime = Date.now();

        setTimeout(async () => {
          const timeInView = Date.now() - startTime;
          const viewportShare = entry.intersectionRatio;

          const data = {
            slotId,
            campaignId,
            creativeId,
            pageUrl: window.location.href,
            viewportShare,
            timeInView,
            userInteraction: interacted,
            clickCount,
            hoverDuration,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          };

          console.log('💡 Sending payload', data);
          data.hash = await hashPayload(data);

          try {
            const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            console.log('💡 Backend responded', response.status);
          } catch (err) {
            console.error('💥 Beacon error', err);
          }
        }, minViewTime);

        observer.disconnect();
      },
      { threshold: [threshold] }
    );

    observer.observe(adElement);
  }

  // ===== Ausführung =====
  if (document.readyState === 'complete') {
    measure();
  } else {
    window.addEventListener('load', measure);
  }
})();
