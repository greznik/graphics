uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

#include ../includes/rotate2D.glsl;

void main() {
    vUv = uv;
    vec3 smokePosition = position;

    float twistPerlin = texture(uPerlinTexture, vec2(0.5, uv.y * 0.4 - uTime * 0.01)).r;
    float angle = twistPerlin * 12.0;

    smokePosition.xz = rotate2D(smokePosition.xz, angle);

    vec2 windOffset = vec2(texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5, texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5);
    windOffset *= pow(uv.y, 2.0) * 10.0;
    smokePosition.xz += windOffset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(smokePosition, 1.0);
}