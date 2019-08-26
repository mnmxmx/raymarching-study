import vertexShader from './glsl/output.vert';
import fragmentShader from './glsl/output.frag';

import _WebGL from '../../common/WebGL';

export default class Webgl extends _WebGL{
  constructor($canvas){

    const uniforms = {
    };

    super({
      $canvas: $canvas,
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

  }
  

  render(){
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