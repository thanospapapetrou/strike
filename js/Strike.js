'use strict';

class Strike {
    static UNIFORM_COLOR = 'color';
    static UNIFORM_LIGHT_AMBIENT = 'light.ambient';
    static UNIFORM_LIGHT_DIRECTIONAL_COLOR = 'light.directional.color';
    static UNIFORM_LIGHT_DIRECTIONAL_COLOR = 'light.directional.direction';
    static UNIFORM_MODEL = 'model';
    static UNIFORM_PROJECTION = 'projection';
    static UNIFORM_VIEW = 'view';

    static #ATTRIBUTES = ['position', 'normal'];
    static #CLEAR = {color: [0.0, 0.0, 0.0, 1.0], depth: 1.0};
    static #CONTEXT = 'webgl2';
    static #LIGHT = {ambient: {color: [0.25, 0.25, 0.25]}, directional: {color: [0.75, 0.75, 0.75], direction: [0.0, 0.0, -1.0]}};
    static #MS_PER_S = 1000;
    static #PROJECTION = {fieldOfView: 1.57079632679, z: {near: 0.1, far: 100.0}};
    static #SELECTOR_CANVAS = 'canvas#strike';
    static #SELECTOR_FPS = 'span#fps';
    static #SHADER_FRAGMENT = './glsl/strike.frag';
    static #SHADER_VERTEX = './glsl/strike.vert';
    static #SPHERE = new Sphere(4, 8);

    #gl;
    #program;
    #table;
    #balls;
    #azimuth;
    #elevation;
    #distance;
    #velocityAzimuth;
    #velocityElevation;
    #velocityDistance;
    #time;

    static async main() {
        const strike = await new Strike(document.querySelector(Strike.#SELECTOR_CANVAS).getContext(Strike.#CONTEXT));
        requestAnimationFrame(strike.render.bind(strike));
    }

    constructor(gl) {
        this.#gl = gl;
        return (async () => {
            this.#program = await new Program(this.#gl,
                    await new Shader(this.#gl, this.#gl.VERTEX_SHADER, Strike.#SHADER_VERTEX),
                    await new Shader(this.#gl, this.#gl.FRAGMENT_SHADER, Strike.#SHADER_FRAGMENT),
                    [Strike.UNIFORM_PROJECTION, Strike.UNIFORM_VIEW, Strike.UNIFORM_MODEL, Strike.UNIFORM_COLOR,
                    Strike.UNIFORM_LIGHT_AMBIENT, Strike.UNIFORM_LIGHT_DIRECTIONAL_COLOR,
                    Strike.UNIFORM_LIGHT_DIRECTIONAL_COLOR], Strike.#ATTRIBUTES);
            this.#table = new Table(this.#gl, this.#program);
            this.#balls = [new Ball(this.#gl, this.#program, new VAO(this.#gl, this.#program,
                    {position: Strike.#SPHERE.positions, normal: Strike.#SPHERE.normals},
                    Strike.#SPHERE.indices), 0, 1.0, -1.0),
                    new Ball(this.#gl, this.#program, new VAO(this.#gl, this.#program,
                    {position: Strike.#SPHERE.positions, normal: Strike.#SPHERE.normals},
                    Strike.#SPHERE.indices), 1, 3.0, -3.0)];
            this.azimuth = 0.0;
            this.elevation = 0.0;
            this.distance = Configuration.distance.max;
            this.#velocityAzimuth = 0.0;
            this.#velocityElevation = 0.0;
            this.#velocityDistance = 0.0;
            this.#time = 0;
            this.#gl.clearColor(...Strike.#CLEAR.color);
            this.#gl.clearDepth(Strike.#CLEAR.depth);
            this.#gl.depthFunc(this.#gl.LEQUAL);
            this.#gl.enable(this.#gl.DEPTH_TEST);
            this.#gl.cullFace(this.#gl.BACK);
            this.#gl.enable(this.#gl.CULL_FACE);
            this.#gl.canvas.addEventListener(Event.KEY_DOWN, this.keyboard.bind(this));
            this.#gl.canvas.addEventListener(Event.KEY_UP, this.keyboard.bind(this));
            this.#gl.canvas.focus();
            return this;
        })();
    }

    set fps(fps) {
        document.querySelector(Strike.#SELECTOR_FPS).firstChild.nodeValue = fps;
    }

    keyboard(event) {
        this.#velocityAzimuth = 0.0;
        this.#velocityElevation = 0.0;
        this.#velocityDistance = 0.0;
        if (event.type == Event.KEY_DOWN) {
            switch (event.code) {
            case KeyCode.ARROW_UP:
                this.#velocityElevation = Configuration.elevation.velocity;
                break;
            case KeyCode.ARROW_DOWN:
                this.#velocityElevation = -Configuration.elevation.velocity;
                break;
            case KeyCode.ARROW_LEFT:
                this.#velocityAzimuth = Configuration.azimuth.velocity;
                break;
            case KeyCode.ARROW_RIGHT:
                this.#velocityAzimuth = -Configuration.azimuth.velocity;
                break;
            case KeyCode.PAGE_UP:
                this.#velocityDistance = Configuration.distance.velocity;
                break;
            case KeyCode.PAGE_DOWN:
                this.#velocityDistance = -Configuration.distance.velocity;
                break;
            }
        }
    }

    render(time) {
        this.idle(time);
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
        this.#gl.useProgram(this.#program.program);
        this.#gl.uniformMatrix4fv(this.#program.uniforms[Strike.UNIFORM_PROJECTION], false, this.#projection),
        this.#gl.uniformMatrix4fv(this.#program.uniforms[Strike.UNIFORM_VIEW], false, this.#view),
        this.#gl.uniformMatrix4fv(this.#program.uniforms[Strike.UNIFORM_MODEL], false, this.#model),
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_LIGHT_AMBIENT], Strike.#LIGHT.ambient.color);
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_LIGHT_DIRECTIONAL_COLOR], Strike.#LIGHT.directional.color);
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_LIGHT_DIRECTIONAL_COLOR], Strike.#LIGHT.directional.direction);
        this.#table.render();
        for (const ball of this.#balls) {
            ball.render();
        }
        requestAnimationFrame(this.render.bind(this));
    }

    idle(time) {
        const dt = (time - this.#time) / Strike.#MS_PER_S;
        this.fps = 1 / dt;
        this.azimuth += this.#velocityAzimuth * dt;
        this.elevation += this.#velocityElevation * dt;
        this.distance += this.#velocityDistance * dt;
        for (const ball of this.#balls) {
            ball.idle(dt);
        }
        this.#time = time;
    }

    get #projection() {
        const projection = mat4.create();
        mat4.perspective(projection, Strike.#PROJECTION.fieldOfView,
                this.#gl.canvas.clientWidth / this.#gl.canvas.clientHeight,
                Strike.#PROJECTION.z.near, Strike.#PROJECTION.z.far);
        return projection;
    }

    get #view() {
        const view = mat4.create();
        mat4.lookAt(view, [0.0, 10.0, 10.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        return view;
    }

    get #model() {
        const model = mat4.create();
        return model;
    }
}
