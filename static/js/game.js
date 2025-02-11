class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.startBtn = document.getElementById('startBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalScoreElement = document.getElementById('finalScore');
        this.playerNameInput = document.getElementById('playerName');
        this.submitScoreBtn = document.getElementById('submitScore');
        this.playAgainBtn = document.getElementById('playAgain');
        this.highScoresList = document.getElementById('highScoresList');

        // Set canvas size
        this.canvas.width = 300;
        this.canvas.height = 300;
        
        // Grid settings
        this.gridSize = 15;
        this.tileSize = this.canvas.width / this.gridSize;

        // Game state
        this.reset();
        
        // Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        this.start = this.start.bind(this);
        
        // Event listeners
        this.startBtn.addEventListener('click', this.start);
        document.addEventListener('keydown', this.handleKeyPress);
        this.submitScoreBtn.addEventListener('click', () => this.submitScore());
        this.playAgainBtn.addEventListener('click', () => this.restart());
        
        // Mobile controls
        this.setupMobileControls();
        
        // Load high scores
        this.loadHighScores();
    }

    reset() {
        this.snake = [{x: 7, y: 7}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameOver = false;
        this.scoreElement.textContent = this.score;
    }

    generateFood() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(segment => segment.x === position.x && segment.y === position.y));
        return position;
    }

    start() {
        this.reset();
        this.startBtn.style.display = 'none';
        this.gameOverModal.style.display = 'none';
        this.gameLoop();
    }

    restart() {
        this.gameOverModal.style.display = 'none';
        this.start();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = '#32CD32';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Draw head with eyes
                this.ctx.fillRect(
                    segment.x * this.tileSize,
                    segment.y * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );
                
                // Draw eyes
                this.ctx.fillStyle = '#000000';
                const eyeSize = this.tileSize / 6;
                const eyeOffset = this.tileSize / 4;
                
                switch(this.direction) {
                    case 'right':
                        this.ctx.fillRect(
                            (segment.x + 1) * this.tileSize - eyeOffset,
                            segment.y * this.tileSize + eyeOffset,
                            eyeSize,
                            eyeSize
                        );
                        this.ctx.fillRect(
                            (segment.x + 1) * this.tileSize - eyeOffset,
                            (segment.y + 1) * this.tileSize - eyeOffset - eyeSize,
                            eyeSize,
                            eyeSize
                        );
                        break;
                    case 'left':
                        this.ctx.fillRect(
                            segment.x * this.tileSize + eyeOffset - eyeSize,
                            segment.y * this.tileSize + eyeOffset,
                            eyeSize,
                            eyeSize
                        );
                        this.ctx.fillRect(
                            segment.x * this.tileSize + eyeOffset - eyeSize,
                            (segment.y + 1) * this.tileSize - eyeOffset - eyeSize,
                            eyeSize,
                            eyeSize
                        );
                        break;
                    case 'up':
                        this.ctx.fillRect(
                            segment.x * this.tileSize + eyeOffset,
                            segment.y * this.tileSize + eyeOffset - eyeSize,
                            eyeSize,
                            eyeSize
                        );
                        this.ctx.fillRect(
                            (segment.x + 1) * this.tileSize - eyeOffset - eyeSize,
                            segment.y * this.tileSize + eyeOffset - eyeSize,
                            eyeSize,
                            eyeSize
                        );
                        break;
                    case 'down':
                        this.ctx.fillRect(
                            segment.x * this.tileSize + eyeOffset,
                            (segment.y + 1) * this.tileSize - eyeOffset,
                            eyeSize,
                            eyeSize
                        );
                        this.ctx.fillRect(
                            (segment.x + 1) * this.tileSize - eyeOffset - eyeSize,
                            (segment.y + 1) * this.tileSize - eyeOffset,
                            eyeSize,
                            eyeSize
                        );
                        break;
                }
                this.ctx.fillStyle = '#32CD32';
            } else {
                this.ctx.fillRect(
                    segment.x * this.tileSize,
                    segment.y * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );
            }
        });

        // Draw food
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.food.x + 0.5) * this.tileSize,
            (this.food.y + 0.5) * this.tileSize,
            this.tileSize / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    move() {
        this.direction = this.nextDirection;
        const head = {...this.snake[0]};
        
        // Move head based on direction
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver = true;
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check if food was eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= this.gridSize || 
            head.y < 0 || head.y >= this.gridSize) {
            return true;
        }

        // Self collision
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    handleKeyPress(event) {
        const key = event.key.toLowerCase();
        
        // Prevent reversing direction
        switch(key) {
            case 'arrowup':
            case 'w':
                if (this.direction !== 'down') this.nextDirection = 'up';
                break;
            case 'arrowdown':
            case 's':
                if (this.direction !== 'up') this.nextDirection = 'down';
                break;
            case 'arrowleft':
            case 'a':
                if (this.direction !== 'right') this.nextDirection = 'left';
                break;
            case 'arrowright':
            case 'd':
                if (this.direction !== 'left') this.nextDirection = 'right';
                break;
        }
    }

    setupMobileControls() {
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');

        upBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.direction !== 'down') this.nextDirection = 'up';
        });

        downBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.direction !== 'up') this.nextDirection = 'down';
        });

        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.direction !== 'right') this.nextDirection = 'left';
        });

        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.direction !== 'left') this.nextDirection = 'right';
        });
    }

    async loadHighScores() {
        try {
            const response = await fetch('/get_high_scores');
            const scores = await response.json();
            this.updateHighScoresList(scores);
        } catch (error) {
            console.error('Error loading high scores:', error);
        }
    }

    updateHighScoresList(scores) {
        this.highScoresList.innerHTML = '';
        scores.forEach((score, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${score.name}: ${score.score}`;
            this.highScoresList.appendChild(li);
        });
    }

    async submitScore() {
        const name = this.playerNameInput.value.trim() || 'Anonymous';
        try {
            await fetch('/submit_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    score: this.score
                })
            });
            await this.loadHighScores();
        } catch (error) {
            console.error('Error submitting score:', error);
        }
    }

    gameLoop() {
        if (!this.gameOver) {
            this.move();
            this.draw();
            
            // Calculate speed based on score (game gets faster as score increases)
            const baseSpeed = 150;
            const speedIncrease = Math.floor(this.score / 50) * 10;
            const gameSpeed = Math.max(baseSpeed - speedIncrease, 70);
            
            setTimeout(this.gameLoop, gameSpeed);
        } else {
            this.finalScoreElement.textContent = this.score;
            this.gameOverModal.style.display = 'block';
            this.startBtn.style.display = 'block';
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});