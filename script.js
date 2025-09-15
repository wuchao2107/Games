class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.generateFood();
        this.updateHighScore();
        this.drawGame();
    }
    
    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const goingUp = this.dy === -1;
        const goingDown = this.dy === 1;
        const goingRight = this.dx === 1;
        const goingLeft = this.dx === -1;
        
        if (e.keyCode === 37 && !goingRight) { // 左箭头
            this.dx = -1;
            this.dy = 0;
        }
        if (e.keyCode === 38 && !goingDown) { // 上箭头
            this.dx = 0;
            this.dy = -1;
        }
        if (e.keyCode === 39 && !goingLeft) { // 右箭头
            this.dx = 1;
            this.dy = 0;
        }
        if (e.keyCode === 40 && !goingUp) { // 下箭头
            this.dx = 0;
            this.dy = 1;
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        
        if (this.dx === 0 && this.dy === 0) {
            this.dx = 1;
            this.dy = 0;
        }
        
        this.gameLoop();
        
        document.getElementById('start-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        document.getElementById('pause-btn').textContent = this.gamePaused ? '继续' : '暂停';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.generateFood();
        this.drawGame();
        
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('pause-btn').textContent = '暂停';
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.updateSnake();
        
        if (this.checkGameOver()) {
            this.endGame();
            return;
        }
        
        this.drawGame();
        setTimeout(() => this.gameLoop(), 200);
    }
    
    updateSnake() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }
    
    checkGameOver() {
        const head = this.snake[0];
        
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    endGame() {
        this.gameRunning = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }
        
        this.showGameOverMessage();
        
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    }
    
    showGameOverMessage() {
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>游戏结束!</h2>
            <p>最终得分: ${this.score}</p>
            <button onclick="this.parentElement.remove()">确定</button>
        `;
        
        document.body.appendChild(gameOverDiv);
    }
    
    updateHighScore() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    drawGame() {
        this.clearCanvas();
        this.drawSnake();
        this.drawFood();
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#f7fafc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawSnake() {
        this.ctx.fillStyle = '#48bb78';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#2f855a';
            } else {
                this.ctx.fillStyle = '#48bb78';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
    }
    
    drawFood() {
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
        
        this.ctx.fillStyle = '#c53030';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 4,
            this.food.y * this.gridSize + 4,
            this.gridSize - 10,
            this.gridSize - 10
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});