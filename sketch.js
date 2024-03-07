// Initial variables
let landNoiseThreshold = 0.6;
let oreVeinsDensity = 0.05; // Default value, you can adjust this as needed

// Base Colors as arrays for RGB manipulation
const seaColorBase = [17, 64, 184];
const landColorBase = [19, 138, 13];
const woodColorBase = [14, 92, 14];
const oreColorBase = [212, 207, 207];
const preciousColorBase = [252, 252, 0];

// Size of each tile (in pixels)
const tileSize = 5;

// Tile counters
let waterTiles = 0;
let earthTiles = 0;
let treeTiles = 0;
let goldTiles = 0;
let oreTiles = 0;

let table; // variable to store the CSV data
let blockNumberInput;
let canvas;

function preload() {
  // Load the CSV file using the raw URL
  let csvUrl = 'https://raw.githack.com/TerraBitsNAS/TerraBits/main/terra.csv';
  table = loadTable(csvUrl, 'csv', 'header');
}

function setup() {
  // Get the input and button from the HTML file
  blockNumberInput = select('#blockNumberInput');
  let generateButton = select('#generateButton');
  generateButton.mousePressed(generateFromInput);

  // Create canvas but hide it initially
  canvas = createCanvas(366, 366);
  canvas.hide();

  noLoop();
}

function generateLand() {
  // Reset tile counters
  waterTiles = 0;
  earthTiles = 0;
  treeTiles = 0;
  goldTiles = 0;
  oreTiles = 0;

  for (let x = 0; x < width; x += tileSize) {
    for (let y = 0; y < height; y += tileSize) {
      let landNoiseVal = noise(x / 100, y / 100);
      let forestNoiseVal = noise(x / 50, y / 50);
      drawTile(x, y, landNoiseVal, forestNoiseVal);
    }
  }

  // Update statistics next to the generated image
  updateStats();
}

function drawTile(x, y, landNoiseVal, forestNoiseVal) {
  // Helper function to add subtle color variation
  function variedColor(baseColor) {
    let variationRange = 7;
    return color(
      baseColor[0] + random(-variationRange, variationRange),
      baseColor[1] + random(-variationRange, variationRange),
      baseColor[2] + random(-variationRange, variationRange)
    );
  }

  if (landNoiseVal < getSeaNoiseThreshold()) {
    fill(variedColor(seaColorBase));
    waterTiles++;
  } else {
    if (forestNoiseVal > landNoiseThreshold) {
      let nonce = getNonce(); // Get nonce from the CSV
      let mappedWoodDensity = map(nonce, 1028694, 4288169963, 0.6, 0.9);

      if (random() < mappedWoodDensity) {
        fill(variedColor(woodColorBase));
        treeTiles++;
      } else {
        fill(variedColor(landColorBase));
        earthTiles++;
      }
    } else {
      let feeReward = getFeeReward(); // Get fee reward from the CSV
      let mappedPreciousVeinsDensity = map(feeReward, 0, 9679, 0.008, 0.03);

      let hashInput = getHash(); // Get hash from the CSV
      let mappedOreVeinsDensity = map(hashInput, 19, 30, 0.008, 0.05);

      if (random() < mappedPreciousVeinsDensity) {
        fill(variedColor(preciousColorBase));
        goldTiles++;
      } else if (random() < mappedOreVeinsDensity) {
        fill(variedColor(oreColorBase));
        oreTiles++;
      } else {
        fill(variedColor(landColorBase));
        earthTiles++;
      }
    }
  }

  noStroke();
  rect(x, y, tileSize, tileSize);
}

function generateFromInput() {
  // Get block number from the input field
  let blockNumber = int(blockNumberInput.value());

  // Find the corresponding row in the CSV
  let row = table.findRow(String(blockNumber), 'number');

  if (row) {
    // Set noiseSeed and randomSeed based on the value from the CSV
    let seedValue = row.getNum('number');
    noiseSeed(seedValue);
    randomSeed(seedValue);

    // Regenerate land based on the updated seed
    generateLand();

    // Log the counts
    console.log(`Water Area: ${waterTiles}`);
    console.log(`Earth Area: ${earthTiles}`);
    console.log(`Tree Area: ${treeTiles}`);
    console.log(`Ore Area: ${oreTiles}`);
    console.log(`Gold Area: ${goldTiles}`);

    // Show the canvas after generating
    canvas.show();
  } else {
    console.log(`Block number ${blockNumber} not found in the CSV.`);
  }
}

function getNonce() {
  // Get nonce from the CSV for the current block
  let blockNumber = int(blockNumberInput.value());
  let row = table.findRow(String(blockNumber), 'number');

  if (row) {
    return row.getNum('nonce');
  } else {
    console.log(`Nonce not found for block number ${blockNumber}`);
    return 0; // Default value
  }
}

function getFeeReward() {
  // Get fee reward from the CSV for the current block
  let blockNumber = int(blockNumberInput.value());
  let row = table.findRow(String(blockNumber), 'number');

  if (row) {
    // Round down to the nearest whole number
    return floor(row.getNum('fee_reward'));
  } else {
    console.log(`Fee reward not found for block number ${blockNumber}`);
    return 0; // Default value
  }
}

function getHash() {
  // Get hash from the CSV for the current block
  let blockNumber = int(blockNumberInput.value());
  let row = table.findRow(String(blockNumber), 'number');

  if (row) {
    return row.getString('hash');
  } else {
    console.log(`Hash not found for block number ${blockNumber}`);
    return ''; // Default value
  }
}

function getSeaNoiseThreshold() {
  // Get weight from the CSV for the current block
  let blockNumber = int(blockNumberInput.value());
  let row = table.findRow(String(blockNumber), 'number');

  if (row) {
    // Map weight to seaNoiseThreshold between 0.33 and 0.5
    return map(row.getNum('weight'), 3998741, 32984, 0.33, 0.5);
  } else {
    console.log(`Weight not found for block number ${blockNumber}`);
    return 0.4; // Default value
  }
}

function updateStats() {
  // Assuming waterTiles, earthTiles, treeTiles, oreTiles, and goldTiles are already defined
  let statsHTML = `
    <p>Water Area: ${waterTiles}</p>
    <p>Land Area: ${earthTiles}</p>
    <p>Forests: ${treeTiles}</p>
    <p>Ore Deposits: ${oreTiles}</p>
    <p>Gold Mines: ${goldTiles}</p>
  `;
  // Insert the stats into the 'statsContainer' div
  document.getElementById('statsContainer').innerHTML = statsHTML;
}

