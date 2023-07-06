class GBox extends DrawBody{

    constructor(x, y, w, h, a = 0){

        super(Matter.Bodies.rectangle(x, y, w, h, {
            collisionFilter:{ },
            angle:a,
            restitution:1
          }),()=>{

            rectMode(CENTER);
            rect(0, 0, w, h);

        });

    }

}