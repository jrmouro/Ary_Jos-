class Fire extends Ball {
    constructor(v, m, x, y, r,
        bodyOptions = {},
        draw = {
            e1: {
                code: 0x1F6D1,
                rate: .95
            },
            e2: undefined
        },
        redraw = undefined) {

        super(x, y, r, bodyOptions, draw, redraw);
        this.pos = {
            x: x,
            y: y
        };

        this.vel = {
            x: v.x,
            y: v.y
        }

        this.max = Math.random() * m;
        this.time = Date.now();

        this.enable = true;

    }

    draw() {


        const t = Date.now();

        if (this.enable) {

            let xx = this.pos.x - this.body.position.x;
            xx *= xx;
            let yy = this.pos.y - this.body.position.y;
            yy *= yy;
            const alt = Math.sqrt(xx + yy);


            if (alt < this.max) {

                const dt = t - this.time;

                const sx = dt * this.vel.x;
                const sy = dt * this.vel.y;

                Matter.Body.setPosition(this.body, {
                    x: this.body.position.x + sx,
                    y: this.body.position.y + sy
                });

            } else {

                Matter.Body.setPosition(this.body, {
                    x: this.pos.x,
                    y: this.pos.y
                });

            }

        }

        this.time = t;

        super.draw();

    };

}

class Fly extends Ball {
    constructor(v, m, x, y, r,
        bodyOptions = {},
        draw = {
            e1: {
                code: 0x1F6D1,
                rate: .95
            },
            e2: undefined
        },
        redraw = undefined) {

        super(x, y, r, bodyOptions, draw, redraw);
        this.pos = {
            x: x,
            y: y
        };

        
        

        this.vel = {
            x: v.x,
            y: v.y
        }

        this.max = Math.random() * m;

        this.time = Date.now();

        this.enable = true;

    }

    draw() {


        const t = Date.now();

        if (this.enable) {

            let xx = this.pos.x - this.body.position.x;
            xx *= xx;
            let yy = this.pos.y - this.body.position.y;
            yy *= yy;
            const alt = Math.sqrt(xx + yy);

            const dt = t - this.time;

            const sx = dt * this.vel.x;
            const sy = dt * this.vel.y;


            if (alt < this.max) {

                Matter.Body.setPosition(this.body, {
                    x: this.body.position.x + sx,
                    y: this.body.position.y + sy
                });

            } else {

                Matter.Body.setPosition(this.body, {
                    x: this.body.position.x - sx,
                    y: this.body.position.y - sy
                });

                this.vel.x = -this.vel.x * Math.random(2);
                this.vel.y = -this.vel.y * Math.random(2);

            }

        }

        this.time = t;

        super.draw();

    };

}