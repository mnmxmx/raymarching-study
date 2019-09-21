
// uniform vec2  mouse;

const vec3 center = vec3(0.0);
const float radius = 1.0;
vec3 light_position = normalize(vec3(-80, 50, 50));

const vec3 cubeColor = vec3(1.0, 0.98, 0.95);
const vec3 shadowColor = vec3(1.0, 0.6, 0.7);
const vec3 bgColor = cubeColor;


float gamma = 0.8;

vec3 trans(vec3 p, float interval){
    return mod(p, interval) - interval/2.0;
}

float sdBox_repeat(in vec3 p, in vec3 c, vec3 b)
{
    vec3 _p = p - c;
    float interval = PI;

    float rotateDist = (mod((_p.x) / interval, 2.0) > 1.0) ? -1.0 : 1.0;

    float offsetX = _p.x / interval;
    offsetX = offsetX - fract(offsetX);

    float _time2 = time - offsetX * 0.2;
    float _time = _time2;
    _time = min(1.0, mod(_time, 1.0) * 1.0);

    _time = cubicInOut(_time);

    _time *= PI / 2.0;
    _time = _time - (rotateDist + 1.0) * PI / 4.0;

     float offsetZ = b.z * ((_time2 - fract(_time2)) * 2.0);
    _p.z -= offsetZ * rotateDist;

    _p.xz = mod(_p.xz, interval) - interval/2.0;

    // rotation
    _p.y = p.y - c.y;
    _p.yz += b.yz;
    _p = (rotateX(_time * rotateDist) * vec4(_p, 1.0)).xyz;
    _p.yz -= b.yz;
    
    vec3 d = abs(_p) - b;
    return length(max(d,0.0))
         + min(max(d.x,max(d.y,d.z)),0.0);
}

float mapTheWorld(in vec3 p)
{
    vec3 baseSize = vec3(100.0, 0.02, 100.0);
    vec3 cubeSize = vec3(PI / 8.0);
    // float round = 0.1;
    float base = sdBox(p, center, baseSize);

    p = (rotateY(0.2) * vec4(p, 1.0)).xyz;

    float box = sdBox_repeat(p, center + vec3(1.0, cubeSize.y + baseSize.y, 1.0), cubeSize);


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

// http://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
vec3 calculateNormal( in vec3 p )
{
    vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;
    return normalize( e.xyy*mapTheWorld( p + e.xyy ) + 
					  e.yyx*mapTheWorld( p + e.yyx ) + 
					  e.yxy*mapTheWorld( p + e.yxy ) + 
					  e.xxx*mapTheWorld( p + e.xxx ) );
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

            float lighting = max(0.0, dot(normal, light_position));

            float diffuseIntensity = lighting;

            diffuseIntensity = 0.4 + 0.6 * diffuseIntensity;

            float shadow = getSoftShadow(currentPos + normal * 0.001, light_position, 2.0);
            diffuseIntensity = min(shadow, diffuseIntensity);

            vec4 ao = genAmbientOcclusion(currentPos, normal);
            // float anbient
            diffuseIntensity *= mix((1.0 - ao.x * ao.w * 2.0), 1.0, lighting);

            diffuseIntensity = max(0.0, diffuseIntensity);

            diffuseIntensity *= (1.0 - (0.41 - currentPos.y) * 0.4);

            diffuseIntensity = min(1.0, diffuseIntensity);

            vec3 color = mix(shadowColor, cubeColor, diffuseIntensity);

            // color = vec3((1.0 - ao.x * ao.w * 2.0));
            

            float fog_intensity = expFog(total_distance_traveled, 0.03);
            color = mix(vec3(1), color, fog_intensity);

            // color = color * 3.0 - 1.94;
            // color = color * 2.0 - 1.0;
            // color += 0.01;


            // color *= vec3(1.0, 0.98, 0.95);

            color = pow(color, vec3(1.0 / gamma));
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
    // light_position = (rotateY(time * 0.5) * vec4(light_position, 1.0)).xyz;
    pc camera = setCamera(45.0, cameraPos, center);

    vec3 color = rayMarch(camera.origin, camera.dir);

    gl_FragColor = vec4(color, 1.0);

}