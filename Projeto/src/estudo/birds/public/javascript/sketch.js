let game;

function setup() {

  const canvas = createCanvas(800, 1400);
  game = new Game(canvas.canvas.canvas, [scene4, scene3, scene1, scene2]);
  game.setup();

}

function draw() {

  game.draw();

}