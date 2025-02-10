const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const GRID_SIZE = 20;
const GRID_WIDTH = canvas.width / GRID_SIZE;
const GRID_HEIGHT = canvas.height / GRID_SIZE;

// Colors
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const GREEN = '#00FF00';
const RED = '#FF0000';

// Game objects
let snake, food;
let gameSpeed;
let gameLoop;
let running = false;

class Snake {
    constructor() {
        this.length = 1;
        this.positions = [[(canvas.width / 2), (canvas.height / 2)]];
        this.direction = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'][Math.floor(Math.random() * 4)];
        this.score = 0;
    }

    getHeadPosition() {
        return this.positions[0];
    }

    turn(direction) {
        const opposites = {
            'ArrowUp': 'ArrowDown',
            'ArrowDown': 'ArrowUp',
            'ArrowLeft': 'ArrowRight',
            'ArrowRight': 'ArrowLeft'
        };

        if (opposites[direction] !== this.direction) {
            this.direction = direction;
        }
    }

    move() {
        const head = this.getHeadPosition();
        let newX = head[0];
        let newY = head[1];

        switch (this.direction) {
            case 'ArrowUp': newY -= GRID_SIZE; break;
            case 'ArrowDown': newY += GRID_SIZE; break;
            case 'ArrowLeft': newX -= GRID_SIZE; break;
            case 'ArrowRight': newX += GRID_SIZE; break;
        }

        // Check wall collision
        if (newX < 0 || newX >= canvas.width || newY < 0 || newY >= canvas.height) {
            return false;
        }

        // Check self collision
        if (this.positions.slice(2).some(pos => pos[0] === newX && pos[1] === newY)) {
            return false;
        }

        this.positions.unshift([newX, newY]);
        if (this.positions.length > this.length) {
            this.positions.pop();
        }

        return true;
    }

    draw() {
        ctx.fillStyle = GREEN;
        this.positions.forEach((pos, i) => {
            const rect = [pos[0], pos[1], GRID_SIZE, GRID_SIZE];
            ctx.fillRect(...rect);

            // Draw eyes on head
            if (i === 0) {
                const eyeSize = GRID_SIZE / 4;
                const eyeMargin = GRID_SIZE / 4;
                const pupilSize = GRID_SIZE / 8;

                // Calculate eye positions based on direction
                let leftEye, rightEye;
                switch (this.direction) {
                    case 'ArrowUp':
                        leftEye = [pos[0] + eyeMargin, pos[1] + eyeMargin];
                        rightEye = [pos[0] + GRID_SIZE - eyeMargin, pos[1] + eyeMargin];
                        break;
                    case 'ArrowDown':
                        leftEye = [pos[0] + eyeMargin, pos[1] + GRID_SIZE - eyeMargin];
                        rightEye = [pos[0] + GRID_SIZE - eyeMargin, pos[1] + GRID_SIZE - eyeMargin];
                        break;
                    case 'ArrowLeft':
                        leftEye = [pos[0] + eyeMargin, pos[1] + eyeMargin];
                        rightEye = [pos[0] + eyeMargin, pos[1] + GRID_SIZE - eyeMargin];
                        break;
                    case 'ArrowRight':
                        leftEye = [pos[0] + GRID_SIZE - eyeMargin, pos[1] + eyeMargin];
                        rightEye = [pos[0] + GRID_SIZE - eyeMargin, pos[1] + GRID_SIZE - eyeMargin];
                        break;
                }

                // Draw white of eyes
                ctx.fillStyle = WHITE;
                ctx.beginPath();
                ctx.arc(leftEye[0], leftEye[1], eyeSize, 0, Math.PI * 2);
                ctx.arc(rightEye[0], rightEye[1], eyeSize, 0, Math.PI * 2);
                ctx.fill();

                // Draw pupils with slight randomness
                ctx.fillStyle = BLACK;
                const pupilOffset = 2;
                ctx.beginPath();
                ctx.arc(
                    leftEye[0] + Math.random() * pupilOffset * 2 - pupilOffset,
                    leftEye[1] + Math.random() * pupilOffset * 2 - pupilOffset,
                    pupilSize, 0, Math.PI * 2
                );
                ctx.arc(
                    rightEye[0] + Math.random() * pupilOffset * 2 - pupilOffset,
                    rightEye[1] + Math.random() * pupilOffset * 2 - pupilOffset,
                    pupilSize, 0, Math.PI * 2
                );
                ctx.fill();
            }
        });
    }

    drawScore() {
        ctx.fillStyle = WHITE;
        ctx.font = '36px Arial';
        ctx.fillText(`Score: ${this.score}`, 10, 40);
    }
}

class Food {
    constructor() {
        this.position = [0, 0];
        this.randomizePosition();
    }

    randomizePosition() {
        this.position = [
            Math.floor(Math.random() * GRID_WIDTH) * GRID_SIZE,
            Math.floor(Math.random() * GRID_HEIGHT) * GRID_SIZE
        ];
    }

    draw() {
        ctx.fillStyle = RED;
        ctx.fillRect(this.position[0], this.position[1], GRID_SIZE, GRID_SIZE);
    }
}

function setupGame() {
    const difficultyScreen = document.getElementById('difficultyScreen');
    const gameControls = document.getElementById('controls');
    
    difficultyScreen.style.display = 'flex';
    gameControls.style.display = 'none';
    canvas.style.display = 'none';

    document.getElementById('easyBtn').onclick = () => startGame(5);
    document.getElementById('mediumBtn').onclick = () => startGame(10);
    document.getElementById('hardBtn').onclick = () => startGame(15);
}

function startGame(speed) {
    gameSpeed = speed;
    const difficultyScreen = document.getElementById('difficultyScreen');
    const gameControls = document.getElementById('controls');
    
    difficultyScreen.style.display = 'none';
    gameControls.style.display = 'grid';
    canvas.style.display = 'block';

    snake = new Snake();
    food = new Food();
    running = true;

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, 1000 / gameSpeed);
}

function gameStep() {
    if (!running) return;

    if (!snake.move()) {
        gameOver();
        return;
    }

    const head = snake.getHeadPosition();
    if (head[0] === food.position[0] && head[1] === food.position[1]) {
        snake.length += 1;
        snake.score += 1;
        food.randomizePosition();
    }

    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.draw();
    food.draw();
    snake.drawScore();
}

function gameOver() {
    running = false;
    clearInterval(gameLoop);

    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = WHITE;
    ctx.font = '36px Arial';
    const text = `Game Over! Score: ${snake.score}`;
    const textMetrics = ctx.measureText(text);
    ctx.fillText(text, (canvas.width - textMetrics.width) / 2, canvas.height / 2);

    setTimeout(() => {
        setupGame();
    }, 2000);
}

// Event Listeners
document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        snake.turn(event.key);
    }
});

// Touch controls
document.getElementById('upBtn').onclick = () => snake.turn('ArrowUp');
document.getElementById('downBtn').onclick = () => snake.turn('ArrowDown');
document.getElementById('leftBtn').onclick = () => snake.turn('ArrowLeft');
document.getElementById('rightBtn').onclick = () => snake.turn('ArrowRight');

// Start the game
setupGame();