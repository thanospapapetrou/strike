'use strict';

class Sphere {
    #positions;
    #normals;
    #indices;
    
    constructor(stacks, sectors) {
        const polarStep = Math.PI / stacks;
        const azimuthalStep = 2 * Math.PI / sectors;
        this.#positions = [];
        this.#normals = [];
        this.#indices = [];
        this.#positions.push(0.0, -1.0, 0.0);
        this.#normals.push(0.0, -1.0, 0.0);
        for (let i = 0; i < stacks - 1; i++) {
            for (let j = 0; j < sectors; j++) {
                const y = Math.sin((i + 1) * polarStep - Math.PI / 2);
                const x = Math.cos((i + 1) * polarStep - Math.PI / 2) * Math.cos(j * azimuthalStep);
                const z = -Math.cos((i + 1) * polarStep - Math.PI / 2) * Math.sin(j * azimuthalStep);
                this.#positions.push(x, y, z);
                this.#normals.push(x, y, z);
                if (i > 0) {
                    this.#indices.push((i - 1) * sectors + j + 1,
                            (i - 1) * sectors + (j + 1) % sectors + 1,
                            i * sectors + j + 1);
                    this.#indices.push(i * sectors + (j + 1) % sectors + 1,
                            i * sectors + j + 1,
                            (i - 1) * sectors + (j + 1) % sectors + 1);
                } else {
                    this.#indices.push((j + 1) % sectors + 1 , j + 1, 0);
                }
            }
        }
        this.#positions.push(0.0, 1.0, 0.0);
        this.#normals.push(0.0, 1.0, 0.0);
        for (let j = 0; j < sectors; j++) {
            this.#indices.push((stacks - 2) * sectors + j + 1,
                    (stacks - 2) * sectors + (j + 1) % sectors + 1,
                    (stacks - 1) * sectors + 1);
        }
    }

    get positions() {
        return this.#positions;
    }

    get normals() {
        return this.#normals;
    }

    get indices() {
        return this.#indices;
    }
}
