class ChallengeScene extends DrawWorld {

    constructor(round, canvas, engine, def = null, finished = (score) => {}) {
        super(engine.world, 0, 0, 0, def.drawFunction);
        this.round = round;
        this.canvas = canvas;
        this.engine = engine;
        this.def = def;
        this.finished = finished;
        this.sling = null;
        this.bird = null;
        this.mouseConstraint = null;
        this.score = 0;


        this.isFinished = false;

        if (def) this.build(def);

    }

    finish() {

        this.clear();
        this.finished(this.score);

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
            def.sensor2.position.y - def.chase2.dimension,
            def.chase2.dimension, def.chase2.bodyOptions, def.chase2.draw, def.chase2.redraw);

            self.add(ball.body.id, ball);

        const options = {
            mouse: Matter.Mouse.create(this.canvas),
            collisionFilter: {
                mask: def.mouse.mask
            },
            stiffness: def.mouse.stiffness
        }

        this.mouseConstraint = Matter.MouseConstraint.create(this.engine, options);

        Matter.World.add(this.world, this.mouseConstraint);

        Matter.Events.on(this.mouseConstraint, "mousemove", function (event) {

            if (self.mouseConstraint.body && self.mouseConstraint.body.label === 'b') {

                if (self.sling.isLimit()) {

                    self.mouseConstraint.constraint.bodyB = null;

                    self.sling.release();

                }

            }

        });

        Matter.Events.on(this.engine, 'collisionStart', function (event) {

            event.pairs.forEach(pair => {

                if (!self.bird.isDead && !self.sling.isBind()) {

                    if (pair.bodyB.label === "b" && pair.bodyA.label === def.chase1.bodyOptions.label && self.sling.releasedBodyId !== pair.bodyA.id) {

                        setTimeout(() => {

                            self.get(pair.bodyA.id).change();

                            if(self.sling.releasedBodyId) self.get(self.sling.releasedBodyId).change();

                            self.delete(-1);

                            const op = {
                                bodyB: self.bird.body,
                                pointA: {
                                    x: pair.bodyA.position.x,
                                    y: pair.bodyA.position.y
                                },
                                pointB: self.def.sling.constraintOptions.pointB,
                                stiffness: self.def.sling.constraintOptions.stiffness,
                                length: self.def.sling.constraintOptions.length
                            };


                            self.sling = new Sling(self.def.sling.limit, self.def.sling.maxLength, self.def.sling.velLength, op, self.def.sling.drawPointA, pair.bodyA.id);

                            self.add(-1, self.sling);

                            self.score = self.round.score;

                        }, 100);

                    }

                    if (pair.bodyB.label === "b" && pair.bodyA.label === def.chase2.bodyOptions.label && self.sling.releasedBodyId !== pair.bodyA.id) {


                        setTimeout(() => {

                            self.get(pair.bodyA.id).change();

                            if(self.sling.releasedBodyId) self.get(self.sling.releasedBodyId).change();

                            self.delete(-1);

                            const op = {
                                bodyB: self.bird.body,
                                pointA: {
                                    x: pair.bodyA.position.x,
                                    y: pair.bodyA.position.y
                                },
                                pointB: self.def.sling.constraintOptions.pointB,
                                stiffness: self.def.sling.constraintOptions.stiffness,
                                length: self.def.sling.constraintOptions.length
                            };


                            self.sling = new Sling(self.def.sling.limit, self.def.sling.maxLength, self.def.sling.velLength, op, self.def.sling.drawPointA, pair.bodyA.id);

                            self.add(-1, self.sling);

                            self.score = 0;

                        }, 100);

                    }

                }

                if (!self.bird.isDead && self.sling.isBind()) {

                    if (pair.bodyB.label === "b" && pair.bodyA.label === "5") {

                        // setTimeout(() => {

                        //     if (self.nextflag) {
                        //         self.next();
                        //         self.nextflag = false;
                        //     }

                        // }, def.nextTime);

                        self.isFinished = true;
                        Matter.Events.off(self.engine);
                        Matter.Events.off(self.mouseConstraint);

                        setTimeout(() => {

                            setTimeout(() => {

                                self.finish();

                            }, 1000);

                        }, 200);

                    }
                }

                if (!self.isFinished) {

                    if (pair.bodyB.label === "b" && pair.bodyA.label === "4") {

                        self.isFinished = true;
                        Matter.Events.off(self.engine);
                        Matter.Events.off(self.mouseConstraint);

                        setTimeout(() => {

                            self.bird.dead();
                            setTimeout(() => {

                                self.finish();

                            }, 2000);

                        }, 200);

                    }

                }



            });

        });

        if (this.bird) this.delete(this.bird.body.id);
        this.delete(-1);

        this.bird = new Bird(
            this.def.bird1.position.x,
            this.def.bird1.position.y,
            this.def.bird1.dimension,
            this.def.bird1.bodyOptions, this.def.bird1.draw, this.def.bird1.redraw);

        const op = {
            bodyB: this.bird.body,
            pointA: {
                x: this.def.bird1.position.x,
                y: this.def.bird1.position.y,
            },
            pointB: this.def.sling.constraintOptions.pointB,
            stiffness: this.def.sling.constraintOptions.stiffness,
            length: this.def.sling.constraintOptions.length
        };


        this.sling = new Sling(this.def.sling.limit, this.def.sling.maxLength, this.def.sling.velLength, op, this.def.sling.drawPointA);

        this.add(-1, this.sling);
        this.add(this.bird.body.id, this.bird);

    }

}