class Game {

    constructor(canvas, def_scenes) {

        this.engine = undefined;
        this.def_scenes = def_scenes;
        this.def_scene_index = 0;
        this.current_scene = undefined;
        this.canvas = canvas;
        this.score = 0;

    }  
    
    setup(){

        this.next();

    }

    gameOver(){

        console.log("Game Over: " + this.score);

    }

    next() {

        const self = this;

        if (this.def_scene_index < this.def_scenes.length) {

            this.engine = Matter.Engine.create();

            this.current_scene = new Scene(this.canvas, this.engine, this.def_scenes[this.def_scene_index++], (score)=>{

                self.score += score;

                self.next();
                console.log("Scene Over: " + score);


            });        

        } else {

            this.current_scene = null;
            this.gameOver();

        }

    }

    draw() {

        if(this.engine)Matter.Engine.update(this.engine);
        if (this.current_scene) {
            this.current_scene.draw();
        }

    }

}