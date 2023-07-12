class Ball extends DrawBody {

    constructor(
        x, y, r,
        bodyOptions = {},
        draw = {
            e1: {
                code: 0x1F6D1,
                rate: .95
            },
            e2: undefined
        },
        redraw = undefined
    ) {

        super(Matter.Bodies.circle(x, y, r / 2, bodyOptions),
            () => {

                if (draw) {

                    textAlign(CENTER, CENTER);

                    if (draw.e1) {
                        textSize(r * draw.e1.rate);
                        text(String.fromCodePoint(draw.e1.code), 0, 0);
                    }

                    if (draw.e2) {
                        textSize(r * draw.e2.rate);
                        text(String.fromCodePoint(draw.e2.code), 0, 0);
                    }

                }

            });

        this._draw = draw;
        this.redraw = redraw;
        this.radius = r;

    }

    change() {

        if (this.redraw) {

            const draw = this.redraw;
            const r = this.radius;

            this.drawFunction = () => {

                textAlign(CENTER, CENTER);

                if (draw.e1) {
                    textSize(r * draw.e1.rate);
                    text(String.fromCodePoint(draw.e1.code), 0, 0);
                }

                if (draw.e2) {
                    textSize(r * draw.e2.rate);
                    text(String.fromCodePoint(draw.e2.code), 0, 0);
                }

            }

            const d = this._draw;
            this._draw = this.redraw;
            this.redraw = d;

        }

    }

}