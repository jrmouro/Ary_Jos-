class Game {

    constructor(
        canvas,
        def_scenes,
        game_def,
        challenge_service = undefined) {

        this.def_scenes = def_scenes;
        this.game_def = game_def;
        this.challenge_service = challenge_service;
        this.engine = Matter.Engine.create();
        this.def_scene_index = 0;
        this.current_scene = undefined;
        this.canvas = canvas;
        this.rounds = [];

        const ScoreBoard = class extends Drawable {
            constructor(score = 0) {
                super(20, 30);
                this.score = score;
                const self = this;
                this.drawFunction = () => {
                    textAlign(LEFT, CENTER);
                    textSize(28);
                    text("Score: " + self.score, 0, 0);
                }
            }
            inc(score) {
                this.score += score;
            }
        }

        this.scoreBoard = new ScoreBoard(0);
        this.background = new Drawable(0, 0, 0, this.game_def.drawFunction);
        this.foreground = new Drawable();
        this.foreground.add(0, new Drawable(260, 20, 0, () => {
            textAlign(LEFT, CENTER);
            textSize(40);
            text("Spider Quiz", 0, 0);
        }));
        this.foreground.add(1, this.scoreBoard);

    }

    setup() {

        const self = this;

        if (this.game_def.isChallenge && this.challenge_service) {

            WSChallenge.get(this.challenge_service, (rounds) => {

                if (rounds) {

                    const aux = Object.values(rounds);

                    aux.forEach((value) => {

                        self.rounds = self.rounds.concat(Object.values(value));

                    });


                    console.log('Rounds: ', JSON.stringify(self.rounds))


                }

                self.next();

            }, 3000);

        } else {

            this.next();

        }

    }

    gameOver(finished) {

        const self = this;

        this.def_scene_index = 0;
        

        console.log("Game Over: " + this.scoreBoard.score);

        Matter.World.clear(this.engine.world);
        Matter.Engine.clear(this.engine);

        this.current_scene = new DrawWorld(this.engine.world);

        const ground = new DrawBody(Matter.Bodies.rectangle(
            this.game_def.ground.position.x,
            this.game_def.ground.position.y,
            this.game_def.ground.width,
            this.game_def.ground.height,
            this.game_def.ground.bodyOptions, ), () => {

            rectMode(CENTER);
            fill(0);
            rect(0, 0, self.game_def.ground.width, self.game_def.ground.height + 100);

        });

        const actor = new Actor(this.engine, this.game_def);

        this.current_scene.add(ground.body.id, ground);


        let finalMsg = "Good luck next time!";

        if (finished) {

            finalMsg = "Congratulations! You closed the whole game.";

        }

        console.log(finalMsg);



        const FinalMsg = class extends Drawable {
            constructor(bodyBinding, msg) {
                super(bodyBinding.position.x, bodyBinding.position.x, 0, () => {
                    textAlign(CENTER, CENTER);
                    textSize(28);
                    text(msg, 0, 0);
                });
                this.msg = msg;
                this.bodyBinding = bodyBinding;

            }
            draw() {
                this.x = this.bodyBinding.position.x;
                this.y = this.bodyBinding.position.y + 30;
                super.draw();
            }
        };

        this.current_scene.add(3, new FinalMsg(actor.bird.body, finalMsg));

        this.current_scene.add(-2, actor);


        Matter.Events.on(this.engine, 'collisionStart', function (event) {

            event.pairs.forEach(pair => {

                Matter.Events.off(self.engine);

                setTimeout(() => {

                    self.scoreBoard.score = 0;
                    self.next();

                }, 1500);

            });

        });

    }

    next() {

        const self = this;

        if (this.rounds.length > 0) {

            if (this.def_scene_index < this.rounds.length) {

                Matter.World.clear(this.engine.world);
                Matter.Engine.clear(this.engine);

                this.current_scene = new ChallengeScene(this.rounds[this.def_scene_index++], this.engine, challenge_scene, (score, finished) => {

                    self.scoreBoard.inc(score);

                    if (finished) {

                        if (self.def_scene_index < self.def_scenes.length) {

                            self.current_scene = new Scene(this.canvas, this.engine, this.def_scenes[this.def_scene_index - 1], (score, finished) => {

                                self.scoreBoard.inc(score);

                                if(score === 0){
                                    if(!finished)self.gameOver(false);
                                } else {
                                    if(finished)self.next();
                                }

                            });

                        } else {

                            self.next();

                        }

                    } else {

                        self.gameOver(false);

                    }

                });

            } else {

                this.gameOver(true);

            }

        } else {


            if (self.def_scene_index < self.def_scenes.length) {

                self.current_scene = new Scene(this.canvas, this.engine, this.def_scenes[this.def_scene_index++], (score, finished) => {

                    self.scoreBoard.inc(score);

                    if(score === 0){
                        if(!finished)self.gameOver(false);
                    } else {
                        if(finished)self.next();
                    }


                });

            } else {

                this.gameOver(true);

            }

        }

    }

    draw() {

        this.background.draw();

        if (this.engine) Matter.Engine.update(this.engine);

        if (this.current_scene) {
            this.current_scene.draw();
        }

        this.foreground.draw();

    }

}