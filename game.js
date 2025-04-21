// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to match container size
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

// Call resize initially and on window resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
const gameState = {
    score: 0,
    speed: 5,
    isGameOver: false,
    lastSpawnTime: 0,
    spawnInterval: 400, // Base spawn interval (0.4 seconds between spawns)
    lastEnemyType: 'tumbleweed', // Track the last enemy type to ensure alternation
    maxEnemiesOnScreen: 3, // Start with 3 enemies on screen
    gameStarted: false, // Track if the game has started
    explosion: {
        active: false,
        x: 0,
        y: 0,
        frame: 0,
        maxFrames: 15, // Number of frames for the explosion animation
        frameDelay: 100, // Delay between frames in ms (for slow motion)
        lastFrameTime: 0
    },
    difficultyLevel: 1, // Track the current difficulty level
    enemySpeed: 5, // Base enemy speed
    spawnChance: 0.7 // Base chance to spawn an enemy (70%)
};

// Character properties
const character = {
    x: 0,
    y: 0,
    width: 85,  // Reduced to ~2/3 (128 * 2/3)
    height: 128, // Reduced to ~2/3 (192 * 2/3)
    color: '#2E8B57',
    speed: 5
};

// Obstacles array
let obstacles = [];

// Initialize character position
function initCharacter() {
    character.x = canvas.width / 2 - character.width / 2;
    character.y = canvas.height - character.height - 20;
}

// Create new obstacle
function createObstacle() {
    const width = 80;  // Size for scorpion
    const height = 80; // Size for scorpion

    // Alternate between scorpion and tumbleweed
    const type = gameState.lastEnemyType === 'scorpion' ? 'tumbleweed' : 'scorpion';
    gameState.lastEnemyType = type; // Update the last enemy type

    return {
        x: Math.random() * (canvas.width - width),
        y: -height,
        width: width,
        height: height,
        color: type === 'scorpion' ? '#8B0000' : '#8B4513', // Dark red for scorpion, brown for tumbleweed
        type: type
    };
}

// Draw 8-bit cactus character
function drawCharacter() {
    const x = character.x;
    const y = character.y;
    const pixelSize = 11; // Reduced to ~2/3 (16 * 2/3)

    // Set colors
    const mainColor = '#2E8B57';    // Main cactus color
    const darkColor = '#1B4D2E';    // Darker shade for depth
    const lightColor = '#3CB371';   // Lighter shade for highlights
    const hatColor = '#FFFFFF';     // White for cowboy hat
    const hatBorderColor = '#CCCCCC'; // Light gray for hat border
    const hatBandColor = '#8B4513'; // Brown for hat band

    // Draw Texas-style cowboy hat
    ctx.fillStyle = hatColor;
    // Hat top (taller and more curved)
    ctx.fillRect(x + 20, y, 45, 15);
    // Hat brim (wider and curved)
    ctx.fillRect(x + 10, y + 10, 65, 12);

    // Hat band
    ctx.fillStyle = hatBandColor;
    ctx.fillRect(x + 20, y + 5, 45, 5);

    // Hat border
    ctx.fillStyle = hatBorderColor;
    ctx.fillRect(x + 10, y + 10, 65, 3);
    ctx.fillRect(x + 20, y, 45, 3);

    // Draw main cactus body
    ctx.fillStyle = mainColor;
    // Main body
    ctx.fillRect(x + 32, y + 21, 21, 85);
    // Left arm
    ctx.fillRect(x + 11, y + 43, 21, 21);
    // Right arm
    ctx.fillRect(x + 53, y + 64, 21, 21);

    // Add darker edges for depth
    ctx.fillStyle = darkColor;
    // Main body edges
    ctx.fillRect(x + 32, y + 21, 5, 85);
    ctx.fillRect(x + 48, y + 21, 5, 85);
    // Arm edges
    ctx.fillRect(x + 11, y + 43, 5, 21);
    ctx.fillRect(x + 27, y + 43, 5, 21);
    ctx.fillRect(x + 53, y + 64, 5, 21);
    ctx.fillRect(x + 69, y + 64, 5, 21);

    // Add highlights
    ctx.fillStyle = lightColor;
    // Main body highlight
    ctx.fillRect(x + 37, y + 27, 5, 75);
    // Arm highlights
    ctx.fillRect(x + 16, y + 48, 5, 11);
    ctx.fillRect(x + 58, y + 69, 5, 11);

    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 37, y + 43, 5, 5);
    ctx.fillRect(x + 48, y + 43, 5, 5);

    // Draw Doug Dimmadome-style mustache
    ctx.fillStyle = '#000';
    // Left side of mustache
    ctx.fillRect(x + 32, y + 53, 10, 3);
    // Middle of mustache
    ctx.fillRect(x + 42, y + 55, 5, 3);
    // Right side of mustache
    ctx.fillRect(x + 47, y + 53, 10, 3);

    // Draw smile
    ctx.fillStyle = '#000';
    // Left side of smile
    ctx.fillRect(x + 37, y + 58, 5, 3);
    // Middle of smile
    ctx.fillRect(x + 42, y + 60, 5, 3);
    // Right side of smile
    ctx.fillRect(x + 47, y + 58, 5, 3);
}

// Draw 8-bit scorpion
function drawScorpion(x, y) {
    // Set colors
    const mainColor = '#8B0000';    // Dark red for body
    const darkColor = '#4B0000';    // Darker shade for depth
    const lightColor = '#CD0000';   // Lighter shade for highlights
    const clawColor = '#FF0000';    // Brighter red for claws
    const legColor = '#A52A2A';     // Brownish-red for legs

    // Draw tail (curved)
    ctx.fillStyle = mainColor;
    // Tail segments
    ctx.fillRect(x + 10, y + 45, 10, 10);
    ctx.fillRect(x + 5, y + 35, 10, 10);
    ctx.fillRect(x + 8, y + 25, 10, 10);
    ctx.fillRect(x + 12, y + 15, 10, 10);

    // Draw stinger
    ctx.fillStyle = darkColor;
    ctx.fillRect(x + 3, y + 10, 8, 5);

    // Draw body
    ctx.fillStyle = mainColor;
    // Main body
    ctx.fillRect(x + 25, y + 30, 20, 15);

    // Draw head
    ctx.fillRect(x + 45, y + 25, 15, 10);

    // Draw claws
    ctx.fillStyle = clawColor;
    // Left claw
    ctx.fillRect(x + 15, y + 20, 12, 8);
    ctx.fillRect(x + 10, y + 15, 8, 8);
    // Right claw
    ctx.fillRect(x + 53, y + 20, 12, 8);
    ctx.fillRect(x + 55, y + 15, 8, 8);

    // Draw legs
    ctx.fillStyle = legColor;
    // Left legs (4 pairs)
    ctx.fillRect(x + 20, y + 35, 6, 6);
    ctx.fillRect(x + 20, y + 42, 6, 6);
    ctx.fillRect(x + 20, y + 49, 6, 6);
    ctx.fillRect(x + 20, y + 56, 6, 6);
    // Right legs (4 pairs)
    ctx.fillRect(x + 54, y + 35, 6, 6);
    ctx.fillRect(x + 54, y + 42, 6, 6);
    ctx.fillRect(x + 54, y + 49, 6, 6);
    ctx.fillRect(x + 54, y + 56, 6, 6);

    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 48, y + 28, 3, 3);
    ctx.fillRect(x + 52, y + 28, 3, 3);

    // Add highlights
    ctx.fillStyle = lightColor;
    // Body highlight
    ctx.fillRect(x + 28, y + 32, 8, 10);
    // Claw highlights
    ctx.fillRect(x + 17, y + 22, 4, 4);
    ctx.fillRect(x + 55, y + 22, 4, 4);
}

// Draw 8-bit tumbleweed
function drawTumbleweed(x, y) {
    // Set colors
    const mainColor = '#8B4513';    // Brown for main body
    const darkColor = '#654321';    // Darker brown for depth
    const lightColor = '#A0522D';   // Lighter brown for highlights

    // Draw main circular body
    ctx.fillStyle = mainColor;
    // Center
    ctx.fillRect(x + 35, y + 35, 10, 10);
    // Top
    ctx.fillRect(x + 30, y + 25, 20, 10);
    // Bottom
    ctx.fillRect(x + 30, y + 45, 20, 10);
    // Left
    ctx.fillRect(x + 25, y + 30, 10, 20);
    // Right
    ctx.fillRect(x + 45, y + 30, 10, 20);

    // Draw outer spikes
    // Top spikes
    ctx.fillRect(x + 25, y + 20, 5, 5);
    ctx.fillRect(x + 35, y + 15, 10, 5);
    ctx.fillRect(x + 50, y + 20, 5, 5);
    // Bottom spikes
    ctx.fillRect(x + 25, y + 55, 5, 5);
    ctx.fillRect(x + 35, y + 60, 10, 5);
    ctx.fillRect(x + 50, y + 55, 5, 5);
    // Left spikes
    ctx.fillRect(x + 15, y + 25, 5, 5);
    ctx.fillRect(x + 10, y + 35, 5, 10);
    ctx.fillRect(x + 15, y + 50, 5, 5);
    // Right spikes
    ctx.fillRect(x + 60, y + 25, 5, 5);
    ctx.fillRect(x + 65, y + 35, 5, 10);
    ctx.fillRect(x + 60, y + 50, 5, 5);

    // Add darker edges for depth
    ctx.fillStyle = darkColor;
    // Center edges
    ctx.fillRect(x + 35, y + 35, 5, 5);
    ctx.fillRect(x + 40, y + 35, 5, 5);
    ctx.fillRect(x + 35, y + 40, 5, 5);
    ctx.fillRect(x + 40, y + 40, 5, 5);

    // Add highlights
    ctx.fillStyle = lightColor;
    // Center highlight
    ctx.fillRect(x + 37, y + 37, 3, 3);
    // Outer highlights
    ctx.fillRect(x + 32, y + 27, 3, 3);
    ctx.fillRect(x + 45, y + 27, 3, 3);
    ctx.fillRect(x + 32, y + 47, 3, 3);
    ctx.fillRect(x + 45, y + 47, 3, 3);
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'scorpion') {
            drawScorpion(obstacle.x, obstacle.y);
        } else if (obstacle.type === 'tumbleweed') {
            drawTumbleweed(obstacle.x, obstacle.y);
        } else {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    });
}

// Draw score
function drawScore() {
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 20, 40);

    // Draw difficulty level
    ctx.fillText(`Level: ${gameState.difficultyLevel}`, 20, 70);

    // Draw enemy speed
    ctx.fillText(`Speed: ${gameState.enemySpeed.toFixed(1)}`, 20, 100);

    // Draw max enemies
    ctx.fillText(`Max Enemies: ${gameState.maxEnemiesOnScreen}`, 20, 130);
}

// Update obstacles
function updateObstacles() {
    const currentTime = Date.now();

    // Check if we need to increase difficulty based on score
    const newDifficultyLevel = Math.floor(gameState.score / 1000) + 1;
    if (newDifficultyLevel > gameState.difficultyLevel) {
        gameState.difficultyLevel = newDifficultyLevel;

        // Decrease spawn interval (faster spawns) as difficulty increases
        // But don't go below 150ms to keep the game playable
        gameState.spawnInterval = Math.max(400 - (gameState.difficultyLevel - 1) * 50, 150);

        // Increase enemy speed as difficulty increases
        gameState.enemySpeed = 5 + (gameState.difficultyLevel - 1) * 0.5;

        // Increase max enemies by 1 every 2 levels (starting at level 3)
        if (gameState.difficultyLevel >= 3 && gameState.difficultyLevel % 2 === 0) {
            gameState.maxEnemiesOnScreen = Math.min(3 + Math.floor((gameState.difficultyLevel - 2) / 2), 8);
        }
    }

    // Add new obstacle if enough time has passed and we haven't reached max enemies
    if (currentTime - gameState.lastSpawnTime >= gameState.spawnInterval &&
        obstacles.length < gameState.maxEnemiesOnScreen) {

        // Random chance to spawn an enemy
        if (Math.random() < gameState.spawnChance) {
            obstacles.push(createObstacle());
            gameState.lastSpawnTime = currentTime;
        }
    }

    // Move obstacles down
    obstacles.forEach(obstacle => {
        obstacle.y += gameState.enemySpeed;
    });

    // Remove obstacles that are off screen
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);

    // Check for collisions
    obstacles.forEach(obstacle => {
        if (checkCollision(character, obstacle)) {
            // Start explosion at collision point (position is now set in the collision check functions)
            if (!gameState.explosion.active) {
                gameState.explosion.active = true;
                gameState.explosion.frame = 0;
                gameState.explosion.lastFrameTime = currentTime;
            }
        }
    });

    // Update score
    gameState.score += obstacles.length;
}

// Check collision between character and obstacle
function checkCollision(char, obstacle) {
    if (obstacle.type === 'scorpion') {
        return checkScorpionCollision(char, obstacle);
    } else if (obstacle.type === 'tumbleweed') {
        return checkTumbleweedCollision(char, obstacle);
    }
    return false;
}

// Define cactus body parts for collision detection
function getCactusBodyParts(x, y) {
    return [
        // Main body
        { x: x + 32, y: y + 21, width: 21, height: 85 },
        // Left arm
        { x: x + 11, y: y + 43, width: 21, height: 21 },
        // Right arm
        { x: x + 53, y: y + 64, width: 21, height: 21 }
    ];
}

// Check collision with scorpion's actual shape
function checkScorpionCollision(char, scorpion) {
    // Get cactus body parts
    const cactusParts = getCactusBodyParts(char.x, char.y);

    // Define the main body parts of the scorpion
    const scorpionParts = [
        // Main body
        { x: scorpion.x + 25, y: scorpion.y + 30, width: 20, height: 15 },
        // Head
        { x: scorpion.x + 45, y: scorpion.y + 25, width: 15, height: 10 },
        // Tail segments
        { x: scorpion.x + 10, y: scorpion.y + 45, width: 10, height: 10 },
        { x: scorpion.x + 5, y: scorpion.y + 35, width: 10, height: 10 },
        { x: scorpion.x + 8, y: scorpion.y + 25, width: 10, height: 10 },
        { x: scorpion.x + 12, y: scorpion.y + 15, width: 10, height: 10 },
        // Claws
        { x: scorpion.x + 15, y: scorpion.y + 20, width: 12, height: 8 },
        { x: scorpion.x + 10, y: scorpion.y + 15, width: 8, height: 8 },
        { x: scorpion.x + 53, y: scorpion.y + 20, width: 12, height: 8 },
        { x: scorpion.x + 55, y: scorpion.y + 15, width: 8, height: 8 }
    ];

    // Check collision between each cactus part and each scorpion part
    for (let i = 0; i < cactusParts.length; i++) {
        const cactusPart = cactusParts[i];

        for (let j = 0; j < scorpionParts.length; j++) {
            const scorpionPart = scorpionParts[j];

            if (cactusPart.x < scorpionPart.x + scorpionPart.width &&
                cactusPart.x + cactusPart.width > scorpionPart.x &&
                cactusPart.y < scorpionPart.y + scorpionPart.height &&
                cactusPart.y + cactusPart.height > scorpionPart.y) {

                // Calculate collision point (center of the overlapping area)
                const overlapX = Math.min(cactusPart.x + cactusPart.width, scorpionPart.x + scorpionPart.width) - Math.max(cactusPart.x, scorpionPart.x);
                const overlapY = Math.min(cactusPart.y + cactusPart.height, scorpionPart.y + scorpionPart.height) - Math.max(cactusPart.y, scorpionPart.y);

                // Store collision point for explosion
                gameState.explosion.x = Math.max(cactusPart.x, scorpionPart.x) + overlapX / 2;
                gameState.explosion.y = Math.max(cactusPart.y, scorpionPart.y) + overlapY / 2;

                return true;
            }
        }
    }
    return false;
}

// Check collision with tumbleweed's actual shape
function checkTumbleweedCollision(char, tumbleweed) {
    // Get cactus body parts
    const cactusParts = getCactusBodyParts(char.x, char.y);

    // Define the main body parts of the tumbleweed
    const tumbleweedParts = [
        // Center
        { x: tumbleweed.x + 35, y: tumbleweed.y + 35, width: 10, height: 10 },
        // Main body
        { x: tumbleweed.x + 30, y: tumbleweed.y + 25, width: 20, height: 10 },
        { x: tumbleweed.x + 30, y: tumbleweed.y + 45, width: 20, height: 10 },
        { x: tumbleweed.x + 25, y: tumbleweed.y + 30, width: 10, height: 20 },
        { x: tumbleweed.x + 45, y: tumbleweed.y + 30, width: 10, height: 20 },
        // Spikes
        { x: tumbleweed.x + 25, y: tumbleweed.y + 20, width: 5, height: 5 },
        { x: tumbleweed.x + 35, y: tumbleweed.y + 15, width: 10, height: 5 },
        { x: tumbleweed.x + 50, y: tumbleweed.y + 20, width: 5, height: 5 },
        { x: tumbleweed.x + 25, y: tumbleweed.y + 55, width: 5, height: 5 },
        { x: tumbleweed.x + 35, y: tumbleweed.y + 60, width: 10, height: 5 },
        { x: tumbleweed.x + 50, y: tumbleweed.y + 55, width: 5, height: 5 },
        { x: tumbleweed.x + 15, y: tumbleweed.y + 25, width: 5, height: 5 },
        { x: tumbleweed.x + 10, y: tumbleweed.y + 35, width: 5, height: 10 },
        { x: tumbleweed.x + 15, y: tumbleweed.y + 50, width: 5, height: 5 },
        { x: tumbleweed.x + 60, y: tumbleweed.y + 25, width: 5, height: 5 },
        { x: tumbleweed.x + 65, y: tumbleweed.y + 35, width: 5, height: 10 },
        { x: tumbleweed.x + 60, y: tumbleweed.y + 50, width: 5, height: 5 }
    ];

    // Check collision between each cactus part and each tumbleweed part
    for (let i = 0; i < cactusParts.length; i++) {
        const cactusPart = cactusParts[i];

        for (let j = 0; j < tumbleweedParts.length; j++) {
            const tumbleweedPart = tumbleweedParts[j];

            if (cactusPart.x < tumbleweedPart.x + tumbleweedPart.width &&
                cactusPart.x + cactusPart.width > tumbleweedPart.x &&
                cactusPart.y < tumbleweedPart.y + tumbleweedPart.height &&
                cactusPart.y + cactusPart.height > tumbleweedPart.y) {

                // Calculate collision point (center of the overlapping area)
                const overlapX = Math.min(cactusPart.x + cactusPart.width, tumbleweedPart.x + tumbleweedPart.width) - Math.max(cactusPart.x, tumbleweedPart.x);
                const overlapY = Math.min(cactusPart.y + cactusPart.height, tumbleweedPart.y + tumbleweedPart.height) - Math.max(cactusPart.y, tumbleweedPart.y);

                // Store collision point for explosion
                gameState.explosion.x = Math.max(cactusPart.x, tumbleweedPart.x) + overlapX / 2;
                gameState.explosion.y = Math.max(cactusPart.y, tumbleweedPart.y) + overlapY / 2;

                return true;
            }
        }
    }
    return false;
}

// Handle keyboard input
const keys = {
    left: false,
    right: false
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ' && !gameState.gameStarted) {
        gameState.gameStarted = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

// Update character position
function updateCharacter() {
    if (keys.left && character.x > 0) {
        character.x -= character.speed;
    }
    if (keys.right && character.x < canvas.width - character.width) {
        character.x += character.speed;
    }
}

// Draw 8-bit title screen
function drawTitleScreen() {
    // Background
    ctx.fillStyle = '#87CEEB'; // Sky blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MR CACTUS', canvas.width / 2, canvas.height / 3);

    // Draw 8-bit style start button
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    const buttonY = canvas.height / 2;

    // Button background
    ctx.fillStyle = '#4CAF50'; // Green color
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Button border
    ctx.fillStyle = '#388E3C'; // Darker green for border
    ctx.fillRect(buttonX, buttonY, buttonWidth, 10); // Top border
    ctx.fillRect(buttonX, buttonY, 10, buttonHeight); // Left border
    ctx.fillRect(buttonX, buttonY + buttonHeight - 10, buttonWidth, 10); // Bottom border
    ctx.fillRect(buttonX + buttonWidth - 10, buttonY, 10, buttonHeight); // Right border

    // Button text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('START GAME', canvas.width / 2, buttonY + 35);

    // Draw blinking "Press SPACE to start" text
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = '#000000';
        ctx.font = '18px Arial';
        ctx.fillText('Press SPACE to start', canvas.width / 2, buttonY + buttonHeight + 40);
    }
}

// Draw background cactus
function drawBackgroundCactus(x, y, scale) {
    const mainColor = '#2E8B57';    // Main cactus color
    const darkColor = '#1B4D2E';    // Darker shade for depth
    const lightColor = '#3CB371';   // Lighter shade for highlights

    // Scale the dimensions
    const width = Math.floor(21 * scale);
    const height = Math.floor(85 * scale);
    const armWidth = Math.floor(21 * scale);
    const armHeight = Math.floor(21 * scale);

    // Draw main cactus body
    ctx.fillStyle = mainColor;
    // Main body
    ctx.fillRect(x, y, width, height);
    // Left arm
    ctx.fillRect(x - armWidth, y + height / 2, armWidth, armHeight);
    // Right arm
    ctx.fillRect(x + width, y + height / 2 + armHeight, armWidth, armHeight);

    // Add darker edges for depth
    ctx.fillStyle = darkColor;
    // Main body edges
    ctx.fillRect(x, y, Math.floor(5 * scale), height);
    ctx.fillRect(x + width - Math.floor(5 * scale), y, Math.floor(5 * scale), height);
    // Arm edges
    ctx.fillRect(x - armWidth, y + height / 2, Math.floor(5 * scale), armHeight);
    ctx.fillRect(x - Math.floor(5 * scale), y + height / 2, Math.floor(5 * scale), armHeight);
    ctx.fillRect(x + width, y + height / 2 + armHeight, Math.floor(5 * scale), armHeight);
    ctx.fillRect(x + width + armWidth - Math.floor(5 * scale), y + height / 2 + armHeight, Math.floor(5 * scale), armHeight);
}

// Draw 8-bit explosion
function drawExplosion() {
    if (!gameState.explosion.active) return;

    const x = gameState.explosion.x;
    const y = gameState.explosion.y;
    const frame = gameState.explosion.frame;

    // Explosion colors
    const colors = [
        '#FF4500', // Orange-red
        '#FF8C00', // Dark orange
        '#FFD700', // Gold
        '#FFFF00', // Yellow
        '#FFFFFF'  // White
    ];

    // Determine which color to use based on frame
    const colorIndex = Math.min(Math.floor(frame / 3), colors.length - 1);
    ctx.fillStyle = colors[colorIndex];

    // Explosion size increases with frame
    const size = 5 + frame * 2;

    // Draw explosion based on frame
    if (frame < 5) {
        // Small explosion
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
    } else if (frame < 10) {
        // Medium explosion
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        ctx.fillRect(x - size / 4, y - size, size / 2, size / 2);
        ctx.fillRect(x - size / 4, y + size / 2, size / 2, size / 2);
        ctx.fillRect(x - size, y - size / 4, size / 2, size / 2);
        ctx.fillRect(x + size / 2, y - size / 4, size / 2, size / 2);
    } else {
        // Large explosion
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        ctx.fillRect(x - size / 4, y - size, size / 2, size / 2);
        ctx.fillRect(x - size / 4, y + size / 2, size / 2, size / 2);
        ctx.fillRect(x - size, y - size / 4, size / 2, size / 2);
        ctx.fillRect(x + size / 2, y - size / 4, size / 2, size / 2);

        // Additional particles
        ctx.fillRect(x - size / 2, y - size / 2, size / 4, size / 4);
        ctx.fillRect(x + size / 4, y - size / 2, size / 4, size / 4);
        ctx.fillRect(x - size / 2, y + size / 4, size / 4, size / 4);
        ctx.fillRect(x + size / 4, y + size / 4, size / 4, size / 4);
    }
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 100);
}

// Reset game
function resetGame() {
    gameState.score = 0;
    gameState.isGameOver = false;
    gameState.lastSpawnTime = 0;
    gameState.lastEnemyType = 'tumbleweed'; // Reset the last enemy type
    gameState.gameStarted = true; // Keep the game started
    gameState.difficultyLevel = 1; // Reset difficulty level
    gameState.spawnInterval = 400; // Reset spawn interval
    gameState.enemySpeed = 5; // Reset enemy speed
    gameState.maxEnemiesOnScreen = 3; // Reset max enemies to 3
    gameState.spawnChance = 0.7; // Reset spawn chance
    obstacles = [];
    initCharacter();
}

// Game loop
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameState.gameStarted) {
        // Draw title screen
        drawTitleScreen();
    } else if (!gameState.isGameOver) {
        // Only update game state if explosion is not active
        if (!gameState.explosion.active) {
            updateCharacter();
            updateObstacles();
        } else {
            // Update only the explosion animation
            const currentTime = Date.now();
            if (currentTime - gameState.explosion.lastFrameTime >= gameState.explosion.frameDelay) {
                gameState.explosion.frame++;
                gameState.explosion.lastFrameTime = currentTime;

                // End explosion when complete
                if (gameState.explosion.frame >= gameState.explosion.maxFrames) {
                    gameState.explosion.active = false;
                    gameState.isGameOver = true;
                }
            }
        }

        // Draw game elements
        drawCharacter();
        drawObstacles();
        drawScore();

        // Draw explosion if active
        if (gameState.explosion.active) {
            drawExplosion();
        }
    } else {
        drawGameOver();
    }

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Handle restart
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && gameState.isGameOver) {
        resetGame();
    }
});

// Initialize the game
function init() {
    initCharacter();
    gameLoop();
}

// Start the game
init();
