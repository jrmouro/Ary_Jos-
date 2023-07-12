let game;

function setup() {

  const challenge_service = {
    wssa: document.getElementById('wssa').innerHTML,
    wssp: document.getElementById('wssp').innerHTML,
    ws_cluster: document.getElementById('ws_cluster').innerHTML,
    ws_client: document.getElementById('ws_client').innerHTML
  }

  const canvas = createCanvas(800, 1400);
  game = new Game(canvas.canvas.canvas, [scene1, scene2, scene3, scene4, scene5], game_def, challenge_service);
  game.setup();

}

function draw() {

  game.draw();

}