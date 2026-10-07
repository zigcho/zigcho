import { loadSkinFromDir } from './replayviewer.js';

async function sprite(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext('2d'), width, height);
  return createImageBitmap(canvas);
}

function ring(ctx, x, y, radius, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

export async function skinForReplay(audioContext) {
  const skin = await loadSkinFromDir('/assets/replay-skin', audioContext);
  Object.assign(skin.config, {
    name: 'kai clean', version: '2.4',
    comboColors: ['#bc9cff', '#ed96bd', '#8bcddd'],
    sliderBorder: '#c8c2d1', sliderTrackOverride: '#17141e',
    hitCircleOverlap: 3, allowSliderBallTint: false,
  });
  const add = async (name, width, height, paint) => skin.images.set(name + '.png', await sprite(width, height, paint));
  await Promise.all([
    add('hitcircle', 128, 128, ctx => {
      ctx.fillStyle = '#ffffff28';
      ctx.beginPath(); ctx.arc(64, 64, 57, 0, Math.PI * 2); ctx.fill();
      ring(ctx, 64, 64, 57, 5, '#fff');
    }),
    add('hitcircleoverlay', 128, 128, ctx => ring(ctx, 64, 64, 52, 1.5, '#ffffffb0')),
    add('approachcircle', 128, 128, ctx => ring(ctx, 64, 64, 59, 2.5, '#fff')),
    add('sliderb', 128, 128, ctx => {
      ctx.fillStyle = '#ffffff14';
      ctx.beginPath(); ctx.arc(64, 64, 54, 0, Math.PI * 2); ctx.fill();
      ring(ctx, 64, 64, 54, 3, '#fff');
      ring(ctx, 64, 64, 46, 1, '#ffffff60');
    }),
    add('sliderfollowcircle', 256, 256, ctx => ring(ctx, 128, 128, 117, 2, '#d4bfff90')),
    add('cursor', 32, 32, ctx => {
      ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
      ctx.fillStyle = '#f7d678';
      ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI * 2); ctx.fill();
      ring(ctx, 16, 16, 10, 2, '#fff');
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(16, 16, 2, 0, Math.PI * 2); ctx.fill();
    }),
    add('cursortrail', 16, 16, ctx => {
      ctx.fillStyle = '#f7d67865'; ctx.beginPath(); ctx.arc(8, 8, 5, 0, Math.PI * 2); ctx.fill();
    }),
    add('reversearrow', 128, 128, ctx => {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(82, 39); ctx.lineTo(48, 64); ctx.lineTo(82, 89); ctx.stroke();
    }),
    add('spinner-circle', 512, 512, ctx => {
      ring(ctx, 256, 256, 220, 3, '#ffffffa0');
      ring(ctx, 256, 256, 207, 6, '#bc9cff');
      ctx.strokeStyle = '#bc9cff'; ctx.lineWidth = 3;
      for (let tick = 0; tick < 12; tick++) {
        const angle = tick * Math.PI / 6;
        ctx.beginPath(); ctx.moveTo(256 + Math.cos(angle) * 187, 256 + Math.sin(angle) * 187);
        ctx.lineTo(256 + Math.cos(angle) * 199, 256 + Math.sin(angle) * 199); ctx.stroke();
      }
    }),
    add('spinner-approachcircle', 512, 512, ctx => ring(ctx, 256, 256, 220, 3, '#ffffff90')),
    add('spinner-middle', 96, 96, ctx => {
      ring(ctx, 48, 48, 32, 3, '#bc9cff');
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(48, 48, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#bc9cff'; ctx.fillRect(47, 8, 2, 20);
    }),
    ...Array.from({ length: 10 }, (_, digit) => add('default-' + digit, 38, 54, ctx => {
      ctx.fillStyle = '#fff'; ctx.font = '500 46px Arial, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(digit), 19, 28);
    })),
  ]);
  return skin;
}
