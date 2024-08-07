var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/* ************************* */
var Paint2D = function (canvas) {
    var ctx = canvas.getContext("2d");
    if (ctx === null) {
        throw new Error("2D Rendering context is not supported.");
    }
    return {
        background: function (style) {
            this.rectangle(0, 0, canvas.width, canvas.height, { fillStyle: style });
        },
        withinPath: function (path) {
            ctx.beginPath();
            path();
            ctx.closePath();
        },
        grid: function (columns, rows, options) {
            for (var x = 1; x < columns; x++) {
                var lineLength = (canvas.width / columns) * x;
                this.line(lineLength, 0, lineLength, canvas.height, {
                    color: options.color,
                    width: options.width,
                });
            }
            for (var y = 1; y < rows; y++) {
                var lineLength = (canvas.height / rows) * y;
                this.line(0, lineLength, canvas.width, lineLength, {
                    color: options.color,
                    width: options.width,
                });
            }
        },
        circle: function (x, y, radius, options) {
            this.withinPath(function () {
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                if (options.fillStyle) {
                    ctx.fillStyle = options.fillStyle;
                    ctx.fill();
                }
                else if (options.strokeStyle) {
                    ctx.strokeStyle = options.strokeStyle;
                    ctx.stroke();
                }
                else if (options.fillStyle && options.strokeStyle) {
                    console.log("TODO");
                }
            });
        },
        rectangle: function (x, y, width, height, options) {
            this.withinPath(function () {
                ctx.rect(x, y, width, height);
                if (options.fillStyle) {
                    ctx.fillStyle = options.fillStyle;
                    ctx.fill();
                }
                else if (options.strokeStyle) {
                    ctx.strokeStyle = options.strokeStyle;
                    ctx.stroke();
                }
                else if (options.fillStyle && options.strokeStyle) {
                    console.log("TODO");
                }
            });
        },
        line: function (x1, y1, x2, y2, options) {
            this.withinPath(function () {
                ctx.strokeStyle = options.color;
                ctx.lineWidth = options.width;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            });
        },
        render: function (draw) {
            ctx.reset();
            draw();
        },
    };
};
/* ****************************** */
var canvas = document.getElementById("canvas");
if (canvas === null) {
    throw new Error("Canvas element was not found in document.");
}
var FRAME_RATE = 15;
var FRAME_INTERVAL = 1000 / FRAME_RATE;
var CELL_SIZE = 15;
var CANVAS_WIDTH = 500;
var CANVAS_HEIGHT = 500;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
var paint = Paint2D(canvas);
// Create canvas
// Create a snake that has a position x and y
// Draw it in the canvas
// Implement keyboard events to move it
// Implement food that spawns randomly
// If snakes eats the food (is in the same spot)
//    then food spawns again
// If snakes eats the food then it becomes longer
// TODO: Food cannot spawn where the snake is
// TODO: Snake dies when hitting edges
// TODO: Snake dies when hitting itself
// TODO: Success message with max snake length (grid^2-1?)
var Snake = /** @class */ (function () {
    function Snake(x, y) {
        this.x = x;
        this.y = y;
        this.dx = 1;
        this.dy = 0;
        this.position = [this.x, this.y];
        this.tail = [];
    }
    Snake.prototype.left = function () {
        if (this.dx === 1 && this.dy === 0)
            return;
        this.dx = -1;
        this.dy = 0;
    };
    Snake.prototype.right = function () {
        if (this.dx === -1 && this.dy === 0)
            return;
        this.dx = 1;
        this.dy = 0;
    };
    Snake.prototype.up = function () {
        if (this.dx === 0 && this.dy === 1)
            return;
        this.dx = 0;
        this.dy = -1;
    };
    Snake.prototype.down = function () {
        if (this.dx === 0 && this.dy === -1)
            return;
        this.dx = 0;
        this.dy = 1;
    };
    Snake.prototype.move = function () {
        if (this.tail.length > 0) {
            this.tail.unshift([this.x, this.y]);
            this.tail.pop();
        }
        this.x += this.dx * CELL_SIZE;
        this.y += this.dy * CELL_SIZE;
        this.position = [this.x, this.y];
    };
    Snake.prototype.eat = function () {
        this.tail.push([this.x, this.y]);
    };
    return Snake;
}());
var Food = /** @class */ (function () {
    function Food() {
        this.x = Math.floor(Math.random() * (CANVAS_WIDTH / CELL_SIZE)) * CELL_SIZE;
        this.y =
            Math.floor(Math.random() * (CANVAS_HEIGHT / CELL_SIZE)) * CELL_SIZE;
        this.position = [this.x, this.y];
    }
    Food.prototype.spawn = function () {
        paint.rectangle(this.x, this.y, CELL_SIZE, CELL_SIZE, {
            fillStyle: "magenta",
        });
    };
    Food.prototype.respawn = function () {
        this.x = Math.floor(Math.random() * (CANVAS_WIDTH / CELL_SIZE)) * CELL_SIZE;
        this.y =
            Math.floor(Math.random() * (CANVAS_HEIGHT / CELL_SIZE)) * CELL_SIZE;
        this.position = [this.x, this.y];
    };
    return Food;
}());
var snake = new Snake(CELL_SIZE, CELL_SIZE);
var food = new Food();
var distance = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
};
var prevTimestamp = 0;
var run = function (timestamp) {
    if (timestamp - prevTimestamp < FRAME_INTERVAL) {
        requestAnimationFrame(run);
        return;
    }
    prevTimestamp = timestamp;
    snake.move();
    paint.render(function () {
        paint.background("black");
        paint.rectangle(snake.x, snake.y, CELL_SIZE, CELL_SIZE, {
            fillStyle: "white",
        });
        for (var i = 0; i < snake.tail.length; i++) {
            var _a = snake.tail[i], x = _a[0], y = _a[1];
            paint.rectangle(x, y, CELL_SIZE, CELL_SIZE, {
                fillStyle: "white",
            });
        }
        food.spawn();
        if (distance.apply(void 0, __spreadArray(__spreadArray([], snake.position, false), food.position, false)) <= 0) {
            snake.eat();
            food.respawn();
        }
    });
    requestAnimationFrame(run);
};
requestAnimationFrame(run);
var keyDownPressed = function (event) {
    // prettier-ignore
    switch (event.key) {
        case "ArrowUp":
            snake.up();
            break;
        case "ArrowDown":
            snake.down();
            break;
        case "ArrowRight":
            snake.right();
            break;
        case "ArrowLeft":
            snake.left();
            break;
    }
};
window.addEventListener("keydown", keyDownPressed);
