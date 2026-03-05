'use strict';

class VBO {
    #buffer

    constructor (gl, type, data) {
        this.#buffer = gl.createBuffer();
        gl.bindBuffer(type, this.#buffer);
        gl.bufferData(type, data, gl.STATIC_DRAW);
    }

    get buffer() {
        return this.#buffer;
    }
}