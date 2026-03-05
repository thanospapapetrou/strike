'use strict';

class Ball {
    #gl;
    #program;
    #vao;
    #x;
    #z;
    #vx;
    #vz;

    constructor(gl, program, vao) {
        this.#gl = gl;
        this.#program = program;
        this.#vao = vao;
        this.#x = 0.0;
        this.#z = 0.0;
        this.#vx = 0.0; // TODO
        this.#vz = 0.0; // TODO
    }

    render() {
        this.#gl.uniformMatrix4fv(this.#program.uniforms[Strike.UNIFORM_MODEL], false, this.#model),
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_COLOR], [0.0, 1.0, 0.0]); // TODO
        this.#vao.render();
    }

    idle(dt) {
        this.#x += this.#vx * dt;
        this.#z += this.#vz * dt;
    }

    get #model() {
        const model = mat4.create();
        mat4.translate(model, model, [this.#x, 0.0, this.#z]);
        return model;
    }
}
