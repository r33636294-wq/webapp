const el = {
  preset: document.getElementById('preset'), bgColor: document.getElementById('bgColor'), bgImage: document.getElementById('bgImage'),
  mainText: document.getElementById('mainText'), textSize: document.getElementById('textSize'), textColorMode: document.getElementById('textColorMode'),
  textColorA: document.getElementById('textColorA'), textColorB: document.getElementById('textColorB'), textTextureImage: document.getElementById('textTextureImage'),
  textStrokeWidth: document.getElementById('textStrokeWidth'), textStrokeColor: document.getElementById('textStrokeColor'),
  shadowType: document.getElementById('shadowType'), shadowColor: document.getElementById('shadowColor'), shadowRadius: document.getElementById('shadowRadius'), shadowBlur: document.getElementById('shadowBlur'),
  glowType: document.getElementById('glowType'), glowColor: document.getElementById('glowColor'), glowRadius: document.getElementById('glowRadius'), glowBlur: document.getElementById('glowBlur'),
  imgZoom: document.getElementById('imgZoom'), imgScale: document.getElementById('imgScale'), imgX: document.getElementById('imgX'), imgY: document.getElementById('imgY'), imgRotate: document.getElementById('imgRotate'),
  imgColorMode: document.getElementById('imgColorMode'), imgColorA: document.getElementById('imgColorA'), imgColorB: document.getElementById('imgColorB'), imgTexture: document.getElementById('imgTexture'),
  imgStrokeWidth: document.getElementById('imgStrokeWidth'), imgStrokeColor: document.getElementById('imgStrokeColor'), imgShadowBlur: document.getElementById('imgShadowBlur'), imgShadowX: document.getElementById('imgShadowX'), imgShadowY: document.getElementById('imgShadowY'), imgShadowColor: document.getElementById('imgShadowColor'), imgBlend: document.getElementById('imgBlend'),
  downloadBtn: document.getElementById('downloadBtn'), resetBtn: document.getElementById('resetBtn'), canvas: document.getElementById('canvas')
};

const ctx = el.canvas.getContext('2d');
let uploadedImage = null;
let textTextureImage = null;
let textPattern = null;
let textState = { x: 0.5, y: 0.65, size: 120 };
let textBounds = null;
let interaction = { mode: null, pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0, originSize: 120 };

const defaults = { preset: '1200x628', bgColor: '#1f2937', mainText: 'YOUR MAIN MESSAGE', textSize: 120 };

function resizeCanvasFromPreset() {
  const [w, h] = el.preset.value.split('x').map(Number);
  el.canvas.width = w;
  el.canvas.height = h;
  textState.x = Math.min(0.9, Math.max(0.1, textState.x));
  textState.y = Math.min(0.9, Math.max(0.1, textState.y));
}

function loadImage(file, cb) {
  if (!file) return cb(null);
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => cb(image);
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function drawImageLayer() {
  if (!uploadedImage) return;
  const cw = el.canvas.width;
  const ch = el.canvas.height;
  const zoom = Number(el.imgZoom.value);
  const scale = Number(el.imgScale.value);
  const xShift = Number(el.imgX.value) * cw * 0.25;
  const yShift = Number(el.imgY.value) * ch * 0.25;
  const rotate = (Number(el.imgRotate.value) * Math.PI) / 180;

  const coverScale = Math.max(cw / uploadedImage.width, ch / uploadedImage.height);
  const finalScale = coverScale * zoom * scale;
  const drawW = uploadedImage.width * finalScale;
  const drawH = uploadedImage.height * finalScale;

  ctx.save();
  ctx.translate(cw / 2 + xShift, ch / 2 + yShift);
  ctx.rotate(rotate);
  ctx.globalCompositeOperation = el.imgBlend.value;
  ctx.shadowBlur = Number(el.imgShadowBlur.value);
  ctx.shadowOffsetX = Number(el.imgShadowX.value);
  ctx.shadowOffsetY = Number(el.imgShadowY.value);
  ctx.shadowColor = el.imgShadowColor.value;
  ctx.drawImage(uploadedImage, -drawW / 2, -drawH / 2, drawW, drawH);

  if (el.imgColorMode.value !== 'none') {
    ctx.globalCompositeOperation = 'source-atop';
    if (el.imgColorMode.value === 'solid') {
      ctx.fillStyle = el.imgColorA.value;
    } else {
      const grad = ctx.createLinearGradient(-drawW / 2, -drawH / 2, drawW / 2, drawH / 2);
      grad.addColorStop(0, el.imgColorA.value);
      grad.addColorStop(1, el.imgColorB.value);
      ctx.fillStyle = grad;
    }
    ctx.globalAlpha = 0.35;
    ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
    ctx.globalAlpha = 1;
  }

  if (el.imgTexture.value === 'grid') {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    const gap = Math.max(12, Math.round(drawW / 30));
    for (let x = -drawW / 2; x <= drawW / 2; x += gap) {
      ctx.beginPath(); ctx.moveTo(x, -drawH / 2); ctx.lineTo(x, drawH / 2); ctx.stroke();
    }
    for (let y = -drawH / 2; y <= drawH / 2; y += gap) {
      ctx.beginPath(); ctx.moveTo(-drawW / 2, y); ctx.lineTo(drawW / 2, y); ctx.stroke();
    }
  }
  if (el.imgTexture.value === 'noise') {
    for (let i = 0; i < 1700; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
      ctx.fillRect((-drawW / 2) + Math.random() * drawW, (-drawH / 2) + Math.random() * drawH, 1, 1);
    }
  }

  const sw = Number(el.imgStrokeWidth.value);
  if (sw > 0) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = el.imgStrokeColor.value;
    ctx.lineWidth = sw;
    ctx.strokeRect(-drawW / 2, -drawH / 2, drawW, drawH);
  }

  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
}

function makeTextFillStyle(x, y, w, h) {
  if (textPattern) return textPattern;
  if (el.textColorMode.value === 'gradient') {
    const grad = ctx.createLinearGradient(x, y - h, x + w, y);
    grad.addColorStop(0, el.textColorA.value);
    grad.addColorStop(1, el.textColorB.value);
    return grad;
  }
  return el.textColorA.value;
}

function drawInnerEffect(text, x, y, effectColor, blur, radius, mode) {
  const font = `900 ${Math.round(textState.size)}px Inter, Arial, sans-serif`;
  ctx.save();
  ctx.font = font;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = makeTextFillStyle(x, y, textBounds.width, textBounds.height);
  ctx.fillText(text, x, y);
  ctx.globalCompositeOperation = mode;
  ctx.shadowColor = effectColor;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = radius;
  ctx.shadowOffsetY = radius;
  ctx.fillStyle = effectColor;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawTextLayer() {
  const text = el.mainText.value || ' ';
  textState.size = Number(el.textSize.value);
  const cw = el.canvas.width;
  const ch = el.canvas.height;
  const x = textState.x * cw;
  const y = textState.y * ch;
  const font = `900 ${Math.round(textState.size)}px Inter, Arial, sans-serif`;

  ctx.save();
  ctx.font = font;
  ctx.textBaseline = 'alphabetic';
  const metrics = ctx.measureText(text);
  const width = metrics.width;
  const ascent = metrics.actualBoundingBoxAscent || textState.size * 0.75;
  const descent = metrics.actualBoundingBoxDescent || textState.size * 0.25;
  const height = ascent + descent;
  textBounds = { x, y, width, height, ascent, descent, handle: 20 };

  if (el.shadowType.value === 'outer') {
    ctx.shadowColor = el.shadowColor.value;
    ctx.shadowBlur = Number(el.shadowBlur.value);
    ctx.shadowOffsetX = Number(el.shadowRadius.value);
    ctx.shadowOffsetY = Number(el.shadowRadius.value);
  }

  if (el.glowType.value === 'outer') {
    ctx.shadowColor = el.glowColor.value;
    ctx.shadowBlur = Number(el.glowBlur.value);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.fillStyle = makeTextFillStyle(x, y, width, height);
  ctx.fillText(text, x, y);

  const sw = Number(el.textStrokeWidth.value);
  if (sw > 0) {
    ctx.lineWidth = sw;
    ctx.strokeStyle = el.textStrokeColor.value;
    ctx.strokeText(text, x, y);
  }

  ctx.restore();

  if (el.shadowType.value === 'inner') {
    drawInnerEffect(text, x, y, el.shadowColor.value, Number(el.shadowBlur.value), Number(el.shadowRadius.value), 'source-atop');
  }
  if (el.glowType.value === 'inner') {
    drawInnerEffect(text, x, y, el.glowColor.value, Number(el.glowBlur.value), Number(el.glowRadius.value), 'lighter');
  }

  drawTextSelection();
}

function drawTextSelection() {
  if (!textBounds) return;
  const { x, y, width, ascent, descent, handle } = textBounds;
  const left = x - 10;
  const top = y - ascent - 10;
  const boxW = width + 20;
  const boxH = ascent + descent + 20;

  ctx.save();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, boxW, boxH);
  ctx.setLineDash([]);
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(left + boxW - handle, top + boxH - handle, handle, handle);
  ctx.restore();
  textBounds.box = { left, top, boxW, boxH };
  textBounds.handleRect = { x: left + boxW - handle, y: top + boxH - handle, w: handle, h: handle };
}

function render() {
  ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);
  ctx.fillStyle = el.bgColor.value;
  ctx.fillRect(0, 0, el.canvas.width, el.canvas.height);
  drawImageLayer();
  drawTextLayer();
}

function isInsideRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

function pointerPos(evt) {
  const rect = el.canvas.getBoundingClientRect();
  const scaleX = el.canvas.width / rect.width;
  const scaleY = el.canvas.height / rect.height;
  return { x: (evt.clientX - rect.left) * scaleX, y: (evt.clientY - rect.top) * scaleY };
}

function onPointerDown(evt) {
  if (!textBounds) return;
  const p = pointerPos(evt);
  const inHandle = isInsideRect(p.x, p.y, textBounds.handleRect);
  const inBox = p.x >= textBounds.box.left && p.x <= textBounds.box.left + textBounds.box.boxW && p.y >= textBounds.box.top && p.y <= textBounds.box.top + textBounds.box.boxH;
  if (!inHandle && !inBox) return;

  interaction.mode = inHandle ? 'resize' : 'drag';
  interaction.pointerId = evt.pointerId;
  interaction.startX = p.x;
  interaction.startY = p.y;
  interaction.originX = textState.x;
  interaction.originY = textState.y;
  interaction.originSize = textState.size;
  el.canvas.setPointerCapture(evt.pointerId);
}

function onPointerMove(evt) {
  if (!interaction.mode || evt.pointerId !== interaction.pointerId) return;
  const p = pointerPos(evt);
  const cw = el.canvas.width;
  const ch = el.canvas.height;
  const dx = p.x - interaction.startX;
  const dy = p.y - interaction.startY;

  if (interaction.mode === 'drag') {
    textState.x = Math.min(0.95, Math.max(0.02, interaction.originX + dx / cw));
    textState.y = Math.min(0.95, Math.max(0.08, interaction.originY + dy / ch));
  } else {
    const nextSize = Math.max(24, Math.min(260, interaction.originSize + (dx + dy) * 0.2));
    textState.size = nextSize;
    el.textSize.value = String(Math.round(nextSize));
  }
  render();
}

function onPointerUp(evt) {
  if (evt.pointerId !== interaction.pointerId) return;
  interaction.mode = null;
  interaction.pointerId = null;
}

function setupTabs() {
  const tabs = [...document.querySelectorAll('.tab')];
  const panels = [...document.querySelectorAll('.tab-panel')];
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  }));
}

[
  'bgColor', 'mainText', 'textSize', 'textColorMode', 'textColorA', 'textColorB', 'textStrokeWidth', 'textStrokeColor',
  'shadowType', 'shadowColor', 'shadowRadius', 'shadowBlur', 'glowType', 'glowColor', 'glowRadius', 'glowBlur',
  'imgZoom', 'imgScale', 'imgX', 'imgY', 'imgRotate', 'imgColorMode', 'imgColorA', 'imgColorB', 'imgTexture',
  'imgStrokeWidth', 'imgStrokeColor', 'imgShadowBlur', 'imgShadowX', 'imgShadowY', 'imgShadowColor', 'imgBlend'
].forEach((id) => el[id].addEventListener('input', render));

el.preset.addEventListener('change', () => { resizeCanvasFromPreset(); render(); });
el.bgImage.addEventListener('change', (e) => loadImage(e.target.files[0], (img) => { uploadedImage = img; render(); }));
el.textTextureImage.addEventListener('change', (e) => loadImage(e.target.files[0], (img) => {
  textTextureImage = img;
  if (!img) {
    textPattern = null;
  } else {
    textPattern = ctx.createPattern(img, 'repeat');
  }
  render();
}));
el.downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `poster-${el.canvas.width}x${el.canvas.height}.png`;
  link.href = el.canvas.toDataURL('image/png');
  link.click();
});
el.resetBtn.addEventListener('click', () => {
  el.preset.value = defaults.preset;
  el.bgColor.value = defaults.bgColor;
  el.mainText.value = defaults.mainText;
  el.textSize.value = String(defaults.textSize);
  textState = { x: 0.5, y: 0.65, size: defaults.textSize };
  el.bgImage.value = '';
  el.textTextureImage.value = '';
  uploadedImage = null;
  textTextureImage = null;
  textPattern = null;
  resizeCanvasFromPreset();
  render();
});

el.canvas.addEventListener('pointerdown', onPointerDown);
el.canvas.addEventListener('pointermove', onPointerMove);
el.canvas.addEventListener('pointerup', onPointerUp);
el.canvas.addEventListener('pointercancel', onPointerUp);

setupTabs();
resizeCanvasFromPreset();
render();
