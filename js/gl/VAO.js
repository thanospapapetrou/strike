'use strict';

class VAO {
    #gl;
    #array;
    #count;

    constructor (gl, program, attributes, indices) {
        this.#gl = gl;
        this.#array = this.#gl.createVertexArray();
        this.#gl.bindVertexArray(this.#array);
        for (const [attribute, data] of Object.entries(attributes)) {
            new VBO(this.#gl, this.#gl.ARRAY_BUFFER, new Float32Array(data));
            this.#gl.vertexAttribPointer(program.attributes[attribute], 3, gl.FLOAT, false, 0, 0);
            this.#gl.enableVertexAttribArray(program.attributes[attribute]);
        }
        new VBO(this.#gl, this.#gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
        this.#gl.bindVertexArray(null);
        this.#count = indices.length;
    }

    render() {
        this.#gl.bindVertexArray(this.#array);
        this.#gl.drawElements(this.#gl.TRIANGLES, this.#count, this.#gl.UNSIGNED_SHORT, 0); // TODO byte
    }
}