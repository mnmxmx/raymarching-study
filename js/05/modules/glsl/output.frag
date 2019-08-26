
// uniform vec2  mouse;

const vec3 center = vec3(0.0);
const float radius = 1.0;
const vec3 light_position = vec3(2.0, -5.0, 3.0);

const vec3 bgColor = vec3(0.9);

float mapTheWorld(in vec3 p)
{
    vec3 baseSize = vec3(2.0, 0.02, 2.0);
    float round = 0.1;
    float base = sdBox(p, center, baseSize);

    float box = sdBox(p, center + vec3(0.0, 1.01, 0.0), vec3(1.0));
    // Later we might have sphere_1, sphere_2, cube_3, etc...

    return unite(box, base);
}

// simple ambient occlusion
vec4 genAmbientOcclusion(vec3 ro, vec3 rd)
{
    vec4 totao = vec4(0.0);
    float sca = 1.0;

    for (int aoi = 0; aoi < 5; aoi++)
    {
        float hr = 0.01 + 0.02 * float(aoi * aoi);
        vec3 aopos = ro + rd * hr;
        float dd = mapTheWorld(aopos);
        float ao = clamp(-(dd - hr), 0.0, 1.0);
        totao += ao * sca * vec4(1.0, 1.0, 1.0, 1.0);
        sca *= 0.75;
    }

    const float aoCoef = 0.5;
    totao.w = 1.0 - clamp(aoCoef * totao.w, 0.0, 1.0);

    return totao;
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
    const int NUMBER_OF_STEPS = 255;
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

            vec3 directionToLight = normalize(current_position - light_position);

            float diffuseIntensity = dot(normal, directionToLight) * 0.5 + 0.5;

            vec3 color = mix(vec3(1.0, 0.9, 0.8), vec3(1.0), diffuseIntensity);

            vec4 ao = genAmbientOcclusion(current_position, normal);

            color -= ao.xyz * ao.w;

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
    vec3 cameraPos = vec3(8.0);
    cameraPos = (rotateY(time * 0.2) * vec4(cameraPos, 1.0)).xyz;
    pc camera = setCamera(45.0, cameraPos, center);

    vec3 color = rayMarch(camera.origin, camera.dir);

    gl_FragColor = vec4(color, 1.0);

}