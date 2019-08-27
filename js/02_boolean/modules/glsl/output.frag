

const vec3 center = vec3(0.0);
const float radius = 1.0;
const vec3 light_position = vec3(2.0, -5.0, 3.0);


float mapTheWorld(in vec3 p)
{
    const float disS = 8.0;
    vec3 samplePoint = p;
    samplePoint = (rotateY(time) * vec4(samplePoint, 1.0)).xyz;
    
    // float displacement = sin(disS * p.x + time) * sin(disS * p.y + time) * sin(disS * p.z + time) * 0.25;
    // displacement *= sin(time) * 0.5 + 0.5;
    float box_0 = sdBox(samplePoint, center, vec3(radius*0.8));
    float sphere_0 = sdSphere(samplePoint, center, radius);

    // Later we might have sphere_1, sphere_2, cube_3, etc...

    return subtract( sphere_0, box_0 );
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
    const int NUMBER_OF_STEPS = 32;
    const float MINIMUM_HIT_DISTANCE = 0.01;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        vec3 currentPos = ro + total_distance_traveled * rd;

        float distance_to_closest = mapTheWorld(currentPos);

        if (distance_to_closest < MINIMUM_HIT_DISTANCE) 
        {
            // return vec3(1.0, 0.0, 0.0);
            vec3 normal = calculateNormal(currentPos);

            vec3 directionToLight = normalize(currentPos - light_position);

            // Remember, each component of the normal will be in 
            // the range -1..1, so for the purposes of visualizing
            // it as an RGB color, let's remap it to the range
            // 0..1
            float diffuseIntensity = max(0.0, dot(normal, directionToLight));

            return mix(vec3(1.0, 0.95, 0.9), vec3(1.0, 0.8, 1.0), diffuseIntensity);
        }

        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
        {
            break;
        }
        total_distance_traveled += distance_to_closest;
    }
    return vec3(1.0);
}

void main(void){

  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);


  vec3 camera_position = vec3(0.0, 0.0, -3.0);
  vec3 ro = camera_position;  // ray's origin
  vec3 rd = normalize(vec3(p, 1.0));  // ray's direction

  vec3 shaded_color = rayMarch(ro, rd);

  gl_FragColor = vec4(shaded_color, 1.0);

}