
const vec3 center = vec3(0.0);
const float radius = 1.0;
const vec3 light_position = vec3(2000.0, -5000.0, 3000.0);

const vec3 bgColor = vec3(0.9, 0.8, 1.0);

vec3 trans(vec3 p){
    float interval = 6.0;
    return mod(p, interval) - interval/2.0;
}

float sdSphere_repeat(in vec3 p, in vec3 c, float r)
{
    return length(trans(p - c)) - r;
}

float sdRoundBox_repeat( vec3 p, vec3 c, vec3 b, float r )
{
  vec3 d = abs(trans(p - c)) - b;
  return length(max(d,0.0)) - r
         + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
}

float expFog(float d, float density) {
	float dd = d * density;
	return exp(-dd * dd);
}

float mapTheWorld(in vec3 p)
{
    const float disS = 2.4;
    vec3 samplePoint = p;
    // samplePoint = (rotateY(time) * vec4(samplePoint, 1.0)).xyz;
    
    
    float displacement = sin(disS * p.x + time) * sin(disS * p.y + time) * sin(disS * p.z + time) * 0.2;
    // displacement *= sin(time) * 0.5 + 0.5;
    float sphere_0 = 
    // sdRoundBox_repeat(samplePoint, center, vec3(0.7, 0.7, 0.7), 0.4);
    sdSphere_repeat(samplePoint, center, radius);

    return sphere_0 + displacement;
}

vec3 calculateNormal(in vec3 p)
{
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = mapTheWorld(p + small_step.xyy) - mapTheWorld(p - small_step.xyy);
    float gradient_y = mapTheWorld(p + small_step.yxy) - mapTheWorld(p - small_step.yxy);
    float gradient_z = mapTheWorld(p + small_step.yyx) - mapTheWorld(p - small_step.yyx);

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

vec3 rayMarch(in vec3 ro, in vec3 rd)
{
    float total_distance_traveled = 0.0;
    const int NUMBER_OF_STEPS = 64;
    const float MINIMUM_HIT_DISTANCE = 0.01;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        vec3 current_position = ro + total_distance_traveled * rd;

        float distance_to_closest = mapTheWorld(current_position);

        if (distance_to_closest < MINIMUM_HIT_DISTANCE) 
        {
            // return vec3(1.0, 0.0, 0.0);
            vec3 normal = calculateNormal(current_position);

            vec3 direction_to_light = normalize(current_position - light_position);

            // Remember, each component of the normal will be in 
            // the range -1..1, so for the purposes of visualizing
            // it as an RGB color, let's remap it to the range
            // 0..1
            float diffuse_intensity = max(0.0, dot(normal, direction_to_light));

            vec3 color = mix(vec3(1.0, 0.95, 0.9), vec3(1.0, 0.75, 0.95), diffuse_intensity);

            float fog_intensity = expFog(total_distance_traveled, 0.03);

            color = mix(bgColor, color, fog_intensity);

            return color;
        }

        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
        {
            break;
        }
        total_distance_traveled += distance_to_closest;
    }
    return bgColor;
}

void main(void){

  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);


  vec3 camera_position = vec3(mouse * 3.0, -3.0 + time);
  vec3 ro = camera_position;  // ray's origin
  vec3 rd = normalize(vec3(p, 1.0));  // ray's direction

  vec3 shaded_color = rayMarch(ro, rd);

  gl_FragColor = vec4(shaded_color, 1.0);

}