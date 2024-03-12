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

const enableDrag = false;  // enables dragging of the image
const test = true;  // disables some front-end elements and enables hard-coded seed
const enableRotate = true;
const rotateSpeed = 3;
const useFrameRate = 60;


// Tile counters
let waterTiles = 0;
let earthTiles = 0;
let treeTiles = 0;
let goldTiles = 0;
let oreTiles = 0;

let table; // variable to store the CSV data
let blockNumberInput;
let canvas;


let canvasSize = 366;

var depth = 400;
var cubesize = 10;
var res = 0.005;
var terrHeight = 200;

let angleX = 0;
let angleY = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let dragging = false;

let row;



function draw() {
  background(0);
  rotateX(0.8);
  
  if (enableDrag){
    dragIt();
  }
  
  if (enableRotate) {
      let angle = radians(frameCount) * rotateSpeed;
      rotateZ(angle);
    
      // let time = millis() / 1000; // Current time in seconds
      // angle = radians(rotationSpeed * time); // Convert speed to radians per second and multiply by elapsed time
      // rotateZ(angle);

  }

  generateFromInput();
}

function dragIt(){
  if (dragging) {
    angleY += (mouseX - prevMouseX) * 0.01;
    angleX += (mouseY - prevMouseY) * 0.01;
  }
  
  // Apply rotation based on mouse movement
  rotateX(angleX);
  rotateY(angleY);

  // Update previous mouse position
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function mousePressed() {
  dragging = true;
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function mouseReleased() {
  dragging = false;
}


function preload() {
  // Load the CSV file using the raw URL
  let csvUrl = 'https://raw.githack.com/TerraBitsNAS/TerraBits/main/terra.csv';
  table = loadTable(csvUrl, 'csv', 'header'); 
}

function setup() {
  
  // Get the input and button from the HTML file

  
  blockNumberInput = select('#blockNumberInput');
  noiseSeed(blockNumberInput);
  
  let generateButton = select('#generateButton');
  
  if (test){
      blockNumberInput = int(591986);
  } else {
    generateButton.mousePressed(generateFromInput);
  }
  console.log(blockNumberInput);
  row = table.findRow(String(blockNumberInput), 'number');
  
  canvas = createCanvas(canvasSize, canvasSize, WEBGL); // WEBGL starts drawing in [0,0,0] which is the middle.
  background(255);
  
  if (enableDrag || enableRotate){
    frameRate(useFrameRate);
  } else {noLoop();}

}

function generateLand() {
  background(0);


  // Reset tile counters
  waterTiles = 0;
  earthTiles = 0;
  treeTiles = 0;
  goldTiles = 0;
  oreTiles = 0;

  for (let x = -canvasSize / 2; x < canvasSize / 2; x += tileSize) {
    for (let y = -canvasSize / 2; y < canvasSize / 2; y += tileSize) {
      let landNoiseVal = noise((x + canvasSize / 2) / 100, (y + canvasSize / 2) / 100);
      let forestNoiseVal = noise((x + canvasSize / 2) / 50, (y + canvasSize / 2) / 50);
      let z = map(landNoiseVal, 0, 1, -terrHeight / 2, terrHeight / 2);

      drawTile(x, y, z, landNoiseVal, forestNoiseVal);

    push();
    translate(x, y, z);
    box(cubesize, cubesize);
    pop();

    // Update statistics next to the generated image
    updateStats();
}    }
  }

function variedColor(baseColor) {
  // Helper function to add subtle color variation
  let variationRange = 7;
  return color(
    baseColor[0] + random(-variationRange, variationRange),
    baseColor[1] + random(-variationRange, variationRange),
    baseColor[2] + random(-variationRange, variationRange)
  );
}

function fillTile(colorBase, x, y, z) {
    tileColor = variedColor(colorBase);

    fill(tileColor); // Apply the determined color

    push(); // Save current drawing state
    translate(x + tileSize / 2, y + tileSize / 2, z + tileSize / 2); // Positioning the tile correctly in 3D space
    noStroke(); // Remove stroke for a cleaner look
    box(tileSize); // Draw the box with the given tileSize
    pop(); // Restore previous drawing state
}

function fillTileTree(x, y, z) {
  //tree
    push();
    translate(x, y, z);
    box(cubesize, cubesize);

    if (y < 85 && random() < 0.2) {
        //tree
        fill(50,50,0);
        translate(0,-cubesize,0);
        cylinder(1, 15, 4, 4);

        fill(100,map(y,0,90,255,100),100);
        translate(0,-14,0);
        sphere(cubesize*0.7, 6, 6);
    }
    pop();
}


function drawTile(x, y, z, landNoiseVal, forestNoiseVal) {
  seaNoiseThreshold = getSeaNoiseThreshold();
  let tileColor;

  if (landNoiseVal < seaNoiseThreshold) {

    // tileColor = variedColor(seaColorBase);
    fillTile(seaColorBase, x, y, z);
    waterTiles++;
  } else {
    if (forestNoiseVal > landNoiseThreshold) {
      let nonce = getNonce(); // Get nonce from the CSV
      let mappedWoodDensity = map(nonce, 1028694, 4288169963, 0.6, 0.9);

      if (random() < mappedWoodDensity) {
        // tileColor = variedColor(woodColorBase);
        //tree
        fillTileTree(x, y, z);
        // fillTile(woodColorBase, x, y, z);
        treeTiles++;
      } else {
        // tileColor = variedColor(landColorBase);
        fillTile(landColorBase, x, y, z);
        earthTiles++;
      }
    } else {
      let feeReward = getFeeReward(); // Get fee reward from the CSV

      let mappedPreciousVeinsDensity = map(feeReward, 0, 9679, 0.008, 0.03);

      let hashInput = getHash(); // Get hash from the CSV
      let mappedOreVeinsDensity = map(hashInput, 19, 30, 0.008, 0.05);

      if (random() < mappedPreciousVeinsDensity) {
        // tileColor = variedColor(preciousColorBase);
        fillTile(preciousColorBase, x, y, z);
        goldTiles++;
      } else if (random() < mappedOreVeinsDensity) {
        // tileColor = variedColor(oreColorBase);
        fillTile(oreColorBase, x, y, z);
        oreTiles++;
      } else {
        // tileColor = variedColor(landColorBase);
        fillTile(landColorBase, x, y, z);
        earthTiles++;
      }
    }
  }
//   fill(tileColor); // Apply the determined color

//   push(); // Save current drawing state
//   translate(x + tileSize / 2, y + tileSize / 2, z + tileSize / 2); // Positioning the tile correctly in 3D space
//   noStroke(); // Remove stroke for a cleaner look
//   box(tileSize); // Draw the box with the given tileSize
//   pop(); // Restore previous drawing state
}

function generateFromInput() {
  // Get block number from the input field
  // let blockNumber = int(blockNumberInput.value());
  // let blockNumber = int(591986);

  // Find the corresponding row in the CSV
  // let row = table.findRow(String(blockNumber), 'number');

  if (row) {
    // Set noiseSeed and randomSeed based on the value from the CSV
    let seedValue = row.getNum('number');
    noiseSeed(seedValue);
    randomSeed(seedValue);

    // Regenerate land based on the updated seed
    generateLand();

    // Log the counts
    // console.log(`Water Area: ${waterTiles}`);
    // console.log(`Earth Area: ${earthTiles}`);
    // console.log(`Tree Area: ${treeTiles}`);
    // console.log(`Ore Area: ${oreTiles}`);
    // console.log(`Gold Area: ${goldTiles}`);

    // Show the canvas after generating
    canvas.show();
  } else {
    console.log(`Block number ${blockNumberInput} not found in the CSV.`);
  }
}

function getNonce() {
  // Get nonce from the CSV for the current block
  // let blockNumber = int(blockNumberInput.value());
  // let blockNumber = int(591986);
  // let row = table.findRow(String(blockNumber), 'number');

  if (row) {
    return row.getNum('nonce');
  } else {
    console.log(`Nonce not found for block number ${blockNumber}`);
    return 0; // Default value
  }
}

function getFeeReward() {
  // Get fee reward from the CSV for the current block
  // let blockNumber = int(blockNumberInput.value());
  // let blockNumber = int(591986);
  // let row = table.findRow(String(blockNumber), 'number');

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
//   let blockNumber = int(blockNumberInput.value());
  // let blockNumber = int(591986);
  // let row = table.findRow(String(blockNumber), 'number');

  if (row) {
    return row.getString('hash');
  } else {
    console.log(`Hash not found for block number ${blockNumber}`);
    return ''; // Default value
  }
}

function getSeaNoiseThreshold() {
  // Get weight from the CSV for the current block
  // let blockNumber = int(blockNumberInput.value());
  // let blockNumber = int(591986);
  // let row = table.findRow(String(blockNumber), 'number');

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
    <p><b>Water Area:</b> ${waterTiles}</p>
    <p><b>Land Area:</b> ${earthTiles}</p>
    <p><b>Forests:</b> ${treeTiles}</p>
    <p><b>Ore Deposits:</b> ${oreTiles}</p>
    <p><b>Gold Mines:</b> ${goldTiles}</p>
  `;
  // Insert the stats into the 'statsContainer' div
  // document.getElementById('statsContainer').innerHTML = statsHTML; // uncomment
}
