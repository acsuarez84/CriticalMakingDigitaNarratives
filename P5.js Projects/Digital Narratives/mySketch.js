// ── CONSTANTS ─────────────────────────────────────────────────────
const PANEL_W = 220;

// ── DATA ──────────────────────────────────────────────────────────
let ringData = [
  ['flax',3],['fibre',3],['silken',3],['pile',4],['shed',4],
  ['reed',5],['shaft',5],['picks',5],['harness',6],['shuttle',6],
  ['stitch',6],['stitches',7],['yarn',7],['spinning',8],['linen',8],
  ['cotton',8],['silk',9],['wool',9],['cloth',9],['fabric',10],
  ['warp',12],['weft',12],['loom',11],['plain',11],['twill',10],
  ['weave',14],['weaving',13],['woven',10],['thread',13],['garment',7]
];

let cats = {
  innovators:   { words:['inventor','pioneer','designer','innovator','master','creator'],  col:[239,159,39]  },
  participants: { words:['weaver','artisan','maker','trader','worker','merchant'],         col:[29,158,117]  },
  spinsters:    { words:['spinner','spinster','distaff','maiden','widow','crone'],         col:[175,169,236] },
  invisible:    { words:['unnamed','forgotten','hidden','silent','unseen','erased'],       col:[136,135,128] }
};

let patternForms = {
  'plain':   'like plain weave — direct, alternating, each line crosses the previous cleanly, over-under rhythm',
  'twill':   'like twill weave — diagonal flow, each line shifts at an angle from the last, building momentum',
  'satin':   'like satin weave — smooth, flowing, long vowels, few hard stops, luxurious unbroken rhythm',
  'pile':    'like pile weave — layered depth, each line adds another stratum of meaning beneath the surface',
  'warp':    'like warp threads — the first line is structural and load-bearing, the others cross it',
  'weft':    'like weft threads — lines flow horizontally, each completing what the previous set up',
  'weave':   'like the act of weaving — over and under, alternating tension and release between each line',
  'weaving': 'like the weaving motion — rhythmic and repetitive, each pass reveals something slightly different',
  'woven':   'like finished woven cloth — tight, complete, every line interlocked, nothing loose',
  'loom':    'like setting up a loom — the first line sets the frame, the second loads the threads, the third releases cloth',
  'shuttle': 'like a shuttle — the poem darts across, carrying meaning swiftly from one edge to the other',
  'harness': 'like a loom harness — the structure controls which threads rise, each line lifting a different layer',
  'shed':    'like the shed of a loom — each line opens a space for the next thread to pass through'
};

let anglesPool = ['at dawn','in winter','through grief','at the end of a long day',
  'in old age','at the moment of creation','with defiance','in silence',
  'alone by candlelight','through memory','with weathered hands','with pride'];
let sensoryPool = ['focusing on sound','focusing on touch','focusing on smell',
  'focusing on light','focusing on rhythm','focusing on texture','focusing on weight'];

// ── STATE ──────────────────────────────────────────────────────────
let catKeys, n, maxF;
let angle = 0, tornadoT = 0;
let wordPositions = [];
let selectedWords = [];
let frozen = false;
let activePoem = null;
let poemTimer = 0;
let poemT = 0;
let poemHovered = false;
let hoverLerp = 0;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let dragStartAngle = 0, dragStartTornado = 0;
let totalDrag = 0;
let draggingSlider = false;
let showInstructions = true;
let instructionAlpha = 255;
let apiKey = '';

// ── SETUP ──────────────────────────────────────────────────────────
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  ringData.sort((a, b) => a[1] - b[1]);
  catKeys = Object.keys(cats);
  n = ringData.length;
  maxF = ringData[n - 1][1];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ── DRAW ───────────────────────────────────────────────────────────
function draw() {
  background(0, 2, 8);

  if (!frozen && !isDragging && !draggingSlider) {
    angle += 0.002;
  }

  wordPositions = [];
  let spiralW = width - PANEL_W;
  let cx = spiralW / 2;
  let cy = height / 2;
  let maxR = min(spiralW, height) * 0.41;

  ringData.forEach(([word, count], i) => {
    let t = i / (n - 1);
    let baseR = 20 + i * (maxR / n) * 1.35;
    let arcLen = (count / maxF) * TWO_PI * 0.82;
    let off = (i * 0.43) + angle;
    let pulse = frozen ? 1 : 1 + sin(frameCount * 0.035 + i) * 0.03;
    let rx = baseR * pulse;
    let ry = rx * max(0.08, 1 - tornadoT * 0.88);
    let ringCY = cy + (i - n / 2) * 10 * tornadoT * 2.2;
    let ringL = lerp(255, 45, t);
    let ringW = max(2, lerp(13, 4, t));

    push();
    translate(cx, ringCY);
    scale(1, ry / rx);
    noFill();
    stroke(ringL, ringL, ringL, 224);
    strokeWeight(ringW * (rx / max(ry, 0.1)));
    arc(0, 0, rx * 2, rx * 2, off, off + arcLen);
    pop();

    let fs = max(39, ringW * 4.2);
    let arcMid = off + arcLen / 2;
    let tx = cx + rx * cos(arcMid);
    let ty = ringCY + ry * sin(arcMid);
    let isSel = selectedWords.some(s => s.word === word);

    if (isSel) {
      noStroke();
      fill(255, 255, 255, 40);
      rect(tx - fs * word.length * 0.35, ty - fs * 0.75,
           fs * word.length * 0.72, fs * 1.5, 4);
    }
    noStroke();
    fill(isSel ? 255 : lerp(0, 255, t));
    textSize(fs);
    text(word, tx, ty);
    wordPositions.push({ word, category:'textile', col:[170,170,170], x:tx, y:ty });

    if (i % 3 === 1) {
      let ci = floor(i / 3) % 4;
      let catKey = catKeys[ci];
      let cat = cats[catKey];
      let wWord = cat.words[floor(i / 12) % cat.words.length];
      let wArcMid = off + arcLen + 0.9;
      let wArcLen = 1.1;

      push();
      translate(cx, ringCY);
      scale(1, ry / rx);
      noFill();
      stroke(cat.col[0], cat.col[1], cat.col[2], 198);
      strokeWeight(ringW * 0.85 * (rx / max(ry, 0.1)));
      arc(0, 0, rx * 2, rx * 2, wArcMid - wArcLen/2, wArcMid + wArcLen/2);
      pop();

      let wfs = max(39, ringW * 3.9);
      let wx = cx + rx * cos(wArcMid);
      let wy = ringCY + ry * sin(wArcMid);
      let wSel = selectedWords.some(s => s.word === wWord);

      if (wSel) {
        noStroke();
        fill(cat.col[0], cat.col[1], cat.col[2], 50);
        rect(wx - wfs * wWord.length * 0.35, wy - wfs * 0.75,
             wfs * wWord.length * 0.72, wfs * 1.5, 4);
      }
      noStroke();
      fill(wSel ? color(255) : color(cat.col[0], cat.col[1], cat.col[2]));
      textSize(wfs);
      text(wWord, wx, wy);
      wordPositions.push({ word:wWord, category:catKey, col:cat.col, x:wx, y:wy });
    }
  });

  if (!frozen && !showInstructions) {
    noStroke();
    fill(255, 255, 255, 18);
    textSize(11);
    textAlign(LEFT, BOTTOM);
    text('drag left/right = rotate   drag up/down = flatten/tornado', 12, height - 8);
    textAlign(CENTER, CENTER);
  }

  drawSidePanel();
  drawInstructions(cx, cy);

  if (frozen && activePoem) {
    let bw = min(540, spiralW - 60);
    let lines = activePoem.lines;
    let lineH = 48;
    let bh = 80 + lines.length * lineH + 30;
    let bx = cx - bw / 2;
    let by = cy - bh / 2;

    poemHovered = (mouseX > bx && mouseX < bx + bw &&
                   mouseY > by && mouseY < by + bh);

    // smoothly lerp toward readable (1) or woven (0)
    if (poemHovered) {
      hoverLerp = min(1, hoverLerp + 0.06);
    } else {
      hoverLerp = max(0, hoverLerp - 0.06);
    }

    if (!poemHovered) poemT += 0.025;

    noStroke();
    fill(0, 2, 8, 195);
    rect(0, 0, spiralW, height);
    drawPoemOverlay(cx, cy, spiralW, bx, by, bw, bh);

    if (!poemHovered && millis() - poemTimer > activePoem.duration) {
      frozen = false;
      activePoem = null;
      selectedWords = [];
      poemT = 0;
      poemHovered = false;
      hoverLerp = 0;
    }
  }
}

// ── SIDE PANEL ────────────────────────────────────────────────────
function drawSidePanel() {
  let px = width - PANEL_W;
  let centerX = px + PANEL_W / 2;

  noStroke();
  fill(0, 0, 8, 235);
  rect(px, 0, PANEL_W, height);
  stroke(255, 255, 255, 20);
  strokeWeight(0.5);
  line(px, 0, px, height);
  noStroke();

  textAlign(CENTER, CENTER);
  fill(130);
  textSize(10);
  text('CATEGORIES', centerX, 16);

  let legendEntries = [
    { label:'innovators',   col:[239,159,39]  },
    { label:'participants', col:[29,158,117]  },
    { label:'spinsters',    col:[175,169,236] },
    { label:'invisible',    col:[136,135,128] },
    { label:'textile',      col:[170,170,170] }
  ];
  legendEntries.forEach((e, i) => {
    fill(e.col[0], e.col[1], e.col[2]);
    circle(px + 22, 34 + i * 20, 9);
    textAlign(LEFT, CENTER);
    textSize(12);
    text(e.label, px + 34, 34 + i * 20);
    textAlign(CENTER, CENTER);
  });

  stroke(255, 255, 255, 15);
  strokeWeight(0.5);
  line(px + 12, 142, px + PANEL_W - 12, 142);
  noStroke();

  fill(130);
  textSize(10);
  text('TORNADO  ↕  FLAT', centerX, 155);

  let sliderX = centerX;
  let sliderTop = 170;
  let sliderBot = height - 230;

  stroke(255, 255, 255, 25);
  strokeWeight(3);
  line(sliderX, sliderTop, sliderX, sliderBot);
  let thumbY = lerp(sliderBot, sliderTop, tornadoT);
  stroke(255, 255, 255, 60);
  strokeWeight(5);
  line(sliderX, thumbY, sliderX, sliderBot);
  stroke(255);
  strokeWeight(0.5);
  fill(255);
  circle(sliderX, thumbY, 18);

  noStroke();
  fill(90);
  textSize(10);
  text('tornado', centerX, sliderTop - 10);
  text('flat', centerX, sliderBot + 12);

  stroke(255, 255, 255, 15);
  strokeWeight(0.5);
  line(px + 12, height - 215, px + PANEL_W - 12, height - 215);
  noStroke();

  fill(120);
  textSize(10);
  text(selectedWords.length > 0 ? 'SELECTED:' : 'click words to select', centerX, height - 200);

  selectedWords.forEach((s, i) => {
    fill(s.col[0], s.col[1], s.col[2]);
    textSize(11);
    textAlign(LEFT, CENTER);
    text('· ' + s.word, px + 18, height - 184 + i * 16);
    textAlign(CENTER, CENTER);
  });

  let btnW = PANEL_W - 30;
  let btnX = px + 15;
  let genY = height - 112;
  let clrY = height - 64;
  let genActive = selectedWords.length > 0;

  stroke(255, 255, 255, genActive ? 80 : 25);
  strokeWeight(0.5);
  fill(255, 255, 255, genActive ? 22 : 6);
  rect(btnX, genY, btnW, 36, 10);
  noStroke();
  fill(genActive ? 255 : 70);
  textSize(12);
  text('Generate poem', centerX, genY + 18);

  stroke(255, 255, 255, 25);
  strokeWeight(0.5);
  fill(255, 255, 255, 6);
  rect(btnX, clrY, btnW, 36, 10);
  noStroke();
  fill(80);
  textSize(12);
  text('Clear', centerX, clrY + 18);
}

// ── INSTRUCTIONS ──────────────────────────────────────────────────
function drawInstructions(cx, cy) {
  if (!showInstructions) return;
  if (selectedWords.length > 0 && instructionAlpha > 0) {
    instructionAlpha -= 3;
    if (instructionAlpha <= 0) { showInstructions = false; return; }
  }

  let iw = min(620, (width - PANEL_W) - 60);
  let ih = 190;
  let ix = cx - iw / 2;
  let iy = cy - ih / 2 - 40;

  noStroke();
  fill(0, 2, 8, instructionAlpha * 0.85);
  rect(ix, iy, iw, ih, 14);

  fill(255, 255, 255, instructionAlpha);
  textSize(22);
  textStyle(BOLD);
  text('Women in Textiles — Interactive Spiral', cx, iy + 28);
  textStyle(NORMAL);

  fill(200, 200, 200, instructionAlpha);
  textSize(15);
  text('Drag left / right on spiral  →  rotate 360°', cx, iy + 66);
  text('Drag up / down on spiral  →  flat to tornado', cx, iy + 90);
  text('Side slider  →  also controls flat / tornado', cx, iy + 114);
  text('Click any word  →  select  (click again to deselect)', cx, iy + 138);
  text('Select words  →  hit Generate poem for unique haiku', cx, iy + 162);

  fill(180, 180, 180, instructionAlpha * 0.7);
  textSize(12);
  text('Hover poem to read  ·  move away to weave again', cx, iy + 182);
}

// ── DETECT PATTERN ────────────────────────────────────────────────
function detectPattern(words) {
  let names = words.map(w => w.word);
  if (names.some(w => ['plain','cloth','linen','cotton','flax','fibre'].includes(w)))
    return 'plain';
  if (names.some(w => ['twill','warp','weft','harness','shaft','picks','shed'].includes(w)))
    return 'herringbone';
  if (names.some(w => ['silk','satin','silken','pile','garment','fabric'].includes(w)))
    return 'diamond';
  return 'weaving';
}

// ── POEM OVERLAY ─────────────────────────────────────────────────
function drawPoemOverlay(cx, cy, spiralW, bx, by, bw, bh) {
  if (!activePoem) return;

  let lines = activePoem.lines;
  let lineH = 48;

  stroke(255, 255, 255, lerp(50, 90, hoverLerp));
  strokeWeight(lerp(0.5, 1, hoverLerp));
  fill(0, 2, 8, 210);
  rect(bx, by, bw, bh, 14);

  let pat = activePoem.pattern || 'weaving';
  let t = poemT;

  noStroke();
  textAlign(RIGHT, CENTER);
  fill(activePoem.col[0], activePoem.col[1], activePoem.col[2], 70);
  textSize(10);
  // label fades out as we hover into readable mode
  fill(activePoem.col[0], activePoem.col[1], activePoem.col[2],
       lerp(70, 0, hoverLerp));
  text(pat + ' pattern', bx + bw - 14, by + 14);

  textAlign(CENTER, CENTER);
  fill(activePoem.col[0], activePoem.col[1], activePoem.col[2]);
  textSize(13);
  text(activePoem.label, cx, by + 28);

  textStyle(ITALIC);
  textSize(20);

  let visIdx = 0;

  lines.forEach((line, li) => {
    if (line.trim() === '') return;

    let baseY = by + 62 + li * lineH;

    let charWidths = [];
    let totalW = 0;
    for (let ci = 0; ci < line.length; ci++) {
      let cw = textWidth(line[ci]);
      charWidths.push(cw);
      totalW += cw;
    }
    let startX = cx - totalW / 2;
    let accumX = 0;

    for (let ci = 0; ci < line.length; ci++) {
      let ch = line[ci];
      let cw = charWidths[ci];
      let charCX = startX + accumX + cw / 2;
      accumX += cw;

      let cp = ci * 0.55 + visIdx * 1.4;
      let xOff = 0, yOff = 0, rot = 0, sc = 1.0, alpha = 235;

      if (pat === 'plain') {
        let isWarp = ci % 2 === 0;
        if (isWarp) {
          yOff = -18 * sin(t * 1.1 + cp);
          xOff = 1.5 * cos(t * 0.4 + cp);
          alpha = 140 + 115 * (sin(t * 1.1 + cp) > 0 ? 1 : 0);
          sc = 1 + 0.06 * sin(t * 1.1 + cp);
        } else {
          xOff = 14 * cos(t * 0.9 + cp);
          yOff = 2 * sin(t * 0.3 + cp);
          alpha = 100 + 80 * abs(cos(t * 0.9 + cp));
          sc = 0.88 + 0.08 * abs(cos(t * 0.9 + cp));
        }
        rot = 0.04 * sin(t + cp);

      } else if (pat === 'herringbone') {
        let mid = (line.length - 1) / 2.0;
        let distMid = ci - mid;
        let dir = distMid >= 0 ? 1 : -1;
        let d = abs(distMid) / max(mid, 1);
        let sweep = sin(t * 0.9 + visIdx * 0.7);
        xOff = dir * d * 22 * sweep;
        yOff = d * 16 * abs(sweep);
        yOff += 8 * sin(t * 1.8 + cp * 0.9);
        rot = dir * 0.22 * sin(t * 1.1 + cp);
        alpha = 120 + 115 * abs(sin(t * 0.7 + d * 2.0));
        sc = 1 + 0.1 * abs(sin(t * 0.9 + cp));

      } else if (pat === 'diamond') {
        let mid = (line.length - 1) / 2.0;
        let dMid = 1.0 - abs(ci - mid) / max(mid, 1);
        let freq = 0.85 + ci * 0.04;
        let orbitA = 20 * dMid;
        let orbitB = 14 * dMid;
        let ex = orbitA * cos(t * freq + cp);
        let ey = orbitB * sin(t * freq + cp);
        xOff = ex * cos(0.785) - ey * sin(0.785);
        yOff = ex * sin(0.785) + ey * cos(0.785);
        rot = 0.28 * sin(t * freq + cp);
        alpha = 110 + 145 * (0.5 + 0.5 * sin(t * freq + cp));
        sc = 0.9 + 0.18 * abs(sin(t * freq + cp));

      } else {
        let harness = ci % 2 === 0 ? 1 : -1;
        let shuttlePos = t + visIdx * 0.8;
        yOff = harness * 12 * sin(t * 1.3 + cp * 0.5);
        let shuttleSweep = 20 * sin(shuttlePos);
        xOff = shuttleSweep + harness * 4 * cos(t * 2.1 + cp);
        rot = 0.25 * sin(t * 0.9 + cp * 0.7) * harness;
        alpha = 120 + 115 * (0.5 + 0.5 * sin(t * 1.3 + cp * 0.5) * harness);
        sc = 0.85 + 0.22 * abs(sin(t * 1.1 + cp));
      }

      // lerp all offsets toward readable (zero) as hoverLerp approaches 1
      xOff  = lerp(xOff,  0,   hoverLerp);
      yOff  = lerp(yOff,  0,   hoverLerp);
      rot   = lerp(rot,   0,   hoverLerp);
      sc    = lerp(sc,    1.0, hoverLerp);
      alpha = lerp(alpha, 235, hoverLerp);

      push();
      translate(charCX + xOff, baseY + yOff);
      rotate(rot);
      scale(sc);
      noStroke();
      fill(255, 255, 255, alpha);
      textAlign(CENTER, CENTER);
      textStyle(ITALIC);
      textSize(20);
      text(ch, 0, 0);
      pop();
    }
    visIdx++;
  });

  textStyle(NORMAL);
}

// ── MOUSE ────────────────────────────────────────────────────────
function mousePressed() {
  if (frozen) return;
  isDragging = true;
  totalDrag = 0;
  dragStartX = mouseX;
  dragStartY = mouseY;
  dragStartAngle = angle;
  dragStartTornado = tornadoT;

  if (mouseX > width - PANEL_W) {
    let sliderX = width - PANEL_W + PANEL_W / 2;
    let sliderTop = 170, sliderBot = height - 230;
    if (mouseY > sliderTop - 20 && mouseY < sliderBot + 20
        && abs(mouseX - sliderX) < 40) {
      draggingSlider = true;
    }
  }
}

function mouseDragged() {
  if (frozen) return;
  let dx = mouseX - pmouseX;
  let dy = mouseY - pmouseY;
  totalDrag += abs(dx) + abs(dy);

  if (draggingSlider) {
    let sliderTop = 170, sliderBot = height - 230;
    tornadoT = constrain(map(mouseY, sliderBot, sliderTop, 0, 1), 0, 1);
    return;
  }
  if (mouseX < width - PANEL_W) {
    angle = dragStartAngle + (mouseX - dragStartX) * 0.008;
    tornadoT = constrain(dragStartTornado + (mouseY - dragStartY) * 0.004, 0, 1);
  }
}

function mouseReleased() {
  if (frozen) { isDragging = false; draggingSlider = false; return; }
  if (draggingSlider) { draggingSlider = false; isDragging = false; return; }

  if (totalDrag < 6) {
    if (mouseX > width - PANEL_W) {
      handlePanelClick();
    } else {
      handleWordClick();
    }
  }
  isDragging = false;
}

function handlePanelClick() {
  let px = width - PANEL_W;
  let btnW = PANEL_W - 30;
  let btnX = px + 15;
  let genY = height - 112;
  let clrY = height - 64;

  if (mouseX >= btnX && mouseX <= btnX + btnW) {
    if (mouseY >= genY && mouseY <= genY + 36) {
      if (selectedWords.length > 0) generatePoem([...selectedWords]);
    } else if (mouseY >= clrY && mouseY <= clrY + 36) {
      selectedWords = [];
    }
  }
}

function handleWordClick() {
  let nearest = null, minD = 60;
  wordPositions.forEach(wp => {
    let d = dist(mouseX, mouseY, wp.x, wp.y);
    if (d < minD) { minD = d; nearest = wp; }
  });
  if (nearest) {
    showInstructions = false;
    let idx = selectedWords.findIndex(s => s.word === nearest.word);
    if (idx >= 0) selectedWords.splice(idx, 1);
    else selectedWords.push({ word:nearest.word, category:nearest.category, col:nearest.col });
  }
}

// ── HAIKU GENERATION ─────────────────────────────────────────────
function rPick(arr) { return arr[floor(random(arr.length))]; }

function makeFallback(word) {
  let h = 7;
  for (let c of word) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  let templates = [
    [`${word} in her hands`, `she pulls the thread through darkness`, `cloth holds her name`],
    [`the ${word} remembers`, `each woman who passed through here`, `silence woven in`],
    [`she bends to the ${word}`, `dawn before the children wake`, `history forgets`],
    [`from ${word} she made`, `a language no one would read`, `but the cloth survived`],
    [`${word} — her only`, `language in a world of men`, `thread speaks what words can't`],
    [`rough hands touch the ${word}`, `she was never in the book`, `the work outlasts her`],
    [`through ${word} she breathed`, `ten thousand mornings of thread`, `unnamed but not gone`],
    [`the ${word} still turns`, `as it did in her mother's time`, `hands change, rhythm stays`],
  ];
  return templates[h % templates.length];
}

function getPatternInstruction(words) {
  let match = words.find(w => patternForms[w.word]);
  if (match) return `\nPoetic structure: Form this poem ${patternForms[match.word]}.`;
  return `\nPoetic structure: Form this poem like woven cloth — each line interlocks, over and under, no thread left loose.`;
}

async function generatePoem(words) {
  frozen = true;
  poemT = 0;
  poemHovered = false;
  hoverLerp = 0;
  let label = words.map(w => w.word).join('  ·  ');
  let col = words.length === 1 ? words[0].col : [200, 200, 200];
  let pat = detectPattern(words);

  let lines = [];
  if (words.length === 1) {
    lines = makeFallback(words[0].word);
  } else {
    words.forEach((w, i) => {
      if (i > 0) lines.push('');
      lines.push(...makeFallback(w.word));
    });
  }
  let duration = words.length === 1 ? 5000 : min(5000 + words.length * 2500, 15000);
  activePoem = { label, col, lines, duration, pattern: pat };
  poemTimer = millis();
}