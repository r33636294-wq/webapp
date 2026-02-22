const elements = {
  preset: document.getElementById('preset'),
  bgColor: document.getElementById('bgColor'),
  bgImage: document.getElementById('bgImage'),
  titleText: document.getElementById('titleText'),
  titleColor: document.getElementById('titleColor'),
  titleSize: document.getElementById('titleSize'),
  subtitleText: document.getElementById('subtitleText'),
  subtitleColor: document.getElementById('subtitleColor'),
  subtitleSize: document.getElementById('subtitleSize'),
  overlay: document.getElementById('overlay'),
  imgZoom: document.getElementById('imgZoom'),
  imgScale: document.getElementById('imgScale'),
  imgX: document.getElementById('imgX'),
  imgY: document.getElementById('imgY'),
  imgRotate: document.getElementById('imgRotate'),
  imgColorMode: document.getElementById('imgColorMode'),
  imgColorA: document.getElementById('imgColorA'),
  imgColorB: document.getElementById('imgColorB'),
  imgTexture: document.getElementById('imgTexture'),
  imgStrokeWidth: document.getElementById('imgStrokeWidth'),
  imgStrokeColor: document.getElementById('imgStrokeColor'),
  imgShadowBlur: document.getElementById('imgShadowBlur'),
  imgShadowX: document.getElementById('imgShadowX'),
  imgShadowY: document.getElementById('imgShadowY'),
  imgShadowColor: document.getElementById('imgShadowColor'),
  imgBlend: document.getElementById('imgBlend'),
  downloadBtn: document.getElementById('downloadBtn'),
  resetBtn: document.getElementById('resetBtn'),
  canvas: document.getElementById('canvas')
};

const ctx = elements.canvas.getContext('2d');
let uploadedImage = null;

const defaults = {
  preset: '1200x628',
  bgColor: '#1f2937',
  titleText: 'YOUR EVENT TITLE',
  titleColor: '#ffffff',
  titleSize: 96,
  subtitleText: 'Date • Venue • Call to Action',
  subtitleColor: '#f3f4f6',
  subtitleSize: 42,
  overlay: 0.35,
  imgZoom: 1,
  imgScale: 1,
  imgX: 0,
  imgY: 0,
  imgRotate: 0,
  imgColorMode: 'none',
  imgColorA: '#ff6b6b',
  imgColorB: '#4d96ff',
  imgTexture: 'none',
  imgStrokeWidth: 0,
  imgStrokeColor: '#ffffff',
  imgShadowBlur: 0,
  imgShadowX: 0,
  imgShadowY: 0,
  imgShadowColor: '#000000',
  imgBlend: 'source-over'
};

function resizeCanvasFromPreset() {
  const [w, h] = elements.preset.value.split('x').map(Number);
  elements.canvas.width = w;
  elements.canvas.height = h;
}

function drawImageTexture(width, height) {
  const texture = elements.imgTexture.value;
  if (texture === 'none') return;

  ctx.save();
  if (texture === 'noise') {
    for (let i = 0; i < 1800; i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const alpha = Math.random() * 0.12;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  if (texture === 'grid') {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    const gap = Math.max(14, Math.round(width / 32));
    for (let x = 0; x <= width; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawStyledImage() {
  if (!uploadedImage) return;

  const cw = elements.canvas.width;
  const ch = elements.canvas.height;
  const zoom = Number(elements.imgZoom.value);
  const scale = Number(elements.imgScale.value);
  const xShift = Number(elements.imgX.value) * cw * 0.25;
  const yShift = Number(elements.imgY.value) * ch * 0.25;
  const rotate = (Number(elements.imgRotate.value) * Math.PI) / 180;

  const coverScale = Math.max(cw / uploadedImage.width, ch / uploadedImage.height);
  const finalScale = coverScale * zoom * scale;
  const drawW = uploadedImage.width * finalScale;
  const drawH = uploadedImage.height * finalScale;

  ctx.save();
  ctx.translate(cw / 2 + xShift, ch / 2 + yShift);
  ctx.rotate(rotate);
  ctx.globalCompositeOperation = elements.imgBlend.value;
  ctx.shadowBlur = Number(elements.imgShadowBlur.value);
  ctx.shadowOffsetX = Number(elements.imgShadowX.value);
  ctx.shadowOffsetY = Number(elements.imgShadowY.value);
  ctx.shadowColor = elements.imgShadowColor.value;
  ctx.drawImage(uploadedImage, -drawW / 2, -drawH / 2, drawW, drawH);

  const colorMode = elements.imgColorMode.value;
  if (colorMode !== 'none') {
    ctx.globalCompositeOperation = 'source-atop';
    if (colorMode === 'solid') {
      ctx.fillStyle = elements.imgColorA.value;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      const grad = ctx.createLinearGradient(-drawW / 2, -drawH / 2, drawW / 2, drawH / 2);
      grad.addColorStop(0, elements.imgColorA.value);
      grad.addColorStop(1, elements.imgColorB.value);
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
    }
    ctx.globalAlpha = 1;
  }

  drawImageTexture(drawW, drawH);

  const strokeWidth = Number(elements.imgStrokeWidth.value);
  if (strokeWidth > 0) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = elements.imgStrokeColor.value;
    ctx.lineWidth = strokeWidth;
    ctx.strokeRect(-drawW / 2, -drawH / 2, drawW, drawH);
  }

  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
}

function drawTextBlock() {
  const w = elements.canvas.width;
  const h = elements.canvas.height;
  const padX = w * 0.07;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  const titleSize = Number(elements.titleSize.value);
  ctx.fillStyle = elements.titleColor.value;
  ctx.font = `900 ${titleSize}px Inter, Arial, sans-serif`;
  ctx.fillText(elements.titleText.value.toUpperCase(), padX, h * 0.62, w * 0.86);

  const subtitleSize = Number(elements.subtitleSize.value);
  ctx.fillStyle = elements.subtitleColor.value;
  ctx.font = `500 ${subtitleSize}px Inter, Arial, sans-serif`;
  ctx.fillText(elements.subtitleText.value, padX, h * 0.78, w * 0.86);
}

function render() {
  const w = elements.canvas.width;
  const h = elements.canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = elements.bgColor.value;
  ctx.fillRect(0, 0, w, h);

  drawStyledImage();

  const overlayValue = Number(elements.overlay.value);
  if (overlayValue > 0) {
    ctx.fillStyle = `rgba(0,0,0,${overlayValue})`;
    ctx.fillRect(0, 0, w, h);
  }

  const gradient = ctx.createLinearGradient(0, h * 0.45, 0, h);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  drawTextBlock();
}

function handleImageUpload(file) {
  if (!file) {
    uploadedImage = null;
    render();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      uploadedImage = image;
      render();
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function downloadPNG() {
  const link = document.createElement('a');
  link.download = `poster-${elements.canvas.width}x${elements.canvas.height}.png`;
  link.href = elements.canvas.toDataURL('image/png');
  link.click();
}

function reset() {
  Object.entries(defaults).forEach(([key, value]) => {
    if (elements[key]) elements[key].value = value;
  });
  elements.bgImage.value = '';
  uploadedImage = null;
  resizeCanvasFromPreset();
  render();
}

function setupTabs() {
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((entry) => entry.classList.remove('active'));
      panels.forEach((panel) => panel.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

[
  'bgColor', 'titleText', 'titleColor', 'titleSize', 'subtitleText', 'subtitleColor', 'subtitleSize', 'overlay',
  'imgZoom', 'imgScale', 'imgX', 'imgY', 'imgRotate', 'imgColorMode', 'imgColorA', 'imgColorB', 'imgTexture',
  'imgStrokeWidth', 'imgStrokeColor', 'imgShadowBlur', 'imgShadowX', 'imgShadowY', 'imgShadowColor', 'imgBlend'
].forEach((id) => elements[id].addEventListener('input', render));

elements.preset.addEventListener('change', () => {
  resizeCanvasFromPreset();
  render();
});

elements.bgImage.addEventListener('change', (event) => {
  const [file] = event.target.files;
  handleImageUpload(file);
});

elements.downloadBtn.addEventListener('click', downloadPNG);

elements.resetBtn.addEventListener('click', reset);

setupTabs();
resizeCanvasFromPreset();
render();
