'use strict';

class Table {
    static LENGTH = 60.0;
    static WIDTH = 30.0;

    static #COLOR = [1.0, 1.0, 1.0];

    #gl;
    #program;
    #vao;

    constructor(gl, program) {
        this.#gl = gl;
        this.#program = program;
        this.#vao = new VAO(this.#gl, this.#program, {
                position: [
                    -Table.WIDTH / 2, 0.0, 0.0,
                    Table.WIDTH / 2, 0.0, 0.0,
                    -Table.WIDTH / 2, 0.0, -Table.LENGTH / 2,
                    Table.WIDTH / 2, 0.0, -Table.LENGTH / 2
                ], normal: [
                    0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0
                ]}, [
                    0, 1, 2,
                    2, 1, 3
                ]);
    }

    render() {
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_COLOR], Table.#COLOR);
        this.#vao.render();
    }
}
