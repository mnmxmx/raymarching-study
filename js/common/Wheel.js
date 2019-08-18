export default class Wheel{
    constructor(){
        this._wheel = 0;
        this.wheel = 0;
        window.addEventListener("wheel", (e) => {
            this._wheel += e.deltaY;
        });
    }

    render(){
        this.wheel += (this._wheel - this.wheel) * 0.2;
    }
}