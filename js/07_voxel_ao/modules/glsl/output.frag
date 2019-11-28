
#include <common>

// reference of voxel's ambient occlusion: http://www.iquilezles.org/www/articles/voxellines/voxellines.htm

const vec3 center = vec3(0.0);
const float radius = 1.0;
vec3 light_position = normalize(vec3(-6, 6, 4));

const vec3 cubeColor = vec3(1.0, 0.95, 0.95);
const vec3 shadowColor = vec3(1.0, 0.6, 0.7);
const vec3 bgColor = cubeColor;

float scale = sin(time) * 0.5 + 0.5;

float voxelSize = 0.2;

float gamma = 0.6;

vec3 trans(vec3 p, float interval){
    return mod(p, interval) - interval/2.0;
}

float mapTheWorld(in vec3 p)
{
    // vec3 baseSize = vec3(100.0, 0.02, 100.0);
    float torusSize = 1.1 - scale;

    // p += vec3(0.0,1.0, 0.0);
    
    // float base = sdPlane(p, vec4(0.0, 1.0, 0.0, 1.3));
    // p -= vec3(0.0, 1.0, 0.0);
    
    p = (rotateY(0.2) * vec4(p, 1.0)).xyz;
    p = (rotateY(time) * vec4(p, 1.0)).xyz;
    p = (rotateX(time) * vec4(p, 1.0)).xyz;

    float torus = sdTorus(p, center, vec2(torusSize, 0.5  - scale * 0.3));

    return torus;
}

vec3 worldToVoxel(vec3 i)
{
    return floor(i/voxelSize);
}

vec3 voxelToWorld(vec3 i)
{
    return i*voxelSize;	
}

void getOtherVoxels(vec3 voxel, vec3 normal, out vec4 vc, out vec4 vd){
    vec3 dir = abs(normal);
    vec3 vc_x = voxel + normal + dir.yzx;
    vec3 vc_y = voxel + normal - dir.yzx;
    vec3 vc_z = voxel + normal + dir.zxy;
    vec3 vc_w = voxel + normal - dir.zxy;

    vec3 vd_x = voxel + normal + dir.yzx + dir.zxy;
    vec3 vd_y = voxel + normal - dir.yzx + dir.zxy;
    vec3 vd_z = voxel + normal - dir.yzx - dir.zxy;
    vec3 vd_w = voxel + normal + dir.yzx - dir.zxy;

    vc = vec4(
        step(mapTheWorld(voxelToWorld(vc_x)), 0.0),
        step(mapTheWorld(voxelToWorld(vc_y)), 0.0),
        step(mapTheWorld(voxelToWorld(vc_z)), 0.0),
        step(mapTheWorld(voxelToWorld(vc_w)), 0.0)
    );

    vd = vec4(
        step(mapTheWorld(voxelToWorld(vd_x)), 0.0),
        step(mapTheWorld(voxelToWorld(vd_y)), 0.0),
        step(mapTheWorld(voxelToWorld(vd_z)), 0.0),
        step(mapTheWorld(voxelToWorld(vd_w)), 0.0)
    );
}

float calcOcc( in vec2 uv, vec4 vc, vec4 vd )
{
    vec2 st = 1.0 - uv;

    // edges
    vec4 wa = vec4( uv.x, st.x, uv.y, st.y ) * vc;

    // corners
    vec4 wb = vec4(uv.x*uv.y,
                   st.x*uv.y,
                   st.x*st.y,
                   uv.x*st.y)*vd*(1.0-vc.xzyw)*(1.0-vc.zywx);
    
    return wa.x + wa.y + wa.z + wa.w +
           wb.x + wb.y + wb.z + wb.w;
}

vec3 calcColor(vec3 pos, vec3 normal, vec3 voxel){
    vec3 color;

    vec3 uvw = (pos - voxelToWorld(voxel)) / voxelSize;
    vec3 dir = abs(normal);
    vec2 uv = dir.x > 0.0 ? uvw.zy : dir.y > 0.0 ? uvw.xz : uvw.yx;

    vec4 vc, vd;
    getOtherVoxels(voxel, normal, vc, vd);

    float occ = calcOcc(uv, vc, vd);
    occ = 1.0 - occ * occ/12.0;
    occ = occ*occ;
    occ = occ*occ;
    
    float lighting = max(0.2, dot(normal, light_position));

    float diffuseIntensity = lighting;

    diffuseIntensity = 0.2 + 0.8 * diffuseIntensity;
    diffuseIntensity *= (1.0 - (0.41 - pos.y) * 0.4);

    color = mix(shadowColor, cubeColor, diffuseIntensity);
    color = mix(mix(shadowColor * shadowColor, shadowColor, 0.7), color, occ);

    return color;
}

vec3 voxelTrace(vec3 ro, vec3 rd, out bool hit, out vec3 hitNormal){
    const int MAX_RAY_STEPS = 128;
    vec3 voxel = worldToVoxel(ro);
    vec3 rayStep = sign(rd);
    vec3 tDelta = voxelSize / abs(rd);
    vec3 tMax = (voxelToWorld(voxel) - ro + (rayStep * 0.5 + 0.5)*voxelSize) / rd;
    
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
    
    vec3 color = (hit) ? calcColor(realPos, hitNormal, hitVoxel) : vec3(1.0, 0.9, 0.9) + gl_FragCoord.y / resolution.y * 0.05;

    return color;
}




void main(void){
    vec3 cameraPos = vec3(5.0, 3.0, 5.0);
    cameraPos = (rotateY(time * 0.2) * vec4(cameraPos, 1.0)).xyz;
    light_position = (rotateY(time * 0.2) * vec4(light_position, 1.0)).xyz;
    pc camera = setCamera(60.0, cameraPos, center);


    vec3 norm;
    bool hit;
    vec3 color = voxelTrace(camera.origin, camera.dir, hit, norm);

    gl_FragColor = vec4(color, 1.0);

}