import vertexShader from './glsl/output.vert';
import fragmentShader from './glsl/output.frag';
import _WebGL from '../../common/WebGL';

function setHex( hex ) {

  hex = Math.floor( hex );

  const r = ( hex >> 16 & 255 ) / 255;
  const g = ( hex >> 8 & 255 ) / 255;
  const b = ( hex & 255 ) / 255;

  return [r, g, b];
}

export default class Webgl extends _WebGL{
  constructor($canvas){

    const uniforms = {
      "blobs[0].color" : {
        value: setHex(0xffb6b9),
        location: null,
        type: 'v3'
      },
      "blobs[1].color" : {
        value: setHex(0xfae3d9),
        location: null,
        type: 'v3'
      },
      "blobs[2].color" : {
        value: setHex(0xbbded6),
        location: null,
        type: 'v3'
      },
      "blobs[3].color" : {
        value: setHex(0x8ac6d1),
        location: null,
        type: 'v3'
      },
      "blobs[4].color" : {
        value: setHex(0xfffcab),
        location: null,
        type: 'v3'
      },

      "blobs[0].pos" : {
        value: [1.0, 1.0, 1.0],
        location: null,
        type: 'v3'
      },
      "blobs[1].pos" : {
        value: [1.0, -0.5, -1.0],
        location: null,
        type: 'v3'
      },
      "blobs[2].pos" : {
        value: [-0.8, 1.0, -0.5],
        location: null,
        type: 'v3'
      },
      "blobs[3].pos" : {
        value: [-0.4, -1.0, 0.5],
        location: null,
        type: 'v3'
      },
      "blobs[4].pos" : {
        value: [-0.5, 0.7, 1.0],
        location: null,
        type: 'v3'
      },

      "blobs[0].speed" : {
        value: 0.8,
        location: null,
        type: 'f'
      },
      "blobs[1].speed" : {
        value: 0.6,
        location: null,
        type: 'f'
      },
      "blobs[2].speed" : {
        value: 1.0,
        location: null,
        type: 'f'
      },
      "blobs[3].speed" : {
        value: 0.7,
        location: null,
        type: 'f'
      },
      "blobs[4].speed" : {
        value: 0.5,
        location: null,
        type: 'f'
      },

      
      
    };

    super({
      $canvas: $canvas,
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

  }

  
  

  render(){
    super.render();
    this.uniforms.time.value = (new Date().getTime() - this.startTime) * 0.002;

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.setUniforms();

    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    this.gl.flush();

    requestAnimationFrame(this.render.bind(this));
  }

  

  resize(){
    super.resize();
  }

}