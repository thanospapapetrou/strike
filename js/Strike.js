'use strict';

class Strike {
    static UNIFORM_COLOR = 'color';
    static UNIFORM_LIGHT_AMBIENT = 'light.ambient';
    static UNIFORM_LIGHT_DIRECTIONAL_COLOR = 'light.directional.color';
    static UNIFORM_LIGHT_DIRECTIONAL_DIRECTION = 'light.directional.direction';
    static UNIFORM_MODEL = 'model';
    static UNIFORM_PROJECTION = 'projection';
    static UNIFORM_VIEW = 'view';

    static #ATTRIBUTES = ['position', 'normal'];
    static #CLEAR = {color: [0.0, 0.0, 0.0, 1.0], depth: 1.0};
    static #CONTEXT = 'webgl2';
    static #LIGHT = {ambient: [0.5, 0.5, 0.5], directional: {color: [0.5, 0.5, 0.5], direction: [0.0, 1.0, -1.0]}};
    static #MS_PER_S = 1000;
    static #PROJECTION = {fieldOfView: 1.57079632679, z: {near: 0.1, far: 100.0}};
    static #SELECTOR_CANVAS = 'canvas#strike';
    static #SELECTOR_FPS = 'span#fps';
    static #SHADER_FRAGMENT = './glsl/strike.frag';
    static #SHADER_VERTEX = './glsl/strike.vert';
    static #SPHERE = new Sphere(4, 8);
    static #VELOCITY_LAUNCH = -100.0;
    static #VELOCITY_MOVE = 10.0;

    #gl;
    #program;
    #table;
    #balls;
    #next;
    #leftPressed;
    #rightPressed;
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
                    Strike.UNIFORM_LIGHT_DIRECTIONAL_DIRECTION], Strike.#ATTRIBUTES);
            this.#table = new Table(this.#gl, this.#program);
            this.#balls = [];
            this.#next = this.#newBall(0);
            this.#leftPressed = false;
            this.#rightPressed = false;
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
        switch (event.type) {
        case Event.KEY_DOWN:
            switch (event.code) {
            case KeyCode.ARROW_LEFT:
                this.#next.vx = -Strike.#VELOCITY_MOVE;
                this.#leftPressed = true;
                break;
            case KeyCode.ARROW_RIGHT:
                this.#next.vx = Strike.#VELOCITY_MOVE;
                this.#rightPressed = true;
                break;
            case KeyCode.SPACE:
                this.#next.vz = Strike.#VELOCITY_LAUNCH;
                this.#balls.push(this.#next);
                const x = this.#next.x;
                const vx = this.#next.vx;
                this.#next = this.#newBall(0);
                this.#next.x = x;
                this.#next.vx = vx;
            }
            break;
        case Event.KEY_UP:
            switch (event.code) {
            case KeyCode.ARROW_LEFT:
                this.#next.vx = this.#rightPressed ? Strike.#VELOCITY_MOVE : 0.0;
                this.#leftPressed = false;
                break;
            case KeyCode.ARROW_RIGHT:
                this.#next.vx = this.#leftPressed ? -Strike.#VELOCITY_MOVE : 0.0;
                this.#rightPressed = false;
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
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_LIGHT_AMBIENT], Strike.#LIGHT.ambient);
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_LIGHT_DIRECTIONAL_COLOR], Strike.#LIGHT.directional.color);
        this.#gl.uniform3fv(this.#program.uniforms[Strike.UNIFORM_LIGHT_DIRECTIONAL_DIRECTION], Strike.#LIGHT.directional.direction);
        this.#table.render();
        for (const ball of this.#balls) {
            ball.render();
        }
        this.#next.render();
        requestAnimationFrame(this.render.bind(this));
    }

    idle(time) {
        const dt = (time - this.#time) / Strike.#MS_PER_S;
        this.fps = 1 / dt;
        for (const ball of this.#balls) {
            ball.idle(dt);
        }
        this.#next.idle(dt);
        if (this.#next.x > Table.WIDTH / 2 - this.#next.radius) {
            this.#next.x = Table.WIDTH / 2 - this.#next.radius;
        } else if (this.#next.x < -Table.WIDTH / 2 + this.#next.radius) {
            this.#next.x = -Table.WIDTH / 2 + this.#next.radius;
        }
        this.#time = time;
    }

    #newBall(rank) {
        const ball = new Ball(this.#gl, this.#program, new VAO(this.#gl, this.#program,
                {position: Strike.#SPHERE.positions, normal: Strike.#SPHERE.normals}, Strike.#SPHERE.indices), rank);
        ball.y = ball.radius;
        ball.z = -ball.radius;
        return ball;
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
