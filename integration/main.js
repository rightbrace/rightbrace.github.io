let G = 0.001 // Gravitational constant, tuned to size/masses
Math.PHI = (1 + Math.sqrt(5)) / 2
let dt = 0.01;

let keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    in: false,
    out: false
}
window.onkeydown = function (event) {
    switch (event.keyCode) {
        case 38:
            keys.in = true
            break
        case 40:
            keys.out = true
            break
        case 87:
            keys.up = true
            break
        case 83:
            keys.down = true
            break
        case 65:
            keys.left = true
            break
        case 68:
            keys.right = true
            break
    }
}

window.onkeyup = function (event) {
    switch (event.keyCode) {
        case 38:
            keys.in = false
            break
        case 40:
            keys.out = false
            break
        case 87:
            keys.up = false
            break
        case 83:
            keys.down = false
            break
        case 65:
            keys.left = false
            break
        case 68:
            keys.right = false
            break
    }
}

window.onresize = function (event) {
    resizeCanvas()
}

function rand(a, b) {
    return Math.random() * (b - a) + a
}

function resizeCanvas() {
    let canvas = document.getElementById("display-canvas")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}

function resetTransform(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

let zoom = 0.7
let xoff = 0
let yoff = 0
function transformCanvas(canvas, ctx) {
    let centreX = canvas.width / 2
    let centreY = canvas.height / 2
    resetTransform(ctx)
    ctx.translate(centreX, centreY)
    ctx.scale(zoom, zoom)
    ctx.translate(xoff, yoff)
}

// Where h, s, and v are all [0,1]
function HSVtoRGB(h, s, v) {
    let i = Math.floor(h * 6)
    let f = h * 6 - i
    let p = v * (1 - s)
    let q = v * (1 - f * s)
    let t = v * (1 - (1 - f) * s)

    switch (i % 6) {
        case 0: return { r: v, g: t, b: p }
        case 1: return { r: q, g: v, b: p }
        case 2: return { r: p, g: v, b: t }
        case 3: return { r: p, g: q, b: v }
        case 4: return { r: t, g: p, b: v }
        case 5: return { r: v, g: p, b: q }
    }
}

function nextDistributedValue(since, min, max) {
    if (min == undefined) {
        min = 0
    }
    if (max == undefined) {
        max = 1
    }

    // put k in range [0, 1]
    let k = (since - min) / (max - min)

    k += Math.PHI
    k %= 1

    // put it back in original range
    return min + k * (max - min)
}

// Make an array of n colours such that the colours are well distributed, but the sum is 1, 1, 1
function generateColours(n, startHue) {
    let colours = []
    let saturation = 1;
    let value = 1;
    let hue = 0;
    if (startHue != undefined) hue = startHue;
    for (let i = 0; i < n; i++) {
        hue = nextDistributedValue(hue)
        let colour = HSVtoRGB(hue, saturation, value);
        colours.push(colour)
    }

    return colours

}

function drawCircle(ctx, x, y, radius) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
}

// Accepts either:
// r, g, b [0, 1]
// or {r, g, b} [0, 1]
function ctxColour(r, g, b) {
    if (g == undefined) {
        g = r.g
        b = r.b
        r = r.r
    }
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
}

function getWorldSpace(canvasX, canvasY) {
    let x = canvasX
    let y = canvasY

    let canvas = document.getElementById("display-canvas")


    x -= canvas.width / 2
    y -= canvas.height / 2

    x /= zoom
    y /= zoom

    x -= xoff
    y -= yoff

    return { x, y }
}

class Simulation {

    constructor(colour, type, bodies) {
        this.bodies = bodies.map(body => new type(...body))
        this.colour = colour
    }

    render(ctx) {
        // Render first
        ctx.strokeStyle = ctxColour(this.colour)
        ctx.fillStyle = ctxColour(this.colour)
        ctx.lineWidth = 1

        this.bodies.forEach(body => body.renderPath(ctx))
        this.bodies.forEach(body => body.render(ctx))
    }

    tick(dt) {
        // Then do update pass
        this.bodies = this.bodies.map(body => body.update(dt, this))
    }

    getBodies() {
        return this.bodies
    }

    getAccelerationFor(x, y, ignore) {
        let ax = 0
        let ay = 0
        this.getBodies().forEach(other => {
            if (ignore != other) {
                let rx = other.x - x
                let ry = other.y - y
                let r = Math.sqrt(rx * rx + ry * ry)
                let aMag = G * other.mass / r
                ax += aMag * rx
                ay += aMag * ry
            }
        })
        return { x: ax, y: ay }
    }
}


class Body {
    constructor(mass, x, y) {
        this.mass = mass
        this.x = x
        this.y = y
        this.path = []
    }

    // Return a new body which represents this body after timestep dt
    update(dt, simulation) {

    }

    renderPath(ctx) {

        if (this.path.length < 2) return

        let maxArcLength = 1000
        let snipAt = -1
        let arcLength = 0
        let lx = this.path[this.path.length - 1].x
        let ly = this.path[this.path.length - 1].y

        ctx.beginPath()
        ctx.moveTo(lx, ly)

        for (let i = this.path.length - 2; i >= 0; i--) {
            let x = this.path[i].x
            let y = this.path[i].y
            ctx.lineTo(x, y)
            arcLength += Math.sqrt((x - lx) * (x - lx) + (y - ly) * (y - ly))
            if (arcLength > maxArcLength) {
                snipAt = i
                break
            }
            lx = x
            ly = y
        }

        ctx.stroke()

        if (snipAt > -1) {
            this.path.splice(0, snipAt)
        }

    }

    render(ctx) {
        this.path.push({
            x: this.x, y: this.y
        })
        drawCircle(ctx, this.x, this.y, Math.log10(this.mass * 100))
    }
}

class Euler extends Body {

    constructor(mass, x, y, vx, vy, path) {
        super(mass, x, y)
        this.vx = vx
        this.vy = vy
        this.path = path || []
    }

    update(dt, simulation) {
        let a = simulation.getAccelerationFor(this.x, this.y, this)

        let dVx = a.x * dt
        let dVy = a.y * dt

        let dx = this.vx * dt
        let dy = this.vy * dt

        return new Euler(
            this.mass,
            this.x + dx, this.y + dy,
            this.vx + dVx, this.vy + dVy,
            this.path)
    }
}

class EulerConverger extends Euler {

    tryDt(dt, simulation, original) {
        let a = simulation.getAccelerationFor(this.x, this.y, original)
        let dVx = a.x * dt
        let dVy = a.y * dt

        let dx = this.vx * dt
        let dy = this.vy * dt

        return new EulerConverger(
            this.mass,
            this.x + dx, this.y + dy,
            this.vx + dVx, this.vy + dVy,
            this.path)
    }

    update(dt, simulation) {

        /*
        keep recalculating until changes in results gets really small
        */

        let coarserStep = this.tryDt(dt, simulation, this)
        let coarseX = coarserStep.x
        let coarseY = coarserStep.y

        let convergenceThreshold = 0.001;
        let convergence = convergenceThreshold + 1;
        let nextStepInput;

        for (let steps = 2; convergence > convergenceThreshold; steps = Math.floor(steps * 1.5)) {
            nextStepInput = this.tryDt(dt / steps, simulation, this)
            for (let i = 1; i < steps; i++) {
                nextStepInput = nextStepInput.tryDt(dt / steps, simulation, this)
            }


            let finerX = nextStepInput.x
            let finerY = nextStepInput.y

            // this will always be the current position since it never gets altered
            let dcoarsex = coarseX - this.x
            let dcoarsey = coarseY - this.y
            let dcoarse = dcoarsex * dcoarsex + dcoarsey * dcoarsey

            let dfinex = finerX - this.x
            let dfiney = finerY - this.y
            let dfine = dfinex * dfinex + dfiney * dfiney


            // Convergence is the absolute difference between the better estimate and the worse one
            // ie "position can drift by no more than X per step"
            convergence = Math.abs(dcoarse - dfine)

            // On the next step, what's fine now will be coarse
            coarseX = finerX
            coarseY = finerY
            coarserStep = nextStepInput

        }

        return nextStepInput
    }
}

class Verlet extends Body {

    constructor(mass, x, y, vx, vy, path) {
        super(mass, x, y)
        // Don't store vx and vy, store previous x and y
        this._x = this.x - dt * vx
        this._y = this.y - dt * vy
        this.path = path || []
    }

    update(dt, simulation) {

        /*
        f(t+dt) = 2f(t) - f(t-dt) + f''(t)*dt^2 + error
        */
        let a = simulation.getAccelerationFor(this.x, this.y, this)

        let xp = 2 * this.x - this._x + a.x * dt * dt
        let yp = 2 * this.y - this._y + a.y * dt * dt

        let next = new Verlet(this.mass, xp, yp, 0, 0, this.path)
        next._x = this.x
        next._y = this.y

        return next

    }
}

class RK4 extends Body {

    constructor(mass, x, y, vx, vy, path) {
        super(mass, x, y)
        this.vx = vx
        this.vy = vy
        this.path = path || []
    }

    update(dt, simulation) {


        let d = [];
        let v = [];
        let a = [];

        // First sample
        d[0] = { x: this.x, y: this.y }
        v[0] = { x: this.vx, y: this.vy }
        a[0] = simulation.getAccelerationFor(this.x, this.y, this)

        // Second sample
        d[1] = {
            x: d[0].x + dt * v[0].x / 2,
            y: d[0].y + dt * v[0].y / 2
        }

        v[1] = {
            x: v[0].x + dt * a[0].x / 2,
            y: v[0].y + dt * a[0].y / 2
        }

        a[1] = simulation.getAccelerationFor(d[1].x, d[1].y, this)

        // Third sample
        d[2] = {
            x: d[0].x + dt * v[1].x / 2,
            y: d[0].y + dt * v[1].y / 2
        }

        v[2] = {
            x: v[0].x + dt * a[1].x / 2,
            y: v[0].y + dt * a[1].y / 2
        }

        a[2] = simulation.getAccelerationFor(d[2].x, d[2].y, this)

        // Fourth sample
        d[3] = {
            x: d[0].x + dt * v[2].x,
            y: d[0].y + dt * v[2].y
        }

        v[3] = {
            x: v[0].x + dt * a[2].x,
            y: v[0].y + dt * a[2].y
        }

        a[3] = simulation.getAccelerationFor(d[3].x, d[3].y, this)

        let d_next = {
            x: d[0].x + dt * v[0].x + dt * dt / 6 * (a[0].x + a[1].x + a[2].x),
            y: d[0].y + dt * v[0].y + dt * dt / 6 * (a[0].y + a[1].y + a[2].y)
        }

        let v_next = {
            x: v[0].x + dt / 6 * (a[0].x + 2 * a[1].x + 2 * a[2].x + a[3].x),
            y: v[0].y + dt / 6 * (a[0].y + 2 * a[1].y + 2 * a[2].y + a[3].y)
        }

        return new RK4(
            this.mass,
            d_next.x, d_next.y,
            v_next.x, v_next.y,
            this.path)
    }
}





// Silly way of initializing many objects of different subclasses with the same parameters
// Assumes all the constructors are the same
// mass, x, y, vx, vy


var simulations = []

function loadSim(which) {

    let bodies = []

    switch (which) {
        case 1:
            bodies = [
                [1_000_000, 0, 0, 0, 0],
                [10_000, 100, 0, 0, -300],
                [1, -600, 0, 0, 800],
            ]
            break
        case 2:
            bodies = [
                [1_000_000, 0, 0, 0, 80],
                [100_000, 500, 0, 0, -800],
                [10, 500, 30, -20, -800],
            ]
            break
        case 3:
            bodies = []
            let count = rand(2, 8)
            for (let i = 0; i < count; i++) {
                bodies.push([rand(100, 1_000_000), rand(-500, 500), rand(-500, 500), rand(-500, 500), rand(-500, 500)])
            }
    }
    simulations = [
        new Simulation({ r: 1, g: 0, b: 0 }, Euler, bodies),
        new Simulation({ r: 0, g: 0, b: 1 }, EulerConverger, bodies),
        new Simulation({ r: 0, g: 1, b: 0 }, Verlet, bodies),
        new Simulation({ r: 1, g: 0.5, b: 0 }, RK4, bodies),
    ]

}

function toggleSim(n) {
    simulations[n].hidden = !simulations[n].hidden
    simulations[n].bodies.forEach(body => body.path = [])
}

let timewarp = 1;
function faster() {
    timewarp++;
    document.getElementById("timewarp").innerText = timewarp;
}

function slower() {
    timewarp--;
    timewarp = Math.max(timewarp, 0);
    document.getElementById("timewarp").innerText = timewarp;
}

let clickstart = { x: 0, y: 0 }
let mousenow = { x: 0, y: 0 }

function tick() {

    requestAnimationFrame(tick)

    let canvas = document.getElementById("display-canvas")
    let ctx = canvas.getContext("2d")

    // Clear canvas
    resetTransform(ctx)
    ctx.globalCompositeOperation = "source-over"
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Advance the simulations
    if (keys.in) zoom *= 1.01
    if (keys.out) zoom /= 1.01
    let panRate = 15
    if (keys.up) yoff += panRate / zoom
    if (keys.down) yoff -= panRate / zoom
    if (keys.left) xoff += panRate / zoom
    if (keys.right) xoff -= panRate / zoom

    transformCanvas(canvas, ctx)
    ctx.globalCompositeOperation = "lighter"
    for (let i = 0; i < timewarp; i++) simulations.forEach(sim => sim.tick(dt))
    simulations.forEach(sim => { if (!sim.hidden) sim.render(ctx) })

    ctx.fillStyle = "#fff"

}





window.onload = () => {
    resizeCanvas()
    loadSim(2)
    requestAnimationFrame(tick);

    let canvas = document.getElementById("display-canvas")
    canvas.onmousemove = (event) => {
        let cx = event.clientX
        let cy = event.clientY
        let pos = getWorldSpace(cx, cy)
        mousenow = pos
    }
}

