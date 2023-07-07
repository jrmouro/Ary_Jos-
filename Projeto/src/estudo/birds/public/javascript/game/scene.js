class Scene extends DrawWorld {

    constructor(canvas, engine, def = null, finished = (score) => {}) {
        super(engine.world, 0, 0, 0, def.drawFunction);
        this.canvas = canvas;
        this.engine = engine;
        this.def = def;
        this.current_shot = 0;
        this.sling = null;
        this.bird = null;
        this.mouseConstraint = null;
        this.nextflag = false;
        this.score = 0;

        if (def) this.build(def);

        this.finished = finished;
        this.isFinished = false;


    }


    next() {

        this.nextflag = true;

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

    build(def) {

        this.def = def;

        let li = 0;
        let lj = 0;


        def.elements.forEach((element, i) => {

            let y = (i) * def.spacing.h + def.position.y;

            li = Math.max(li, i);

            element.forEach((angle, j) => {

                let x = (j) * def.spacing.w + def.position.x;

                lj = Math.max(lj, j);

                let ball = undefined;

                if (angle === 1) {

                    ball = new Ball(x, y, def.chase1.dimension, def.chase1.bodyOptions, def.chase1.draw, def.chase1.redraw);

                } else if (angle === 2) {

                    ball = new Ball(x, y, def.building1.dimension, def.building1.bodyOptions, def.building1.draw, def.building1.redraw);


                } else if (angle === 3) {

                    ball = new Ball(x, y, def.chase2.dimension, def.chase2.bodyOptions, def.chase2.draw, def.chase2.redraw);

                } else if (angle === 4) {

                    ball = new Ball(x, y, def.sensor1.dimension, def.sensor1.bodyOptions, def.sensor1.draw, def.sensor1.redraw);

                } else if (angle === 5) {

                    ball = new Ball(x, y, def.sensor2.dimension, def.sensor2.bodyOptions, def.sensor2.draw, def.sensor2.redraw);

                } else if (angle === -1) {

                    this.def.bird1.position.x = x;
                    this.def.bird1.position.y = y;

                }

                if (ball) this.add(ball.body.id, ball);

            });

        });

        const self = this;

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

                    setTimeout(() => {

                        self.delete(-1);

                    }, def.sling.timeToRelease);

                }

            }

        });

        var flag = true;

        Matter.Events.on(this.engine, 'collisionStart', function (event) {

            event.pairs.forEach(pair => {

                if (pair.bodyB.label === "b" && pair.bodyA.label === "1") {

                    if (!self.bird.isDead) {

                        setTimeout(() => {

                            Matter.World.remove(self.world, pair.bodyA);
                            self.get(pair.bodyA.id).change();

                            self.delete(-1);
                            if (self.bird) self.delete(self.bird.body.id);

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


                            self.sling = new Sling(self.def.sling.limit, self.def.sling.maxLength, self.def.sling.velLength, op, self.def.sling.drawPointA);

                            self.add(-1, self.sling);
                            if (self.bird) self.add(self.bird.body.id, self.bird);

                            self.score++;

                        }, 100);

                    }

                }

                if (!self.bird.isDead) {

                    if (pair.bodyB.label === "b" && pair.bodyA.label === "5") {



                        setTimeout(() => {

                            if (self.nextflag) {
                                self.next();
                                self.nextflag = false;
                            }

                        }, def.nextTime);

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
                            
                                self.finished(self.score);
                                console.log("finished scene");
    
                            }, 2000);

                        }, 200);

                    }

                }



            });

        });

        this.next();


    }

}