/* ************************* */

type CanvasStyle = string | CanvasGradient | CanvasPattern;

type StyleOptions = {
  fillStyle?: CanvasStyle;
  strokeStyle?: CanvasStyle;
};

type LineOptions = {
  color: CanvasStyle;
  width: number;
};

const Paint2D = function (canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("2D Rendering context is not supported.");
  }

  return {
    background: function (style: CanvasStyle) {
      this.rectangle(0, 0, canvas.width, canvas.height, { fillStyle: style });
    },
    withinPath: function (path: () => void) {
      ctx.beginPath();
      path();
      ctx.closePath();
    },
    grid: function (columns: number, rows: number, options: LineOptions) {
      for (let x = 1; x < columns; x++) {
        const lineLength = (canvas.width / columns) * x;
        this.line(lineLength, 0, lineLength, canvas.height, {
          color: options.color,
          width: options.width,
        });
      }

      for (let y = 1; y < rows; y++) {
        const lineLength = (canvas.height / rows) * y;
        this.line(0, lineLength, canvas.width, lineLength, {
          color: options.color,
          width: options.width,
        });
      }
    },
    circle: function (
      x: number,
      y: number,
      radius: number,
      options: StyleOptions
    ) {
      this.withinPath(() => {
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (options.fillStyle) {
          ctx.fillStyle = options.fillStyle;
          ctx.fill();
        } else if (options.strokeStyle) {
          ctx.strokeStyle = options.strokeStyle;
          ctx.stroke();
        } else if (options.fillStyle && options.strokeStyle) {
          console.log("TODO");
        }
      });
    },
    rectangle: function (
      x: number,
      y: number,
      width: number,
      height: number,
      options: StyleOptions
    ) {
      this.withinPath(() => {
        ctx.rect(x, y, width, height);
        if (options.fillStyle) {
          ctx.fillStyle = options.fillStyle;
          ctx.fill();
        } else if (options.strokeStyle) {
          ctx.strokeStyle = options.strokeStyle;
          ctx.stroke();
        } else if (options.fillStyle && options.strokeStyle) {
          console.log("TODO");
        }
      });
    },
    line: function (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      options: LineOptions
    ) {
      this.withinPath(() => {
        ctx.strokeStyle = options.color;
        ctx.lineWidth = options.width;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    },
    render: function (draw: () => void) {
      ctx.reset();
      draw();
    },
  };
};
/* ****************************** */

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (canvas === null) {
  throw new Error("Canvas element was not found in document.");
}

const FRAME_RATE = 15;
const FRAME_INTERVAL = 1000 / FRAME_RATE;
const CELL_SIZE = 15;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const paint = Paint2D(canvas);

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

class Snake {
  x: number;
  y: number;
  dx: number;
  dy: number;
  position: [number, number];
  tail: number[][];
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.dx = 1;
    this.dy = 0;
    this.position = [this.x, this.y];
    this.tail = [];
  }

  left() {
    if (this.dx === 1 && this.dy === 0) return;
    this.dx = -1;
    this.dy = 0;
  }

  right() {
    if (this.dx === -1 && this.dy === 0) return;
    this.dx = 1;
    this.dy = 0;
  }

  up() {
    if (this.dx === 0 && this.dy === 1) return;
    this.dx = 0;
    this.dy = -1;
  }

  down() {
    if (this.dx === 0 && this.dy === -1) return;
    this.dx = 0;
    this.dy = 1;
  }

  move() {
    if (this.tail.length > 0) {
      this.tail.unshift([this.x, this.y]);
      this.tail.pop();
    }

    this.x += this.dx * CELL_SIZE;
    this.y += this.dy * CELL_SIZE;
    this.position = [this.x, this.y];
  }

  eat() {
    this.tail.push([this.x, this.y]);
  }
}

class Food {
  x: number;
  y: number;
  position: [number, number];
  constructor() {
    this.x = Math.floor(Math.random() * (CANVAS_WIDTH / CELL_SIZE)) * CELL_SIZE;
    this.y =
      Math.floor(Math.random() * (CANVAS_HEIGHT / CELL_SIZE)) * CELL_SIZE;
    this.position = [this.x, this.y];
  }

  spawn() {
    paint.rectangle(this.x, this.y, CELL_SIZE, CELL_SIZE, {
      fillStyle: "magenta",
    });
  }

  respawn() {
    this.x = Math.floor(Math.random() * (CANVAS_WIDTH / CELL_SIZE)) * CELL_SIZE;
    this.y =
      Math.floor(Math.random() * (CANVAS_HEIGHT / CELL_SIZE)) * CELL_SIZE;
    this.position = [this.x, this.y];
  }
}

const snake = new Snake(CELL_SIZE, CELL_SIZE);
const food = new Food();

const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

let prevTimestamp = 0;
const run = (timestamp: number) => {
  if (timestamp - prevTimestamp < FRAME_INTERVAL) {
    requestAnimationFrame(run);
    return;
  }

  prevTimestamp = timestamp;
  snake.move();
  paint.render(() => {
    paint.background("black");
    paint.rectangle(snake.x, snake.y, CELL_SIZE, CELL_SIZE, {
      fillStyle: "white",
    });

    for (let i = 0; i < snake.tail.length; i++) {
      const [x, y] = snake.tail[i];
      paint.rectangle(x, y, CELL_SIZE, CELL_SIZE, {
        fillStyle: "white",
      });
    }

    food.spawn();

    if (distance(...snake.position, ...food.position) <= 0) {
      snake.eat();
      food.respawn();
    }
  });

  requestAnimationFrame(run);
};

requestAnimationFrame(run);

const keyDownPressed = (event: KeyboardEvent) => {
  // prettier-ignore
  switch(event.key) {
    case "ArrowUp": snake.up(); break;
    case "ArrowDown": snake.down(); break;
    case "ArrowRight": snake.right(); break;
    case "ArrowLeft": snake.left(); break;
  }
};

window.addEventListener("keydown", keyDownPressed);
