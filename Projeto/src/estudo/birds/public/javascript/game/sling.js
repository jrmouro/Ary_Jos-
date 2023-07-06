class Sling extends Binding {

    constructor(
        limit,
        maxLength,
        velLength,
        constraintOptions,
        drawPointA = {
            e1: {
                code: 0x1F6D1,
                rate: .95
            },
            e2: undefined
        }) {
        super(constraintOptions, drawPointA);
        this.limit = limit * limit;
        this.maxLength = maxLength;
        this.velLength = velLength;
        this.time = Date.now();
    }


    isLimit() {

        if (this.constraint.bodyB) {

            const a = (this.constraint.bodyA ? this.constraint.bodyA.position.x : 0) + this.constraint.pointA.x - this.constraint.bodyB.position.x - this.constraint.pointB.x;
            const b = (this.constraint.bodyA ? this.constraint.bodyA.position.y : 0) + this.constraint.pointA.y - this.constraint.bodyB.position.y - this.constraint.pointB.y;
            const h = a * a + b * b;

            return h > this.limit;

        }

        return true;

    }

    draw() {

        const t = Date.now();

        if (this.constraint.length < this.maxLength) {

            const dt = t - this.time;

            this.constraint.length += dt * this.velLength;

        }

        this.time = t;

        super.draw();

    };

}