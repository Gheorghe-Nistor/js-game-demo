class HTMLObject{
    #props;
    #width;
    #height;
    constructor(id){
        if(id === 'zombie-container')
            this.#props = document.createElement('div');
        else
            this.#props  = document.getElementById(id);
        this.#width  = this.#props.getBoundingClientRect().width;
        this.#height = this.#props.getBoundingClientRect().height;
    }
    props()     {return this.#props;}
    getLeft()   {return this.#props.getBoundingClientRect().left;}
    getTop()    {return this.#props.getBoundingClientRect().top;}
    getWidth()  {return this.#width;}
    getHeight() {return this.#height;}
    setLeft(pos) {this.#props.style.left = pos + 'px'}
    setTop(pos)  {this.#props.style.top  = pos + 'px'}
    rotate(obj){
        const centerX = this.getLeft() + this.getWidth()/2  - window.pageXOffset;
        const centerY = this.getTop()  + this.getHeight()/2 - window.pageYOffset;
    
        const radians = Math.atan2(obj.getLeft()-centerX, obj.getTop()-centerY);
        const degree  = (radians * (180 / Math.PI) * -1) + 180; 
    
        this.props().style.transform = `rotate(${degree}deg)`;
    }
}

class TankTarget extends HTMLObject{
    constructor(){
        super('tank-target');
    }
    setPos(clientX, clientY) {
        this.setLeft(clientX-this.getWidth()/2);
        this.setTop(clientY -this.getHeight()/2);
    }
}
const tankTarget = new TankTarget();

class Tank extends HTMLObject{
    #tankView;
    #speed;
    constructor(){
        super('tank');
        this.#speed = 4;
        this.#tankView = new HTMLObject('tank-view')
    }
    move(direction) {
        if(tankTarget.props().style.display === "none")
            return;
        this.rotate(tankTarget);

        let x;
        direction === 'forward' ? x = -90: x = 90;
        const angle = (getCurrentRotation(this.props())+x) * Math.PI/180;
        
        const speed = direction === 'forward' ? this.#speed : this.#speed/2;
        const deltaX = Math.cos(angle) * speed;
        const deltaY = Math.sin(angle) * speed;

        this.#tankView.setLeft(this.#tankView.getLeft()+deltaX);
        this.#tankView.setTop(this.#tankView.getTop()+deltaY);  
    }
}
const tank = new Tank();

const WINDOW = {
    width: window.innerWidth,
    height: window.innerHeight
}

class Zombie extends HTMLObject{
    #speed;
    #zombie;
    #interval;
    constructor(){
        super('zombie-container');
        document.body.appendChild(this.props());
        this.#zombie = document.createElement('img');
        this.props().className = 'zombie-container';
        this.props().appendChild(this.#zombie);
        this.#zombie.className = 'zombie';

        this.setLeft(Math.random()*WINDOW.width);
        this.setTop(Math.random()*2);

        let spawn = Math.floor(Math.random()*4), spawnLeft, spawnTop;

        switch(spawn){
            case 0:
                spawnLeft = 0;
                spawnTop  = Math.random()*WINDOW.height;
                break;
            case 1:
                spawnLeft = Math.random()*WINDOW.width;
                spawnTop  = 0;
                break;
            case 2:
                spawnLeft = WINDOW.width;
                spawnTop  = Math.random()*WINDOW.height
                break;
            case 3:
                spawnLeft = Math.random()*WINDOW.width
                spawnTop  = WINDOW.height;
                break;
        }
        
        this.setLeft(spawnLeft);
        this.setTop(spawnTop);
        this.setSize(Math.random()*40+60);
        this.#speed = 2;

        this.#interval = setInterval(() => {
            const angle = (getCurrentRotation(this.props())-90) * Math.PI/180;
            
            const deltaX = Math.cos(angle) * this.#speed;
            const deltaY = Math.sin(angle) * this.#speed;

            this.setLeft(this.props().offsetLeft + deltaX);
            this.setTop (this.props().offsetTop + deltaY);
            
            this.rotate(tank)
        }, 200);

        this.props().addEventListener("click", () => {
            console.log('x');
            this.props().remove();
            this.getZombie().remove();
            clearInterval(this.#interval);
        });

    }
    getZombie(){return this.#zombie;}
    setSize(size){this.#zombie.style.width = this.height + 'px';}
}
const firstZombie = new Zombie(); 


const getCurrentRotation = (element) => {
    const transform = getComputedStyle(element, null).getPropertyValue("transform");
    if(transform == "none")
        return 0;
    const values = transform.match(/-?\d\.[\d]+/g);
    return Math.round(Math.atan2(values[1], values[0])*(180/Math.PI));
}

const init = () => {
    //document.addEventListener('contextmenu', (e) => e.preventDefault());
    /*setInterval(() => {
        new Zombie();
    }, 5000);*/

    document.addEventListener("mouseenter", (e) => {
        tankTarget.props().style.display = 'block';
    });

    document.addEventListener("mouseleave", (e) => {
        tankTarget.props().style.display = 'none';
    });  

    document.addEventListener("mousemove", ({clientX, clientY} = e) => {
        tankTarget.setPos(clientX, clientY);
        tank.rotate(tankTarget);
    });
    
    document.addEventListener("click", (e) => {
        e.preventDefault();
        tankTarget.props().classList = "tank-target-red";
        setTimeout(() => {
            tankTarget.props().classList = "tank-target-green"; 
        }, 250);
    });

    document.addEventListener("keydown", (e) => {
        if(e.key == 'w')
            tank.move('forward');
        if(e.key == 's')
            tank.move('backward');
    });
}
window.onload = init;

