let words = [
  'silk', 'cotton', 'linen', 'wool', 'flax', 'yarn', 'thread', 'fibre',
  'plain', 'twill', 'satin', 'pile', 'weft', 'warp',
  'loom', 'shed', 'reed', 'shaft', 'shuttle', 'harness', 'picks',
  'woven', 'weave', 'weaving', 'spinning', 'stitch', 'stitches',
  'cloth', 'fabric', 'cloths', 'fabrics', 'garment', 'garments', 'silken'
];

let freq = {};
let sorted = [];
let angle = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  noFill();

  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  sorted = Object.entries(freq).sort((a, b) => a[1] - b[1]);
}

function draw() {
  background(0);

  let maxF = sorted[sorted.length - 1][1];
  let cx = width / 2;
  let cy = height / 2;
  let n = sorted.length;
  let maxR = min(width, height) * 0.50;

  sorted.forEach(([word, count], i) => {
    let t = i / (n - 1);

    let baseR = 22 + i * (maxR / n) * 1.4;
    let arcLen = (count / maxF) * TWO_PI * 0.85;
    let offset = (i * 0.42) + angle;
    let pulse = 1 + sin(frameCount * 0.04 + i) * 0.04;
    let r = baseR * pulse;
    let ringW = lerp(14, 6, t); // thick inner, thinner outer

    // draw ring
    let ringBright = lerp(255, 45, t);
    stroke(ringBright, ringBright, ringBright, 235);
    strokeWeight(ringW);
    arc(cx, cy, r * 2, r * 2, offset, offset + arcLen);

    // embed text along the arc curve
    let fontSize = max(7, ringW * 0.72);
    let labelBright = lerp(0, 255, t);
    fill(labelBright, labelBright, labelBright, 240);
    noStroke();
    textSize(fontSize);

    let charW = fontSize * 0.62;
    let totalW = word.length * charW;
    let arcMid = offset + arcLen / 2;
    let startA = arcMid - (totalW / 2) / r;

    for (let k = 0; k < word.length; k++) {
      let charAngle = startA + (k * charW + charW / 2) / r;
      let lx = cx + cos(charAngle) * r;
      let ly = cy + sin(charAngle) * r;
      push();
      translate(lx, ly);
      rotate(charAngle + HALF_PI);
      text(word[k], 0, 0);
      pop();
    }

    noFill();
  });

  angle += 0.003;
}