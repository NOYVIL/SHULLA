let grid = [];
let rows = 20;
let cols = 20;
let cellSize = 20;
let color1 = '#000000'; // שחור
let color2 = '#FF0000'; // אדום
let currentColor = color1;
let explosions = [];
let bombLocations = [];
let exploding = false;
let explosionTimer = 0;
let explosionRadius = 5; // רדיוס ההשפעה של הפיצוץ
let bombCount = 10; // מספר הפצצות
let showSettings = false;
let settingsHeight = 160;

function setup() {
  createCanvas(cols * cellSize, rows * cellSize + (showSettings ? settingsHeight : 0));
  setupGrid();
  setupBombs();
}

function setupGrid() {
  // יצירת הגריד
  grid = [];
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = '#FFFFFF'; // התחלה עם רקע לבן
    }
  }
}

function setupBombs() {
  // הוספת פצצות בצורה רנדומלית
  bombLocations = [];
  let remainingBombs = bombCount;
  while (remainingBombs > 0) {
    let x = floor(random(cols));
    let y = floor(random(rows));
    
    // בדיקה שאין פצצה במיקום זה כבר
    if (!bombLocations.some(loc => loc.x === x && loc.y === y)) {
      bombLocations.push({x, y});
      remainingBombs--;
    }
  }
}

function draw() {
  background(255);
  
  // ציור הגריד
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      fill(grid[i][j]);
      stroke(200);
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
  
  // ציור הפיצוצים
  if (exploding) {
    explosionTimer++;
    
    for (let explosion of explosions) {
      // פיצוץ גדול יותר
      let maxExplosionTime = 90;
      let alpha = map(explosionTimer, 0, maxExplosionTime, 255, 0);
      let maxSize = cellSize * explosionRadius * 2;
      let size = map(explosionTimer, 0, maxExplosionTime, cellSize, maxSize);
      
      // גרדיאנט לפיצוץ
      for (let r = size; r > 0; r -= 20) {
        let alphaGradient = alpha * (r / size);
        fill(255, 165, 0, alphaGradient); // צבע כתום עם שקיפות
        noStroke();
        ellipse(
          explosion.x * cellSize + cellSize / 2,
          explosion.y * cellSize + cellSize / 2,
          r,
          r
        );
      }
    }
    
    // סיום הפיצוץ
    if (explosionTimer > 90) {
      exploding = false;
      explosionTimer = 0;
      explosions = [];
    }
  }
  
  // ציור פאנל ההגדרות
  if (showSettings) {
    drawSettings();
  }
  
  // ציור כפתור ההגדרות
  drawSettingsButton();
}

function drawSettingsButton() {
  // ציור כפתור הגדרות
  fill(150);
  rect(width - 40, 10, 30, 30, 5);
  fill(255);
  text("⚙️", width - 33, 30);
}

function drawSettings() {
  let settingsY = rows * cellSize;
  
  // רקע הגדרות
  fill(240);
  rect(0, settingsY, width, settingsHeight);
  
  // כותרת
  fill(0);
  textSize(18);
  text("הגדרות", 10, settingsY + 25);
  textSize(12);
  
  // הגדרת צבעים
  text("צבע 1:", 10, settingsY + 50);
  fill(color1);
  rect(60, settingsY + 40, 20, 20);
  
  text("צבע 2:", 10, settingsY + 80);
  fill(color2);
  rect(60, settingsY + 70, 20, 20);
  
  // הגדרת גודל רשת
  fill(0);
  text("גודל רשת:", 120, settingsY + 50);
  fill(255);
  rect(180, settingsY + 40, 50, 20);
  fill(0);
  text(cols + "x" + rows, 190, settingsY + 55);
  
  // הגדרת גודל תא
  fill(0);
  text("גודל פיקסל:", 120, settingsY + 80);
  fill(255);
  rect(180, settingsY + 70, 50, 20);
  fill(0);
  text(cellSize, 200, settingsY + 85);
  
  // הגדרת מספר פצצות
  fill(0);
  text("מספר פצצות:", 260, settingsY + 50);
  fill(255);
  rect(340, settingsY + 40, 30, 20);
  fill(0);
  text(bombCount, 350, settingsY + 55);
  
  // הגדרת רדיוס פיצוץ
  fill(0);
  text("רדיוס פיצוץ:", 260, settingsY + 80);
  fill(255);
  rect(340, settingsY + 70, 30, 20);
  fill(0);
  text(explosionRadius, 350, settingsY + 85);
  
  // כפתור החלת שינויים
  fill(100, 200, 100);
  rect(width - 120, settingsY + 120, 100, 30, 5);
  fill(255);
  text("החל שינויים", width - 105, settingsY + 140);
  
  // כפתור איפוס
  fill(200, 100, 100);
  rect(width - 240, settingsY + 120, 100, 30, 5);
  fill(255);
  text("איפוס", width - 210, settingsY + 140);
}

function mousePressed() {
  // בדיקה אם לחצו על כפתור ההגדרות
  if (mouseX > width - 40 && mouseX < width - 10 && mouseY > 10 && mouseY < 40) {
    showSettings = !showSettings;
    resizeCanvas(cols * cellSize, rows * cellSize + (showSettings ? settingsHeight : 0));
    return;
  }

  // בדיקה אם הלחיצה הייתה באזור ההגדרות כשהוא פתוח
  if (showSettings && mouseY > rows * cellSize) {
    handleSettingsClick();
    return;
  }
  
  // חישוב המיקום בגריד
  let x = floor(mouseX / cellSize);
  let y = floor(mouseY / cellSize);
  
  // בדיקה שהמיקום בתוך הגריד
  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    // בדיקה אם יש פצצה במיקום זה
    let bombIndex = bombLocations.findIndex(loc => loc.x === x && loc.y === y);
    
    if (bombIndex !== -1) {
      // פיצוץ!
      explosions.push({x, y});
      exploding = true;
      explosionTimer = 0;
      
      // צביעה רנדומלית של מספר פיקסלים סביב הפצצה - הגדלת האזור המושפע
      let pixelsToColor = floor(random(explosionRadius * 5, explosionRadius * 10));
      for (let i = 0; i < pixelsToColor; i++) {
        let offsetX = floor(random(-explosionRadius, explosionRadius + 1));
        let offsetY = floor(random(-explosionRadius, explosionRadius + 1));
        let newX = x + offsetX;
        let newY = y + offsetY;
        
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
          // סיכוי גבוה יותר לצבוע פיקסלים קרובים
          let distance = sqrt(offsetX * offsetX + offsetY * offsetY);
          if (random() > distance / explosionRadius) {
            grid[newX][newY] = random() > 0.5 ? color1 : color2;
          }
        }
      }
      
      // הסרת הפצצה מהרשימה
      bombLocations.splice(bombIndex, 1);
    } else {
      // החלפת צבע הפיקסל
      grid[x][y] = grid[x][y] === color1 ? color2 : color1;
    }
  }
}

function handleSettingsClick() {
  let settingsY = rows * cellSize;
  
  // בדיקת לחיצה על צבע 1
  if (mouseX > 60 && mouseX < 80 && mouseY > settingsY + 40 && mouseY < settingsY + 60) {
    let newColor = prompt("הכנס צבע חדש (קוד HEX, לדוגמה #00FF00):", color1);
    if (newColor && isValidHexColor(newColor)) {
      color1 = newColor;
    }
  }
  
  // בדיקת לחיצה על צבע 2
  if (mouseX > 60 && mouseX < 80 && mouseY > settingsY + 70 && mouseY < settingsY + 90) {
    let newColor = prompt("הכנס צבע חדש (קוד HEX, לדוגמה #0000FF):", color2);
    if (newColor && isValidHexColor(newColor)) {
      color2 = newColor;
    }
  }
  
  // בדיקת לחיצה על גודל רשת
  if (mouseX > 180 && mouseX < 230 && mouseY > settingsY + 40 && mouseY < settingsY + 60) {
    let newSize = prompt("הכנס גודל רשת חדש (לדוגמה 30):", cols);
    if (newSize && !isNaN(newSize) && newSize > 5 && newSize <= 50) {
      cols = parseInt(newSize);
      rows = parseInt(newSize);
      resizeCanvas(cols * cellSize, rows * cellSize + (showSettings ? settingsHeight : 0));
      setupGrid();
      setupBombs();
    }
  }
  
  // בדיקת לחיצה על גודל פיקסל
  if (mouseX > 180 && mouseX < 230 && mouseY > settingsY + 70 && mouseY < settingsY + 90) {
    let newSize = prompt("הכנס גודל פיקסל חדש (לדוגמה 15):", cellSize);
    if (newSize && !isNaN(newSize) && newSize > 5 && newSize <= 40) {
      cellSize = parseInt(newSize);
      resizeCanvas(cols * cellSize, rows * cellSize + (showSettings ? settingsHeight : 0));
    }
  }
  
  // בדיקת לחיצה על מספר פצצות
  if (mouseX > 340 && mouseX < 370 && mouseY > settingsY + 40 && mouseY < settingsY + 60) {
    let newCount = prompt("הכנס מספר פצצות חדש:", bombCount);
    if (newCount && !isNaN(newCount) && newCount >= 0 && newCount <= cols * rows / 3) {
      bombCount = parseInt(newCount);
      setupBombs();
    }
  }
  
  // בדיקת לחיצה על רדיוס פיצוץ
  if (mouseX > 340 && mouseX < 370 && mouseY > settingsY + 70 && mouseY < settingsY + 90) {
    let newRadius = prompt("הכנס רדיוס פיצוץ חדש (1-10):", explosionRadius);
    if (newRadius && !isNaN(newRadius) && newRadius >= 1 && newRadius <= 10) {
      explosionRadius = parseInt(newRadius);
    }
  }
  
  // בדיקת לחיצה על כפתור החלת שינויים
  if (mouseX > width - 120 && mouseX < width - 20 && mouseY > settingsY + 120 && mouseY < settingsY + 150) {
    // השינויים כבר מוחלים בזמן אמת
    showSettings = false;
    resizeCanvas(cols * cellSize, rows * cellSize + (showSettings ? settingsHeight : 0));
  }
  
  // בדיקת לחיצה על כפתור איפוס
  if (mouseX > width - 240 && mouseX < width - 140 && mouseY > settingsY + 120 && mouseY < settingsY + 150) {
    resetSketch();
  }
}

function resetSketch() {
  // איפוס כל ההגדרות לברירת המחדל
  rows = 20;
  cols = 20;
  cellSize = 20;
  color1 = '#000000';
  color2 = '#FF0000';
  currentColor = color1;
  bombCount = 10;
  explosionRadius = 5;
  setupGrid();
  setupBombs();
  resizeCanvas(cols * cellSize, rows * cellSize + (showSettings ? settingsHeight : 0));
}

function keyPressed() {
  if (key === 'c' || key === 'C') {
    // ניקוי הגריד
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j] = '#FFFFFF';
      }
    }
  } else if (key === '1') {
    currentColor = color1;
  } else if (key === '2') {
    currentColor = color2;
  } else if (key === 's' || key === 'S') {
    showSettings = !showSettings;
    resizeCanvas(cols * cellSize, rows * cellSize + (showSettings ? settingsHeight : 0));
  }
}

function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}
