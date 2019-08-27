
// uniform vec2  mouse;

const vec3 center = vec3(0.0);
const float radius = 1.0;
vec3 light_position = normalize(vec3(-80, 50, 50));

const vec3 cubeColor = vec3(1.0, 0.8, 0.8);
const vec3 bgColor = cubeColor;


float gamma = 1.6;

vec3 trans(vec3 p){
    float interval = 2.0;
    return mod(p, interval) - interval/2.0;
}

float sdBox_repeat(in vec3 p, in vec3 c, vec3 b)
{
    vec3 _p = trans(p - c);
    _p.y = p.y - c.y;
    vec3 d = abs(_p) - b;
    return length(max(d,0.0))
         + min(max(d.x,max(d.y,d.z)),0.0);
}

float mapTheWorld(vec3 p)
{
    vec3 baseSize = vec3(10.0, 0.02, 10.0);
    vec3 cubeSize = vec3(0.4);
    float round = 0.1;
    float base = sdBox(p, center, baseSize);

    p = (rotateY(0.2) * vec4(p, 1.0)).xyz;

    float box = sdBox_repeat(p, center + vec3(1.0, cubeSize.y + baseSize.y, 1.0), cubeSize);

    // p = (rotateZ(time * 0.2) * vec4(p, 1.0)).xyz;

    // float torus = sdTorus(p, vec3(0.0), cubeSize.yx);

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

float getSoftShadow(vec3 ro, vec3 rd, float k){
    float h = 0.0;
    float c = 0.001;
    float r = 1.0;
    float shadowCoef = 0.5;
    for(float t = 0.0; t < 50.0; t++){
        h = mapTheWorld(ro + rd * c);
        if(h < 0.001){
            return 1.0 - shadowCoef;
        }
        r = min(r, h * k / c);
        c += h;
    }
    return 1.0 - shadowCoef + r * shadowCoef;
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
    const float MINIMUM_HIT_DISTANCE = 0.0001;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        vec3 currentPos = ro + total_distance_traveled * rd;

        float distance_to_closest = mapTheWorld(currentPos);

        if (distance_to_closest < MINIMUM_HIT_DISTANCE) 
        {
            // return vec3(1.0, 0.0, 0.0);
            vec3 normal = calculateNormal(currentPos);

            float diffuseIntensity = max(0.0, dot(normal, light_position));

            diffuseIntensity = 0.4 + 0.6 * diffuseIntensity;

            float shadow = getSoftShadow(currentPos + normal * 0.001, light_position, 4.0);
            diffuseIntensity = min(shadow, diffuseIntensity);

            vec4 ao = genAmbientOcclusion(currentPos, normal);
            diffuseIntensity *= 1.0 - ao.x * ao.w * 2.0;

            diffuseIntensity = max(0.0, diffuseIntensity);

            diffuseIntensity *= (1.0 - (0.41 - currentPos.y) * 0.4);

            diffuseIntensity = min(1.0, diffuseIntensity);

            vec3 color = mix(vec3(1.0, 0.5, 0.6), cubeColor, diffuseIntensity);
            

            float fog_intensity = expFog(total_distance_traveled, 0.02);
            color = mix(vec3(1.0), color, fog_intensity);

            // color = pow(color, vec3(1.0 / gamma));
            // color += 0.1;
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
    // cameraPos = (rotateY(time * 0.2) * vec4(cameraPos, 1.0)).xyz;
    // light_position = (rotateY(time * 0.2) * vec4(light_position, 1.0)).xyz;
    pc camera = setCamera(45.0, cameraPos, center);

    vec3 color = rayMarch(camera.origin, camera.dir);

    gl_FragColor = vec4(color, 1.0);

}