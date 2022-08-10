class HTMLObject{
    #props;
    #left;
    #top;
    #width;
    #height;
    constructor(id){
        this.#props  = document.getElementById(id);
        this.#left   = this.#props.getBoundingClientRect().left;
        this.#top    = this.#props.getBoundingClientRect().top;
        this.#width  = this.#props.getBoundingClientRect().width;
        this.#height = this.#props.getBoundingClientRect().height;
    }
    props()  {return this.#props;}
    getLeft()   {return this.#left;}
    getTop()    {return this.#top;}
    getWidth()  {return this.#width;}
    getHeight() {return this.#height;}
    setLeft(pos) {
        this.#left = pos;
        this.#props.style.left = pos + 'px'
    }
    setTop(pos)  {
        this.#top  =  pos;
        this.#props.style.top = pos + 'px'
    }
}

class Tank extends HTMLObject{
    #tankView;
    #speed;
    constructor(){
        super('tank');
        this.#speed = 5;
        this.#tankView = new HTMLObject('tank-view')
    }
    moveForward(){
        const angle = getCurrentRotation(this.props());
        console.log(angle);
        const deltaX = Math.sin(angle) * this.#speed;
        const deltaY = -Math.cos(angle) * this.#speed;

        this.#tankView.setLeft(this.#tankView.getLeft()+deltaX);
        this.#tankView.setTop(this.#tankView.getTop()+deltaY);
    }

    moveBackward(){
        this.#tankView.setTop(this.#tankView.getTop()+this.#speed);
    }
}

class TankTarget extends HTMLObject{
    constructor(){
        super('tank-target');
    }
}

const getCurrentRotation = (element) => {
    const style = window.getComputedStyle(element, null);
    const transform = style.getPropertyValue("transform");
    if(transform == "none")
        return 0;
    const values = transform.split('(')[1].split(')')[0].split(',');
    return Math.round(Math.atan2(values[1],values[0]) * (180/Math.PI));
}

const init = () => {
    //document.addEventListener('contextmenu', (e) => e.preventDefault());
    const tank = new Tank();
    const tankTarget = new TankTarget();
    
    document.addEventListener("mousemove", ({clientX, clientY} = e) => {
        // move tank target
        tankTarget.setLeft(clientX-tankTarget.getWidth()/2);
        tankTarget.setTop(clientY -tankTarget.getHeight()/2);

        // rotate tank 
        const centerX = tank.getLeft() + tank.getWidth()/2  - window.pageXOffset;
        const centerY = tank.getTop()  + tank.getHeight()/2 - window.pageYOffset;

        const radians = Math.atan2(clientX-centerX, clientY-centerY);
        const degree  = (radians * (180 / Math.PI) * -1) + 180; 

        tank.props().style.transform = `rotate(${degree}deg)`;

        console.log(getCurrentRotation(tank.props()));
    });
    
    document.addEventListener("keydown", (e) => {
        if(e.key == 'w')
            tank.moveForward();
        if(e.key == 's')
            tank.moveBackward();
    });
}
window.onload = init;

