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

}