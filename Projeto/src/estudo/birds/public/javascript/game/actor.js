class Actor extends DrawWorld {

    constructor(engine, def = undefined) {
        super(engine.world, 0, 0, 0, () => {});
        this.engine = engine;
        this.def = def;
        this.bird = undefined;
        this.sling = undefined;
        this.mouseConstraint = undefined;

        if (def) this.build(def);

    }

    build(def) {

        const self = this;

        this.def = def;

        this.mouseConstraint = Matter.MouseConstraint.create(this.engine, def.mouse.constraintOptions);

        Matter.World.add(this.engine.world, this.mouseConstraint);

        Matter.Events.on(this.mouseConstraint, "mousemove", function (event) {

            if (self.mouseConstraint.body && self.mouseConstraint.body.label === self.def.bird1.bodyOptions.label) {

                if (self.sling.isLimit()) {

                    self.mouseConstraint.constraint.bodyB = null;

                    self.sling.release();

                }

            }

        });

        this.slinging(this.def.bird1.position);

    }

    dead(){

        if(this.bird)this.bird.dead();

    }

    isDead(){
        if(this.bird)
        return this.bird.isDead;
        return true;
    }

    isSlinging() {
        if (this.sling)
            return this.sling.isBind();
        return false;
    }

    label(){
        if(this.def)
        return this.def.bird1.bodyOptions.label;
        return undefined;
    }

    releasedBodyId(){
        if(this.sling)
        return this.sling.releasedBodyId;
        return undefined;
    }

    slinging(point, releasedBodyId = undefined) {

        if (this.bird) {
            this.delete(this.bird.body.id);
        }else{
           this.bird = new Bird(
            this.def.bird1.position.x,
            this.def.bird1.position.y,
            this.def.bird1.dimension,
            this.def.bird1.bodyOptions, this.def.bird1.draw, this.def.bird1.redraw);

        }
        

        

        if (this.sling) this.delete(-1);

        const op = {
            bodyB: this.bird.body,
            pointA: point,
            pointB: this.def.sling.constraintOptions.pointB,
            stiffness: this.def.sling.constraintOptions.stiffness,
            length: this.def.sling.constraintOptions.length
        };


        this.sling = new Sling(this.def.sling.limit, this.def.sling.maxLength, this.def.sling.velLength, op, this.def.sling.drawPointA, releasedBodyId);

        this.add(-1, this.sling);
        this.add(this.bird.body.id, this.bird);

    }


}