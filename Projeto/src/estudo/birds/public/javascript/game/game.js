class Game {

    constructor(
        canvas,
        def_scenes,
        definitions,
        challenge_service = undefined) {

        this.def_scenes = def_scenes;
        this.definitions = definitions;
        this.challenge_service = challenge_service;
        this.engine = Matter.Engine.create();
        this.def_scene_index = 0;
        this.current_scene = undefined;
        this.canvas = canvas;
        this.score = 0;
        this.rounds = [];

    }

    setup() {

        const self = this;

        if (this.definitions.isChallenge && this.challenge_service) {

            WSChallenge.get(this.challenge_service, (rounds) => {

                if(rounds) { 

                    const aux = Object.values(rounds);

                    aux.forEach((value)=>{

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

    gameOver() {

        console.log("Game Over: " + this.score);

    }

    next() {

        const self = this;

        if (this.rounds.length > 0) {

            if (this.def_scene_index < this.rounds.length) {

                Matter.World.clear(this.engine.world);
                Matter.Engine.clear(this.engine);

                this.current_scene = new ChallengeScene(this.rounds[this.def_scene_index++], this.canvas, this.engine, challenge_scene, (score) => {

                    self.score += score;

                    if (self.def_scene_index < self.def_scenes.length - 1) {

                        self.current_scene = new Scene(this.canvas, this.engine, this.def_scenes[this.def_scene_index - 1], (score) => {

                            self.score += score;

                            self.next();

                        });

                    } else {

                        self.next();

                    }

                });

            } else {

                this.current_scene = null;

                this.gameOver();

            }

        } else {


            if (self.def_scene_index < self.def_scenes.length) {

                self.current_scene = new Scene(this.canvas, this.engine, this.def_scenes[this.def_scene_index++], (score) => {

                    self.score += score;

                    self.next();


                });

            } else {

                this.current_scene = null;

                this.gameOver();

            }

        }

    }

    draw() {

        const self = this;

        if (this.engine) Matter.Engine.update(this.engine);

        if (this.current_scene) {
            this.current_scene.draw();
        }

        new Drawable(20, 30, 0, () => {

            textAlign(LEFT, CENTER);
            textSize(32);
            text("Score: " + self.score, 0, 0);

        }).draw();

    }

}