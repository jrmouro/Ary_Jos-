class Drawable {

  constructor(x = 0, y = 0, a = 0 , drawFunction = () => {}) {
    this.isVisible = true;
    this.x = x;
    this.y = y;
    this.a = a;
    this.drawFunction = drawFunction;
    this.map = new Map();
  }

  add(key, drawable) {
    const obj = this.map.get(key);
    if(obj) this.delete(key);
    this.map.set(key, drawable);
  }

  delete(key) {
    this.map.delete(key);
  }

  clear() {
    const self = this;
    this.map.forEach((drawable, key) => {
      self.delete(key);
    });
  }

  draw() {
    if (this.isVisible) {
      push()
      translate(this.x, this.y);
      rotate(this.a);
      this.drawFunction();
      this.map.forEach((drawable, key) => {
        drawable.draw();
      });
      pop();
    }
  }

  get(key) {
    return this.map.get(key);
  }

}