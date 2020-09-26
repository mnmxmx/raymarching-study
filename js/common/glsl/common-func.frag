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

float sdPlane( vec3 p, vec4 n )
{
  // n must be normalized
  return dot(p, n.xyz) + n.w;
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

float cubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

float cubicIn(float t) {
  return t * t * t;
}

float cubicInOut(float t) {
  return t < 0.5
    ? 4.0 * t * t * t
    : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}


float quadraticOut(float t) {
  return -t * (t - 2.0);
}

float quarticInOut(float t) {
  return t < 0.5
    ? +8.0 * pow(t, 4.0)
    : -8.0 * pow(t - 1.0, 4.0) + 1.0;
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}