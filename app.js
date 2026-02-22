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
  overlay: 0.35
};

function resizeCanvasFromPreset() {
  const [w, h] = elements.preset.value.split('x').map(Number);
  elements.canvas.width = w;
  elements.canvas.height = h;
}

function drawCoverImage(img, cw, ch) {
  const imageRatio = img.width / img.height;
  const canvasRatio = cw / ch;

  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imageRatio > canvasRatio) {
    sw = img.height * canvasRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / canvasRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
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

  if (uploadedImage) {
    drawCoverImage(uploadedImage, w, h);
  }

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
    if (elements[key]) {
      elements[key].value = value;
    }
  });
  elements.bgImage.value = '';
  uploadedImage = null;
  resizeCanvasFromPreset();
  render();
}

[
  'bgColor',
  'titleText',
  'titleColor',
  'titleSize',
  'subtitleText',
  'subtitleColor',
  'subtitleSize',
  'overlay'
].forEach((id) => {
  elements[id].addEventListener('input', render);
});

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

resizeCanvasFromPreset();
render();
