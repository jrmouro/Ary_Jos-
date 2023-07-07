class Actor extends DrawWorld {
    constructor(engine) {
        super(engine.world,  0, 0, 0, ()=>{});
        this.bird = undefined;
        this.binding = undefined;

    }

    build(def, index, key){

        const actorDef = def.actors[index];

        this.bird = this.bird = new Bird(
            (actorDef.bird.position.x + 1) * def.spacing.w + def.position.x,
            (actorDef.bird.position.y + 1) * def.spacing.h + def.position.y,
            actorDef.bird.dimension.w,
            actorDef.bird.label,
            actorDef.e1,
            actorDef.e2,
            actorDef.category,
            actorDef.frictionAir,
            actorDef.retitution);

        this.add(key++, this.bird);

        this.sling = new Sling(
            this.bird.body,
            (actorDef.bird.position.x) * def.spacing.w + def.position.x,
            (actorDef.bird.position.y) * def.spacing.h + def.position.y,
            actorDef.sling.lenght,
            actorDef.sling.limit,
            actorDef.sling.stiffness);

        this.add(key++, this.sling);

    }
}