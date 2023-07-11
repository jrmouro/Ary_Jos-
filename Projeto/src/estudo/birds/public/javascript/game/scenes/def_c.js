const challenge_scene = {
    
    theme:{

        position: {
            x: 20,
            y: 60
        },
    
        dimension: {
            w: 400,
            h: 60
        },

    },

    question:{

        position: {
            x: 20,
            y: 100
        },
    
        dimension: {
            w: 200,
            h: 90
        },

    },

    options:[
        {

            position: {
                x: 350,
                y: 200
            },
        
            dimension: {
                w: 200,
                h: 60
            },
    
        },
        {

            position: {
                x: 350,
                y: 300
            },
        
            dimension: {
                w: 200,
                h: 60
            },
    
        },
        {

            position: {
                x: 350,
                y: 400
            },
        
            dimension: {
                w: 200,
                h: 60
            },
    
        },
        {

            position: {
                x: 350,
                y: 500
            },
        
            dimension: {
                w: 200,
                h: 60
            },
    
        }
    ],


    nextTime: 3000,

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

    position: {
        x: 18,
        y: 18
    },

    dimension: {
        w: 25,
        h: 25
    },

    spacing: {
        w: 17,
        h: 17
    },

    drawFunction: () => {
        background(45, 180, 145);
    },

    

    sensor1: { //4

        dimension: 25,

        draw: {
            e1: {
                code: 0x1F525,
                rate: 1.2
            },
            e2: undefined
        },

        redraw: {
            e1: {
                code: 0x1F525,
                rate: .95
            },
            e2: {
                code: 0x1F480,
                rate: .95
            },
        },

        bodyOptions: {
            frictionAir: .03,
            isStatic: true,
            isSensor: true,
            label: '4',
            restitution: .8,
            collisionFilter: {
                category: 0b1
            }
        }

    },

    sensor2: { //5

        dimension: 35,

        position: {
            x: 110,
            y: 500
        },

        draw: {
            e1: {
                code: 0x1F573,
                rate: 3.0
            },
            e2: undefined
        },

        redraw: undefined,

        bodyOptions: {
            frictionAir: .028,
            isStatic: true,
            isSensor: true,
            label: '5',
            restitution: .8,
            collisionFilter: {
                category: 0b1
            }
        }

    },

    building1: { //2

        dimension: 22,

        draw: {
            e1: {
                code: 0x1F333,
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
                rate: .95
            },
        },

        bodyOptions: {
            frictionAir: .03,
            isStatic: true,
            isSensor: false,
            label: '2',
            restitution: .8,
            collisionFilter: {
                category: 0b1
            }
        }

    },

    ground: { //9

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
            label: '2',
            restitution: .8,
            collisionFilter: {
                category: 0b1
            }
        }

    },

    chase1: { //3

        dimension: 30,

        draw: {
            e1: {
                code: 0x1F997,
                rate: 1.3
            },
            e2: undefined,
        },

        redraw: {
            e1: {
                code: 0x1F997,
                rate: 1.0
            },
            e2: {
                code: 0x1F578,
                rate: 1.3
            },
        },

        bodyOptions: {
            frictionAir: .03,
            isStatic: true,
            isSensor: true,
            label: '1',
            restitution: .8,
            collisionFilter: {
                category: 0b1
            }
        }

    },

    chase2: { //3

        dimension: 30,

        draw: {
            e1: {
                code: 0x1F997,
                rate: 1.3
            },
            e2: undefined,
        },

        redraw: {
            e1: {
                code: 0x1F997,
                rate: 1.0
            },
            e2: {
                code: 0x1F578,
                rate: 1.3
            },
        },

        bodyOptions: {
            frictionAir: .03,
            isStatic: true,
            isSensor: true,
            label: '3',
            restitution: .8,
            collisionFilter: {
                category: 0b1
            }
        }

    },

    chase3: { //3

        dimension: 45,

        draw: {
            e1: {
                code: 0x1F997,
                rate: .95
            },
            e2: undefined,
        },

        redraw: {
            e1: {
                code: 0x1F997,
                rate: .95
            },
            e2: {
                code: 0x1F578,
                rate: 1.3
            },
        },

        bodyOptions: {
            frictionAir: .03,
            isStatic: true,
            isSensor: true,
            label: '7',
            restitution: .8,
            collisionFilter: {
                category: 0b1
            }
        }

    },

    bird1: { //-1

        dimension: 45,

        position: {
            x: 200,
            y: 350
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
            frictionAir: .06,
            isStatic: false,
            isSensor: false,
            label: 'b',
            restitution: .003,
            collisionFilter: {
                category: 0b10
            }
        }

    },

    sling: {

        limit: 90,

        maxLength:60,
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