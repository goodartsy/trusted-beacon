/**
 * trusted-ad-beacon.js
 * Trusted Ad Beacon – Client Prototype mit Fallback für .ad-slot
 */
(function () {
  const slotId = 'slot-123';
  const campaignId = 'cmp-456';
  const creativeId = 'crv-789';
  const apiEndpoint = 'http://localhost:3000/impression';

  console.log('💡 Beacon script loaded');

  let interacted = false;
  let clickCount = 0;
  let hoverStart = 0;
  let hoverDuration = 0;

  const hashPayload = (payload) =>
    crypto.subtle
      .digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)))
      .then((buf) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      );

  const measure = () => {
    // ← Fallback: Versuch currentScript.closest, sonst querySelector, sonst body
    const adElement =
      (document.currentScript && document.currentScript.closest('.ad-slot')) ||
      document.querySelector('.ad-slot') ||
      document.body;

    console.log('💡 measure() called, adElement is', adElement);

    adElement.addEventListener('click', () => {
      interacted = true;
      clickCount++;
    });
    adElement.addEventListener('touchstart', () => {
      interacted = true;
      clickCount++;
    });
    adElement.addEventListener('mouseover', () => {
      hoverStart = Date.now();
    });
    adElement.addEventListener('mouseout', () => {
      hoverDuration += Date.now() - hoverStart;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;

        console.log('💡 Ad entered viewport:', entry);

        const start = Date.now();
        setTimeout(async () => {
          const timeInView = Date.now() - start;
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
            timestamp: new Date().toISOString(),
          };

          console.log('💡 Sending payload', data);

          data.hash = await hashPayload(data);

          fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
            .then((res) => console.log('💡 Backend responded', res.status))
            .catch(console.error);
        }, 2000);

        observer.disconnect();
      },
      { threshold: [0.5] }
    );

    observer.observe(adElement);
  };

  window.addEventListener('load', measure);
})();
