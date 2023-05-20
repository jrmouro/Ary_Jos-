function board(size) {







    const pth = 0x1F532;
    const adv = 0x23E9;
    const bck = 0x23EA;
    const qut = 0x2753;
    const ept = 0x2B1B;
    const pnt = 0x23FA;
    const dic = 0x1F3B2;



    var board = {

        font_size: size,
        font_type: "Arial",

        matrix: [
            [pth, ept, bck, qut, adv, ept, ept, ept, pth],
            [qut, ept, pnt, ept, qut, ept, ept, ept, ept],
            [pth, adv, pth, ept, pth, ept, qut, bck, qut],
            [ept, ept, ept, ept, bck, ept, pnt, ept, pth],
            [qut, adv, qut, pnt, pth, ept, adv, ept, bck],
            [pth, ept, ept, ept, ept, ept, pth, ept, qut],
            [bck, pth, qut, adv, pth, pnt, qut, ept, pth],
        ],

        dice_place: [0, 8],

        path: [

            [0, 0],
            [1, 0],
            [2, 0],
            [2, 1],
            [2, 2],
            [1, 2],
            [0, 2],
            [0, 3],
            [0, 4],
            [1, 4],
            [2, 4],
            [3, 4],
            [4, 4],
            [4, 3],
            [4, 2],
            [4, 1],
            [4, 0],
            [5, 0],
            [6, 0],
            [6, 1],
            [6, 2],
            [6, 3],
            [6, 4],
            [6, 5],
            [6, 6],
            [5, 6],
            [4, 6],
            [3, 6],
            [2, 6],
            [2, 7],
            [2, 8],
            [3, 8],
            [4, 8],
            [5, 8],
            [6, 8]

        ],

        update: function (dt) {


        },


        draw: function (ctx) {

            for (let lin = 0; lin < this.matrix.length; lin++) {

                var line = this.matrix[lin];

                for (let col = 0; col < line.length; col++) {
                    ctx.font = this.font_size + "px " + this.font_type;
                    if (line[col] === ept || line[col] === pth) {
                        ctx.fillText(String.fromCodePoint(line[col]), this.font_size * col, this.font_size * lin + this.font_size);
                    } else {
                        ctx.fillText(String.fromCodePoint(pth), this.font_size * col, this.font_size * lin + this.font_size);
                        ctx.font = this.font_size / 2 + "px " + this.font_type;
                        ctx.fillText(String.fromCodePoint(line[col]), this.font_size * col + this.font_size / 4 + 3, this.font_size * lin + this.font_size / 2 + this.font_size / 4 + 3);
                    }


                }

            }

        },

        get_path_coord_x: function (n) {

            if (Number.isInteger(n) && n > -1 && n < this.path.length) {

                return this.font_size * this.path[n][1];

            }

            throw new Error("error in path");

        },

        get_path_coord_y: function (n) {

            if (Number.isInteger(n) && n > -1 && n < this.path.length) {

                return this.font_size * this.path[n][0] + this.font_size;

            }

            throw new Error("error in path");

        },





    }


    var player_1 = {
        font_size: "25",
        font_type: "Arial",
        avatar: 0x1F981,
        board: board,
        place: 0,
        goto: {
            x: 43,
            y: 83,
            v: 0.001
        },
        pos: {
            x: 43,
            y: 83
        },
        vel: {
            x: 0,
            y: 0
        },
        draw: function (ctx) {

            ctx.font = this.font_size + "px " + this.font_type;

            ctx.fillText(
                String.fromCodePoint(this.avatar),
                this.pos.x,
                this.pos.y);

        },

        update: function (dt) {

            let dx = this.goto.x - this.pos.x;
            let dy = this.goto.y - this.pos.y;

            if (Math.abs(dx) < 1) dx = 0;
            if (Math.abs(dy) < 1) dy = 0;

            this.vel.x = dx * this.goto.v;
            this.vel.y = dy * this.goto.v;

            this.pos.x = this.pos.x + dt * this.vel.x;
            this.pos.y = this.pos.y + dt * this.vel.y;
            // console.log(dt);
        },

        setPos: function (px, py) {
            this.pos.x = px;
            this.pos.y = py;
        },

        setVel: function (vx, vy) {
            this.vel.x = vx;
            this.vel.y = vy;
        },

        goto: function (gx, gy, gv) {
            this.goto.x = gx;
            this.goto.y = gy;
            this.goto.v = gv;
        },

        goto_place: function (n, vel = 0.005) {
            this.goto(this.board.get_path_coord_x(n), this.board.get_path_coord_y(n), vel);
            this.place = n;
        },

        walk_to_place: function (n, vel = 0.005, finished = (n) => {}) {

            if (n < this.place) {

                this.goto_place(this.place - 1, vel);

            } else if (n > this.place) {

                this.goto_place(this.place + 1, vel);

            } else {

                finished(n);

                return;

            }

            var self = this;

            setTimeout(() => {

                self.walk_to_place(n, vel, finished);

            }, 700);

        }
    };

    var dice = {

        avatar: dic,
        board: board,
        value: 1,
        vel: 0.05,
        launched: false,
        feedback: false,
        visible: true,

        onClick: function () {


            if (this.visible) {

                if (this.launched) {

                    this.launched = false;
                    this.feedback = true;

                    return this.value;

                } else if (!this.feedback) {

                    this.launched = true;

                }


            }


            return 0;

        },

        draw: function (ctx) {

            ctx.font = this.board.font_size / 2 + "px " + this.board.font_type;

            if (this.visible) {

                if (this.launched) {

                    ctx.fillText(
                        (this.value),
                        this.board.font_size * this.board.dice_place[1] + this.board.font_size / 4 + 12,
                        this.board.font_size * this.board.dice_place[0] + this.board.font_size / 2 + this.board.font_size / 4 + 3);


                } else {

                    if (this.feedback) {

                        ctx.fillText(
                            (this.value),
                            this.board.font_size * this.board.dice_place[1] + this.board.font_size / 4 + 12,
                            this.board.font_size * this.board.dice_place[0] + this.board.font_size / 2 + this.board.font_size / 4 + 3);

                    } else {

                        ctx.fillText(
                            String.fromCodePoint(dic),
                            this.board.font_size * this.board.dice_place[1] + this.board.font_size / 4 + 3,
                            this.board.font_size * this.board.dice_place[0] + this.board.font_size / 2 + this.board.font_size / 4 + 3);

                    }

                }

            } else {

                // ctx.fillText(
                //     String.fromCodePoint(ept),
                //     this.board.font_size * this.board.dice_place[1] + this.board.font_size / 4 + 3,
                //     this.board.font_size * this.board.dice_place[0] + this.board.font_size / 2 + this.board.font_size / 4 + 3);


            }

        },

        update: function (dt) {

            if (this.launched && !this.feedback) {

                this.value = Math.floor(this.value + this.vel * dt);

                if (this.value > 6) this.value = 1;

            }

        },

    }


    var game = {
        canvas: document.getElementById("board"),
        ctx: document.getElementById("board").getContext("2d"),
        dice: dice,
        board: board,
        players: [player_1],
        turn: 0,
        time: Date.now(),
        run: function () {

            for (let index = 0; index < this.players.length; index++) {
                this.players[index].goto_place(0);
            }

            var self = this;

            this.canvas.addEventListener('click', function (event) {
                const value = self.dice.onClick();

                

                if (value > 0) {

                    const place = Math.min(self.players[self.turn].place + value, self.board.path.length - 1);


                    self.players[self.turn].walk_to_place(
                        place,
                        0.008,
                        (n) => {

                            self.dice.launched = false;
                            self.dice.feedback = false;

                        });
                }
            });


            setInterval(() => {

                const current = Date.now();
                const dt = current - self.time;

                self.board.update(dt);
                self.dice.update(dt);
                for (let index = 0; index < self.players.length; index++) {
                    self.players[index].update(dt);
                }

                self.board.draw(self.ctx);
                self.dice.draw(self.ctx);
                for (let index = 0; index < self.players.length; index++) {
                    self.players[index].draw(self.ctx);
                }

                self.time = current;

                // console.log(player_1.vel);

            }, 33);

        }
    };



    game.run();



    // player_1.goto_place(0);

    // var teste2 = setTimeout(() => {

    //     player_1.walk_to_place(3, 0.008, (n) => {

    //         // alert("ok: " + n);

    //     });

    // }, 4000);

    // teste2 = setTimeout(() => {

    //     player_1.walk_to_place(0, 0.008, (n) => {

    //         // alert("ok: " + n);

    //     });

    //     // clearInterval(interval);

    // }, 8000);



}