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
            w: 400,
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
                w: 250,
                h: 60
            },
    
        },
        {

            position: {
                x: 350,
                y: 300
            },
        
            dimension: {
                w: 250,
                h: 60
            },
    
        },
        {

            position: {
                x: 350,
                y: 400
            },
        
            dimension: {
                w: 250,
                h: 60
            },
    
        },
        {

            position: {
                x: 350,
                y: 500
            },
        
            dimension: {
                w: 250,
                h: 60
            },
    
        }
    ],


    nextTime: 3000,

    mouse: {
        timeToRelease: 10,
        stiffness: .1,
        mask: 0b10,
        bind: undefined,
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

    elements: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],

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

        dimension: 70,

        position: {
            x: 80,
            y: 550
        },

        draw: {
            e1: {
                code: 0x1F573,
                rate: 1.5
            },
            e2: undefined
        },

        redraw: undefined,

        bodyOptions: {
            frictionAir: .03,
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

    building2: { //9

        height: 22,
        width: 242,
        
        draw: {
            e1: {
                code: 0x2B1B,
                rate: .81
            },
            e2: undefined
        },

        redraw: {
            e1: {
                code: 0x2B1B,
                rate: .5
            },
            e2: {
                code: 0x1F480,
                rate: .5
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

    building3: { //8

        height: 242,
        width: 22,
        
        draw: {
            e1: {
                code: 0x2B1B,
                rate: .81
            },
            e2: undefined
        },

        redraw: {
            e1: {
                code: 0x2B1B,
                rate: .5
            },
            e2: {
                code: 0x1F480,
                rate: .5
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

    building4: { //7

        height: 22,
        width: 110,
        
        draw: {
            e1: {
                code: 0x2B1B,
                rate: .81
            },
            e2: undefined
        },

        redraw: {
            e1: {
                code: 0x2B1B,
                rate: .5
            },
            e2: {
                code: 0x1F480,
                rate: .5
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

    building5: { //6

        height: 110,
        width: 22,
        
        draw: {
            e1: {
                code: 0x2B1B,
                rate: .81
            },
            e2: undefined
        },

        redraw: {
            e1: {
                code: 0x2B1B,
                rate: .5
            },
            e2: {
                code: 0x1F480,
                rate: .5
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

    chase1: { //3

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
            label: '1',
            restitution: .8,
            collisionFilter: {
                category: 0b1
            }
        }

    },

    chase2: { //3

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
            label: '2',
            restitution: .8,
            collisionFilter: {
                category: 0b1
            }
        }

    },

    bird1: { //-1

        dimension: 45,

        position: {
            x: 150,
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

        maxLength:50,
        velLength:0.05,

        timeToRelease: 10,
        timeToBing: 50,

        constraintOptions: {

            length: 0,

            stiffness: 0.1,

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

    },



}