const vertexMain = /*glsl */ `
  vec3 coords = normal;
  // Animation loop
  coords.y += uTime;
  // Noise loop
  vec3 noisePattern = vec3(noise(coords / 1.5));
  float pattern = wave(noisePattern + uTime);

  vDisplacement = pattern;

  float displacement = vDisplacement / 3.;

  transformed += normalize(objectNormal) * displacement;   
`;

export default vertexMain;
