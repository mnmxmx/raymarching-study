import commonFragmentShader from './glsl/common-func.frag';
import Mouse from "./Mouse.js";

export default class WebGL{
    constructor(props){
        this.props  = props;
        this.$canvas = props.$canvas;

        // this.windowSize = [window.innerWidth, window.innerHeight];
        this.windowSize = [window.innerWidth, window.innerHeight];
        this.$canvas.width = this.windowSize[0];
        this.$canvas.height = this.windowSize[1];
    
    
        this.gl = this.$canvas.getContext('webgl', { antialias: false });
    
        
        this.resize();

        this.mouse = new Mouse({
          $canvas: this.$canvas
        });

        this.uniforms = {
            time: {
                value: 0,
                location: null,
                type: 'f'
            },
            resolution: {
                value: this.windowSize,
                location: null,
                type: 'v2'
            },
            mouse: {
              value: this.mouse.mousePos,
              location: null,
              type: 'v2'
            },
            ...props.uniforms
        };

        this.init();
    }

    init(){
      const fragment = commonFragmentShader + this.props.fragmentShader;
        this.program = this.createProgram(
          this.createShader(this.props.vertexShader, 'vertex'), 
          this.createShader(fragment, 'fragment')
        );
    
        for(let key in this.uniforms){
          this.uniforms[key].location = this.gl.getUniformLocation(this.program, key);
        }
    
        const position = [
          -1.0,  1.0,  0.0,
           1.0,  1.0,  0.0,
          -1.0, -1.0,  0.0,
           1.0, -1.0,  0.0
        ];
    
        const index = [
          0, 2, 1,
          1, 2, 3
        ];
        const vPosition = this.createVbo(position);
        const vIndex = this.createIbo(index);
        const vAttLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vPosition);
        this.gl.enableVertexAttribArray(vAttLocation);
        this.gl.vertexAttribPointer(vAttLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vIndex);
    
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
        this.startTime = new Date().getTime();
    
        this.render();
    }

    createShader(text, type){
        let shader;
        switch(type){
        
        case 'vertex':
          shader = this.gl.createShader(this.gl.VERTEX_SHADER);
          break;
    
        case 'fragment':
          shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
          break;
        default :
          return;
        }
    
        this.gl.shaderSource(shader, text);
    
        this.gl.compileShader(shader);
    
        if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
          
          return shader;
        }else{
          console.error(this.gl.getShaderInfoLog(shader));
          console.warn(this.gl.getShaderInfoLog(shader));
        }
    }

    createProgram(vertex, fragment){
        const program = this.gl.createProgram();
      
        this.gl.attachShader(program, vertex);
        this.gl.attachShader(program, fragment);
        
        this.gl.linkProgram(program);
        
        if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
        
          this.gl.useProgram(program);
          
          return program;
        }else{      
          return null;
        }
      }
    
    createVbo(data){
        const vbo = this.gl.createBuffer();
      
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        
        return vbo;
    }
    
    createIbo(data){
        const ibo = this.gl.createBuffer();
      
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
        
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        
        return ibo;
    }

    setUniforms(){
        for(let key in this.uniforms){
          const uniform = this.uniforms[key];
          switch(uniform.type){
            case 'f':
              this.gl.uniform1f(uniform.location, uniform.value); 
              break;
            case 'v2':
              this.gl.uniform2fv(uniform.location, uniform.value);
              break;
          }
        }
    }

    render(){
      this.mouse.render();
    }

    resize(){
        this.windowSize[0] = window.innerWidth;
        this.windowSize[1] = window.innerHeight;

        this.$canvas.width = this.windowSize[0];
        this.$canvas.height = this.windowSize[1];

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }
}