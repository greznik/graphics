varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform vec3 uColor;

void main() {
    // Фикс интерполяции, делая вектора одинаковой длины;
    vec3 normal = normalize(vNormal);

    if (!gl_FrontFacing) {
        normal *= -1.0;
    };

    float lines = mod((vPosition.y + uTime * 0.05) * 20.0, 1.0);
    lines = pow(lines, 3.0);

    // Эффект френеля
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float frenel = dot(viewDirection, normal) + 1.0;
    frenel = pow(frenel, 3.0);

    float falloff = smoothstep(0.6, 0.0, frenel);

    float hologram = lines * frenel;
    hologram += frenel;
    hologram *= falloff;

    gl_FragColor = vec4(uColor, hologram);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}