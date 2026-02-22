const PROFILE_KEY = 'poster_editor_user_profile_v1';
const FOOTER_PRESET_KEY = 'poster_editor_footer_presets_v1';

const el = {
  canvas: document.getElementById('canvas'),
  splashScreen: document.getElementById('splashScreen'),
  onboardingScreen: document.getElementById('onboardingScreen'),
  onboardingForm: document.getElementById('onboardingForm'),
  userPhoto: document.getElementById('userPhoto'),
  userPhotoPreview: document.getElementById('userPhotoPreview'),
  userName: document.getElementById('userName'),
  userPosition: document.getElementById('userPosition'),
  userPhone: document.getElementById('userPhone'),
  bannerPresetRow: document.getElementById('bannerPresetRow'),
  footerPresetRow: document.getElementById('footerPresetRow'),
  footerPreviewRow: document.getElementById('footerPreviewRow'),
  footerColorA: document.getElementById('footerColorA'),
  footerColorB: document.getElementById('footerColorB'),
  footerAccent: document.getElementById('footerAccent'),
  saveFooterPresetBtn: document.getElementById('saveFooterPresetBtn'),
  addTextBtn: document.getElementById('addTextBtn'),
  addImageBtn: document.getElementById('addImageBtn'),
  addShapeBtn: document.getElementById('addShapeBtn'),
  hiddenImagePicker: document.getElementById('hiddenImagePicker'),
  textInput: document.getElementById('textInput'),
  textSizeInput: document.getElementById('textSizeInput'),
  textFontInput: document.getElementById('textFontInput'),
  textColorInput: document.getElementById('textColorInput'),
  textAlignInput: document.getElementById('textAlignInput'),
  replaceImageBtn: document.getElementById('replaceImageBtn'),
  imageScaleInput: document.getElementById('imageScaleInput'),
  shapeTypeInput: document.getElementById('shapeTypeInput'),
  shapeColorInput: document.getElementById('shapeColorInput')
};

const ctx = el.canvas.getContext('2d');

const defaultFooterPresets = [
  { colors: ['#b91c1c', '#dc2626'], accent: '#facc15' },
  { colors: ['#1d4ed8', '#2563eb'], accent: '#f59e0b' },
  { colors: ['#0f766e', '#14b8a6'], accent: '#fef08a' },
  { colors: ['#6d28d9', '#8b5cf6'], accent: '#f9a8d4' },
  { colors: ['#7c2d12', '#ea580c'], accent: '#fef3c7' }
];

const bannerTemplates = [
  'https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=1100&q=80',
  'https://images.unsplash.com/photo-1508675801627-066ac4346a55?auto=format&fit=crop&w=1100&q=80',
  'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?auto=format&fit=crop&w=1100&q=80',
  'https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=1100&q=80',
  'https://images.unsplash.com/photo-1473973916745-60839aebf06b?auto=format&fit=crop&w=1100&q=80'
];

const state = {
  currentBannerIndex: 0,
  currentFooterPreset: 0,
  footerPresets: [...defaultFooterPresets],
  bannerImage: null,
  profile: null,
  profilePhotoImage: null,
  onboardingPhotoData: '',
  elements: [],
  selectedElementId: null,
  pointer: { mode: null, elementId: null, startX: 0, startY: 0, startW: 0, startH: 0, startElemX: 0, startElemY: 0 }
};

function getStoredProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch { return null; }
}

function getStoredFooterPresets() {
  try { return JSON.parse(localStorage.getItem(FOOTER_PRESET_KEY) || 'null'); } catch { return null; }
}

function persistFooterPresets() {
  localStorage.setItem(FOOTER_PRESET_KEY, JSON.stringify(state.footerPresets));
}

function fitCover(img, cw, ch) {
  const ir = img.width / img.height;
  const cr = cw / ch;
  let sx = 0; let sy = 0; let sw = img.width; let sh = img.height;
  if (ir > cr) { sw = img.height * cr; sx = (img.width - sw) / 2; }
  else { sh = img.width / cr; sy = (img.height - sh) / 2; }
  return { sx, sy, sw, sh };
}

function genId() { return Math.random().toString(36).slice(2, 9); }
function selectedElement() { return state.elements.find((e) => e.id === state.selectedElementId) || null; }

function toCanvasPoint(evt) {
  const rect = el.canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / rect.width) * el.canvas.width,
    y: ((evt.clientY - rect.top) / rect.height) * el.canvas.height
  };
}

async function loadImage(url) {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadBannerByIndex(index) {
  state.currentBannerIndex = index;
  state.bannerImage = await loadImage(bannerTemplates[index]);
  render();
}

async function loadProfilePhoto() {
  if (!state.profile?.photo) { state.profilePhotoImage = null; return; }
  state.profilePhotoImage = await loadImage(state.profile.photo);
}

function drawFooter() {
  const w = el.canvas.width; const h = el.canvas.height;
  const fh = h * 0.12; const y = h - fh;
  const preset = state.footerPresets[state.currentFooterPreset];

  const g = ctx.createLinearGradient(0, y, w, y);
  g.addColorStop(0, preset.colors[0]); g.addColorStop(1, preset.colors[1]);
  ctx.fillStyle = g; ctx.fillRect(0, y, w, fh);

  ctx.strokeStyle = preset.accent; ctx.lineWidth = 6; ctx.strokeRect(8, y + 8, w - 16, fh - 16);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(h * 0.03)}px Inter`;
  ctx.fillText(state.profile?.name || 'Your Name', w * 0.5, y + fh * 0.42);
  ctx.fillStyle = '#e5e7eb'; ctx.font = `500 ${Math.round(h * 0.022)}px Inter`;
  ctx.fillText(state.profile?.position || 'Your Position', w * 0.5, y + fh * 0.67);
  ctx.font = `500 ${Math.round(h * 0.018)}px Inter`;
  ctx.fillText(state.profile?.phone || '', w * 0.5, y + fh * 0.86);

  if (state.profilePhotoImage) {
    const r = fh * 0.34; const cx = w - r - 24; const cy = y + fh / 2;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    const crop = fitCover(state.profilePhotoImage, r * 2, r * 2);
    ctx.drawImage(state.profilePhotoImage, crop.sx, crop.sy, crop.sw, crop.sh, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawElements() {
  state.elements.forEach((e) => {
    if (e.type === 'text') {
      ctx.save();
      ctx.font = `${e.fontSize}px ${e.fontFamily}`;
      ctx.fillStyle = e.color;
      ctx.textAlign = e.align;
      ctx.textBaseline = 'top';
      const drawX = e.align === 'left' ? e.x : e.align === 'center' ? e.x + e.w / 2 : e.x + e.w;
      ctx.fillText(e.text, drawX, e.y, e.w);
      ctx.restore();
    }

    if (e.type === 'shape') {
      ctx.save();
      ctx.fillStyle = e.color;
      if (e.shapeType === 'circle') {
        const r = Math.min(e.w, e.h) / 2;
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2, e.y + e.h / 2, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(e.x, e.y, e.w, e.h);
      }
      ctx.restore();
    }

    if (e.type === 'image' && e.imageObj) {
      ctx.save();
      const crop = fitCover(e.imageObj, e.w, e.h);
      ctx.drawImage(e.imageObj, crop.sx, crop.sy, crop.sw, crop.sh, e.x, e.y, e.w, e.h);
      ctx.restore();
    }
  });

  const selected = selectedElement();
  if (selected) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(selected.x, selected.y, selected.w, selected.h);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(selected.x + selected.w - 14, selected.y + selected.h - 14, 14, 14);
    ctx.restore();
  }
}

function render() {
  const w = el.canvas.width; const h = el.canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (state.bannerImage) {
    const crop = fitCover(state.bannerImage, w, h);
    ctx.drawImage(state.bannerImage, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
  } else {
    ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, w, h);
  }

  drawElements();
  drawFooter();
}

function renderBannerPresetButtons() {
  el.bannerPresetRow.innerHTML = '';
  bannerTemplates.forEach((_, idx) => {
    const b = document.createElement('button');
    b.textContent = String(idx + 1);
    b.className = idx === state.currentBannerIndex ? 'active' : '';
    b.addEventListener('click', async () => {
      await loadBannerByIndex(idx);
      state.currentFooterPreset = idx % state.footerPresets.length;
      syncFooterInputs();
      renderBannerPresetButtons();
      renderFooterPresetButtons();
      render();
    });
    el.bannerPresetRow.append(b);
  });
}

function renderFooterPresetButtons() {
  el.footerPresetRow.innerHTML = '';
  el.footerPreviewRow.innerHTML = '';
  state.footerPresets.forEach((preset, idx) => {
    const b = document.createElement('button');
    b.textContent = String(idx + 1);
    b.className = idx === state.currentFooterPreset ? 'active' : '';
    b.addEventListener('click', () => {
      state.currentFooterPreset = idx;
      syncFooterInputs();
      renderFooterPresetButtons();
      render();
    });
    el.footerPresetRow.append(b);

    const chip = document.createElement('div');
    chip.className = 'preview-chip';
    chip.style.background = `linear-gradient(90deg, ${preset.colors[0]}, ${preset.colors[1]})`;
    chip.textContent = `Footer ${idx + 1}`;
    el.footerPreviewRow.append(chip);
  });
}

function syncFooterInputs() {
  const p = state.footerPresets[state.currentFooterPreset];
  el.footerColorA.value = p.colors[0];
  el.footerColorB.value = p.colors[1];
  el.footerAccent.value = p.accent;
}

function updateSelectedFromTools() {
  const e = selectedElement();
  if (!e) return;
  if (e.type === 'text') {
    e.text = el.textInput.value;
    e.fontSize = Number(el.textSizeInput.value);
    e.fontFamily = el.textFontInput.value;
    e.color = el.textColorInput.value;
    e.align = el.textAlignInput.value;
  }
  if (e.type === 'image') {
    const scale = Number(el.imageScaleInput.value);
    e.w = e.baseW * scale;
    e.h = e.baseH * scale;
  }
  if (e.type === 'shape') {
    e.shapeType = el.shapeTypeInput.value;
    e.color = el.shapeColorInput.value;
  }
  render();
}

function syncToolsFromSelection() {
  const e = selectedElement();
  if (!e) return;
  if (e.type === 'text') {
    el.textInput.value = e.text;
    el.textSizeInput.value = String(e.fontSize);
    el.textFontInput.value = e.fontFamily;
    el.textColorInput.value = e.color;
    el.textAlignInput.value = e.align;
  }
  if (e.type === 'image') {
    const scale = e.baseW ? e.w / e.baseW : 1;
    el.imageScaleInput.value = String(Math.min(2.5, Math.max(0.2, scale)));
  }
  if (e.type === 'shape') {
    el.shapeTypeInput.value = e.shapeType;
    el.shapeColorInput.value = e.color;
  }
}

function hitTest(x, y) {
  for (let i = state.elements.length - 1; i >= 0; i -= 1) {
    const e = state.elements[i];
    if (x >= e.x && x <= e.x + e.w && y >= e.y && y <= e.y + e.h) return e;
  }
  return null;
}

function onPointerDown(evt) {
  const p = toCanvasPoint(evt);
  const e = hitTest(p.x, p.y);
  state.selectedElementId = e ? e.id : null;
  syncToolsFromSelection();
  render();
  if (!e) return;

  const inResize = p.x >= e.x + e.w - 22 && p.x <= e.x + e.w && p.y >= e.y + e.h - 22 && p.y <= e.y + e.h;
  state.pointer.mode = inResize ? 'resize' : 'drag';
  state.pointer.elementId = e.id;
  state.pointer.startX = p.x;
  state.pointer.startY = p.y;
  state.pointer.startElemX = e.x;
  state.pointer.startElemY = e.y;
  state.pointer.startW = e.w;
  state.pointer.startH = e.h;
  el.canvas.setPointerCapture(evt.pointerId);
}

function onPointerMove(evt) {
  if (!state.pointer.mode) return;
  const e = state.elements.find((x) => x.id === state.pointer.elementId);
  if (!e) return;
  const p = toCanvasPoint(evt);
  const dx = p.x - state.pointer.startX;
  const dy = p.y - state.pointer.startY;

  if (state.pointer.mode === 'drag') {
    e.x = state.pointer.startElemX + dx;
    e.y = state.pointer.startElemY + dy;
  } else {
    e.w = Math.max(40, state.pointer.startW + dx);
    e.h = Math.max(40, state.pointer.startH + dy);
    if (e.type === 'text') {
      e.fontSize = Math.max(18, Math.round(e.h * 0.5));
      el.textSizeInput.value = String(e.fontSize);
    }
  }
  render();
}

function onPointerUp() {
  state.pointer.mode = null;
  state.pointer.elementId = null;
}

function bindEvents() {
  el.addTextBtn.addEventListener('click', () => {
    const e = { id: genId(), type: 'text', x: 120, y: 220, w: 500, h: 120, text: 'New Text', fontSize: 54, fontFamily: 'Inter, Arial, sans-serif', color: '#ffffff', align: 'left' };
    state.elements.push(e);
    state.selectedElementId = e.id;
    syncToolsFromSelection();
    render();
  });

  el.addShapeBtn.addEventListener('click', () => {
    const e = { id: genId(), type: 'shape', x: 160, y: 420, w: 220, h: 220, shapeType: 'rect', color: '#22d3ee' };
    state.elements.push(e);
    state.selectedElementId = e.id;
    syncToolsFromSelection();
    render();
  });

  const openPicker = () => el.hiddenImagePicker.click();
  el.addImageBtn.addEventListener('click', openPicker);
  el.replaceImageBtn.addEventListener('click', openPicker);

  el.hiddenImagePicker.addEventListener('change', (evt) => {
    const file = evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const selected = selectedElement();
        if (selected && selected.type === 'image') {
          selected.imageObj = img; selected.baseW = 300; selected.baseH = 300; selected.w = 300; selected.h = 300;
        } else {
          const e = { id: genId(), type: 'image', x: 220, y: 300, w: 300, h: 300, baseW: 300, baseH: 300, imageObj: img };
          state.elements.push(e); state.selectedElementId = e.id;
        }
        syncToolsFromSelection();
        render();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  [el.textInput, el.textSizeInput, el.textFontInput, el.textColorInput, el.textAlignInput, el.imageScaleInput, el.shapeTypeInput, el.shapeColorInput]
    .forEach((input) => input.addEventListener('input', updateSelectedFromTools));

  const updateFooterFromInputs = () => {
    const p = state.footerPresets[state.currentFooterPreset];
    p.colors[0] = el.footerColorA.value;
    p.colors[1] = el.footerColorB.value;
    p.accent = el.footerAccent.value;
    renderFooterPresetButtons();
    render();
  };
  el.footerColorA.addEventListener('input', updateFooterFromInputs);
  el.footerColorB.addEventListener('input', updateFooterFromInputs);
  el.footerAccent.addEventListener('input', updateFooterFromInputs);

  el.saveFooterPresetBtn.addEventListener('click', () => {
    state.footerPresets.push({ colors: [el.footerColorA.value, el.footerColorB.value], accent: el.footerAccent.value });
    state.currentFooterPreset = state.footerPresets.length - 1;
    persistFooterPresets();
    renderFooterPresetButtons();
    render();
  });

  el.canvas.addEventListener('pointerdown', onPointerDown);
  el.canvas.addEventListener('pointermove', onPointerMove);
  el.canvas.addEventListener('pointerup', onPointerUp);
  el.canvas.addEventListener('pointercancel', onPointerUp);

  el.userPhoto.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.onboardingPhotoData = reader.result;
      el.userPhotoPreview.src = reader.result;
      el.userPhotoPreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  el.onboardingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const profile = {
      name: el.userName.value.trim(),
      position: el.userPosition.value.trim(),
      phone: el.userPhone.value.trim(),
      photo: state.onboardingPhotoData
    };
    if (!profile.name || !profile.position || !profile.phone || !profile.photo) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    state.profile = profile;
    await loadProfilePhoto();
    el.onboardingScreen.classList.add('hidden');
    render();
  });
}

function showOnboardingIfNeeded() {
  state.profile = getStoredProfile();
  if (state.profile) {
    el.onboardingScreen.classList.add('hidden');
    loadProfilePhoto().then(render);
    return;
  }
  el.onboardingScreen.classList.remove('hidden');
}

function hideSplashScreen() {
  window.setTimeout(() => {
    el.splashScreen.classList.add('hidden');
    showOnboardingIfNeeded();
  }, 1500);
}

async function init() {
  const storedFooter = getStoredFooterPresets();
  if (storedFooter && Array.isArray(storedFooter) && storedFooter.length) {
    state.footerPresets = storedFooter;
  }

  bindEvents();
  renderBannerPresetButtons();
  renderFooterPresetButtons();
  syncFooterInputs();
  await loadBannerByIndex(0);
  hideSplashScreen();
}

init();
