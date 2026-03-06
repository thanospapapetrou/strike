'use strict';

class Ball {
    static #COLOR = [[1.0, 0.0, 0.0], [1.0, 0.5, 0.0], [1.0, 1.0, 1.0]];
    static #MASS = [1, 2, 3];
    static #RADIUS = [1, 2, 3];

    #gl;
    #program;
    #vao;
    #rank;
    #x;
    #y;
    #z;
    #vx;
    #vz;

    constructor(gl, program, vao, rank, x, y, z) {
        this.#gl = gl;
        this.#program = program;
        this.#vao = vao;
        this.#rank = rank;
        this.#x = x;
        this.#y = y;
        this.#z = z;
        this.#vx = 0.0; // TODO
        this.#vz = 0.0; // TODO
    }

    get radius() {
        return Ball.#RADIUS[this.#rank];
    }

    get x() {
        return this.#x;
    }

    set x(value) {
        this.#x = value;
    }

    render() {
        this.#gl.uniformMatrix4fv(this.#program.uniforms[Strike.UNIFORM_MODEL], false, this.#model);
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_COLOR], Ball.#COLOR[this.#rank]);
        this.#vao.render();
    }

    idle(dt) {
        this.#x += this.#vx * dt;
        this.#z += this.#vz * dt;
    }

    get #model() {
        const model = mat4.create();
        mat4.scale(model, model, [this.radius, this.radius, this.radius]);
        mat4.translate(model, model, [this.#x, this.#y, this.#z]);
        return model;
    }
}
