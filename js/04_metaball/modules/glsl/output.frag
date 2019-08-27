
// const vec3 center = vec3(0.0);

#define NUM_BLOBS 5
const vec3 light_position = vec3(2000.0, -5000.0, 3000.0);

const vec3 bgColor = vec3(1.0, 0.9, 0.9);

float gamma = 1.8;

struct bStruct {
    vec3 color;
    vec3 pos;
    float speed;
};

uniform bStruct blobs[NUM_BLOBS];
float numBlobs = float(NUM_BLOBS);

float smoothIntensity = 0.8;

vec3 blobPos(int i, bStruct blob){
    float radian = 50.0 * PI/numBlobs * float(i);
    vec3 pos = vec3(
        sin(radian + time * blob.speed * 0.5), 
        cos(radian + time * blob.speed * 0.5), 
        sin(radian + time * blob.speed * 0.5) * 0.8
    );

    return pos * blob.pos * 1.3;
}

float blobRadius(float speed){
    return (sin(time + speed * PI * 2.0) * 0.5 + 0.5) * 0.5 + 0.5;
}

vec4 mapTheWorld(in vec3 p)
{
    vec3 samplePoint = p;
    samplePoint = (rotateY(time * 0.3) * vec4(samplePoint, 1.0)).xyz;

    // for(int i = 0; i < numBlobs; i++){
    //     const offset = float(i) / float(numBlobs);

    // }


    vec3 totalColor = blobs[0].color;

    float totalDb = sdSphere(samplePoint, blobPos(0, blobs[0]), blobRadius(blobs[0].speed));

    for(int i = 1; i < NUM_BLOBS; ++i){
        
        float sphere_1 = sdSphere(samplePoint, blobPos(i, blobs[i]), blobRadius(blobs[i].speed));

        float h = smoothUnion_h(totalDb, sphere_1, smoothIntensity);

        

        totalDb = mix( sphere_1, totalDb, h ) - smoothIntensity *h * (1.0-h); 

        totalColor = mix(blobs[i].color, totalColor, h);
    }
    

    return vec4(totalColor, totalDb);
}

vec3 calculateNormal(in vec3 p)
{
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = mapTheWorld(p + small_step.xyy).w - mapTheWorld(p - small_step.xyy).w;
    float gradient_y = mapTheWorld(p + small_step.yxy).w - mapTheWorld(p - small_step.yxy).w;
    float gradient_z = mapTheWorld(p + small_step.yyx).w - mapTheWorld(p - small_step.yyx).w;

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

// const vec3 hemiLight_g = vec3(256.0, 246.0, 191.0) / vec3(256.0);
// const vec3 hemiLight_s_1 = vec3(0.9,0.8,0.8);
// const vec3 hemiLight_s_2 = vec3(0.9,0.7,0.7);
// const vec3 hemiLightPos_1 = vec3(-100.0, -100.0, 100.0);
// const vec3 hemiLightPos_2 = vec3(-100.0, 100.0, -100.0);

const vec3 dirLight = vec3(1.0);
const vec3 dirLightPos = vec3(-4, 6, -10);

// vec3 calcIrradiance_hemi(vec3 normal, vec3 lightPos, vec3 grd, vec3 sky){
//   float dotNL = clamp(dot(normal, normalize(lightPos)), 0.0, 1.0);

//   return mix(grd, sky, dotNL);
// }

vec3 calcIrradiance_dir(vec3 normal, vec3 lightPos, vec3 light){
  float dotNL = dot(normal, normalize(lightPos)) * 0.5 + 0.5;

//   vec3 diffuse = vec3(1.0);

  return light * dotNL;
}

vec3 rayMarch(in vec3 ro, in vec3 rd)
{
    float total_distance_traveled = 0.0;
    const int NUMBER_OF_STEPS = 64;
    const float MINIMUM_HIT_DISTANCE = 0.01;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        vec3 currentPos = ro + total_distance_traveled * rd;

        vec4 distance_to_closest = mapTheWorld(currentPos);

        if (distance_to_closest.w < MINIMUM_HIT_DISTANCE) 
        {
            // return vec3(1.0, 0.0, 0.0);
            vec3 normal = calculateNormal(currentPos);

            // vec3 directionToLight = normalize(currentPos - light_position);

            // vec3 hemiColor = vec3(0.0);
            // hemiColor += calcIrradiance_hemi(normal, hemiLightPos_1, hemiLight_g, hemiLight_s_1) * 0.5;
            // hemiColor += calcIrradiance_hemi(normal, hemiLightPos_2, hemiLight_g, hemiLight_s_2) * 0.5;

            vec3 dirColor = calcIrradiance_dir(normal, dirLightPos, dirLight);

            dirColor = 0.6 + 0.4 * dirColor;

            vec3 halfLE = normalize(dirLightPos + ro);
            float specular = pow(clamp(dot(normal, halfLE), 0.0, 1.0), 80.0);
            // specular *= 2.0;


            vec3 color = distance_to_closest.xyz;

            color += 0.1;

            // color *= min(vec3(1.0), hemiColor * 1.06);
            color *= dirColor;
            color += specular * 0.2;

            // color *= diffuseIntensity;

            float fog_intensity = expFog(total_distance_traveled, 0.03);

            color = mix(bgColor, color, fog_intensity);

            return color;
        }

        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
        {
            break;
        }
        total_distance_traveled += distance_to_closest.w;
    }
    return bgColor;
}

void main(void){

  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

  vec3 camera_position = vec3(0.0, 0.0, -4.0);
  vec3 ro = camera_position;  // ray's origin
  vec3 rd = normalize(vec3(p, 1.0));  // ray's direction

  vec3 color = rayMarch(ro, rd);
  color = pow(color, vec3(1.0 / gamma));

  gl_FragColor = vec4(color, 1.0);

}