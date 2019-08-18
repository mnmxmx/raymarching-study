precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float wheel;

const float PI = 3.14159265359;

mat4 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(c, 0, s, 0),
        vec4(0, 1, 0, 0),
        vec4(-s, 0, c, 0),
        vec4(0, 0, 0, 1)
    );
}



float sdSphere(in vec3 p, in vec3 c, float r)
{
    return length(p - c) - r;
}

float sdBox( vec3 p, vec3 c, vec3 b )
{
  vec3 d = abs(p - c) - b;
  return length(max(d,0.0))
         + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
}

float sdRoundBox( vec3 p, vec3 c, vec3 b, float r )
{
  vec3 d = abs(p - c) - b;
  return length(max(d,0.0)) - r
         + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
}

float unite( float a, float b){return min(a, b);}
float subtract( float a, float b ){ return max(-a, b); }
float intersect( float a, float b ){ return max(a, b); }

float smoothUnion_h(float d1, float d2, float k) {
    return clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
}

float smoothUnion( float d1, float d2, float k ) {
    float h = smoothUnion_h(d1, d2, k);
    return mix( d2, d1, h ) - k*h*(1.0-h); 
}

float smoothSubtraction( float d1, float d2, float k ) {
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h); 
}

float smoothIntersection( float d1, float d2, float k ) {
    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) + k*h*(1.0-h); 
}