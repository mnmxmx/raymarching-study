precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float wheel;

const float PI = 3.14159265359;

struct pc { // perspective camera
    vec3 origin;
    vec3 dir;
};

mat3 lookAt(vec3 eye, vec3 center, vec3 up) {
    // Based on gluLookAt man page
    vec3 f = normalize(center - eye);
    vec3 s = normalize(cross(f, up));
    vec3 u = cross(s, f);
    return mat3(s, u, -f);
}

pc setCamera(float fov, vec3 ro, vec3 centerPos){
    vec2 xy = gl_FragCoord.xy - resolution / 2.0;
    float z = resolution.y / tan(radians(fov) / 2.0);
    vec3 viewDir = normalize(vec3(xy, -z));
    mat3 viewToWorld = lookAt(ro, centerPos, vec3(0.0, 1.0, 0.0));
    
    vec3 worldDir = viewToWorld * viewDir;

    return pc(ro, worldDir);
}

mat4 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(1, 0, 0, 0),
        vec4(0, c, -s, 0),
        vec4(0, s, c, 0),
        vec4(0, 0, 0, 1)
    );
}

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

mat4 rotateZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(c, -s, 0, 0),
        vec4(s, c, 0, 0),
        vec4(0, 0, 1, 0),
        vec4(0, 0, 0, 1)
    );
}

float sdPlaneX(in vec3 p, in float x)
{
    return distance(p,vec3(x,p.y,p.z));
}

float sdPlaneY(in vec3 p, in float y)
{
    return distance(p,vec3(p.x,y,p.z));
}

float sdPlaneZ(in vec3 p, in float z)
{
    return distance(p,vec3(p.x,p.y,z));
}


float sdSphere(in vec3 p, in vec3 c, float r)
{
    return length(p - c) - r;
}


float sdTorus( vec3 p, vec3 c, vec2 t )
{
  vec3 pos = p - c;
  vec2 q = vec2(length(pos.xz)-t.x,pos.y);
  return length(q)-t.y;
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

float expFog(float d, float density) {
	float dd = d * density;
	return exp(-dd * dd);
}



