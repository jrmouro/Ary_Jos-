game_def = {

    isChallenge: true,

    drawFunction: () => {
        background(45, 180, 145);
    },

    mouse: {
        timeToRelease: 10,
        bind: undefined,
        constraintOptions:{
            collisionFilter: {
                mask: 0b10
            },
            stiffness: .1
        }
    },

    ground: { //4

        height: 44,
        width: 5000,

        position: {
            x: 300,
            y: 650
        },
        
        draw: {
            e1: undefined,
            e2: undefined
        },

        redraw: {
            e1: undefined,
            e2: undefined,
        },

        bodyOptions: {
            frictionAir: .03,
            isStatic: true,
            isSensor: false,
            label: '8',
            restitution: .8,
            collisionFilter: {
                category: 0b1
            }
        }

    },

    bird1: { //-1

        dimension: 45,

        position: {
            x: 400,
            y: 300
        },

        draw: {
            e1: {
                code: 0x1F577,
                rate: .95
            },
            e2: undefined
        },

        redraw: {
            e1: {
                code: 0x1F577,
                rate: .95
            },
            e2: {
                code: 0x1F480,
                rate: .4
            },
        },

        bodyOptions: {
            frictionAir: .04,
            isStatic: false,
            isSensor: false,
            label: 'b',
            restitution: 0.1,
            collisionFilter: {
                category: 0b10
            }
        }

    },

    sling: {

        limit: 120,

        maxLength:80,
        velLength:0.05,

        timeToRelease: 10,
        timeToBing: 50,

        constraintOptions: {

            length: 0,

            stiffness: 0.15,

            pointA: {
                x: 0,
                y: 0
            },

            pointB: {
                x: 0,
                y: 0
            }

        },

        drawPointA: {

            radius: 25,

            e1: {
                code: 0x1F578,
                rate: 2
            },

            e2: undefined

        }

    }

}