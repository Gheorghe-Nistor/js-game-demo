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
    distance(obj){
        return Math.sqrt((this.getLeft()-obj.getLeft())**2+(this.getTop()+obj.getTop())**2);
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
    getTankView() {return this.#tankView;}
}
const tank = new Tank();

let zombieIndex = 0;

class Zombie extends HTMLObject{
    #zombie;
    #health;
    #healthBar;
    #speed;
    #moveInterval;
    constructor(size = 80, health = 100, speed = 5){
        super('zombie-container');
        document.body.appendChild(this.props());
        this.#healthBar = document.createElement('p');
        this.props().appendChild(this.#healthBar);

        this.#zombie = document.createElement('img');
        this.props().className = 'zombie-container';
        this.props().appendChild(this.#zombie);
        this.#zombie.className = 'zombie';
        this.#zombie.id = zombieIndex++;

        this.setLeft(Math.random()*window.innerWidth);
        this.setTop(Math.random()*2);

        let spawn = Math.floor(Math.random()*4), spawnLeft, spawnTop;

        switch(spawn){
            case 0:
                spawnLeft = 0;
                spawnTop  = Math.random()*window.innerHeight;
                break;
            case 1:
                spawnLeft = Math.random()*window.innerWidth;
                spawnTop  = 0;
                break;
            case 2:
                spawnLeft = window.innerWidth;
                spawnTop  = Math.random()*window.innerHeight
                break;
            case 3:
                spawnLeft = Math.random()*window.innerWidth
                spawnTop  = window.innerHeight;
                break;
        }
        
        this.setLeft(spawnLeft);
        this.setTop(spawnTop);
        this.setSize(size);
        
        this.#health = health;
        this.setHealthBar();
        this.#speed = speed;

        this.#moveInterval = setInterval(() => {
            const angle = (getCurrentRotation(this.props())-90) * Math.PI/180;
            
            const deltaX = Math.cos(angle) * this.#speed;
            const deltaY = Math.sin(angle) * this.#speed;

            this.setLeft(this.props().offsetLeft + deltaX);
            this.setTop (this.props().offsetTop + deltaY);
            
            this.rotate(tank)
            
            const centerX = this.getLeft() + this.getWidth()/2  - window.pageXOffset;
            const centerY = this.getTop()  + this.getHeight()/2 - window.pageYOffset;

            if(tank.props().isSameNode(document.elementFromPoint(centerX, centerY))){
                for(let zombie of zombieArr)
                    zombie.die();
                clearInterval(spawnZombies);
                alert('game over!');
                location.reload();
            }
        }, 200);
    }
    getZombie(){return this.#zombie;}
    getHealth(){return this.#health;}
    setSize(size){this.#zombie.style.height = size + 'px';}
    setHealthBar(){this.#healthBar.textContent = this.#health;}
    shot(damage) {
        this.#health -= damage; 
        if(this.#health <= 0)
            this.die();
        this.setHealthBar();
    }
    die() {
        zombieArr[parseInt(this.props().id)] = null; 
        this.props().remove();
        this.getZombie().remove();
        clearInterval(this.#moveInterval);
        
    }
}

const getCurrentRotation = (element) => {
    const transform = getComputedStyle(element, null).getPropertyValue("transform");
    if(transform == "none")
        return 0;
    const values = transform.match(/-?\d\.[\d]+/g);
    return Math.round(Math.atan2(values[1], values[0])*(180/Math.PI));
}

const firstZombie = new Zombie();
let zombieArr = [firstZombie], spawnZombies;

const init = () => {
    spawnZombies = setInterval(() => {
        zombieArr.push(new Zombie());
        zombieArr.push(new Zombie(50, 10, 15));
    }, 20000)
    document.addEventListener("mouseenter", (e) => {
        tankTarget.props().style.display = 'block';
    });

    document.addEventListener("mouseleave", (e) => {
        tankTarget.props().style.display = 'none';
    });  

    document.addEventListener("mousemove", ({clientX, clientY} = e) => {
        tankTarget.setPos(clientX, clientY);
        if(tank.props().isSameNode(document.elementsFromPoint(clientX, clientY)[1]))
            return;
        tank.rotate(tankTarget);

        const elements = document.elementsFromPoint(clientX, clientY);
        if(elements[3] != undefined && elements[3].className == 'zombie-container')
            tankTarget.props().className = 'tank-target-red';
        else 
            tankTarget.props().className = 'tank-target-green';
        

    });
    
    let SHOT = true;
    document.addEventListener("click", (e) => {
        e.preventDefault();

        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        if(elements.length < 3)
            return;
        if(SHOT == false)
            return;
        SHOT = false;
        setTimeout(() => {
            SHOT = true;
        }, 1000);

     
        const explosion = new Audio('./resources/explosion.wav');
        explosion.volume = 0.2;
        explosion.play();

        tankTarget.props().style.transform = 'scale(1.5)';
        setTimeout(() => {
            tankTarget.props().style.transform = 'scale(1)';
        }, 300);

        if(elements[3] != undefined && elements[3].className == 'zombie-container'){
            zombieArr[parseInt(elements[3].children[1].id)].shot(Math.floor(Math.random()*5+10));
        }
    });

    document.addEventListener("keydown", (e) => {
        if(e.key == 'w')
            tank.move('forward');
        if(e.key == 's')
            tank.move('backward');
    });
    tank.getTankView().props().className = 'game-over';
}
window.onload = init;

