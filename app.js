const PROFILE_KEY = 'poster_editor_user_profile_v1';

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
  footerPreviewRow: document.getElementById('footerPreviewRow')
};

const ctx = el.canvas.getContext('2d');

const bannerTemplates = [
  'https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=1100&q=80',
  'https://images.unsplash.com/photo-1508675801627-066ac4346a55?auto=format&fit=crop&w=1100&q=80',
  'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?auto=format&fit=crop&w=1100&q=80',
  'https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=1100&q=80',
  'https://images.unsplash.com/photo-1473973916745-60839aebf06b?auto=format&fit=crop&w=1100&q=80'
];

const footerPresets = [
  { colors: ['#b91c1c', '#dc2626'], accent: '#facc15' },
  { colors: ['#1d4ed8', '#2563eb'], accent: '#f59e0b' },
  { colors: ['#0f766e', '#14b8a6'], accent: '#fef08a' },
  { colors: ['#6d28d9', '#8b5cf6'], accent: '#f9a8d4' },
  { colors: ['#7c2d12', '#ea580c'], accent: '#fef3c7' },
  { colors: ['#334155', '#475569'], accent: '#a5f3fc' }
];

const state = {
  currentBannerIndex: 0,
  currentFooterPreset: 0,
  bannerImage: null,
  profile: null,
  profilePhotoImage: null,
  onboardingPhotoData: ''
};

function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function fitCover(img, cw, ch) {
  const ir = img.width / img.height;
  const cr = cw / ch;
  let sx = 0; let sy = 0; let sw = img.width; let sh = img.height;
  if (ir > cr) {
    sw = img.height * cr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / cr;
    sy = (img.height - sh) / 2;
  }
  return { sx, sy, sw, sh };
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
  if (!state.profile?.photo) {
    state.profilePhotoImage = null;
    return;
  }
  state.profilePhotoImage = await loadImage(state.profile.photo);
}

function drawFooter() {
  const w = el.canvas.width;
  const h = el.canvas.height;
  const fh = h * 0.12;
  const y = h - fh;
  const preset = footerPresets[state.currentFooterPreset];

  const g = ctx.createLinearGradient(0, y, w, y);
  g.addColorStop(0, preset.colors[0]);
  g.addColorStop(1, preset.colors[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, y, w, fh);

  ctx.strokeStyle = preset.accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(8, y + 8, w - 16, fh - 16);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = `700 ${Math.round(h * 0.03)}px Inter, Arial`;
  ctx.fillText(state.profile?.name || 'Your Name', w * 0.5, y + fh * 0.42);

  ctx.fillStyle = '#e5e7eb';
  ctx.font = `500 ${Math.round(h * 0.022)}px Inter, Arial`;
  ctx.fillText(state.profile?.position || 'Your Position', w * 0.5, y + fh * 0.67);

  ctx.font = `500 ${Math.round(h * 0.018)}px Inter, Arial`;
  ctx.fillText(state.profile?.phone || '', w * 0.5, y + fh * 0.86);

  if (state.profilePhotoImage) {
    const r = fh * 0.34;
    const cx = w - r - 24;
    const cy = y + fh / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const size = r * 2;
    const crop = fitCover(state.profilePhotoImage, size, size);
    ctx.drawImage(state.profilePhotoImage, crop.sx, crop.sy, crop.sw, crop.sh, cx - r, cy - r, size, size);
    ctx.restore();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function render() {
  const w = el.canvas.width;
  const h = el.canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (state.bannerImage) {
    const crop = fitCover(state.bannerImage, w, h);
    ctx.drawImage(state.bannerImage, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
  } else {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, w, h);
  }

  drawFooter();
}


function renderBannerPresetButtons() {
  el.bannerPresetRow.innerHTML = '';
  bannerTemplates.forEach((_, idx) => {
    const btn = document.createElement('button');
    btn.textContent = String(idx + 1);
    btn.className = idx === state.currentBannerIndex ? 'active' : '';
    btn.addEventListener('click', async () => {
      await loadBannerByIndex(idx);
      state.currentFooterPreset = idx % footerPresets.length;
      renderBannerPresetButtons();
      renderFooterPresetButtons();
      render();
    });
    el.bannerPresetRow.append(btn);
  });
}

function renderFooterPresetButtons() {
  el.footerPresetRow.innerHTML = '';
  el.footerPreviewRow.innerHTML = '';

  footerPresets.forEach((preset, idx) => {
    const btn = document.createElement('button');
    btn.textContent = String(idx + 1);
    btn.className = idx === state.currentFooterPreset ? 'active' : '';
    btn.addEventListener('click', () => {
      state.currentFooterPreset = idx;
      renderFooterPresetButtons();
      render();
    });
    el.footerPresetRow.append(btn);

    const chip = document.createElement('div');
    chip.className = 'preview-chip';
    chip.style.background = `linear-gradient(90deg, ${preset.colors[0]}, ${preset.colors[1]})`;
    chip.textContent = `Preset ${idx + 1}`;
    el.footerPreviewRow.append(chip);
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

renderBannerPresetButtons();
renderFooterPresetButtons();
loadBannerByIndex(0);
hideSplashScreen();
