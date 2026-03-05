'use strict';

class Strike {
    static UNIFORM_MODEL = 'model';
    static UNIFORM_CAMERA = 'camera'; // TODO rename to view
    static UNIFORM_PROJECTION = 'projection';
    static UNIFORM_LIGHT_AMBIENT = 'light.ambient';
    static UNIFORM_LIGHT_DIRECTIONAL_COLOR = 'light.directional.color';
    static UNIFORM_LIGHT_DIRECTIONAL_COLOR = 'light.directional.direction';

    static #ATTRIBUTES = ['position', 'normal', 'color'];
    static #CLEAR = {color: [0.0, 0.0, 0.0, 1.0], depth: 1.0};
    static #CONTEXT = 'webgl2';
    static #MS_PER_S = 1000;
    static #PROJECTION = {fieldOfView: 1.57079632679, z: {near: 0.1, far: 100.0}};
    static #SELECTOR_CANVAS = 'canvas#strike';
    static #SELECTOR_FPS = 'span#fps';
    static #SHADER_FRAGMENT = './glsl/strike.frag';
    static #SHADER_VERTEX = './glsl/strike.vert';
    static #SPHERE = new Sphere(4, 8);

    #gl;
    #program;
    #ball;
    #azimuth;
    #elevation;
    #distance;
    #velocityAzimuth;
    #velocityElevation;
    #velocityDistance;
    #rotation;
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
                    [Strike.UNIFORM_PROJECTION, Strike.UNIFORM_CAMERA, Strike.UNIFORM_MODEL,
                    Strike.UNIFORM_LIGHT_AMBIENT, Strike.UNIFORM_LIGHT_DIRECTIONAL_COLOR,
                    Strike.UNIFORM_LIGHT_DIRECTIONAL_COLOR], Strike.#ATTRIBUTES);
            this.#ball = new Ball(this.#gl, this.#program, new VAO(this.#gl, this.#program,
                    {position: Strike.#SPHERE.positions, normal: Strike.#SPHERE.normals, color: Strike.#SPHERE.colors},
                    Strike.#SPHERE.indices));
            this.azimuth = 0.0;
            this.elevation = 0.0;
            this.distance = Configuration.distance.max;
            this.#velocityAzimuth = 0.0;
            this.#velocityElevation = 0.0;
            this.#velocityDistance = 0.0;
            this.#rotation = 0.0;
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

    get rotation() {
        return this.#rotation;
    }

    set rotation(rotation) {
        this.#rotation = rotation;
        if (this.#rotation >= 2 * Math.PI) {
            this.#rotation -= 2 * Math.PI;
        }
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
        this.#gl.uniformMatrix4fv(this.#program.uniforms[Strike.UNIFORM_CAMERA], false, this.#camera),
        this.#gl.uniformMatrix4fv(this.#program.uniforms[Strike.UNIFORM_MODEL], false, this.#model),
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_LIGHT_AMBIENT], Configuration.light.ambient.color);
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_LIGHT_DIRECTIONAL_COLOR], Configuration.light.directional.color);
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_LIGHT_DIRECTIONAL_COLOR], Configuration.light.directional.direction);
        this.#ball.render(this.#model, this.rotation);
        requestAnimationFrame(this.render.bind(this));
    }

    idle(time) {
        const dt = (time - this.#time) / Strike.#MS_PER_S;
        this.fps = 1 / dt;
        this.azimuth += this.#velocityAzimuth * dt;
        this.elevation += this.#velocityElevation * dt;
        this.distance += this.#velocityDistance * dt;
        this.rotation += Configuration.rotation.velocity * dt;
        this.#ball.idle(dt);
        this.#time = time;
    }

    get #projection() {
        const projection = mat4.create();
        mat4.perspective(projection, Strike.#PROJECTION.fieldOfView,
                this.#gl.canvas.clientWidth / this.#gl.canvas.clientHeight,
                Strike.#PROJECTION.z.near, Strike.#PROJECTION.z.far);
        return projection;
    }

    get #camera() {
        const camera = mat4.create();
        mat4.rotateY(camera, camera, -this.azimuth);
        mat4.rotateX(camera, camera, -this.elevation);
        mat4.translate(camera, camera, [0.0, 0.0, this.distance]);
        return camera;
    }

    get #model() {
        const model = mat4.create();
        mat4.rotateY(model, model, this.rotation);
        return model;
    }
}
