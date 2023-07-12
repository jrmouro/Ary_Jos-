class GBox extends DrawBody {

    constructor(
        x, y, w, h,
        bodyOptions = {},
        draw = undefined,
        redraw = undefined
    ) {

        super(Matter.Bodies.rectangle(x, y, w, h, bodyOptions),

            () => {

                rectMode(CENTER);
                fill(0);
                rect(0,0,w,h);

                if (draw) {

                    let s = "";
                    const min = Math.min(w, h);
                    let count = Math.max(w, h) / this.min;

                    if (h > w) {
                        s = " ";
                        count++;
                    }

                    // rectMode(CORNER);

                    textAlign(CENTER, CENTER);

                    if (draw.e1) {
                        let t = "";
                        for (let index = 0; index < count; index++) {
                            t += String.fromCodePoint(draw.e1.code) + s;
                        }
                        textSize(min * draw.e1.rate);
                        text(t, -w / 2, -h / 2, w, h);
                    }

                    if (draw.e2) {
                        let t = "";
                        for (let index = 0; index < count; index++) {
                            t += String.fromCodePoint(draw.e2.code) + s;
                        }
                        textSize(min * draw.e2.rate);
                        text(t, 0, 0, w, h);
                    }

                }

            });

        this._draw = draw;
        this.redraw = redraw;
        this.height = h,
            this.width = w;
        this.min = Math.min(w, h);
        this.count = Math.max(w, h) / this.min;

    }

    change() {

        if (this.redraw) {

            const draw = this.redraw;
            const min = this.min;
            const w = this.width;
            const h = this.height;
            const c = this.count;


            this.drawFunction = () => {

                textAlign(CENTER, CENTER);

                if (draw.e1) {
                    let t = "";
                    for (let index = 0; index < c; index++) {
                        t += String.fromCodePoint(draw.e1.code);
                    }

                    textSize(min * draw.e1.rate);
                    text(t, 0, 0, w, h);
                }

                if (draw.e2) {
                    let t = "";
                    for (let index = 0; index < c; index++) {
                        t += String.fromCodePoint(draw.e2.code);
                    }
                    textSize(min * draw.e2.rate);
                    text(t, 0, 0, w, h);
                }

            }

            const d = this._draw;
            this._draw = this.redraw;
            this.redraw = d;

        }

    }

}