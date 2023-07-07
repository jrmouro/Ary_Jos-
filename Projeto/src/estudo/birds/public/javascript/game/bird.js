class Bird extends Ball {

  constructor( x, y, r,
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

    this.isDead = false;

  }

  dead(){
    this.change();
    this.isDead = true;
  }


}