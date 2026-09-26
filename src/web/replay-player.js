import { configureWorkers, parseReplay, loadSkinFromDir, buildSkin, createReplaySession } from '/assets/replayviewer.js';

configureWorkers({ stretch: '/assets/replayviewer-stretch-worker.js' });

let active = null;

function timeLabel(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

async function sprite(size, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  paint(canvas.getContext('2d'), size);
  return createImageBitmap(canvas);
}

async function skinForReplay(audioContext) {
  const skin = await loadSkinFromDir('/assets/replay-skin', audioContext);
  skin.config.comboColors = ['#ed83b6', '#91d4e5', '#cbb3ff', '#f4d092'];
  const circle = await sprite(128, (ctx, size) => {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 53, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 45, 0, Math.PI * 2);
    ctx.fill();
  });
  const approach = await sprite(128, (ctx, size) => {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 59, 0, Math.PI * 2);
    ctx.stroke();
  });
  const cursor = await sprite(128, (ctx, size) => {
    const glow = ctx.createRadialGradient(64, 64, 3, 64, 64, 55);
    glow.addColorStop(0, '#fff');
    glow.addColorStop(.3, '#fff');
    glow.addColorStop(.48, '#ffb6db');
    glow.addColorStop(1, '#ff7fb000');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
  });
  const spinnerRing = await sprite(512, (ctx, size) => {
    const centre = size / 2;
    ctx.strokeStyle = '#f5dce9';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(centre, centre, 218, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#ed83b6';
    ctx.lineWidth = 20;
    for (let tick = 0; tick < 24; tick++) {
      const angle = tick * Math.PI / 12;
      ctx.beginPath();
      ctx.arc(centre, centre, 188, angle, angle + .14);
      ctx.stroke();
    }
  });
  const spinnerCore = await sprite(320, (ctx, size) => {
    const centre = size / 2;
    const fill = ctx.createRadialGradient(centre, centre, 0, centre, centre, 150);
    fill.addColorStop(0, '#fff5fb');
    fill.addColorStop(.24, '#ec8cbc');
    fill.addColorStop(.72, '#6d3458');
    fill.addColorStop(1, '#6d345800');
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(centre, centre, 150, 0, Math.PI * 2);
    ctx.fill();
  });
  const spinnerGlow = await sprite(512, (ctx, size) => {
    const centre = size / 2;
    const fill = ctx.createRadialGradient(centre, centre, 100, centre, centre, 245);
    fill.addColorStop(0, '#ed83b600');
    fill.addColorStop(.8, '#ed83b650');
    fill.addColorStop(1, '#ed83b600');
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, size, size);
  });
  skin.images.set('hitcircle.png', circle);
  skin.images.set('approachcircle.png', approach);
  skin.images.set('sliderball.png', circle);
  skin.images.set('cursor.png', cursor);
  skin.images.set('spinner-circle.png', spinnerRing);
  skin.images.set('spinner-approachcircle.png', spinnerRing);
  skin.images.set('spinner-middle.png', spinnerCore);
  skin.images.set('spinner-glow.png', spinnerGlow);
  return skin;
}

async function getBytes(path, signal, limit) {
  const response = await fetch(path, { signal, cache: 'no-store', redirect: 'manual' });
  if (!response.ok || response.type === 'opaqueredirect') throw new Error('the replay file is unavailable');
  const length = Number(response.headers.get('content-length'));
  if (length > limit) throw new Error('this replay is too large for browser playback');
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > limit) throw new Error('this replay is too large for browser playback');
  return bytes;
}

async function getArchive(setId, signal, status) {
  for (let attempt = 0; attempt < 9; attempt++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    const response = await fetch(`/d/${setId}`, { signal, cache: 'no-store', redirect: 'manual' });
    if (response.ok) {
      const length = Number(response.headers.get('content-length'));
      if (length > 128 * 1024 * 1024) throw new Error('this beatmap set is too large for browser playback');
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > 128 * 1024 * 1024) throw new Error('this beatmap set is too large for browser playback');
      return bytes;
    }
    if (response.type !== 'opaqueredirect' && response.status !== 307) throw new Error('the beatmap archive is unavailable');
    status.textContent = 'caching the full beatmap set…';
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 2000);
      signal.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('cancelled', 'AbortError')); }, { once: true });
    });
  }
  throw new Error('the beatmap is still caching. try replay playback again in a moment');
}

export async function openReplayPlayer(score, audioContext) {
  if (active) active.close();
  const source = score.client === 'lazer' ? 'lazer' : 'stable';
  const id = Number(score.id);
  const setId = Number(score.set_id);
  const mapId = Number(score.map_id);
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(setId) || setId < 1) {
    await audioContext.close();
    return;
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'replay-player-dialog';
  dialog.setAttribute('aria-label', 'watch replay');
  dialog.innerHTML = `<div class="replay-player-shell"><div class="replay-player-head"><div class="replay-player-title"><span>replay playback</span><strong></strong><small></small></div><button type="button" class="replay-player-close" aria-label="close replay">×</button></div><div class="replay-player-stage"><canvas width="1280" height="720" aria-label="osu replay playfield"></canvas><div class="replay-player-status" role="status">loading replay and beatmap…</div></div><div class="replay-player-controls"><button type="button" class="replay-player-toggle" disabled>play</button><input type="range" class="replay-player-seek" min="0" max="1" value="0" aria-label="replay position" disabled><output class="replay-player-clock">0:00 / 0:00</output><button type="button" class="replay-player-speed" disabled>1×</button><label class="replay-player-volume">volume <input type="range" min="0" max="100" value="85" aria-label="replay volume" disabled></label><button type="button" class="replay-player-fullscreen" aria-label="fullscreen replay">⛶</button></div></div>`;
  document.body.append(dialog);
  const controller = new AbortController();
  const stage = dialog.querySelector('.replay-player-stage');
  const canvas = stage.querySelector('canvas');
  const status = dialog.querySelector('.replay-player-status');
  const title = dialog.querySelector('.replay-player-title strong');
  const sub = dialog.querySelector('.replay-player-title small');
  const toggle = dialog.querySelector('.replay-player-toggle');
  const seek = dialog.querySelector('.replay-player-seek');
  const clock = dialog.querySelector('.replay-player-clock');
  const speed = dialog.querySelector('.replay-player-speed');
  const volume = dialog.querySelector('.replay-player-volume input');
  let session = null;
  let ticker = 0;
  let closed = false;
  const fitCanvas = () => {
    const scale = Math.min(stage.clientWidth / 16, stage.clientHeight / 9);
    if (scale > 0) {
      canvas.style.width = `${Math.floor(scale * 16)}px`;
      canvas.style.height = `${Math.floor(scale * 9)}px`;
    }
  };
  const layoutObserver = new ResizeObserver(fitCanvas);
  const close = () => dialog.close();
  active = { close };
  title.textContent = `${score.artist} — ${score.title}`;
  sub.textContent = `[${score.version}] · ${source} · ${score.mods_text || ''}`;
  dialog.querySelector('.replay-player-close').onclick = close;
  dialog.querySelector('.replay-player-fullscreen').onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else dialog.querySelector('.replay-player-shell').requestFullscreen?.();
  };
  dialog.onclose = () => {
    closed = true;
    controller.abort();
    cancelAnimationFrame(ticker);
    layoutObserver.disconnect();
    session?.destroy();
    audioContext.close();
    if (active?.close === close) active = null;
    dialog.remove();
  };
  dialog.showModal();
  layoutObserver.observe(stage);
  fitCanvas();

  try {
    const replayPath = `/replays/${source}/${id}`;
    const [replayBytes, archiveBytes, skin] = await Promise.all([
      getBytes(replayPath, controller.signal, 16 * 1024 * 1024),
      getArchive(setId, controller.signal, status),
      skinForReplay(audioContext),
    ]);
    if (closed) return;
    status.textContent = 'building gameplay…';
    const replay = await parseReplay(replayBytes);
    if (source === 'lazer' && Array.isArray(score.mods_json) && score.mods_json.length) {
      replay.scoreInfo = { ...(replay.scoreInfo || {}), mods: score.mods_json };
    }
    session = await createReplaySession({
      canvas,
      audioContext,
      replay,
      beatmapSet: archiveBytes,
      skin: buildSkin(skin, undefined, { mode: replay.mode }),
      fetchOsuOverride: Number.isSafeInteger(mapId) && mapId > 0
        ? async () => new Uint8Array(await getBytes(`/api/v1/beatmaps/${mapId}/file`, controller.signal, 32 * 1024 * 1024))
        : undefined,
      storyboard: true,
      video: true,
    });
    if (closed) { session.destroy(); return; }
    if (!session.assets.songBuffer) throw new Error('the beatmap audio could not be decoded in this browser');
    Object.assign(session.renderer.options, {
      showJudgement: true,
      showKeyOverlay: true,
      showFollowpoints: true,
      showURBar: true,
      showModIcons: true,
      showStoryboard: true,
      showVideo: true,
    });
    session.audioSync.setSongVolume(.85);
    session.audioSync.setEffectsVolume(.65);
    session.audioSync.setBeatmapHitsounds(true);
    session.renderer.start();
    session.player.setClockFn(session.audioSync.clockFn);
    seek.max = String(Math.max(1, Math.floor(session.player.durationMs)));
    toggle.disabled = seek.disabled = speed.disabled = volume.disabled = false;
    sub.textContent = `${sub.textContent} · map speed ${session.speed}× · audio on`;
    status.hidden = true;

    const paintClock = () => {
      if (closed) return;
      const current = Math.min(session.player.durationMs, session.player.currentTimeMs);
      if (document.activeElement !== seek) seek.value = String(Math.max(0, Math.floor(current)));
      clock.textContent = `${timeLabel(current)} / ${timeLabel(session.player.durationMs)}`;
      if (session.player.isPlaying && current >= session.player.durationMs - 50) {
        session.audioSync.pause();
        session.player.pause();
        toggle.textContent = 'play';
      }
      ticker = requestAnimationFrame(paintClock);
    };
    paintClock();

    toggle.onclick = async () => {
      if (session.player.isPlaying) {
        session.audioSync.pause();
        session.player.pause();
        toggle.textContent = 'play';
        return;
      }
      const at = session.player.currentTimeMs >= session.player.durationMs - 50 ? 0 : session.player.currentTimeMs;
      await session.audioSync.playFrom(at);
      if (closed) return;
      session.player.seek(at);
      session.player.play();
      toggle.textContent = 'pause';
    };
    seek.onchange = async () => {
      const at = Number(seek.value);
      await session.audioSync.seekTo(at);
      if (!closed) session.player.seek(at);
    };
    speed.onclick = async () => {
      const rates = [.5, .75, 1, 1.25, 1.5, 2];
      const next = rates[(rates.indexOf(Number(speed.dataset.rate || 1)) + 1) % rates.length];
      speed.dataset.rate = String(next);
      speed.textContent = `${next}×`;
      const at = session.player.currentTimeMs;
      session.audioSync.setUserRate(next);
      if (session.player.isPlaying) await session.audioSync.seekTo(at);
    };
    volume.oninput = () => {
      const level = Number(volume.value) / 100;
      session.audioSync.setSongVolume(level);
      session.audioSync.setEffectsVolume(level * .75);
    };
    await toggle.onclick();
  } catch (error) {
    if (closed || controller.signal.aborted) return;
    status.hidden = false;
    status.classList.add('error');
    status.textContent = error instanceof Error ? error.message : 'replay playback is unavailable';
  }
}
