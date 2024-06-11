window.onload = function () {
    // ignore this part if you want to focus on game coding
    // it sets up the canvas & key detection in the browser
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 128; // Set the canvas width
    canvas.height = 128; // Set the canvas height
    canvas.style.left = "30px"; // consider centering / styles
    canvas.style.top = "30px";
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);
    var sprsize = 8;

// Define player properties
let player = {
    x: 40,
    y: 40,
    speed: 2 // Adjust the speed as needed
};

// Define key mapping
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Event listeners for keydown and keyup events
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Functions to handle key events
function keyDownHandler(e) {
    keys[e.code] = true;
}

function keyUpHandler(e) {
    keys[e.code] = false;
}

// Update function to handle player movement
function update() {
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - sprsize) {
        player.x += player.speed;
    }
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < canvas.height - sprsize) {
        player.y += player.speed;
    }
}

// Draw function to render the player
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the player
    ctx.fillStyle = "blue"; // Set player color
    ctx.fillRect(player.x, player.y, sprsize, sprsize); // Render player as a square (adjust as needed)
}

// Start the game loop
gameLoop();

}
