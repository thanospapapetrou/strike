#version 300 es

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

in vec4 position;
in vec3 normal;

out vec3 vertexNormal;

void main(void) {
  gl_Position = projection * view * model * position;
  vertexNormal = mat3(transpose(inverse(model))) * normal;
}
