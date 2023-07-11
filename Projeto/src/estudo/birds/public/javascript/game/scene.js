class Scene extends DrawWorld {

    constructor(canvas, engine, def = null, finished = (score) => {}) {
        super(engine.world, 0, 0, 0, def.drawFunction);
        this.canvas = canvas;
        this.engine = engine;
        this.def = def;
        this.finished = finished;

        this.actor = null;
        this.score = 0;
        this.isFinished = false;

        if (def) this.build(def);

    }

    finish() {
        this.isFinished = true;
        this.clear();
        this.finished(this.score, true);
    }


    build(def) {

        this.clear();

        this.def = def;

        let li = 0;
        let lj = 0;

        let ball;

        def.elements.forEach((element, i) => {

            let y = (i) * def.spacing.h + def.position.y;

            li = Math.max(li, i);

            element.forEach((label, j) => {

                label = label.toString();

                let x = (j) * def.spacing.w + def.position.x;

                lj = Math.max(lj, j);

                let ball = undefined;

                if (label === def.chase1.bodyOptions.label) {

                    ball = new Ball(x, y, def.chase1.dimension, def.chase1.bodyOptions, def.chase1.draw, def.chase1.redraw);

                } else if (label === def.chase2.bodyOptions.label) {

                    ball = new Ball(x, y, def.chase2.dimension, def.chase2.bodyOptions, def.chase2.draw, def.chase2.redraw);

                } else if (label === def.chase3.bodyOptions.label) {

                    // ball = new Ball(x, y, def.chase3.dimension, def.chase3.bodyOptions, def.chase3.draw, def.chase3.redraw);
                    ball = new Fly(def.chase3.vel, def.chase3.max, x, y, def.chase3.dimension, def.chase3.bodyOptions, def.chase3.draw, def.chase3.redraw);


                } else if (label === def.sensor1.bodyOptions.label) {

                    // ball = new Ball(x, y, def.sensor1.dimension, def.sensor1.bodyOptions, def.sensor1.draw, def.sensor1.redraw);
                    ball = new Fire(def.sensor1.vel, def.sensor1.max, x, y, def.sensor1.dimension, def.sensor1.bodyOptions, def.sensor1.draw, def.sensor1.redraw);

                } else if (label === def.building5.bodyOptions.label) {

                    ball = new GBox(x, y, def.building5.width, def.building5.height, def.building5.bodyOptions);

                }

                if (ball) this.add(ball.body.id, ball);

            });

        });

        ball = new Ball(
            def.sensor2.position.x,
            def.sensor2.position.y,
            def.sensor2.dimension, def.sensor2.bodyOptions, def.sensor2.draw, def.sensor2.redraw);

        this.add(ball.body.id, ball);

        ball = new Ball(
            def.sensor2.position.x,
            def.sensor2.position.y - def.sling.maxLength,
            def.chase3.dimension, def.chase3.bodyOptions, def.chase3.draw, def.chase3.redraw);
        this.add(ball.body.id, ball);

        ball = new DrawBody(Matter.Bodies.rectangle(def.ground.position.x, def.ground.position.y, def.ground.width, def.ground.height, def.ground.bodyOptions, ), () => {

            rectMode(CENTER);
            fill(0);
            rect(0, 0, def.ground.width, def.ground.height + 100);

        });

        this.add(ball.body.id, ball);

        this.actor = new Actor(this.engine, this.def);
        this.add(-2, this.actor);

        const self = this;

        Matter.Events.on(this.engine, 'collisionStart', function (event) {

            event.pairs.forEach(pair => {

                if (!self.actor.isDead() && !self.isFinished) {

                    if (!self.actor.isSlinging()) {

                        if (pair.bodyB.label === self.actor.label()) {


                            if (
                                (pair.bodyA.label === def.chase1.bodyOptions.label || pair.bodyA.label === def.chase2.bodyOptions.label) &&
                                self.actor.releasedBodyId() !== pair.bodyA.id) {

                                setTimeout(() => {

                                    self.get(pair.bodyA.id).change();
                                    Matter.World.remove(self.engine.world, pair.bodyA);

                                    self.actor.slinging(pair.bodyA.position, pair.bodyA.id);

                                    self.finished(1, false)

                                }, 10);

                            }

                            if ((pair.bodyA.label === def.chase3.bodyOptions.label) &&
                                self.actor.releasedBodyId() !== pair.bodyA.id) {

                                setTimeout(() => {

                                    self.get(pair.bodyA.id).change();
                                    self.get(pair.bodyA.id).enable = false;
                                    Matter.World.remove(self.engine.world, pair.bodyA);

                                    self.actor.slinging(pair.bodyA.position, pair.bodyA.id);

                                    self.finished(1, false)

                                }, 10);

                            }

                        }

                        if (((pair.bodyB.label === self.actor.label() &&
                                pair.bodyA.label === def.ground.bodyOptions.label) || (pair.bodyB.label === def.ground.bodyOptions.label &&
                                pair.bodyA.label === self.actor.label()))) {

                            self.isFinished = true;
                            Matter.Events.off(self.engine);

                            setTimeout(() => {

                                self.actor.dead();

                                setTimeout(() => {

                                    self.finish();

                                }, 1500);

                            }, 200);

                        }

                        if (((pair.bodyB.label === self.actor.label() &&
                                pair.bodyA.label === def.sensor1.bodyOptions.label) || (pair.bodyB.label === def.sensor1.bodyOptions.label &&
                                pair.bodyA.label === self.actor.label()))) {

                            self.isFinished = true;
                            Matter.Events.off(self.engine);

                            setTimeout(() => {

                                self.actor.dead();

                                setTimeout(() => {

                                    self.finish();

                                }, 2500);

                            }, 20);

                        }

                    } else {

                        if (((pair.bodyB.label === self.actor.label() &&
                                pair.bodyA.label === def.sensor2.bodyOptions.label) || (pair.bodyB.label === def.sensor2.bodyOptions.label &&
                                pair.bodyA.label === self.actor.label()))) {

                            self.isFinished = true;
                            Matter.Events.off(self.engine);

                            setTimeout(() => {

                                setTimeout(() => {

                                    self.finish();

                                }, 1500);

                            }, 200);

                        }

                    }

                }


            });

        });



    }

}