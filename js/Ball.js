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
    #vy;
    #vz;

    constructor(gl, program, vao, rank) {
        this.#gl = gl;
        this.#program = program;
        this.#vao = vao;
        this.#rank = rank;
        this.#x = 0.0;
        this.#y = 0.0;
        this.#z = 0.0;
        this.#vx = 0.0;
        this.#vy = 0.0;
        this.#vz = 0.0;
    }

    get radius() {
        return Ball.#RADIUS[this.#rank];
    }

    get x() {
        return this.#x;
    }

    set x(x) {
        this.#x = x;
    }

    get y() {
        return this.#y;
    }

    set y(y) {
        this.#y = y;
    }

    get z() {
        return this.#z;
    }

    set z(z) {
        this.#z = z;
    }

    get vx() {
        return this.#vx;
    }

    set vx(vx) {
        this.#vx = vx;
    }

    get vy() {
        return this.#vy;
    }

    set vy(vy) {
        this.#vy = vy;
    }

    get vz() {
        return this.#vz;
    }

    set vz(vz) {
        this.#vz = vz;
    }

    render() {
        this.#gl.uniformMatrix4fv(this.#program.uniforms[Strike.UNIFORM_MODEL], false, this.#model);
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_COLOR], Ball.#COLOR[this.#rank]);
        this.#vao.render();
    }

    idle(dt) {
        this.#x += this.#vx * dt;
        this.#y += this.#vy * dt;
        this.#z += this.#vz * dt;
    }

    get #model() {
        const model = mat4.create();
        mat4.scale(model, model, [this.radius, this.radius, this.radius]);
        mat4.translate(model, model, [this.#x, this.#y, this.#z]);
        return model;
    }
}
