class DrawWorld extends Drawable {

  constructor(world, x = 0, y = 0, a = 0, drawFunction = () => {}) {
    super(x, y, a, drawFunction);
    this.world = world;
  }

  add(key, drawable) {
    super.add(key, drawable);
    if (drawable instanceof DrawBody) {
      Matter.Composite.add(this.world, drawable.body);
    } else if (drawable instanceof Binding) {
      Matter.Composite.add(this.world, drawable.constraint);
    }    
  }

  delete(key) {
    const obj = this.get(key);
    if (obj instanceof DrawBody) {
      Matter.Composite.remove(this.world, obj.body);
    } else if (obj instanceof Binding) {
      Matter.Composite.remove(this.world, obj.constraint);
    } else if (obj instanceof DrawWorld) {
      obj.clear();
    }
    this.map.delete(key);
  }

}