#include <common>

const vec3 center = vec3(0.0);
const float radius = 1.0;
vec3 light_position = normalize(vec3(-6, 2, 4));

const vec3 cubeColor = vec3(1.0);
const vec3 shadowColor = vec3(1.0, 0.6, 0.7);
const vec3 bgColor = cubeColor;

float voxelSize = 0.2;

float gamma = 0.6;

vec3 trans(vec3 p, float interval){
    return mod(p, interval) - interval/2.0;
}

float mapTheWorld(in vec3 p)
{
    vec3 cubeSize = vec3(1.1);

    p = (rotateY(0.2) * vec4(p, 1.0)).xyz;

    p = (rotateY(time) * vec4(p, 1.0)).xyz;
    p = (rotateX(time) * vec4(p, 1.0)).xyz;

    float box = sdTorus(p, center, vec2(cubeSize.x, 0.4));

    return box;
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

vec3 worldToVoxel(vec3 i)
{
    return floor(i/voxelSize);
}

vec3 voxelToWorld(vec3 i)
{
    return i*voxelSize;	
}

vec3 calcColor(vec3 pos, vec3 normal){
    vec3 color;

    float lighting = max(0.0, dot(normal, light_position));

    float diffuseIntensity = lighting;

    diffuseIntensity = 0.2 + 0.8 * diffuseIntensity;

    diffuseIntensity *= (1.0 - (0.41 - pos.y) * 0.4);

    color = mix(shadowColor, cubeColor, diffuseIntensity);
    

    return color;
}

vec3 voxelTrace(vec3 ro, vec3 rd, out bool hit, out vec3 hitNormal){
    const int MAX_RAY_STEPS = 128;
    vec3 voxel = worldToVoxel(ro);
    vec3 rayStep = sign(rd);
    vec3 tDelta = voxelSize / abs(rd);
    vec3 tMax = (voxelToWorld(voxel) - ro) / rd;
    
    vec3 hitVoxel = voxel;
    
    hit = false;

    float hitT = 0.0;
    for(int i=0; i < MAX_RAY_STEPS; i++) {
        float d = mapTheWorld(voxelToWorld(voxel));        
        if (d <= 0.0 && !hit) {
            hit = true;
            hitVoxel = voxel;
            
            break;
        }

        if (tMax.x < tMax.y && tMax.x < tMax.z) { 
            hitNormal = vec3(-rayStep.x, 0.0, 0.0);
            hitT = tMax.x;
            voxel.x += rayStep.x;
            tMax.x += tDelta.x;

        } else if (tMax.y < tMax.z && tMax.y <= tMax.x) {
            hitNormal = vec3(0.0, -rayStep.y, 0.0);	
            hitT = tMax.y;
            voxel.y += rayStep.y;
            tMax.y += tDelta.y;
        } else {
            hitNormal = vec3(0.0, 0.0, -rayStep.z);		
            hitT = tMax.z;
            voxel.z += rayStep.z;
            tMax.z += tDelta.z;
        }
    }

    vec3 realPos = ro + hitT * rd;
    
    vec3 color = (hit) ? calcColor(realPos, hitNormal) : vec3(1.0, 0.9, 0.9);

    return color;
}




void main(void){
    vec3 cameraPos = vec3(5.0);
    pc camera = setCamera(60.0, cameraPos, center);


    vec3 norm;
    bool hit;
    vec3 color = voxelTrace(camera.origin, camera.dir, hit, norm);

    gl_FragColor = vec4(color, 1.0);

}