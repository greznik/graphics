uniform sampler2D uPerlinTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 smokeUv = vUv;
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * 0.03;
    float smoke = texture(uPerlinTexture, smokeUv).r;

    smoke = smoothstep(0.45, 1.0, smoke);
    smoke *= smoothstep(0.0, 0.2, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);
    smoke *= smoothstep(1.0, 0.5, vUv.y);
    smoke *= smoothstep(0.0, 0.1, vUv.y);

    // Final color
    gl_FragColor = vec4(1.0, 0.97, 0.77, smoke);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}