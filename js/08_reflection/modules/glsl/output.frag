#include <common>

const vec3 center = vec3(0.0);
const float radius = 1.0;
const vec3 light_position = vec3(2000.0, -5000.0, 3000.0);

const int NUMBER_OF_STEPS = 90;
const float MINIMUM_HIT_DISTANCE = 0.01;
const float MAXIMUM_TRACE_DISTANCE = 10000.0;

const vec3 bgColor = vec3(1.0, 0.02, 0.7);
const vec3 bgColor2 = vec3(1.0, 0.6, 0.9);


vec3 normal = vec3(1, 0, 0);
vec3 currentPos = vec3(0, 0, 0);
bool hit = false;
vec2 st;
vec3 bgc = vec3(1.0);
int iteration = 0;
float fog_intensity = 1.0;
float reflectDistance = 0.0;

float trans(float p){
    float interval = 6.0;
    return mod(p, interval) - interval/2.0;
}

vec3 trans(vec3 p){
    
    vec3 interval = vec3(4.0, 4.0, 4.0);
    vec3 pos = mod(p, interval) - interval/2.0;
    return pos;
}

float sdSphere_repeat(in vec3 p, in vec3 c, float r)
{
    return length(vec3(trans(p.x - c.x), p.y - c.y + 2.0, trans(p.z - c.z))) - r;
}

float sdRoundBox_repeat( vec3 p, vec3 c, vec3 b, float r )
{
  vec3 d = abs(trans(p - c)) - b;
  return length(max(d,0.0)) - r
         + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
}


float mapTheWorld(in vec3 p)
{
    const float disS = 2.0;
    float displacement = sin(disS * p.x + time) * sin(disS * p.y + time) * sin(disS * p.z + time);
    displacement *= 0.02;
    
    // samplePoint = (rotateY(time) * vec4(samplePoint, 1.0)).xyz;
        
    // displacement *= sin(time) * 0.5 + 0.5;
    // float obj = sdSphere_repeat(p, center, radius);
    float obj = sdRoundBox_repeat(p, center, vec3(radius), 0.0);


    return obj + displacement;
}

vec3 calculateNormal(in vec3 p)
{
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = mapTheWorld(p + small_step.xyy) - mapTheWorld(p - small_step.xyy);
    float gradient_y = mapTheWorld(p + small_step.yxy) - mapTheWorld(p - small_step.yxy);
    float gradient_z = mapTheWorld(p + small_step.yyx) - mapTheWorld(p - small_step.yyx);

    normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

vec3 rayMarch(vec3 ro, in vec3 rd)
{
    float total_distance_traveled = 0.0;
    

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        currentPos = ro + total_distance_traveled * rd;

        float distance_to_closest = mapTheWorld(currentPos);

        if (distance_to_closest < MINIMUM_HIT_DISTANCE) 
        {
            // return vec3(1.0, 0.0, 0.0);
            normal = calculateNormal(currentPos);

            vec3 directionToLight = normalize(currentPos - light_position);

            // Remember, each component of the normal will be in 
            // the range -1..1, so for the purposes of visualizing
            // it as an RGB color, let's remap it to the range
            // 0..1
            float diffuseIntensity = (dot(normal, directionToLight)) * 0.5 + 0.5;
            // diffuseIntensity = pow(diffuseIntensity, 2.0);

            vec3 sp = floor((currentPos + radius - 0.11) / 8.0 );

            float cr = sin((sp.z + sp.y + sp.x) * 0.7) * 0.5 + 0.5;
            cr *= 0.5;

            vec3 scolor = vec3(cr + 0.6, 0.8, 0.8);
            scolor = hsv2rgb(scolor);

            vec3 color = mix(scolor * 0.4, (scolor * 2.0), diffuseIntensity);

            if(iteration == 0){
                fog_intensity = max(0.0, expFog(total_distance_traveled, 0.04));
            }

            color = mix(bgc, color, fog_intensity);

            hit = true;

            return color;
        }

        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
        {
            break;
        }
        total_distance_traveled += distance_to_closest;
    }

    fog_intensity = 0.0;
    return bgc;
}

void main(void){

  st = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

//   bgc =  mix(bgColor, bgColor2, st.y * 0.5 + 0.5);


  vec3 camera_position = vec3(0.0, wheel * 0.01 + time, 0.0);
  vec3 ro = camera_position;  // ray's origin
  vec3 rd = normalize(vec3(st, 2.0));  // ray's direction
 
  float camera_rotation = time * 0.1 + PI / 4.0; 

  ro = (rotateY(camera_rotation) * vec4(ro, 1.0)).xyz;
  rd = (rotateY(-camera_rotation) * vec4(rd, 1.0)).xyz;

  ro.y += time;



//   vec3 shaded_color = rayMarch(ro, rd);
  currentPos = ro;
  vec3 ray = rd;

  vec3 shaded_color = bgc;


  float alpha = 1.0;
  float alphaScale = 1.0;
  for(int i = 0; i < 3; i++) {
    iteration = i;
    vec3 _cp = currentPos;
    vec3 newColor = rayMarch(currentPos, ray);
    float reflectDistance = length(currentPos - _cp);
    float refFog = max(0.0, expFog(reflectDistance, 0.01));
    shaded_color = mix(shaded_color, newColor, alpha * refFog);
    alpha *= 0.4;
    ray = normalize(reflect(ray, normal));
    currentPos += normal * MINIMUM_HIT_DISTANCE * 10.0;
    // alphaScale += 1.0;

    if (!hit) {
      break;
    }
  }

  gl_FragColor = vec4(shaded_color, 1.0);

}