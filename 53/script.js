const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const lifeEl = document.getElementById("combo");
const levelEl = document.getElementById("target");
const toastEl = document.getElementById("toast");
const resultEl = document.getElementById("result");
const restartBtn = document.getElementById("restart");

const W = canvas.width;
const H = canvas.height;
const GRAVITY = 0.55;
const MOVE_SPEED = 3.8;
const JUMP_V = -11.5;

const state = {
  score: 0,
  lives: 3,
  running: true,
  levelIndex: 0,
  levelTime: 90,
  keys: new Set(),
  jumpQueued: false,
  cameraX: 0,
  level: null,
  player: null,
  toastTid: null,
  lastTime: performance.now()
};

function makeLevel({ width, start, platforms, hazards, enemies, trash, goal, time }) {
  return {
    width,
    start,
    platforms,
    hazards,
    enemies: enemies.map((e) => ({ ...e, baseX: e.x, dir: 1 })),
    trash: trash.map((t) => ({ ...t, got: false })),
    goal,
    time,
    need: trash.length,
    got: 0
  };
}

function buildLevels() {
  return [
    makeLevel({
      width: 2200,
      start: { x: 90, y: 360 },
      time: 95,
      platforms: [
        { x: 0, y: 440, w: 460, h: 120 },
        { x: 560, y: 440, w: 380, h: 120 },
        { x: 1010, y: 440, w: 430, h: 120 },
        { x: 1520, y: 440, w: 680, h: 120 },
        { x: 360, y: 340, w: 130, h: 20 },
        { x: 760, y: 330, w: 150, h: 20 },
        { x: 1180, y: 320, w: 160, h: 20 }
      ],
      hazards: [
        { x: 460, y: 532, w: 100, h: 28 },
        { x: 940, y: 532, w: 70, h: 28 },
        { x: 1440, y: 532, w: 80, h: 28 }
      ],
      enemies: [
        { x: 820, y: 412, w: 34, h: 28, patrol: 100, speed: 1.4 },
        { x: 1700, y: 412, w: 34, h: 28, patrol: 120, speed: 1.8 }
      ],
      trash: [
        { x: 220, y: 405, r: 10 },
        { x: 400, y: 305, r: 10 },
        { x: 875, y: 295, r: 10 },
        { x: 1100, y: 405, r: 10 },
        { x: 1300, y: 285, r: 10 },
        { x: 1880, y: 405, r: 10 }
      ],
      goal: { x: 2070, y: 350, w: 70, h: 90 }
    }),
    makeLevel({
      width: 2500,
      start: { x: 90, y: 360 },
      time: 95,
      platforms: [
        { x: 0, y: 440, w: 340, h: 120 },
        { x: 430, y: 440, w: 350, h: 120 },
        { x: 870, y: 440, w: 220, h: 120 },
        { x: 1180, y: 440, w: 370, h: 120 },
        { x: 1620, y: 440, w: 280, h: 120 },
        { x: 1980, y: 440, w: 520, h: 120 },
        { x: 330, y: 350, w: 120, h: 20 },
        { x: 740, y: 315, w: 130, h: 20 },
        { x: 1080, y: 300, w: 120, h: 20 },
        { x: 1510, y: 330, w: 140, h: 20 },
        { x: 1860, y: 305, w: 130, h: 20 }
      ],
      hazards: [
        { x: 340, y: 532, w: 90, h: 28 },
        { x: 780, y: 532, w: 90, h: 28 },
        { x: 1090, y: 532, w: 90, h: 28 },
        { x: 1900, y: 532, w: 80, h: 28 }
      ],
      enemies: [
        { x: 570, y: 412, w: 34, h: 28, patrol: 140, speed: 1.9 },
        { x: 1240, y: 412, w: 34, h: 28, patrol: 130, speed: 1.9 },
        { x: 2060, y: 412, w: 34, h: 28, patrol: 150, speed: 2.1 }
      ],
      trash: [
        { x: 165, y: 405, r: 10 },
        { x: 375, y: 315, r: 10 },
        { x: 825, y: 275, r: 10 },
        { x: 1010, y: 405, r: 10 },
        { x: 1165, y: 260, r: 10 },
        { x: 1590, y: 290, r: 10 },
        { x: 2140, y: 405, r: 10 }
      ],
      goal: { x: 2360, y: 350, w: 70, h: 90 }
    }),
    makeLevel({
      width: 2850,
      start: { x: 90, y: 360 },
      time: 110,
      platforms: [
        { x: 0, y: 440, w: 300, h: 120 },
        { x: 390, y: 440, w: 250, h: 120 },
        { x: 730, y: 440, w: 290, h: 120 },
        { x: 1120, y: 440, w: 270, h: 120 },
        { x: 1470, y: 440, w: 290, h: 120 },
        { x: 1840, y: 440, w: 250, h: 120 },
        { x: 2160, y: 440, w: 690, h: 120 },
        { x: 280, y: 350, w: 110, h: 20 },
        { x: 640, y: 320, w: 110, h: 20 },
        { x: 1000, y: 300, w: 110, h: 20 },
        { x: 1380, y: 280, w: 110, h: 20 },
        { x: 1770, y: 320, w: 110, h: 20 },
        { x: 2080, y: 280, w: 110, h: 20 }
      ],
      hazards: [
        { x: 300, y: 532, w: 90, h: 28 },
        { x: 640, y: 532, w: 90, h: 28 },
        { x: 1020, y: 532, w: 100, h: 28 },
        { x: 1390, y: 532, w: 80, h: 28 },
        { x: 1760, y: 532, w: 80, h: 28 },
        { x: 2090, y: 532, w: 70, h: 28 }
      ],
      enemies: [
        { x: 500, y: 412, w: 34, h: 28, patrol: 120, speed: 2.2 },
        { x: 1250, y: 412, w: 34, h: 28, patrol: 120, speed: 2.2 },
        { x: 1920, y: 412, w: 34, h: 28, patrol: 150, speed: 2.3 },
        { x: 2500, y: 412, w: 34, h: 28, patrol: 180, speed: 2.5 }
      ],
      trash: [
        { x: 130, y: 405, r: 10 },
        { x: 320, y: 315, r: 10 },
        { x: 680, y: 285, r: 10 },
        { x: 1040, y: 265, r: 10 },
        { x: 1430, y: 245, r: 10 },
        { x: 1810, y: 285, r: 10 },
        { x: 2120, y: 245, r: 10 },
        { x: 2360, y: 405, r: 10 }
      ],
      goal: { x: 2710, y: 350, w: 70, h: 90 }
    })
  ];
}

function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function circleRectOverlap(c, r) {
  const cx = Math.max(r.x, Math.min(c.x, r.x + r.w));
  const cy = Math.max(r.y, Math.min(c.y, r.y + r.h));
  const dx = c.x - cx;
  const dy = c.y - cy;
  return dx * dx + dy * dy <= c.r * c.r;
}

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(state.toastTid);
  state.toastTid = setTimeout(() => toastEl.classList.remove("show"), 1000);
}

function resetPlayerAtStart() {
  state.player = {
    x: state.level.start.x,
    y: state.level.start.y,
    w: 30,
    h: 42,
    vx: 0,
    vy: 0,
    onGround: false
  };
}

function restartGame() {
  state.score = 0;
  state.lives = 3;
  state.running = true;
  resultEl.classList.add("hidden");
  state.level = buildLevels()[0];
  state.levelIndex = 0;
  state.levelTime = state.level.time;
  resetPlayerAtStart();
  syncHud();
}

function syncHud() {
  timeEl.textContent = Math.max(0, Math.ceil(state.levelTime)).toString();
  scoreEl.textContent = state.score.toString();
  lifeEl.textContent = state.lives.toString();
  levelEl.textContent = `${state.levelIndex + 1}/3`;
}

function getSolids() {
  return state.level.platforms;
}

function resolveX() {
  const p = state.player;
  const next = { x: p.x + p.vx, y: p.y, w: p.w, h: p.h };

  for (const s of getSolids()) {
    if (!rectOverlap(next, s)) continue;
    if (p.vx > 0) {
      next.x = s.x - p.w;
      p.vx = 0;
    } else if (p.vx < 0) {
      next.x = s.x + s.w;
      p.vx = 0;
    }
  }

  p.x = Math.max(0, Math.min(state.level.width - p.w, next.x));
}

function resolveY() {
  const p = state.player;
  p.onGround = false;
  const next = { x: p.x, y: p.y + p.vy, w: p.w, h: p.h };

  for (const s of getSolids()) {
    if (!rectOverlap(next, s)) continue;

    if (p.vy > 0) {
      next.y = s.y - p.h;
      p.vy = 0;
      p.onGround = true;
    } else if (p.vy < 0) {
      next.y = s.y + s.h;
      p.vy = 0;
    }
  }

  p.y = next.y;
}

function loseLife(reason) {
  state.lives -= 1;
  if (state.lives <= 0) {
    state.running = false;
    resultEl.innerHTML = `闯关失败<br>${reason}<br>总分 ${state.score}`;
    resultEl.classList.remove("hidden");
    syncHud();
    return;
  }

  showToast(`${reason}，剩余生命 ${state.lives}`);
  state.levelTime = Math.max(20, state.levelTime - 8);
  resetPlayerAtStart();
  syncHud();
}

function finishLevel() {
  const bonus = Math.ceil(state.levelTime) * 2;
  state.score += bonus;

  if (state.levelIndex >= 2) {
    state.running = false;
    resultEl.innerHTML = `全部通关！<br>总分 ${state.score}<br>时间奖励 +${bonus}`;
    resultEl.classList.remove("hidden");
    syncHud();
    return;
  }

  state.levelIndex += 1;
  state.level = buildLevels()[state.levelIndex];
  state.levelTime = state.level.time;
  resetPlayerAtStart();
  state.cameraX = 0;
  showToast(`过关！时间奖励 +${bonus}`);
  syncHud();
}

function updateEnemies() {
  for (const e of state.level.enemies) {
    e.x += e.dir * e.speed;
    if (e.x < e.baseX - e.patrol) e.dir = 1;
    if (e.x > e.baseX + e.patrol) e.dir = -1;

    if (rectOverlap(state.player, e)) {
      loseLife("撞到巡逻障碍");
      return;
    }
  }
}

function updateCollectibles() {
  const p = state.player;
  for (const t of state.level.trash) {
    if (t.got) continue;
    const hit = circleRectOverlap({ x: t.x, y: t.y, r: t.r }, p);
    if (!hit) continue;
    t.got = true;
    state.level.got += 1;
    state.score += 12;
    showToast(`收集垃圾 ${state.level.got}/${state.level.need}`);
    syncHud();
  }
}

function checkHazards() {
  const p = state.player;
  for (const hz of state.level.hazards) {
    if (rectOverlap(p, hz)) {
      loseLife("掉进污染区");
      return true;
    }
  }

  if (p.y > H + 120) {
    loseLife("坠落出界");
    return true;
  }
  return false;
}

function checkGoal() {
  const p = state.player;
  if (!rectOverlap(p, state.level.goal)) return;

  if (state.level.got < state.level.need) {
    showToast(`还差 ${state.level.need - state.level.got} 个垃圾`);
    return;
  }

  finishLevel();
}

function update(dt) {
  if (!state.running) return;

  state.levelTime -= dt;
  if (state.levelTime <= 0) {
    state.levelTime = 0;
    loseLife("时间耗尽");
    if (!state.running) return;
  }

  const p = state.player;
  const left = state.keys.has("a") || state.keys.has("arrowleft");
  const right = state.keys.has("d") || state.keys.has("arrowright");

  p.vx = 0;
  if (left) p.vx -= MOVE_SPEED;
  if (right) p.vx += MOVE_SPEED;

  if (state.jumpQueued && p.onGround) {
    p.vy = JUMP_V;
    p.onGround = false;
  }
  state.jumpQueued = false;

  p.vy += GRAVITY;
  p.vy = Math.min(15, p.vy);

  resolveX();
  resolveY();

  updateEnemies();
  if (!state.running) return;
  if (checkHazards()) return;

  updateCollectibles();
  checkGoal();

  state.cameraX = p.x - W * 0.42;
  state.cameraX = Math.max(0, Math.min(state.level.width - W, state.cameraX));
  syncHud();
}

function drawBackground() {
  const cam = state.cameraX;

  ctx.fillStyle = "#f1ffe6";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#d6f5bf";
  for (let i = 0; i < 9; i++) {
    const x = i * 220 - (cam * 0.2) % 220;
    ctx.beginPath();
    ctx.arc(x, 470, 140, Math.PI, 0);
    ctx.fill();
  }

  ctx.fillStyle = "#b2df7a";
  for (let i = 0; i < 7; i++) {
    const x = i * 300 - (cam * 0.35) % 300;
    ctx.beginPath();
    ctx.arc(x + 50, 500, 160, Math.PI, 0);
    ctx.fill();
  }
}

function drawWorld() {
  const cam = state.cameraX;

  for (const p of state.level.platforms) {
    ctx.fillStyle = "#6b8e23";
    ctx.fillRect(p.x - cam, p.y, p.w, p.h);
    ctx.fillStyle = "#8fbf3c";
    ctx.fillRect(p.x - cam, p.y, p.w, 14);
  }

  for (const hz of state.level.hazards) {
    ctx.fillStyle = "#b71c1c";
    ctx.fillRect(hz.x - cam, hz.y, hz.w, hz.h);
    ctx.fillStyle = "#ef5350";
    for (let x = hz.x - cam; x < hz.x - cam + hz.w; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, hz.y + hz.h);
      ctx.lineTo(x + 7, hz.y);
      ctx.lineTo(x + 14, hz.y + hz.h);
      ctx.fill();
    }
  }

  for (const t of state.level.trash) {
    if (t.got) continue;
    ctx.fillStyle = "#00a884";
    ctx.beginPath();
    ctx.arc(t.x - cam, t.y, t.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.beginPath();
    ctx.arc(t.x - cam - 3, t.y - 3, 3.6, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const e of state.level.enemies) {
    ctx.fillStyle = "#5d4037";
    ctx.fillRect(e.x - cam, e.y, e.w, e.h);
    ctx.fillStyle = "#ffcc80";
    ctx.fillRect(e.x - cam + 6, e.y + 7, 6, 6);
    ctx.fillRect(e.x - cam + e.w - 12, e.y + 7, 6, 6);
  }

  const g = state.level.goal;
  ctx.fillStyle = "#1976d2";
  ctx.fillRect(g.x - cam, g.y, g.w, g.h);
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px Microsoft YaHei";
  ctx.fillText("回收站", g.x - cam + 10, g.y + 52);

  ctx.fillStyle = "#103128";
  ctx.font = "16px Microsoft YaHei";
  ctx.fillText(`本关收集: ${state.level.got}/${state.level.need}`, 18, 28);
}

function drawPlayer() {
  const p = state.player;
  const x = p.x - state.cameraX;

  ctx.fillStyle = "#ffb703";
  ctx.fillRect(x, p.y, p.w, p.h);
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(x + 6, p.y + 11, 5, 5);
  ctx.fillRect(x + p.w - 11, p.y + 11, 5, 5);

  ctx.fillStyle = "#2d6a4f";
  ctx.fillRect(x + 4, p.y - 8, p.w - 8, 8);
}

function render() {
  drawBackground();
  drawWorld();
  drawPlayer();
}

function loop(now) {
  const dt = Math.min(0.034, (now - state.lastTime) / 1000);
  state.lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  state.keys.add(k);

  if (k === " " || k === "w" || k === "arrowup") {
    state.jumpQueued = true;
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  state.keys.delete(e.key.toLowerCase());
});

restartBtn.addEventListener("click", restartGame);

restartGame();
requestAnimationFrame(loop);
