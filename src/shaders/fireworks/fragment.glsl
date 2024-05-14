uniform sampler2D uTexture;
uniform vec3 uColor;

void main() {
    float particleAlpha = texture(uTexture, gl_PointCoord).r;
    gl_FragColor = vec4(uColor, particleAlpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}