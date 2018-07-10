const LOG_CONSOLE = false;

//initial enemy position
const INIT_ENEMY_POSITION = -100;

//number of ticks to pause the game between win/lose
const MID_GAME_PAUSE_TICKS = 125;

//initial player position
const INIT_PLAYER_POSITION = [205, 380];
//player delta x when moving left/right
const PLAYER_MOVE_X = 100;
//player delta y when moving up/down
const PLAYER_MOVE_Y = 80;

// Enemies our player must avoid
// @param initX - intitial X coordinate
// @param initY - intitial Y coordinate
const Enemy = function (initX, initY) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = initX;
    this.y = initY;

    // randomly define DX for moving enemy
    this.regenerateDX();

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

/**
 * function which redefines DX value for moving enemy
 * Speed is defined as a random value between 1 and 5 plus the number of wins by a player
 */
Enemy.prototype.regenerateDX = function () {
    this.dX = Math.floor(Math.random() * 5) + 1 + player.winCounts;
};

/**
 * @returns left boundary of enemy
 */
Enemy.prototype.getLeftBoundary = function () {
    return this.x + 10;
};

/**
 * @returns right boundary of enemy
 */
Enemy.prototype.getRightBoundary = function () {
    return this.getLeftBoundary() + 80;
};

/**
 * @returns top boundary of enemy
 */
Enemy.prototype.getTopBoundary = function () {
    return this.y + 80;
};

/**
 *
 * @returns bottom boundary of enemy
 */
Enemy.prototype.getBottomBoundary = function () {
    return this.getTopBoundary() + 60;
};

/**
 * Update the enemy's position, required method for game
 *
 * @param dt a time delta between ticks
 */
Enemy.prototype.update = function (dt) {
    //if player is in mid game pause then actions should be frozen
    if (player.midGamePause) {
        return;
    }
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x > 505) {
        this.x = INIT_ENEMY_POSITION;
        this.regenerateDX();
    } else {
        this.x += this.dX * dt * 20;
    }

    if (player.enterCollision(this)) {
        if (LOG_CONSOLE) {
            console.log("Collision encountered");
        }
        player.loose();
    }
};


// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

    // ctx.fillStyle = 'black';
    // ctx.fillRect(this.x, this.y, 5, 5);
    // ctx.fillRect(this.x + 10, this.y + 80, 80, 60);
};

// Player class
var Player = function () {
    this.resetPosition();

    // mid game pause is used to freeze game once player wins or looses the game
    this.midGamePause = false;
    this.midGamePauseCounter = 0;

    // number of sequential wins by a player
    this.winCounts = 0;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/char-horn-girl.png';
    this.winSprite = 'images/game-win.png';
    this.looseSprite = 'images/game-fail.png';
};

// reset player initial position on the screen
Player.prototype.resetPosition = function () {
    this.x = INIT_PLAYER_POSITION[0];
    this.y = INIT_PLAYER_POSITION[1];
};

/**
 * Update player logic
 * If player is in the mid game pause then mid game counter is incremented until it is greater or equals to the
 * MID_GAME_PAUSE_TICKS value and midGamePause flag is reset.
 * If player arrives to the water level then it wins the game
 */
Player.prototype.update = function () {
    if (this.midGamePause) {
        this.midGamePauseCounter++;
        if (this.midGamePauseCounter >= MID_GAME_PAUSE_TICKS) {
            this.midGamePauseCounter = 0;
            this.midGamePause = false;
        }
        return;
    }
    if (this.x < 0) {
        this.x = 5;
    } else if (this.x > 420) {
        this.x = 405;
    }
    if (this.y < 20) {
        this.win();
    } else if (this.y > 380) {
        this.y = 380;
    }
};

// Draw the player on the screen
// If player is in the midGamePause state then win or fail image is displayed
Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    if (this.midGamePause) {
        if (this.winCounts > 0) {
            ctx.drawImage(Resources.get(this.winSprite), 100, 225);
        } else {
            ctx.drawImage(Resources.get(this.looseSprite), 150, 225);
        }
    }
    // ctx.fillStyle = 'red';
    // ctx.fillRect(this.x, this.y, 5, 5);
    // ctx.fillRect(this.x + 25, this.y + 100, 50, 50);
};

// Handle player moves
Player.prototype.handleInput = function (key) {
    if (this.midGamePause) {
        return;
    }
    switch (key) {
        case 'left':
            this.x -= PLAYER_MOVE_X;
            break;
        case 'right':
            this.x += PLAYER_MOVE_X;
            break;
        case 'up':
            this.y -= PLAYER_MOVE_Y;
            break;
        case 'down':
            this.y += PLAYER_MOVE_Y;
            break;
    }
};

// Handle player win method: win counter is incremented and enemy speed is regenerated with a chance of a greater speed
Player.prototype.win = function () {
    this.winCounts++;
    this.midGamePause = true;
    for (const enemy of allEnemies) {
        enemy.regenerateDX();
    }
    this.resetPosition();
};

// Handle player loose method: loose counter is reset
Player.prototype.loose = function () {
    this.winCounts = 0;
    this.midGamePause = true;
    this.resetPosition();
};

/**
 * @returns left boundary
 */
Player.prototype.getLeftBoundary = function () {
    return this.x + 25;
};

/**
 * @returns right boundary
 */
Player.prototype.getRightBoundary = function () {
    return this.getLeftBoundary() + 50;
};

/**
 * @returns top boundary
 */
Player.prototype.getTopBoundary = function () {
    return this.y + 100;
};

/**
 * @returns bottom boundary
 */
Player.prototype.getBottomBoundary = function () {
    return this.getTopBoundary() + 50;
};

/**
 * Method detects if enemy enters to the collision with player
 *
 * @param enemy to check the collision
 * @returns {boolean} true when enemy and player boundaries are intersected
 */
Player.prototype.enterCollision = function (enemy) {
    if ((within(enemy.getLeftBoundary(), enemy.getRightBoundary(), this.getLeftBoundary())
        || within(enemy.getLeftBoundary(), enemy.getRightBoundary(), this.getRightBoundary()))
        && (within(enemy.getTopBoundary(), enemy.getBottomBoundary(), this.getTopBoundary())
            || within(enemy.getTopBoundary(), enemy.getBottomBoundary(), this.getBottomBoundary()))) {

        if (LOG_CONSOLE) {
            console.log(`My left: ${this.getLeftBoundary()}; my right: ${this.getRightBoundary()}; my top: ${this.getTopBoundary()}; my bottom: ${this.getBottomBoundary()}`);
            console.log(`His left: ${enemy.getLeftBoundary()}; his right: ${enemy.getRightBoundary()}; his top: ${enemy.getTopBoundary()}; his bottom: ${enemy.getBottomBoundary()}`);
        }
        return true;
    }

    return false;
};

/**
 * @param lb left boundary
 * @param rb right boundary
 * @param point point to check
 * @returns {boolean} true if point is within boundaries
 */
function within(lb, rb, point) {
    return lb <= point && point <= rb;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

const ALLOWED_KEYS = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

const player = new Player();
const allEnemies = [new Enemy(INIT_ENEMY_POSITION, 65), new Enemy(INIT_ENEMY_POSITION, 145), new Enemy(INIT_ENEMY_POSITION, 225)];

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
    player.handleInput(ALLOWED_KEYS[e.keyCode]);
});
