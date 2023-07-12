class DrawBody extends Drawable {
    constructor(body, drawFunction) {
      super(body.position.x, body.position.y, body.angle, drawFunction);
      this.body = body;  
    }

    draw() {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.a = this.body.angle;
      super.draw();
    };
    
}