class SBox extends GBox{
    constructor(x, y, w, h, a = 0){
    super(x, y, w, h, a);
    this.body.isStatic = true;
}
}