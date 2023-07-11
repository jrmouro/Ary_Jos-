class Binding extends Drawable {

    constructor(
        constraintOptions = undefined,
        drawPointA = {
            radius: 25,
            e1: {
                code: 0x1F6D1,
                rate: .95
            },
            e2: undefined
        }) {

        super(
            constraintOptions.bodyA ? constraintOptions.bodyA.position.x : 0 + constraintOptions.pointA.x,
            constraintOptions.bodyA ? constraintOptions.bodyA.position.y : 0 + constraintOptions.pointA.y, 0, () => {

                if (constraintOptions && constraintOptions.bodyB) {

                    if (drawPointA) {

                        textAlign(CENTER, CENTER);

                        if (drawPointA.e1) {
                            textSize(drawPointA.radius * drawPointA.e1.rate);
                            text(String.fromCodePoint(drawPointA.e1.code), 0, 0);
                        }

                        if (drawPointA.e2) {
                            textSize(drawPointA.radius * drawPointA.e2.rate);
                            text(String.fromCodePoint(drawPointA.e2.code), 0, 0);
                        }

                    }

                    strokeWeight(2);

                    line(0, 0,
                        constraintOptions.bodyB.position.x + constraintOptions.pointB.x - (constraintOptions.bodyA ? constraintOptions.bodyA.position.x : 0) - constraintOptions.pointA.x,
                        constraintOptions.bodyB.position.y + constraintOptions.pointB.y - (constraintOptions.bodyA ? constraintOptions.bodyA.position.y : 0) - constraintOptions.pointA.y);

                }

            });

        this.drawPointA = drawPointA;
        this.constraint = Matter.Constraint.create(constraintOptions);

    }

    // bind(constraintOptions) {

    //     setTimeout((binding) => {

    //         if (pointA) {
    //             binding.constraint.pointA = pointA;
    //             binding.x = (binding.constraint.bodyA ? binding.constraint.bodyA.position.x : 0) + binding.constraint.pointA.x;
    //             binding.y = (binding.constraint.bodyA ? binding.constraint.bodyA.position.y : 0) + binding.constraint.pointA.y;
    //         }

    //         if (pointB) binding.constraint.pointB = pointB;

    //         if (bodyB) binding.constraint.bodyB = bodyB;
    //         if (bodyA) binding.constraint.bodyA = bodyA;

    //         if (binding.constraint.bodyB) {

    //             this.drawFunction = () => {

    //                 if (binding.constraint.bodyB) {

    //                     if (binding.drawPointA) {

    //                         textAlign(CENTER, CENTER);

    //                         if (binding.drawPointA.e1) {
    //                             textSize(binding.drawPointA.radius * binding.drawPointA.e1.rate);
    //                             text(String.fromCodePoint(binding.drawPointA.e1.code), 0, 0);
    //                         }

    //                         if (binding.drawPointA.e2) {
    //                             textSize(binding.drawPointA.radius * binding.drawPointA.e2.rate);
    //                             text(String.fromCodePoint(binding.drawPointA.e2.code), 0, 0);
    //                         }

    //                     }

    //                     line(0, 0,
    //                         binding.constraint.bodyB.position.x + binding.constraint.pointB.x - (binding.constraint.bodyA ? binding.constraint.bodyA.position.x : 0) - binding.constraint.pointA.x,
    //                         binding.constraint.bodyB.position.y + binding.constraint.pointB.y - (binding.constraint.bodyA ? binding.constraint.bodyA.position.y : 0) - binding.constraint.pointA.y);

    //                 }
    //             }
    //         }



    //     }, timeToBing, this);



    // }

    release(timeToRelease = 0) {

        if (this.constraint) {

            setTimeout((binding) => {

                binding.constraint.bodyB = null;
                this.drawFunction = () => {}

            }, timeToRelease, this);

        }

    }

    isBind() {

        return this.constraint.bodyB !== null;

    }

}