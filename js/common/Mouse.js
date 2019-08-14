
export default class Mouse{
  constructor(prop){
    this.prop = prop;

    this.mouseMove = this._mouseMove.bind(this);

    this._mousePos = [0, 0];
    this.mousePos = [0, 0];


    this.prop.$canvas.addEventListener( 'mousemove', this.mouseMove.bind(this), false );
  }

  _mouseMove(e){
    e.preventDefault();

    var x = e.clientX;
    var y = e.clientY;

    x = x / window.innerWidth;
    y = 1 - y / window.innerHeight;

    x = x * 2 - 1;
    y = y * 2 - 1;

    this._mousePos[0] = x;
    this._mousePos[1] = y;
  }

  render(){
    this.mousePos[0] += (this._mousePos[0] - this.mousePos[0]) * 0.1;
    this.mousePos[1] += (this._mousePos[1] - this.mousePos[1]) * 0.1;
  }
}