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
let canvasWidth, canvasHeight;
let isMobile = false;

function setup() {
  // בדיקת גודל המסך ועדכון משתנים בהתאם
  checkScreenSize();
  
  // יצירת קנבס רספונסיבי
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('sketch-container'); // במקרה שמשתמשים ב-div ייעודי
  
  setupGrid();
  setupBombs();
  
  // הוספת אירועי מסך מגע
  canvas.touchStarted(handleTouch);
  
  // האזנה לשינויי גודל החלון
  window.addEventListener('resize', windowResized);
}

function checkScreenSize() {
  // בדיקה האם המכשיר הוא מובייל
  isMobile = window.innerWidth < 768;
  
  // התאמת המימדים לגודל החלון
  let maxWidth = min(windowWidth * 0.95, 800);
  let maxHeight = min(windowHeight * 0.8, 800);
  
  if (isMobile) {
    // הגדרות למובייל - פחות תאים וגודל תא מותאם
    cols = 12;
    rows = 12;
    settingsHeight = 180; // יותר שטח להגדרות במובייל
  } else {
    // הגדרות למחשב
    cols = 20;
    rows = 20;
    settingsHeight = 160;
  }
  
  // חישוב גודל התא האופטימלי
  let cellW = maxWidth / cols;
  let cellH = (maxHeight - (showSettings ? settingsHeight : 0)) / rows;
  cellSize = min(cellW, cellH);
  
  // עדכון מימדי הקנבס
  canvasWidth = cellSize * cols;
  canvasHeight = cellSize * rows + (showSettings ? settingsHeight : 0);
}

function windowResized() {
  checkScreenSize();
  resizeCanvas(canvasWidth, canvasHeight);
  setupGrid(); // אופציונלי: לשמור על הציור הקיים או לאתחל מחדש
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
  let remainingBombs = min(bombCount, cols * rows / 4); // הגבלת מספר הפצצות
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
      for (let r = size; r > 0; r -= cellSize/2) {
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
  
  // ציור מידע על הצבע הנוכחי
  drawCurrentColorInfo();
}

function drawCurrentColorInfo() {
  // ציור אינדיקטור לצבע הנוכחי
  let indicatorSize = min(cellSize * 0.8, 30);
  fill(currentColor);
  stroke(0);
  rect(10, 10, indicatorSize, indicatorSize);
  
  // טקסט מידע
  fill(0);
  noStroke();
  textSize(min(cellSize * 0.6, 14));
  text("צבע נוכחי", 10 + indicatorSize + 5, 10 + indicatorSize/2 + 5);
}

function drawSettingsButton() {
  // ציור כפתור הגדרות
  let buttonSize = min(cellSize * 1.5, 40);
  fill(150);
  rect(width - buttonSize - 10, 10, buttonSize, buttonSize, 5);
  fill(255);
  textSize(buttonSize * 0.6);
  text("⚙️", width - buttonSize + 5, buttonSize - 5);
}

function drawSettings() {
  let settingsY = rows * cellSize;
  let buttonWidth = isMobile ? canvasWidth/2 - 20 : 100;
  let inputWidth = isMobile ? 40 : 50;
  let margin = isMobile ? 5 : 10;
  let textSize = isMobile ? 10 : 12;
  let buttonSpace = isMobile ? 5 : 20;
  
  // רקע הגדרות
  fill(240);
  rect(0, settingsY, width, settingsHeight);
  
  // כותרת
  fill(0);
  textSize(isMobile ? 14 : 18);
  text("הגדרות", 10, settingsY + 20);
  textSize(textSize);
  
  // מפריד האזורים לשתי עמודות במצב מובייל
  let col1X = margin;
  let col2X = isMobile ? width/2 + margin : 180;
  
  // הגדרת צבעים
  fill(0);
  text("צבע 1:", col1X, settingsY + 40);
  fill(color1);
  rect(col1X + 50, settingsY + 30, 20, 20);
  
  fill(0);
  text("צבע 2:", col1X, settingsY + 70);
  fill(color2);
  rect(col1X + 50, settingsY + 60, 20, 20);
  
  // הגדרת גודל רשת
  fill(0);
  text("גודל רשת:", col2X, settingsY + 40);
  fill(255);
  rect(col2X + 60, settingsY + 30, inputWidth, 20);
  fill(0);
  text(cols + "x" + rows, col2X + 65, settingsY + 45);
  
  // הגדרת גודל תא
  fill(0);
  text("גודל פיקסל:", col2X, settingsY + 70);
  fill(255);
  rect(col2X + 60, settingsY + 60, inputWidth, 20);
  fill(0);
  text(round(cellSize), col2X + 65, settingsY + 75);
  
  // הגדרת מספר פצצות ורדיוס - עמודה שלישית או שורה חדשה במובייל
  let col3X = isMobile ? col1X : col2X + 150;
  let explosionY = isMobile ? settingsY + 100 : settingsY + 40;
  let bombsY = isMobile ? settingsY + 100 : settingsY + 70;
  
  // הגדרת מספר פצצות
  fill(0);
  text("מס' פצצות:", col3X, bombsY);
  fill(255);
  rect(col3X + 70, bombsY - 10, 30, 20);
  fill(0);
  text(bombCount, col3X + 80, bombsY + 5);
  
  // הגדרת רדיוס פיצוץ
  if (isMobile) {
    col3X = col2X;
  }
  
  fill(0);
  text("רדיוס פיצוץ:", col3X, explosionY);
  fill(255);
  rect(col3X + 70, explosionY - 10, 30, 20);
  fill(0);
  text(explosionRadius, col3X + 80, explosionY + 5);
  
  // כפתורים בתחתית
  let buttonsY = settingsY + (isMobile ? 130 : 110);
  
  // כפתור איפוס
  fill(200, 100, 100);
  rect(margin, buttonsY, buttonWidth, 30, 5);
  fill(255);
  text("איפוס", margin + buttonWidth/2 - 20, buttonsY + 20);
  
  // כפתור החלת שינויים
  fill(100, 200, 100);
  rect(width - margin - buttonWidth, buttonsY, buttonWidth, 30, 5);
  fill(255);
  text("החל שינויים", width - margin - buttonWidth/2 - 30, buttonsY + 20);
}

function handleTouch() {
  // טיפול באירועי מגע - להפעלה על מכשירים ניידים
  return handleInput(touchX, touchY);
}

function mousePressed() {
  // להפעלה על מחשב
  return handleInput(mouseX, mouseY);
}

function handleInput(inputX, inputY) {
  // בדיקה אם לחצו על כפתור ההגדרות
  let buttonSize = min(cellSize * 1.5, 40);
  if (inputX > width - buttonSize - 10 && inputX < width - 10 && inputY > 10 && inputY < 10 + buttonSize) {
    showSettings = !showSettings;
    checkScreenSize();
    resizeCanvas(canvasWidth, canvasHeight);
    return false; // מניעת אירועי לחיצה אחרים בדפדפן
  }

  // בדיקה אם הלחיצה הייתה באזור ההגדרות כשהוא פתוח
  if (showSettings && inputY > rows * cellSize) {
    handleSettingsClick(inputX, inputY);
    return false;
  }
  
  // חישוב המיקום בגריד
  let x = floor(inputX / cellSize);
  let y = floor(inputY / cellSize);
  
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
      let pixelsToColor = floor(random(explosionRadius * 3, explosionRadius * 8));
      let explosionRange = max(2, explosionRadius);
      
      for (let i = 0; i < pixelsToColor; i++) {
        let offsetX = floor(random(-explosionRange, explosionRange + 1));
        let offsetY = floor(random(-explosionRange, explosionRange + 1));
        let newX = x + offsetX;
        let newY = y + offsetY;
        
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
          // סיכוי גבוה יותר לצבוע פיקסלים קרובים
          let distance = sqrt(offsetX * offsetX + offsetY * offsetY);
          if (random() > distance / explosionRange) {
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
  
  return false; // מניעת אירועי לחיצה אחרים בדפדפן
}

function handleSettingsClick(inputX, inputY) {
  let settingsY = rows * cellSize;
  let margin = isMobile ? 5 : 10;
  let col1X = margin;
  let col2X = isMobile ? width/2 + margin : 180;
  let col3X = isMobile ? col1X : col2X + 150;
  let buttonWidth = isMobile ? canvasWidth/2 - 20 : 100;
  let inputWidth = isMobile ? 40 : 50;
  let explosionY = isMobile ? settingsY + 100 : settingsY + 40;
  let bombsY = isMobile ? settingsY + 100 : settingsY + 70;
  
  // בדיקת לחיצה על צבע 1
  if (inputX > col1X + 50 && inputX < col1X + 70 && inputY > settingsY + 30 && inputY < settingsY + 50) {
    let newColor = prompt("הכנס צבע חדש (קוד HEX, לדוגמה #00FF00):", color1);
    if (newColor && isValidHexColor(newColor)) {
      color1 = newColor;
    }
    return;
  }
  
  // בדיקת לחיצה על צבע 2
  if (inputX > col1X + 50 && inputX < col1X + 70 && inputY > settingsY + 60 && inputY < settingsY + 80) {
    let newColor = prompt("הכנס צבע חדש (קוד HEX, לדוגמה #0000FF):", color2);
    if (newColor && isValidHexColor(newColor)) {
      color2 = newColor;
    }
    return;
  }
  
  // בדיקת לחיצה על גודל רשת
  if (inputX > col2X + 60 && inputX < col2X + 60 + inputWidth && inputY > settingsY + 30 && inputY < settingsY + 50) {
    let newSize = prompt("הכנס גודל רשת חדש (לדוגמה 30):", cols);
    if (newSize && !isNaN(newSize)) {
      let size = parseInt(newSize);
      if (size >= 5 && size <= (isMobile ? 20 : 50)) {
        cols = size;
        rows = size;
        checkScreenSize();
        resizeCanvas(canvasWidth, canvasHeight);
        setupGrid();
        setupBombs();
      } else {
        alert("גודל רשת חייב להיות בין 5 ל-" + (isMobile ? "20" : "50"));
      }
    }
    return;
  }
  
  // בדיקת לחיצה על גודל פיקסל
  if (inputX > col2X + 60 && inputX < col2X + 60 + inputWidth && inputY > settingsY + 60 && inputY < settingsY + 80) {
    let newSize = prompt("הכנס גודל פיקסל חדש (לדוגמה 15):", Math.round(cellSize));
    if (newSize && !isNaN(newSize)) {
      let size = parseInt(newSize);
      if (size >= 5 && size <= (isMobile ? 30 : 50)) {
        cellSize = size;
        checkScreenSize();
        resizeCanvas(canvasWidth, canvasHeight);
      } else {
        alert("גודל פיקסל חייב להיות בין 5 ל-" + (isMobile ? "30" : "50"));
      }
    }
    return;
  }
  
  // בדיקת לחיצה על מספר פצצות
  if (inputX > col3X + 70 && inputX < col3X + 100 && inputY > bombsY - 10 && inputY < bombsY + 10) {
    let maxBombs = Math.floor(cols * rows / 4);
    let newCount = prompt("הכנס מספר פצצות חדש (מקסימום " + maxBombs + "):", bombCount);
    if (newCount && !isNaN(newCount)) {
      let count = parseInt(newCount);
      if (count >= 0 && count <= maxBombs) {
        bombCount = count;
        setupBombs();
      } else {
        alert("מספר הפצצות חייב להיות בין 0 ל-" + maxBombs);
      }
    }
    return;
  }
  
  // בדיקת לחיצה על רדיוס פיצוץ
  if (inputX > (isMobile ? col3X : col2X) + 70 && inputX < (isMobile ? col3X : col2X) + 100 && 
      inputY > explosionY - 10 && inputY < explosionY + 10) {
    let newRadius = prompt("הכנס רדיוס פיצוץ חדש (1-10):", explosionRadius);
    if (newRadius && !isNaN(newRadius)) {
      let radius = parseInt(newRadius);
      if (radius >= 1 && radius <= 10) {
        explosionRadius = radius;
      } else {
        alert("רדיוס פיצוץ חייב להיות בין 1 ל-10");
      }
    }
    return;
  }
  
  // בדיקת לחיצה על כפתור החלת שינויים
  let buttonsY = settingsY + (isMobile ? 130 : 110);
  if (inputX > width - margin - buttonWidth && inputX < width - margin && 
      inputY > buttonsY && inputY < buttonsY + 30) {
    showSettings = false;
    checkScreenSize();
    resizeCanvas(canvasWidth, canvasHeight);
    return;
  }
  
  // בדיקת לחיצה על כפתור איפוס
  if (inputX > margin && inputX < margin + buttonWidth && 
      inputY > buttonsY && inputY < buttonsY + 30) {
    resetSketch();
    return;
  }
}

function resetSketch() {
  // איפוס כל ההגדרות לברירת המחדל
  color1 = '#000000';
  color2 = '#FF0000';
  currentColor = color1;
  bombCount = isMobile ? 5 : 10;
  explosionRadius = 5;
  
  checkScreenSize();
  setupGrid();
  setupBombs();
  resizeCanvas(canvasWidth, canvasHeight);
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
    checkScreenSize();
    resizeCanvas(canvasWidth, canvasHeight);
  }
}

function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

// טיפול במגע למכשירים ניידים
function touchStarted() {
  // הפנייה לפונקציית הטיפול הכללית
  return handleInput(touchX, touchY);
}

// מניעת התנהגויות ברירת מחדל של הדפדפן
function touchMoved() {
  return false;
}
