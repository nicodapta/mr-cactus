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
    isGameOver: false
};

// Character properties
const character = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
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
    const width = 40;
    const height = 40;
    return {
        x: Math.random() * (canvas.width - width),
        y: -height,
        width: width,
        height: height,
        color: '#FF4444'
    };
}

// Draw the character
function drawCharacter() {
    ctx.fillStyle = character.color;
    ctx.fillRect(character.x, character.y, character.width, character.height);
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Draw score
function drawScore() {
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 20, 40);
}

// Update obstacles
function updateObstacles() {
    // Add new obstacle randomly
    if (Math.random() < 0.02) {
        obstacles.push(createObstacle());
    }

    // Move obstacles down
    obstacles.forEach(obstacle => {
        obstacle.y += gameState.speed;
    });

    // Remove obstacles that are off screen
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);

    // Check for collisions
    obstacles.forEach(obstacle => {
        if (checkCollision(character, obstacle)) {
            gameState.isGameOver = true;
        }
    });

    // Update score
    gameState.score += obstacles.length;
}

// Check collision between character and obstacle
function checkCollision(char, obstacle) {
    return char.x < obstacle.x + obstacle.width &&
        char.x + char.width > obstacle.x &&
        char.y < obstacle.y + obstacle.height &&
        char.y + char.height > obstacle.y;
}

// Handle keyboard input
const keys = {
    left: false,
    right: false
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
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
    obstacles = [];
    initCharacter();
}

// Game loop
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameState.isGameOver) {
        // Update game state
        updateCharacter();
        updateObstacles();

        // Draw game elements
        drawCharacter();
        drawObstacles();
        drawScore();
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
