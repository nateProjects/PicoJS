    // To do: code schrijven 
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');

// _init section
    var img = new Image();
    img.src = 'booty-sprites.png';
    img.onload = _draw;

function _draw() {
        ctx.drawImage(img, 105, 32, 7, 15, 0, 0, 15, 32);
    }

