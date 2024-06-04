varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularTexture;
uniform vec3 uSunDirection;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    vec3 color = vec3(0.0);

    // Sun
    float sunOrientation = dot(uSunDirection, normal);

    float sunMix = smoothstep(-0.25, 0.5, sunOrientation);
    vec3 dayTexture = texture(uDayTexture, vUv).rgb;
    vec3 nightTexture = texture(uNightTexture, vUv).rgb;
    color = mix(nightTexture, dayTexture, sunMix);

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}