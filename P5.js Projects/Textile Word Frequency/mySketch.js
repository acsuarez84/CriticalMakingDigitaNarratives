let words = [
  'silk','cloth','cotton','thread','linen','wool','warp','weft',
  'loom','woven','pattern','weaving','flax','yarn','design','fabric',
  'cloths','shaft','stitch','shuttle','garments','weave','spinning',
  'twill','satin','reed','harness','needle','garment','patterns',
  'stitches','clothing','fabrics','silken','looms','pile',
  'shed','picks','plain','ancient','manufacture','egypt','greek',
  'india','dress','weight','motion','principle','passage','position',
  'method','beautiful','double','spider','worms','wheel','machine','century'
];

let freq = {};
let sorted = [];
let angle = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  textAlign(CENTER, CENTER);
  noFill();

  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 24);
}

function draw() {
  background(220, 90, 5);

  let maxF = sorted[0][1];
  let cx = width / 2;
  let cy = height / 2;

  sorted.forEach(([word, count], i) => {
    let baseR = 30 + i * (min(width, height) * 0.018);
    let arcLen = (count / maxF) * TWO_PI * 0.85;
    let offset = (i * 0.42) + angle;
    let pulse = 1 + sin(frameCount * 0.04 + i) * 0.05;
    let r = baseR * pulse;

    let h = (i * 35) % 360;
    let sw = 4 + (count / maxF) * 6;

    stroke(h, 70, 90, 80);
    strokeWeight(sw);

    arc(cx, cy, r * 2, r * 2, offset, offset + arcLen);

    // word label at arc midpoint
    let mid = offset + arcLen / 2;
    let lx = cx + cos(mid) * (r + 14);
    let ly = cy + sin(mid) * (r + 14);

    noStroke();
    fill(h, 50, 100, 90);
    textSize(constrain(10 + count * 4, 18, 32));
    text(word, lx, ly);
    noFill();
  });

  angle += 0.003;
}