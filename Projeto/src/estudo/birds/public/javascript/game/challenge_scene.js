class ChallengeScene extends DrawWorld {

    constructor(round, /*canvas,*/ engine, def = null, finished = (score) => {}) {
        super(engine.world, 0, 0, 0, def.drawFunction);
        this.round = round;
        // this.canvas = canvas;
        this.engine = engine;
        this.def = def;
        this.finished = finished;
        this.actor = undefined;
        // this.sling = null;
        // this.bird = null;
        // this.mouseConstraint = null;
        this.score = 0;


        this.isFinished = false;

        if (def) this.build(def);

    }

    build(def) {

        this.clear();

        const self = this;

        const question_options = self.round.question.fake_options.slice();
        question_options.push(self.round.question.true_option);
        shuffle(question_options);

        let key = -2;

        this.add(key--, new Drawable(def.theme.position.x, def.theme.position.y, 0, () => {

            textAlign(LEFT, TOP);
            textSize(18);
            text("Theme: " + self.round.quiz_theme, 0, 0, def.theme.dimension.x, def.theme.dimension.y);

        }));

        this.add(key--, new Drawable(def.question.position.x, def.question.position.y, 0, () => {

            textAlign(LEFT, TOP);
            textSize(18);
            text("Question(" + self.round.score + " scores): " + self.round.question.description, 0, 0, def.question.dimension.x, def.question.dimension.y);

        }));

        let count = 0;

        let ball;

        question_options.forEach(element => {

            let def_option = def.options[count++];



            if (element == self.round.question.true_option) {

                ball = new Ball(
                    def_option.position.x - def.chase1.dimension,
                    def_option.position.y + def.chase1.dimension / 2,
                    def.chase1.dimension, def.chase1.bodyOptions, def.chase1.draw, def.chase1.redraw);


            } else {

                ball = new Ball(
                    def_option.position.x - def.chase2.dimension,
                    def_option.position.y + def.chase2.dimension / 2,
                    def.chase2.dimension, def.chase2.bodyOptions, def.chase2.draw, def.chase2.redraw);

            }

            self.add(ball.body.id, ball);

            self.add(key--, new Drawable(def_option.position.x, def_option.position.y, 0, () => {

                textAlign(LEFT, TOP);
                textSize(18);
                text(element, 0, 0, def_option.dimension.x, def_option.dimension.y);

            }));

        });

        ball = new Ball(
            def.sensor2.position.x,
            def.sensor2.position.y,
            def.sensor2.dimension, def.sensor2.bodyOptions, def.sensor2.draw, def.sensor2.redraw);

        self.add(ball.body.id, ball);

        ball = new Ball(
            def.sensor2.position.x,
            def.sensor2.position.y - def.sling.maxLength,
            def.chase3.dimension, def.chase3.bodyOptions, def.chase3.draw, def.chase3.redraw);
        self.add(ball.body.id, ball);

        // ball = new GBox(def.ground.position.x, def.ground.position.y, def.ground.width, def.ground.height, def.ground.bodyOptions, def.ground.draw, def.ground.redraw);
        // self.add(ball.body.id, ball);

        ball = new DrawBody(Matter.Bodies.rectangle(def.ground.position.x, def.ground.position.y, def.ground.width, def.ground.height, def.ground.bodyOptions, ), () => {

            rectMode(CENTER);
            fill(0);
            rect(0, 0, def.ground.width, def.ground.height + 100);

        });

        self.add(ball.body.id, ball);

        this.actor = new Actor(this.engine, this.def);
        self.add(-2, this.actor);

        Matter.Events.on(this.engine, 'collisionStart', function (event) {

            event.pairs.forEach(pair => {

                if (!self.actor.isDead()) {

                    if (!self.actor.isSlinging()) {

                        if (
                            pair.bodyB.label === self.actor.label() &&
                            (pair.bodyA.label === def.chase1.bodyOptions.label || pair.bodyA.label === def.chase2.bodyOptions.label || pair.bodyA.label === def.chase3.bodyOptions.label) &&
                            self.actor.releasedBodyId() !== pair.bodyA.id) {

                            setTimeout(() => {

                                self.get(pair.bodyA.id).change();

                                const oldRreleaseBodyId = self.actor.releasedBodyId();

                                if (oldRreleaseBodyId) self.get(oldRreleaseBodyId).change();

                                self.actor.slinging(pair.bodyA.position, pair.bodyA.id);

                                if (pair.bodyA.label === def.chase1.bodyOptions.label) {
                                    self.score = self.round.score;
                                } else if (pair.bodyA.label === def.chase2.bodyOptions.label) {
                                    self.score = 0;
                                }

                            }, 10);

                        }

                        if ((pair.bodyB.label === self.actor.label() &&
                                pair.bodyA.label === def.ground.bodyOptions.label) || (pair.bodyB.label === def.ground.bodyOptions.label &&
                                pair.bodyA.label === self.actor.label())) {

                            self.isFinished = true;
                            Matter.Events.off(self.engine);
                            // Matter.Events.off(self.mouseConstraint);

                            setTimeout(() => {

                                self.actor.dead();

                                setTimeout(() => {

                                    self.clear();
                                    self.finished(0, false);

                                }, 1500);

                            }, 200);

                        } else {



                        }

                    } else {

                        if ((pair.bodyB.label === self.actor.label() &&
                                pair.bodyA.label === def.sensor2.bodyOptions.label) || (pair.bodyB.label === def.sensor2.bodyOptions.label &&
                                pair.bodyA.label === self.actor.label())) {

                            self.isFinished = true;
                            Matter.Events.off(self.engine);
                            // Matter.Events.off(self.mouseConstraint);

                            if(self.score > 0) applause.play(); else wrong.play();

                            setTimeout(() => {

                                setTimeout(() => {

                                    self.clear();
                                    self.finished(self.score, true);

                                }, 1500);

                            }, 200);

                        }

                    }

                }


            });

        });

    }

}