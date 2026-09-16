/* ===========================
   QR-RDEV — app.js
   100% frontend, zero backend
   Uses: qr-code-styling library
   =========================== */

(function () {
  'use strict';

  /* ---- DOM refs ---- */
  const urlInput      = document.getElementById('urlInput');
  const clearBtn      = document.getElementById('clearBtn');
  const inputHint     = document.getElementById('inputHint');
  const generateBtn   = document.getElementById('generateBtn');
  const sizeButtons   = document.querySelectorAll('.size-btn');
  const colorPicker   = document.getElementById('colorPicker');
  const bgPicker      = document.getElementById('bgPicker');
  const colorPreview  = document.getElementById('colorPreview');
  const bgPreview     = document.getElementById('bgPreview');
  const dotStyleBtns  = document.querySelectorAll('#dotStyleButtons .style-btn');
  const cornerBtns    = document.querySelectorAll('#cornerStyleButtons .style-btn');
  const logoFileInput = document.getElementById('logoFileInput');
  const pickLogoBtn   = document.getElementById('pickLogoBtn');
  const logoUploadIdle    = document.getElementById('logoUploadIdle');
  const logoUploadPreview = document.getElementById('logoUploadPreview');
  const logoPreviewImg    = document.getElementById('logoPreviewImg');
  const logoFileName      = document.getElementById('logoFileName');
  const removeLogoBtn     = document.getElementById('removeLogoBtn');
  const qrResult      = document.getElementById('qrResult');
  const qrContainer   = document.getElementById('qrContainer');
  const qrUrlDisplay  = document.getElementById('qrUrlDisplay');
  const editBtn       = document.getElementById('editBtn');
  const downloadPngBtn = document.getElementById('downloadPngBtn');
  const downloadSvgBtn = document.getElementById('downloadSvgBtn');
  const copyUrlBtn    = document.getElementById('copyUrlBtn');
  const copyBtnText   = document.getElementById('copyBtnText');

  /* ---- State ---- */
  let selectedSize   = 300;
  let qrColor        = '#000000';
  let qrBg           = '#ffffff';
  let dotStyle       = 'square';
  let cornerStyle    = 'square';
  let logoDataUrl    = null;
  let currentUrl     = '';
  let qrCodeInstance = null;   // qr-code-styling instance

  /* ---- Helpers ---- */
  function isValidUrl(str) {
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch { return false; }
  }

  function normalizeUrl(str) {
    str = str.trim();
    if (str && !str.match(/^https?:\/\//i)) str = 'https://' + str;
    return str;
  }

  /* ---- Size ---- */
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = parseInt(btn.dataset.size, 10);
      if (currentUrl) generateQR(currentUrl);
    });
  });

  /* ---- Colors ---- */
  colorPicker.addEventListener('input', e => {
    qrColor = e.target.value;
    colorPreview.style.background = qrColor;
    if (currentUrl) generateQR(currentUrl);
  });
  bgPicker.addEventListener('input', e => {
    qrBg = e.target.value;
    bgPreview.style.background = qrBg;
    if (currentUrl) generateQR(currentUrl);
  });
  document.querySelector('label[for="colorPicker"]').addEventListener('click', () => colorPicker.click());
  document.querySelector('label[for="bgPicker"]').addEventListener('click', () => bgPicker.click());

  /* ---- Dot style ---- */
  dotStyleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dotStyleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dotStyle = btn.dataset.style;
      if (currentUrl) generateQR(currentUrl);
    });
  });

  /* ---- Corner style ---- */
  cornerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cornerBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cornerStyle = btn.dataset.style;
      if (currentUrl) generateQR(currentUrl);
    });
  });

  /* ---- Logo upload ---- */
  pickLogoBtn.addEventListener('click', e => {
    e.stopPropagation();
    logoFileInput.click();
  });

  logoFileInput.addEventListener('change', e => {
    const file = e.target.files && e.target.files[0];
    if (file) handleLogoFile(file);
    logoFileInput.value = '';
  });

  removeLogoBtn.addEventListener('click', () => {
    logoDataUrl = null;
    logoPreviewImg.src = '';
    logoUploadPreview.classList.add('hidden');
    logoUploadIdle.classList.remove('hidden');
    if (currentUrl) generateQR(currentUrl);
  });

  function handleLogoFile(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      logoDataUrl = ev.target.result;
      logoPreviewImg.src = logoDataUrl;
      logoFileName.textContent = file.name;
      logoUploadIdle.classList.add('hidden');
      logoUploadPreview.classList.remove('hidden');
      if (currentUrl) generateQR(currentUrl);
    };
    reader.readAsDataURL(file);
  }

  /* ---- URL input ---- */
  urlInput.addEventListener('input', () => {
    clearBtn.classList.toggle('visible', urlInput.value.trim().length > 0);
    urlInput.classList.remove('error');
    inputHint.textContent = 'Escribe o pega un enlace para comenzar';
    inputHint.classList.remove('error-text');
  });
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleGenerate(); });
  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    urlInput.classList.remove('error');
    clearBtn.classList.remove('visible');
    inputHint.textContent = 'Escribe o pega un enlace para comenzar';
    inputHint.classList.remove('error-text');
    urlInput.focus();
  });

  /* ---- Generate ---- */
  generateBtn.addEventListener('click', handleGenerate);

  function handleGenerate() {
    const raw = urlInput.value.trim();
    if (!raw) {
      showInputError('Por favor, introduce un enlace antes de continuar.');
      urlInput.focus();
      return;
    }
    const url = normalizeUrl(raw);
    if (!isValidUrl(url)) {
      showInputError('El enlace no es valido. Asegurate de usar https://...');
      urlInput.classList.add('error');
      return;
    }
    urlInput.value = url;
    currentUrl = url;
    generateQR(url);
  }

  function showInputError(msg) {
    inputHint.textContent = msg;
    inputHint.classList.add('error-text');
    urlInput.classList.add('error');
    urlInput.animate([
      { transform: 'translateX(0)' }, { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' }, { transform: 'translateX(-4px)' },
      { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }
    ], { duration: 320, easing: 'ease-in-out' });
  }

  function generateQR(url) {
    // Clear previous
    qrContainer.innerHTML = '';

    const options = {
      width:  selectedSize,
      height: selectedSize,
      type: 'canvas',
      data: url,
      dotsOptions: {
        color: qrColor,
        type:  dotStyle,
      },
      backgroundOptions: {
        color: qrBg,
      },
      cornersSquareOptions: {
        type:  cornerStyle,
        color: qrColor,
      },
      cornersDotOptions: {
        type:  cornerStyle === 'dot' ? 'dot' : (cornerStyle === 'extra-rounded' ? 'dot' : 'square'),
        color: qrColor,
      },
      qrOptions: {
        errorCorrectionLevel: 'H',  // Highest — allows logo without losing readability
      },
    };

    // Only add image option if logo is set
    if (logoDataUrl) {
      options.image = logoDataUrl;
      options.imageOptions = {
        hideBackgroundDots: true,
        imageSize: 0.35,   // 35% of QR size
        margin: 6,
      };
    }

    qrCodeInstance = new QRCodeStyling(options);
    qrCodeInstance.append(qrContainer);

    qrUrlDisplay.textContent = url;
    qrResult.classList.remove('hidden');
    copyBtnText.textContent = 'Copiar URL';
    copyUrlBtn.classList.remove('success');

    setTimeout(() => {
      qrResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);
  }

  /* ---- Edit button ---- */
  editBtn.addEventListener('click', () => {
    urlInput.focus();
    urlInput.select();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---- Download PNG ---- */
  downloadPngBtn.addEventListener('click', () => {
    if (!qrCodeInstance) return;
    qrCodeInstance.download({ name: 'qr-rdev', extension: 'png' });
  });

  /* ---- Download SVG ---- */
  downloadSvgBtn.addEventListener('click', () => {
    if (!qrCodeInstance) return;
    // qr-code-styling can export SVG natively
    qrCodeInstance.download({ name: 'qr-rdev', extension: 'svg' });
  });

  /* ---- Copy URL ---- */
  copyUrlBtn.addEventListener('click', () => {
    if (!currentUrl) return;
    const doSuccess = () => {
      copyBtnText.textContent = 'Copiado!';
      copyUrlBtn.classList.add('success');
      setTimeout(() => {
        copyBtnText.textContent = 'Copiar URL';
        copyUrlBtn.classList.remove('success');
      }, 2000);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(doSuccess).catch(fallback);
    } else { fallback(); }
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = currentUrl;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); doSuccess(); } catch (_) {}
      document.body.removeChild(ta);
    }
  });

  /* ---- Nav active on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-pill');
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-pill[href="#${entry.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => navObserver.observe(s));

})();
