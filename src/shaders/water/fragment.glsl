uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../common/ambientLight;
#include ../common/directionalLight;
#include ../common/pointLight;

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    // Базовый цвет
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    mixStrength = smoothstep(0.0, 1.0, mixStrength);
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    // Освещение
    vec3 light = vec3(0.0);
    // light += ambientLight(vec3(1.0), 0.3);
    light += pointLight(vec3(1.0), 10.0, normal, vec3(0.0, 0.85, 0.0), viewDirection, 30.0, vPosition, 0.45);
    light += pointLight(vec3(0.2, 0.2, 0.9), 20.0, normal, vec3(-1.0, 1.0, 0.0), viewDirection, 30.0, vPosition, 0.45);
    color *= light;

    // Финальный цвет
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}