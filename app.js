const el = {
  canvas: document.getElementById('canvas'),
  preset: document.getElementById('preset'),
  bgColor: document.getElementById('bgColor'),
  imgUpload: document.getElementById('imgUpload'),
  imgScale: document.getElementById('imgScale'),
  imgRotate: document.getElementById('imgRotate'),
  imgBlend: document.getElementById('imgBlend'),
  textValue: document.getElementById('textValue'),
  textSize: document.getElementById('textSize'),
  textColor: document.getElementById('textColor'),
  layersList: document.getElementById('layersList'),
  addLayerBtn: document.getElementById('addLayerBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  onboardingScreen: document.getElementById('onboardingScreen'),
  onboardingForm: document.getElementById('onboardingForm'),
  userPhoto: document.getElementById('userPhoto'),
  userPhotoPreview: document.getElementById('userPhotoPreview'),
  userName: document.getElementById('userName'),
  userPosition: document.getElementById('userPosition'),
  userPhone: document.getElementById('userPhone'),
  editorPage: document.getElementById('editorPage'),
  galleryPage: document.getElementById('galleryPage'),
  openGalleryBtn: document.getElementById('openGalleryBtn'),
  openEditorBtn: document.getElementById('openEditorBtn'),
  galleryGrid: document.getElementById('galleryGrid'),
  galleryDateLabel: document.getElementById('galleryDateLabel'),
  selectedTemplateLabel: document.getElementById('selectedTemplateLabel')
};
const ctx = el.canvas.getContext('2d');

let idSeq = 4;
const state = {
  background: { color: '#1f2937', visible: true, locked: false },
  imageBase: { image: null, scale: 1, rotate: 0, blend: 'source-over', x: 0.5, y: 0.5 },
  textBase: { value: 'YOUR MESSAGE', size: 120, color: '#ffffff', x: 0.12, y: 0.72 },
  layers: [
    { id: 1, type: 'background', name: 'Background', visible: true, locked: false },
    { id: 2, type: 'image', name: 'Image 1', visible: true, locked: false, data: {} },
    { id: 3, type: 'text', name: 'Text 1', visible: true, locked: false, data: {} }
  ],
  selectedLayerId: 3
};


const galleryItems = [
  { title: 'Viral Maharashtra', date: '2026-02-22', img: 'https://images.unsplash.com/photo-1473973916745-60839aebf06b?auto=format&fit=crop&w=700&q=80' },
  { title: 'Sant Raja Janmotsav', date: '2026-02-22', img: 'https://images.unsplash.com/photo-1508675801627-066ac4346a55?auto=format&fit=crop&w=700&q=80' },
  { title: 'Chhatrapati Shivaji Tribute', date: '2026-02-23', img: 'https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=700&q=80' },
  { title: 'National Service Message', date: '2026-02-23', img: 'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?auto=format&fit=crop&w=700&q=80' },
  { title: 'Social Awareness Poster', date: '2026-02-24', img: 'https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=700&q=80' },
  { title: 'Daily Event Creative', date: '2026-02-24', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=700&q=80' }
];



async function toDataUrlFromRemote(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function openTemplateInEditor(item) {
  try {
    const dataUrl = await toDataUrlFromRemote(item.img);
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        state.imageBase.image = img;
        state.imageBase.scale = 1;
        state.imageBase.rotate = 0;
        state.imageBase.blend = 'source-over';
        const imageLayer = state.layers.find((layer) => layer.type === 'image');
        if (imageLayer) {
          imageLayer.visible = true;
          imageLayer.locked = false;
          persistLayerData(imageLayer);
          state.selectedLayerId = imageLayer.id;
        }
        el.selectedTemplateLabel.textContent = `Template: ${item.title} (${item.date})`;
        el.selectedTemplateLabel.classList.remove('hidden');
        renderLayersUI();
        render();
        openPage('editor');
        resolve();
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  } catch {
    alert('Unable to load template right now. Please try again.');
  }
}

function applyLayerData(layer) {
  if (layer.type === 'image') {
    Object.assign(state.imageBase, layer.data);
    el.imgScale.value = state.imageBase.scale;
    el.imgRotate.value = state.imageBase.rotate;
    el.imgBlend.value = state.imageBase.blend;
  }
  if (layer.type === 'text') {
    Object.assign(state.textBase, layer.data);
    el.textValue.value = state.textBase.value;
    el.textSize.value = state.textBase.size;
    el.textColor.value = state.textBase.color;
  }
}

function persistLayerData(layer) {
  if (layer.type === 'image') layer.data = { ...state.imageBase };
  if (layer.type === 'text') layer.data = { ...state.textBase };
}

function selectedLayer() {
  return state.layers.find((l) => l.id === state.selectedLayerId);
}

function renderLayersUI() {
  el.layersList.innerHTML = '';
  state.layers.forEach((layer) => {
    const row = document.createElement('div');
    row.className = `layer-row ${layer.id === state.selectedLayerId ? 'active' : ''}`;

    const nameBtn = document.createElement('button');
    nameBtn.className = 'layer-name';
    nameBtn.textContent = layer.name;
    nameBtn.onclick = () => {
      state.selectedLayerId = layer.id;
      applyLayerData(layer);
      renderLayersUI();
      render();
    };

    const actions = document.createElement('div');
    actions.className = 'layer-actions';

    const hideBtn = document.createElement('button');
    hideBtn.textContent = layer.visible ? 'Hide' : 'Show';
    hideBtn.onclick = () => {
      layer.visible = !layer.visible;
      renderLayersUI();
      render();
    };

    const lockBtn = document.createElement('button');
    lockBtn.textContent = layer.locked ? 'Unlock' : 'Lock';
    lockBtn.onclick = () => {
      layer.locked = !layer.locked;
      renderLayersUI();
    };

    const dupBtn = document.createElement('button');
    dupBtn.textContent = 'Dup';
    dupBtn.onclick = () => {
      const copy = { ...layer, id: ++idSeq, name: `${layer.name} Copy`, data: { ...(layer.data || {}) } };
      state.layers.push(copy);
      renderLayersUI();
      render();
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Del';
    delBtn.onclick = () => {
      if (state.layers.length <= 1) return;
      state.layers = state.layers.filter((l) => l.id !== layer.id);
      if (state.selectedLayerId === layer.id) state.selectedLayerId = state.layers[state.layers.length - 1].id;
      renderLayersUI();
      render();
    };

    actions.append(hideBtn, lockBtn, dupBtn, delBtn);
    row.append(nameBtn, actions);
    el.layersList.append(row);
  });
}

function drawBackground(layer) {
  if (!layer.visible) return;
  ctx.fillStyle = state.background.color;
  ctx.fillRect(0, 0, el.canvas.width, el.canvas.height);
}

function drawImageLayer(layer) {
  if (!layer.visible || !state.imageBase.image) return;
  const img = state.imageBase.image;
  const cw = el.canvas.width;
  const ch = el.canvas.height;
  const scale = Number(state.imageBase.scale);
  const rotate = (Number(state.imageBase.rotate) * Math.PI) / 180;
  const fit = Math.max(cw / img.width, ch / img.height);
  const w = img.width * fit * scale;
  const h = img.height * fit * scale;
  ctx.save();
  ctx.translate(cw * state.imageBase.x, ch * state.imageBase.y);
  ctx.rotate(rotate);
  ctx.globalCompositeOperation = state.imageBase.blend;
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
}

function drawTextLayer(layer) {
  if (!layer.visible) return;
  const t = state.textBase;
  ctx.save();
  ctx.font = `900 ${Number(t.size)}px Inter, Arial, sans-serif`;
  ctx.fillStyle = t.color;
  ctx.fillText(t.value || '', el.canvas.width * t.x, el.canvas.height * t.y, el.canvas.width * 0.86);
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);
  state.layers.forEach((layer) => {
    if (layer.type === 'background') drawBackground(layer);
    if (layer.type === 'image') drawImageLayer(layer);
    if (layer.type === 'text') drawTextLayer(layer);
  });
}

function updateSelectedLayerFromControls() {
  const layer = selectedLayer();
  if (!layer || layer.locked) return;
  if (layer.type === 'background') {
    state.background.color = el.bgColor.value;
    layer.data = { ...state.background };
  }
  if (layer.type === 'image') {
    state.imageBase.scale = Number(el.imgScale.value);
    state.imageBase.rotate = Number(el.imgRotate.value);
    state.imageBase.blend = el.imgBlend.value;
    persistLayerData(layer);
  }
  if (layer.type === 'text') {
    state.textBase.value = el.textValue.value;
    state.textBase.size = Number(el.textSize.value);
    state.textBase.color = el.textColor.value;
    persistLayerData(layer);
  }
  render();
}

el.preset.addEventListener('change', () => {
  const [w, h] = el.preset.value.split('x').map(Number);
  el.canvas.width = w;
  el.canvas.height = h;
  render();
});

el.bgColor.addEventListener('input', updateSelectedLayerFromControls);
el.imgScale.addEventListener('input', updateSelectedLayerFromControls);
el.imgRotate.addEventListener('input', updateSelectedLayerFromControls);
el.imgBlend.addEventListener('input', updateSelectedLayerFromControls);
el.textValue.addEventListener('input', updateSelectedLayerFromControls);
el.textSize.addEventListener('input', updateSelectedLayerFromControls);
el.textColor.addEventListener('input', updateSelectedLayerFromControls);

el.imgUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.imageBase.image = img;
      const layer = selectedLayer();
      if (layer && layer.type === 'image') persistLayerData(layer);
      render();
    };
    img.src = r.result;
  };
  r.readAsDataURL(file);
});

el.addLayerBtn.addEventListener('click', () => {
  const base = selectedLayer() || state.layers[state.layers.length - 1];
  const type = base.type === 'background' ? 'text' : base.type;
  const layer = { id: ++idSeq, type, name: `${type[0].toUpperCase()}${type.slice(1)} ${idSeq}`, visible: true, locked: false, data: {} };
  if (type === 'text') layer.data = { ...state.textBase };
  if (type === 'image') layer.data = { ...state.imageBase };
  state.layers.push(layer);
  state.selectedLayerId = layer.id;
  renderLayersUI();
  render();
});

Array.from(document.querySelectorAll('.tool-toggle')).forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const panel = document.getElementById(target);
    const shouldShow = !panel.classList.contains('active');
    document.querySelectorAll('.tool-panel').forEach((p) => p.classList.remove('active'));
    document.querySelectorAll('.tool-toggle').forEach((b) => b.classList.remove('active'));
    if (shouldShow) {
      panel.classList.add('active');
      btn.classList.add('active');
    }
  });
});

el.downloadBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = `poster-${el.canvas.width}x${el.canvas.height}.png`;
  a.href = el.canvas.toDataURL('image/png');
  a.click();
});

renderLayersUI();
render();


function hideSplashScreen() {
  const splash = document.getElementById('splashScreen');
  if (!splash) return;
  window.setTimeout(() => {
    splash.classList.add('hidden');
    showOnboardingIfNeeded();
  }, 1700);
}



const PROFILE_KEY = 'poster_editor_user_profile_v1';
let onboardingPhotoData = '';

function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function showOnboardingIfNeeded() {
  const profile = getStoredProfile();
  if (profile) {
    el.onboardingScreen.classList.add('hidden');
    openPage('gallery');
    return;
  }
  el.onboardingScreen.classList.remove('hidden');
}

function saveProfile(event) {
  event.preventDefault();
  const profile = {
    name: el.userName.value.trim(),
    position: el.userPosition.value.trim(),
    phone: el.userPhone.value.trim(),
    photo: onboardingPhotoData
  };

  if (!profile.name || !profile.position || !profile.phone) return;

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  el.onboardingScreen.classList.add('hidden');
  openPage('gallery');
}

el.userPhoto.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    onboardingPhotoData = '';
    el.userPhotoPreview.classList.add('hidden');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    onboardingPhotoData = reader.result;
    el.userPhotoPreview.src = reader.result;
    el.userPhotoPreview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

el.onboardingForm.addEventListener('submit', saveProfile);
el.openGalleryBtn.addEventListener('click', () => openPage('gallery'));
el.openEditorBtn.addEventListener('click', () => openPage('editor'));

renderGallery();
hideSplashScreen();


function formatDateLabel() {
  const now = new Date();
  return now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderGallery() {
  el.galleryDateLabel.textContent = `Updated: ${formatDateLabel()}`;
  el.galleryGrid.innerHTML = '';
  galleryItems.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'banner-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${item.img}" alt="${item.title}" loading="lazy" />
      <div class="banner-meta">
        <div class="banner-date">${item.date}</div>
        <div>${item.title}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      openTemplateInEditor(item);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openTemplateInEditor(item);
      }
    });
    el.galleryGrid.append(card);
  });
}

function openPage(page) {
  if (page === 'gallery') {
    el.editorPage.classList.remove('active');
    el.galleryPage.classList.add('active');
    el.openGalleryBtn.classList.add('hidden');
    el.openEditorBtn.classList.remove('hidden');
    return;
  }
  el.galleryPage.classList.remove('active');
  el.editorPage.classList.add('active');
  el.openEditorBtn.classList.add('hidden');
  el.openGalleryBtn.classList.remove('hidden');
}
