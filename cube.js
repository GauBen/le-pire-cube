/**
 * Le Pire Cube
 *
 * @author Gautier Ben Aïm
 */

'use strict'

const PI = 3.141592653589793
const SQRT2 = 1.414213562373095
const SQRT3 = 1.732050807568877
const EPSILON = 0.000001

/**
 * Three-dimensional vector
 */
class Vect {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  constructor (x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  lengthSquared () {
    return this.dot(this)
  }

  /**
   * Euclidean length
   */
  length () {
    return this.lengthSquared() ** 0.5
  }

  /**
   * v / length(v)
   */
  normalize () {
    const l = this.length()
    if (l === 0) {
      throw new Error('Zero vector cannot be normalized')
    }
    return this.multiply(1 / l)
  }

  /**
   * Add to another vector
   * @param {Vect} v
   */
  add (v) {
    return new Vect(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  /**
   * Multiply a vector by a scalar value
   * @param {number} lambda
   */
  multiply (lambda) {
    return new Vect(this.x * lambda, this.y * lambda, this.z * lambda)
  }

  /**
   * Substract v to this vector
   * @param {Vect} v
   */
  substract (v) {
    return this.add(v.multiply(-1))
  }

  /**
   * Dot-product with another vector
   * @param {Vect} v
   */
  dot (v) {
    return this.x * v.x + this.y * v.y + this.z * v.z
  }

  /**
   * Cross-product with another vector
   * @param {Vect} v
   */
  cross (v) {
    return new Vect(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    )
  }

  /**
   * Rotate along the x-axis
   * @param {number} theta
   */
  rotateX (theta) {
    return new Vect(this.x, this.y * Math.cos(theta) - this.z * Math.sin(theta), this.z * Math.cos(theta) + this.y * Math.sin(theta))
  }

  /**
   * Rotate along the y-axis
   * @param {number} theta
   */
  rotateY (theta) {
    return new Vect(this.x * Math.cos(theta) + this.z * Math.sin(theta), this.y, this.z * Math.cos(theta) - this.x * Math.sin(theta))
  }

  /**
   * Rotate along the z-axis
   * @param {number} theta
   */
  rotateZ (theta) {
    return new Vect(this.x * Math.cos(theta) - this.y * Math.sin(theta), this.y * Math.cos(theta) + this.x * Math.sin(theta), this.z)
  }

  clone () {
    return new Vect(this.x, this.y, this.z)
  }

  cloneX () {
    return new Vect(this.x, 0, 0)
  }

  cloneY () {
    return new Vect(0, this.y, 0)
  }

  cloneZ () {
    return new Vect(0, 0, this.z)
  }

  cloneXY () {
    return new Vect(this.x, this.y, 0)
  }

  cloneXZ () {
    return new Vect(this.x, 0, this.z)
  }

  cloneYZ () {
    return new Vect(0, this.y, this.z)
  }
}

Vect.ZERO = new Vect(0, 0, 0)
Vect.ONE = new Vect(1, 1, 1)

/**
 * 3x3 matrix, defined by its three columns
 */
class Matrix {
  /**
   * @param {Vect} u
   * @param {Vect} v
   * @param {Vect} w
   */
  constructor (u, v, w) {
    this.u = u
    this.v = v
    this.w = w
  }

  /**
   * Multiply this matrix with a vector to its left, producing a new vector
   * @param {Vect} v
   */
  product (v) {
    return new Vect(
      this.u.x * v.x + this.v.x * v.y + this.w.x * v.z,
      this.u.y * v.x + this.v.y * v.y + this.w.y * v.z,
      this.u.z * v.x + this.v.z * v.y + this.w.z * v.z
    )
  }

  /**
   * @param {number} lambda
   */
  multiply (lambda) {
    return new Matrix(this.u.multiply(lambda), this.v.multiply(lambda), this.w.multiply(lambda))
  }
}

/**
 * Array of vects on the same plane, named vertices
 */
class Path {
  /**
   * @param {Vect[]} vects
   */
  constructor (vects) {
    if (vects.length <= 2) {
      throw new Error('A path is a least three points')
    }
    this.vertices = [vects[0], vects[1], vects[2]]
    this.normal = vects[1].substract(vects[0]).cross(vects[2].substract(vects[1])).normalize()
    for (const vect of vects.slice(3)) {
      this.vertices.push(vect)
    }
  }

  /**
   * @param {string} method
   * @param {any[]} args
   */
  _call (method, ...args) {
    return new Path(this.vertices.map(v => v[method](...args)))
  }

  /**
   * @param {Vect} v
   */
  translate (v) {
    return this._call('add', v)
  }

  /**
   * @param {Vect} origin
   * @param {number} theta
   */
  rotateX (theta, origin = Vect.ZERO) {
    return this.translate(origin.multiply(-1))._call('rotateX', theta).translate(origin)
  }

  /**
   * @param {Vect} origin
   * @param {number} theta
   */
  rotateY (theta, origin = Vect.ZERO) {
    return this.translate(origin.multiply(-1))._call('rotateY', theta).translate(origin)
  }

  /**
   * @param {Vect} origin
   * @param {number} theta
   */
  rotateZ (theta, origin = Vect.ZERO) {
    return this.translate(origin.multiply(-1))._call('rotateZ', theta).translate(origin)
  }
}

/**
 * Array of paths, named faces
 */
class Solid {
  /**
   * @param {Path[]} paths
   */
  constructor (paths) {
    this.faces = paths
  }

  /**
   * @param {string} method
   * @param {any[]} args
   */
  _call (method, ...args) {
    return new Solid(this.faces.map(v => v[method](...args)))
  }

  /**
   * @param {Vect} v
   */
  translate (v) {
    return this._call('translate', v)
  }

  /**
   * @param {Vect} origin
   * @param {number} theta
   */
  rotateX (theta, origin) {
    return this._call('rotateX', theta, origin)
  }

  /**
   * @param {Vect} origin
   * @param {number} theta
   */
  rotateY (theta, origin) {
    return this._call('rotateY', theta, origin)
  }

  /**
   * @param {Vect} origin
   * @param {number} theta
   */
  rotateZ (theta, origin) {
    return this._call('rotateZ', theta, origin)
  }
}

/**
 * Best solid ever
 */
class Prism extends Solid {
  /**
   * @param {Vect} diagonal
   */
  constructor (diagonal) {
    const x = diagonal.cloneX()
    const y = diagonal.cloneY()
    let z = diagonal.cloneZ()
    const vertices = [
      Vect.ZERO, x, x.add(y), y,
      z, z.add(x), z.add(x).add(y), z.add(y)
    ]
    super([
      new Path([vertices[0], vertices[3], vertices[2], vertices[1]]),
      new Path([vertices[1], vertices[2], vertices[6], vertices[5]]),
      new Path([vertices[2], vertices[3], vertices[7], vertices[6]]),
      new Path([vertices[0], vertices[1], vertices[5], vertices[4]]),
      new Path([vertices[3], vertices[0], vertices[4], vertices[7]]),
      new Path([vertices[4], vertices[5], vertices[6], vertices[7]])
    ])
    this.diagonal = diagonal
  }
}

/**
 * Some useful computations about collisions
 */
class Collisions {
  /**
   * @param {Vect} v
   * @param {Path} path
   */
  static isPointInPath (v, path) {
    const vects = path.translate(v.multiply(-1)).vertices
    /**
     * @param {Vect} u
     */
    function vectorSeesAllOthersOnTheSameHalfPlane (u) {
      let min = 0
      let max = 0
      for (const w of vects) {
        const dot = path.normal.dot(u.cross(w))
        if (dot < min) {
          min = dot
        } else if (dot > max) {
          max = dot
        }
        if (max !== 0 && min !== 0) {
          return false
        }
      }
      return true
    }
    // One may prove that, for a given path P=[A, B, C...] and a point Z,
    // Z is not strictly in the convex envelope of P if and only if all
    // the vectors ZA, ZB, ZC... fit within a half-plane
    return !vects.some(vectorSeesAllOthersOnTheSameHalfPlane)
  }

  /**
   * @param {Path} firstPath
   * @param {Path} secondPath
   */
  static pathIntersection (firstPath, secondPath) {

  }
}

/**
 * (r, g, b) plus a few other things
 */
class Color {
  /**
   * @param {number} r
   * @param {number} g
   * @param {number} b
   */
  constructor (r, g, b) {
    this.r = Math.floor(r)
    this.g = Math.floor(g)
    this.b = Math.floor(b)
  }

  toString () {
    return `rgb(${this.r},${this.g},${this.b})`
  }

  /**
   * @param {Color} c1
   * @param {Color} c2
   * @param {number} t
   */
  static gradient (c1, c2, t) {
    return new Color(
      (1 - t) * c1.r + t * c2.r,
      (1 - t) * c1.g + t * c2.g,
      (1 - t) * c1.b + t * c2.b
    )
  }

  /**
   * @param {Color} c
   * @param {Color} lightest
   * @param {Color} darkest
   * @param {number} brightness
   * @param {number} t
   */
  static scale (c, lightest, darkest, brightness, t) {
    const light = Color.gradient(c, lightest, brightness)
    const dark = Color.gradient(c, darkest, brightness)
    return Color.gradient(light, dark, (t + 1) / 2)
  }

  /**
   * @param {string} s
   */
  static fromHex (s) {
    const m = s.match(/#([0-9a-f]{3}([0-9a-f]{3})?)/i)
    if (m === null) {
      throw new Error('Incorrect hex color format')
    }
    let hex = m[1]
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    const bin = parseInt(hex, 16)
    return new Color(bin >> 16, bin >> 8 & 255, bin & 255)
  }
}

/**
 * Some settings
 */
// eslint-disable-next-line no-unused-vars
class GameSettings {
  /**
   * @param {Window} window
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLCanvasElement} offscreenCanvas
   */
  constructor (window, canvas, offscreenCanvas) {
    this.window = window
    this.canvasElement = canvas
    this.canvasContext = canvas.getContext('2d', { alpha: false })
    this.offscreenCanvasElement = offscreenCanvas
    this.offscreenCanvasContext = offscreenCanvas.getContext('2d', { alpha: false })

    this.offscreenHeightRatio = 3

    this.playerSize = 0.5
    this.playerInitialPosition = new Vect(1.5, 1.5, 0)
    this.playerAcceleration = new Vect(0, 0, -30)
    this.playerJumpVelocity = new Vect(0, 0, 10)

    // Since we travel along the y=x axis, we want to multiply everything by SQRT2
    this.gameInitialPosition = -5 * SQRT2
    this.gameInitialVelocity = 1.0 * SQRT2
    this.gameAcceleration = 0.1 * SQRT2
    this.gameTimeBetweenPowerUps = 10
    this.gameDeathZone = 4 // 4 tiles offscreen
    this.gameWalkZone = 200
    this.gameWidth = 6

    this.rendererProjectionMatrix = new Matrix(
      new Vect(SQRT3 / 2, -1 / 2, 0),
      new Vect(-SQRT3 / 2, -1 / 2, 0),
      new Vect(0, -1, 0)
    )
    this.rendererInvertedProjectionMatrix = new Matrix(
      new Vect(SQRT3 / 3, -SQRT3 / 3, 0),
      new Vect(-1, -1, 0),
      Vect.ZERO
    )
    this.rendererTilesOnScreen = 15
    this.rendererTileHeight = 2
    this.rendererLightDirection = new Vect(-1, -3, -4).normalize()
    this.rendererPlayerColors = [
      Color.fromHex('#08d'),
      Color.fromHex('#5b5'),
      Color.fromHex('#dd3'),
      Color.fromHex('#e92'),
      Color.fromHex('#d21'),
      Color.fromHex('#b3b'),
      Color.fromHex('#dde')
    ]
    this.rendererGroundColor = Color.fromHex('#333')
    this.rendererBackgroundColor = Color.fromHex('#000')
    this.rendererDarkColor = Color.fromHex('#000')
    this.rendererLightColor = Color.fromHex('#fff')
    this.rendererBrightness = 0.2
    this.rendererMinimumTimeBetweenFrames = 0.015 // 60 Hz
    this.rendererPowerUpAnimationDuration = 0.1
    this.rendererFallingAnimationDuration = 0.5
    this.rendererMenuAnimationDuration = 3

    this.inputIsTouchScreen = 'ontouchstart' in window
  }
}

/**
 * Le Pire Cube
 */
class Player {
  /**
   * @param {GameSettings} settings
   */
  constructor (settings) {
    this.settings = settings

    // Dimenstions
    this.side = settings.playerSize
    this.s = Vect.ONE.multiply(this.side)

    // Position, velocity, acceleration
    /** @type Vect */
    this.position = settings.playerInitialPosition
    this.velocity = Vect.ZERO
    this.acceleration = settings.playerAcceleration

    // Velocities of several motions
    this.orientationAngularVelocity = null
    this.rotationAngularVelocity = null
    this.inAirVelocity = null

    this.level = 0
    this.levelSince = 0
    this._updateStats()

    this.jumpVelocity = settings.playerJumpVelocity

    // State
    this.orientation = 0

    this.rotation = 0
    this.inRotation = false
    this.inRotationSince = 0

    this.inAir = false
    this.inAirSince = 0
  }

  /**
   * @param {number} t
   */
  setInAir (t) {
    this.inAir = true
    this.inAirSince = t
  }

  /**
   * @param {number} t
   */
  jump (t) {
    this.setInAir(t)
    this.velocity = this.jumpVelocity
  }

  land () {
    this.inAir = false
    this.velocity = Vect.ZERO
  }

  resetAltitude () {
    this.position = this.position.cloneXY()
  }

  /**
   * @param {number} t
   */
  updateAltitude (t) {
    const airTime = t - this.inAirSince
    this.position = new Vect(this.position.x, this.position.y, airTime * airTime * this.acceleration.z / 2 + airTime * this.velocity.z)
  }

  /**
   * @param {Vect} direction
   * @param {number} dt
   */
  flyTowards (direction, dt) {
    this.position = this.position.add(direction.multiply(this.inAirVelocity * dt))
  }

  /**
   * @param {number} theta
   */
  setOrientation (theta) {
    this.orientation = theta
  }

  /**
   * @param {number} t
   */
  beginRotation (t) {
    this.inRotation = true
    this.inRotationSince = t
    this.rotation = 0
  }

  /**
   * @param {number} t
   */
  updateRotation (t) {
    this.inRotation = true
    this.rotation = (t - this.inRotationSince) * this.rotationAngularVelocity
  }

  endRotation () {
    this.inRotation = false
    this.rotation = 0
    this.position = this.position.add(new Vect(this.side, 0, 0).rotateZ(this.orientation))
  }

  /**
   * @param {number} t
   */
  eatPowerUp (t) {
    this.level++
    this.levelSince = t
    this._updateStats()
  }

  /**
   * To be called when a powerup is eaten
   */
  _updateStats () {
    const velocity = this.settings.gameTimeBetweenPowerUps * this.settings.gameAcceleration * (this.level + 2) + this.settings.gameInitialVelocity

    this.inAirVelocity = velocity
    this.rotationAngularVelocity = velocity / this.side * PI / 2
    this.orientationAngularVelocity = this.rotationAngularVelocity
  }

  getCollisionPath () {
    if (this.inRotation) {
      return new Path([
        this.s.cloneX(),
        this.s.cloneX().multiply(SQRT2 / 2).add(this.s.cloneY().multiply(1 / 2)),
        this.s.cloneXY(),
        this.s.cloneX().multiply(SQRT2).add(this.s.cloneY().multiply(1 / 2))
      ])
        .rotateZ(this.orientation, this.s.multiply(1 / 2))
        .translate(this.position.substract(this.s.cloneXY().multiply(1 / 2)))
    }
    return new Path([
      Vect.ZERO,
      this.s.cloneY(),
      this.s.cloneXY(),
      this.s.cloneX()
    ]).rotateZ(this.orientation, this.s.multiply(1 / 2)).translate(this.position.substract(this.s.cloneXY().multiply(1 / 2)))
  }
}

/**
 * 1x1 square
 */
class GameCell {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor (x, y) {
    this.x = x
    this.y = y
  }
}

/**
 * Something to walk on
 */
class Tile extends GameCell { }

/**
 * A better thing to walk on
 */
class PowerUpTile extends Tile {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor (x, y) {
    super(x, y)
    this.consumed = false
    this.consumedSince = 0
  }
}

/**
 * Generates tiles and powerups on a 2d plane
 */
class WorldGenerator {
  /**
   * @param {GameSettings} settings
   */
  constructor (settings) {
    this.settings = settings
    this.seed = Math.random()
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  isTile (x, y) {
    if (Math.abs(x - y) >= this.settings.gameWidth) {
      return false
    }
    const z = ((1 + this.seed) * Math.cos(7 * x) + Math.sin(6 * x - y) + Math.cos(this.seed * 19 * y) + (2 - this.seed) * Math.sin(2 * x + 5 * y)) / 5 - (y - x) ** 2 / 25 + Math.exp(-(x + y) / this.settings.gameWalkZone)
    return z >= 0
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  isPowerUp (x, y) {
    const a = this.settings.gameAcceleration
    const v0 = this.settings.gameInitialVelocity
    const t0 = this.settings.gameTimeBetweenPowerUps

    /** @param {number} x */
    const n = x => (-v0 + (v0 * v0 + 2 * a * x) ** 0.5) / (a * t0)

    return x === y && x >= 1 && Math.floor(n(x * SQRT2)) > Math.floor(n((x - 1) * SQRT2))
  }
}

class GameInputs {
  constructor () {
    this.direction = Vect.ZERO
    this.jump = false
  }
}

/**
 * An instance of the game
 */
class Game {
  /**
   * @param {GameSettings} settings
   * @param {GameInputs} inputs
   */
  constructor (settings, inputs) {
    this.settings = settings

    // In game time
    this.t = 0
    this.score = 0
    this.gameOver = false
    this.gameOverAt = 0

    this.tiles = { 1: { 1: new Tile(1, 1) } }
    this.generator = new WorldGenerator(settings)
    this.player = new Player(settings)

    // The world is generated between these two boundaries
    this.viewportStart = 0
    this.viewportEnd = 0
    this.cameraPosition = settings.gameInitialPosition
    this.generateWorld(0, settings.rendererTilesOnScreen)

    this.inputs = inputs
    this.jumpQueued = false
  }

  /**
   * Generate and store tiles
   * @param {number} start
   * @param {number} end
   */
  generateWorld (start, end) {
    start = Math.max(0, start)
    if (start > this.viewportStart) {
      for (let i = this.viewportStart; i < start; i++) {
        delete this.tiles[i]
      }
    }
    if (end > this.viewportEnd) {
      for (let y = start; y <= end; y++) {
        if (!(y in this.tiles)) {
          this.tiles[y] = {}
        }
        for (let x = start; x <= end; x++) {
          if ((x < this.viewportEnd && y < this.viewportEnd) || x in this.tiles[y]) {
            continue
          }
          if (this.generator.isPowerUp(x, y)) {
            this.tiles[y][x] = new PowerUpTile(x, y)
          } else if (this.generator.isTile(x, y)) {
            this.tiles[y][x] = new Tile(x, y)
          } else {
            this.tiles[y][x] = new GameCell(x, y)
          }
        }
      }
    }
    this.viewportStart = start
    this.viewportEnd = end
    return this.tiles
  }

  /**
   * Return a list of the tiles the player is stepping on
   * Empty <=> player is in the air
   */
  playerIsOnTheseTiles () {
    const p = this.player
    const playerPath = p.getCollisionPath()

    let left = Math.floor(playerPath.vertices[0].x)
    let right = left
    let bottom = Math.floor(playerPath.vertices[0].y)
    let top = bottom

    const theseTiles = []

    for (const vertex of playerPath.vertices) {
      const x = Math.floor(vertex.x)
      const y = Math.floor(vertex.y)
      left = Math.min(left, x)
      right = Math.max(right, x)
      bottom = Math.min(bottom, y)
      top = Math.max(top, y)
      if (y in this.tiles && x in this.tiles[y] && this.tiles[y][x] instanceof Tile && theseTiles.indexOf(this.tiles[y][x]) === -1) {
        theseTiles.push(this.tiles[y][x])
      }
    }

    for (let y = bottom; y <= top; y++) {
      for (let x = left; x <= right; x++) {
        if (y in this.tiles && x in this.tiles[y] && this.tiles[y][x] instanceof Tile) {
          const corner = [new Vect(x, y, 0), new Vect(x + 1, y, 0), new Vect(x, y + 1, 0), new Vect(x + 1, y + 1, 0)].reduce((u, v) => p.position.substract(u).lengthSquared() < p.position.substract(v).lengthSquared() ? u : v)

          if (theseTiles.indexOf(this.tiles[y][x]) === -1 && Collisions.isPointInPath(corner, playerPath)) {
            theseTiles.push(this.tiles[y][x])
          }
        }
      }
    }

    return theseTiles
  }

  /**
   * Update the game state for a given number of seconds
   * @param {number} elapsedTime
   */
  update (elapsedTime) {
    let direction = this.inputs.direction
    if (direction.lengthSquared() > 0) {
      direction = direction.normalize()
    }

    // Figure out next event
    const dts = [elapsedTime]
    let dtRotation = 0
    let dtFalling = 0
    let dtOrientation = 0

    // Checking rotation
    if (this.player.inRotation) {
      dtRotation = (PI / 2 - this.player.rotation) / this.player.rotationAngularVelocity
      dts.push(dtRotation)
    }
    // Checking player's height
    if (this.player.inAir) {
      dtFalling = -2 * this.player.velocity.z / this.player.acceleration.z - (this.t - this.player.inAirSince)
      if (dtFalling > EPSILON) {
        dts.push(dtFalling)
      }
    }
    // Checking orientation
    let orientationClockwise = false
    let angle = 0
    if (direction.lengthSquared() > 0) {
      angle = Math.atan2(direction.y, direction.x)
      if (!this.player.inRotation && Math.abs((angle - this.player.orientation) % (PI / 2)) > EPSILON) {
        const diff = Math.abs(angle - this.player.orientation) % (PI / 2)
        if (angle < this.player.orientation) {
          orientationClockwise = !orientationClockwise
        }
        const dtClockwise = diff / this.player.orientationAngularVelocity
        const dtCounterclockwise = ((PI / 2) - diff) / this.player.orientationAngularVelocity
        dtOrientation = dtClockwise
        if (dtCounterclockwise < dtClockwise) {
          dtOrientation = dtCounterclockwise
          orientationClockwise = !orientationClockwise
        }
        dts.push(dtOrientation)
      }
    }

    // Picking the closest event
    const dt = Math.min(...dts)
    this.t += dt

    // Finishind rotation
    if (dt === dtRotation) {
      this.player.endRotation()
    } else if (this.player.inRotation) {
      this.player.updateRotation(this.t)
    }

    // Reaching the ground
    if (dt === dtFalling) {
      this.player.resetAltitude()
    } else if (this.player.inAir) {
      this.player.updateAltitude(this.t)
    }

    // Reaching correct orientation
    if (dt === dtOrientation) {
      this.player.setOrientation(angle)
    }

    // We have to check collisions now
    if (this.player.position.z === 0) {
      const tiles = this.playerIsOnTheseTiles()
      if (tiles.length > 0) {
        this.player.land()

        if (!this.player.inRotation) {
          for (const tile of tiles) {
            if (tile instanceof PowerUpTile && !tile.consumed) {
              this.player.eatPowerUp(this.t)
              tile.consumed = true
              tile.consumedSince = this.t
            }
          }
        }
      } else if (!this.player.inAir) {
        this.player.setInAir(this.t)
      }
    }

    // Examining inputs
    if (this.inputs.jump || this.jumpQueued) {
      if (!this.player.inAir && !this.player.inRotation) {
        this.jumpQueued = false
        this.player.jump(this.t)
      } else if (!this.player.inAir) {
        this.jumpQueued = true
      }
    }

    // Changing orientation
    if (direction.lengthSquared() > 0 && !this.player.inRotation) {
      if (Math.abs((angle - this.player.orientation) % (PI / 2)) < EPSILON) {
        this.player.setOrientation(angle)
        if (!this.player.inAir) {
          this.player.beginRotation(this.t)
        }
      } else {
        const sign = orientationClockwise ? -1 : 1
        this.player.setOrientation(this.player.orientation + sign * dt * this.player.orientationAngularVelocity)
      }
      if (this.player.position.z >= 0) {
        this.player.flyTowards(direction, dt)
      }
    }

    // Compute camera position
    this.cameraPosition = this.getCameraPosition(this.t)

    // Compute score
    const distance = new Vect(SQRT2 / 2, SQRT2 / 2, 0).dot(this.player.position)
    this.score = Math.max(this.score, Math.floor(distance - new Vect(SQRT2 / 2, SQRT2 / 2, 0).dot(this.settings.playerInitialPosition)))

    // this.cameraPosition = distance - 5 + this.player.side * this.player.rotation / (PI / 2) * Math.sin(this.player.orientation + PI / 4)

    // ded?
    if (!this.gameOver && (distance < this.cameraPosition - this.settings.gameDeathZone || this.player.position.z < -EPSILON)) {
      this.gameOver = true
      this.gameOverAt = this.t
    }

    // Do we need to compute another event?
    if (elapsedTime - dt > EPSILON) {
      return this.update(elapsedTime - dt)
    }
  }

  /**
   * @param {number} t
   */
  getCameraPosition (t) {
    if (!this.gameOver || t <= this.gameOverAt) {
      return this.settings.gameAcceleration / 2 * t * t + this.settings.gameInitialVelocity * t + this.settings.gameInitialPosition
    }
    const v = this.settings.gameAcceleration * this.gameOverAt + this.settings.gameInitialVelocity
    const a = this.settings.rendererFallingAnimationDuration > 0 ? -v / this.settings.rendererFallingAnimationDuration : 0
    const dt = Math.min(this.settings.rendererFallingAnimationDuration, t - this.gameOverAt)
    return this.getCameraPosition(this.gameOverAt) + a / 2 * dt * dt + v * dt
  }
}

class State {
  constructor () {
    this.ready = true
    this.inGame = false
    /** @type {Game} */
    this.game = null
    /** @type {GameInputs} */
    this.gameInputs = null
    this.t = 0
    this.gameOver = false
    this.gameOverAt = 0
    this.gameScore = 0
  }
}

class ProjectedContext {
  /**
   * @param {CanvasRenderingContext2D} context
   * @param {Vect} origin
   * @param {Matrix} projectionMatrix
   */
  constructor (context, projectionMatrix, origin) {
    this.context = context
    this.projectionMatrix = projectionMatrix
    this.origin = origin
  }
}

class GameScene {
  /**
   * @param {Player} player
   * @param {number} start
   * @param {number} end
   * @param {{ 1: { 1: Tile; }; }} tiles
   * @param {number} powerUpColorId
   * @param {number} t
   * @param {number} lastPowerUpTime
   */
  constructor (player, start, end, tiles, powerUpColorId, t, lastPowerUpTime) {
    this.player = player
    this.start = start
    this.end = end
    this.tiles = tiles
    this.powerUpColorId = powerUpColorId
    this.t = t
    this.lastPowerUpTime = lastPowerUpTime
  }

  /**
   * @param {Game} game
   */
  static fromGame (game) {
    return new GameScene(game.player, game.viewportStart, game.viewportEnd, game.tiles, game.player.level + 1, game.t, game.player.levelSince)
  }
}

class GameSceneDrawer {
  /**
   * @param {GameSettings} settings
   */
  constructor (settings) {
    this.settings = settings

    // Pre-compute some colors
    this.backgroundColor = settings.rendererBackgroundColor.toString()
    this.groundColor = this._faceColor(settings.rendererGroundColor, new Vect(0, 0, 1)).toString()
    this.bottomLeftSideColor = this._faceColor(settings.rendererGroundColor, new Vect(-1, 0, 0)).toString()
    this.bottomRightSideColor = this._faceColor(settings.rendererGroundColor, new Vect(0, -1, 0)).toString()
  }

  /**
   * Draw a `scene` on a `projectedContext`
   * @param {ProjectedContext} projectedContext
   * @param {GameScene} scene
   */
  drawScene (projectedContext, scene) {
    const ctx = projectedContext.context
    ctx.fillStyle = this.settings.rendererBackgroundColor.toString()
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    let drawPlayer = false
    let playerX
    let playerY
    let playerZ
    if (scene.player instanceof Player) {
      drawPlayer = true
      playerZ = scene.player.position.z
      if (playerZ < 0) {
        const p = scene.player.getCollisionPath().vertices[0]
        playerX = Math.floor(p.x)
        playerY = Math.floor(p.y)
      }
    }

    // (len ** 2) tiles to draw
    const len = scene.end - scene.start + 1

    // We draw them from back to front
    for (let i = 0; i < 2 * len - 1; i++) {
      for (let j = Math.max(0, i - len + 1); j <= Math.min(i, len - 1); j++) {
        const x = len - j - 1 + scene.start
        const y = len - (i - j) - 1 + scene.start

        if (drawPlayer && playerZ < 0 && x === playerX && y === playerY) {
          this.drawPlayer(projectedContext, scene)
          drawPlayer = false
        }

        if (this._isTile(scene, x, y)) {
          const tile = scene.tiles[y][x]
          this._drawTile(projectedContext, scene, tile)
        }
      }
    }

    if (drawPlayer) {
      this.drawPlayer(projectedContext, scene)
    }
  }

  /**
   * Draw the player (given in the `scene`) on the `projectedContext`
   * @param {ProjectedContext} projectedContext
   * @param {GameScene} scene
   */
  drawPlayer (projectedContext, scene) {
    const p = scene.player

    const cube = new Prism(p.s)
      .rotateY(p.rotation, p.s.cloneX())
      .rotateZ(p.orientation, p.s.multiply(0.5))
      .translate(p.position.substract(p.s.cloneXY().multiply(0.5)))

    this.drawPlayerShadow(projectedContext, scene, cube)

    const color = this._transitionColor(scene, p.level)

    /**
     * @param {Path} cp
     */
    const depth = cp =>
      cp.vertices.map(v => 2 * v.z - v.x - v.y).reduce((a, b) => a + b) / cp.vertices.length
    cube.faces.sort((p1, p2) => depth(p1) - depth(p2))

    for (const path of cube.faces) {
      let faceColor = this._faceColor(color, path.normal)
      const t = Math.min(Math.max((-p.position.z - p.side) / this.settings.rendererTileHeight, 0), 1)
      if (p.position.z < 0) {
        faceColor = Color.gradient(faceColor, this.settings.rendererBackgroundColor, t)
      }
      this._drawColoredPath(projectedContext, path, faceColor)
    }
  }

  /**
   * @param {ProjectedContext} projectedContext
   * @param {GameScene} scene
   * @param {Solid} cube
   */
  drawPlayerShadow (projectedContext, scene, cube) {
    const v = this.settings.rendererLightDirection

    const shadowProjectionMatrix = new Matrix(
      new Vect(1, 0, 0),
      new Vect(0, 1, 0),
      new Vect(-v.x / v.z, -v.y / v.z, 0)
    )

    // const gravityCenter = scene.player.position.add(scene.player.s.cloneZ().multiply(0.5))
    // const projectedGravityCenter = shadowProjectionMatrix.product(gravityCenter)

    if (scene.player.position.z < 0) {
      return
    }

    for (const face of cube.faces) {
      const projectedVertices = face.vertices.map(
        p => shadowProjectionMatrix.product(p)
      )
      this._drawColoredPath(projectedContext, new Path(projectedVertices), new Color(50, 50, 50))
    }
  }

  /**
   * @param {ProjectedContext} projectedContext
   * @param {number} x
   * @param {number} y
   * @param {?number} z
   */
  _project (projectedContext, x, y, z = 0) {
    return projectedContext.origin.add(projectedContext.projectionMatrix.product(new Vect(x, y, z)))
  }

  /**
   * @param {GameScene} scene
   * @param {number} x
   * @param {number} y
   */
  _isTile (scene, x, y) {
    return y in scene.tiles && x in scene.tiles[y] && scene.tiles[y][x] instanceof Tile
  }

  /**
   * @param {Color} color
   * @param {Vect} normalVect
   */
  _faceColor (color, normalVect) {
    return Color.scale(color, this.settings.rendererLightColor, this.settings.rendererDarkColor, this.settings.rendererBrightness, this.settings.rendererLightDirection.dot(normalVect))
  }

  /**
   * @param {GameScene} scene
   * @param {number} colorId
   */
  _transitionColor (scene, colorId) {
    const colors = this.settings.rendererPlayerColors
    const dt = scene.t - scene.lastPowerUpTime
    let color = colors[colorId % colors.length]
    if (colorId > 0 && scene.lastPowerUpTime > 0 && dt < this.settings.rendererPowerUpAnimationDuration) {
      color = Color.gradient(colors[(colorId - 1) % colors.length], color, dt / this.settings.rendererPowerUpAnimationDuration)
    }
    return color
  }

  /**
   * @param {PowerUpTile} tile
   * @param {GameScene} scene
   */
  _tileColor (scene, tile) {
    if (tile.consumed) {
      if (scene.t - tile.consumedSince >= this.settings.rendererPowerUpAnimationDuration) {
        return this.settings.rendererGroundColor
      }
      const colors = this.settings.rendererPlayerColors
      return Color.gradient(colors[(scene.powerUpColorId - 1) % colors.length], this.settings.rendererGroundColor, (scene.t - tile.consumedSince) / this.settings.rendererPowerUpAnimationDuration)
    }
    return this._transitionColor(scene, scene.powerUpColorId)
  }

  /**
   * @param {ProjectedContext} projectedContext
   * @param {Path} path
   * @param {Color} color
   */
  _drawColoredPath (projectedContext, path, color) {
    const ctx = projectedContext.context
    ctx.fillStyle = color.toString()

    ctx.beginPath()
    for (const vertex of path.vertices) {
      const corner = this._project(projectedContext, vertex.x, vertex.y, vertex.z)
      if (corner === path.vertices[0]) {
        ctx.moveTo(corner.x, corner.y)
      } else {
        ctx.lineTo(corner.x, corner.y)
      }
    }
    ctx.closePath()
    ctx.fill()
  }

  /**
   * Draw all the faces of a tile
   * @param {ProjectedContext} projectedContext
   * @param {GameScene} scene
   * @param {Tile} tile
   */
  _drawTile (projectedContext, scene, tile) {
    // Draw the sides
    if (!this._isTile(scene, tile.x - 1, tile.y)) {
      this._drawSide(projectedContext, scene, tile, true)
    }
    if (!this._isTile(scene, tile.x, tile.y - 1)) {
      this._drawSide(projectedContext, scene, tile, false)
    }

    // Draw the top face
    //   _ 3 _
    // 4 _   _ 2
    //     1
    const one = this._project(projectedContext, tile.x, tile.y)
    const two = this._project(projectedContext, tile.x + 1, tile.y)
    const three = this._project(projectedContext, tile.x + 1, tile.y + 1)
    const four = this._project(projectedContext, tile.x, tile.y + 1)

    let colorString = this.groundColor
    if (tile instanceof PowerUpTile) {
      colorString = this._faceColor(this._tileColor(scene, tile), new Vect(0, 0, 1)).toString()
    }
    const ctx = projectedContext.context
    ctx.fillStyle = colorString

    ctx.beginPath()
    ctx.moveTo(one.x, one.y + 1 / SQRT3)
    ctx.lineTo(two.x + 4 / 3, two.y)
    ctx.lineTo(three.x, three.y - 1 / SQRT3)
    ctx.lineTo(four.x - 4 / 3, four.y)
    ctx.closePath()
    ctx.fill()
  }

  /**
   * Draw the side of a tile
   * @param {ProjectedContext} projectedContext
   * @param {GameScene} scene
   * @param {GameCell} tile
   * @param {boolean} leftSide True to draw the left side, false otherwise
   */
  _drawSide (projectedContext, scene, tile, leftSide) {
    // true/false <- leftSide
    //   _-"-_
    // 2 _   _ 2
    // |   1   |
    // |   |   |
    // 3 _ | _ 3
    //     4

    const shift = leftSide ? 1 : 0
    const one = this._project(projectedContext, tile.x, tile.y, 0)
    const two = this._project(projectedContext, tile.x + (1 - shift), tile.y + shift, 0)
    const three = this._project(projectedContext, tile.x + (1 - shift), tile.y + shift, -this.settings.rendererTileHeight)
    const four = this._project(projectedContext, tile.x, tile.y, -this.settings.rendererTileHeight)

    const ctx = projectedContext.context
    const projectionMatrix = projectedContext.projectionMatrix
    const gradientVect = leftSide ? projectionMatrix.product(new Vect(0, 1, 0)).rotateZ(PI / 2) : projectionMatrix.product(new Vect(1, 0, 0)).rotateZ(-PI / 2)
    const gradient = ctx.createLinearGradient(
      one.x,
      one.y,
      one.x + this.settings.rendererTileHeight * this.settings.rendererProjectionMatrix.w.y * gradientVect.x,
      one.y + this.settings.rendererTileHeight * this.settings.rendererProjectionMatrix.w.y * gradientVect.y
    )

    let colorString = leftSide ? this.bottomLeftSideColor : this.bottomRightSideColor
    if (tile instanceof PowerUpTile) {
      colorString = this._faceColor(this._tileColor(scene, tile), new Vect(-shift, shift - 1, 0)).toString()
    }

    gradient.addColorStop(0, colorString)
    gradient.addColorStop(1, this.backgroundColor)
    ctx.fillStyle = gradient

    ctx.beginPath()
    ctx.moveTo(Math.floor(one.x), one.y)
    ctx.lineTo(two.x - 2 * shift + 1, two.y)
    ctx.lineTo(three.x - 2 * shift + 1, three.y)
    ctx.lineTo(Math.floor(four.x), four.y)
    ctx.closePath()
    ctx.fill()
  }
}

class GameRenderer {
  /**
   * @param {GameSettings} settings
   * @param {Game} game
   * @param {GameSceneDrawer} drawer
   */
  constructor (settings, game, drawer) {
    this.settings = settings
    this.game = game
    this.drawer = drawer

    this.offscreenDrawn = false
    this.offscreenCameraOffset = 0
    this.offscreenT = 0
    this.resize()
  }

  resize () {
    this.offscreenDrawn = false

    const offscreenCanvas = this.settings.offscreenCanvasElement
    offscreenCanvas.width = (this._projectionMatrix().product(new Vect(this.settings.gameWidth, 0, 0)).x + 2) * 2
    offscreenCanvas.height = this.settings.canvasElement.height * this.settings.offscreenHeightRatio
  }

  directDraw () {
    const screenWidth = this.settings.canvasElement.width
    const screenHeight = this.settings.canvasElement.height
    const m3 = this._projectionMatrix()
    const mm3 = this._invertedProjectionMatrix()

    const cameraPosition = this.game.cameraPosition

    const origin = new Vect(screenWidth / 2, screenHeight, 0).add(m3.product(new Vect(SQRT2 / 2, SQRT2 / 2, 0).multiply(-cameraPosition)))

    const topRight = mm3.product(new Vect(screenWidth, 0, 0).substract(origin))
    const bottomLeft = mm3.product(new Vect(0, screenHeight, 0).substract(origin))

    const start = Math.floor(bottomLeft.x)
    const end = Math.ceil(topRight.x)
    this.game.generateWorld(start, end)

    const projectedContext = new ProjectedContext(this.settings.canvasContext, m3, origin)
    const scene = GameScene.fromGame(this.game)

    this.drawer.drawScene(projectedContext, scene)
  }

  draw () {
    const m3 = this._projectionMatrix()
    const mm3 = this._invertedProjectionMatrix()

    if (this.game.player.level > 0 && this.game.t - this.game.player.levelSince < this.settings.rendererPowerUpAnimationDuration) {
      this.directDraw()
      if (!this._isOffscreenUpToDate(this.game.t + this.settings.rendererPowerUpAnimationDuration, m3)) {
        setTimeout(() => this._drawOffscreen(this.game.player.levelSince + this.settings.rendererPowerUpAnimationDuration, m3, mm3, 'animation'), 0)
      }
      return
    }

    if (this.game.player.position.z < 0) {
      this.directDraw()
      return
    }

    const cameraPosition = this.game.cameraPosition
    const cameraOffset = -m3.product(new Vect(SQRT2 / 2, SQRT2 / 2, 0).multiply(cameraPosition)).y

    if (!this._isOffscreenUpToDate(this.game.t, m3)) {
      this._drawOffscreen(this.game.t, m3, mm3)
    }

    const screenWidth = this.settings.canvasElement.width
    const screenHeight = this.settings.canvasElement.height

    const offscreenWidth = this.settings.offscreenCanvasElement.width
    const offscreenHeight = this.settings.offscreenCanvasElement.height

    const ctx = this.settings.canvasContext
    const center = Math.floor(screenWidth / 2 - offscreenWidth / 2)

    ctx.fillStyle = this.settings.rendererBackgroundColor.toString()
    ctx.fillRect(0, 0, screenWidth, screenHeight)

    ctx.drawImage(this.settings.offscreenCanvasElement, Math.max(0, -center), offscreenHeight - screenHeight + this.offscreenCameraOffset - cameraOffset, Math.min(screenWidth, offscreenWidth), screenHeight, Math.max(0, center), 0, Math.min(screenWidth, offscreenWidth), screenHeight)

    const origin = new Vect(screenWidth / 2, screenHeight, 0).add(new Vect(0, cameraOffset, 0))
    this.drawer.drawPlayer(new ProjectedContext(this.settings.canvasContext, m3, origin), GameScene.fromGame(this.game))

    const tNextFrame = this.game.t + this.settings.rendererMinimumTimeBetweenFrames

    if (!this._isOffscreenUpToDate(tNextFrame, m3)) {
      setTimeout(() => this._drawOffscreen(tNextFrame, m3, mm3, 'anticipation'), 0)
    }
  }

  _projectionMatrix () {
    return this.settings.rendererProjectionMatrix.multiply(
      this.settings.canvasElement.height /
      (-(this.settings.rendererProjectionMatrix.u.y +
        this.settings.rendererProjectionMatrix.v.y) *
        this.settings.rendererTilesOnScreen)
    )
  }

  _invertedProjectionMatrix () {
    return this.settings.rendererInvertedProjectionMatrix.multiply(
      (-(this.settings.rendererProjectionMatrix.u.y +
        this.settings.rendererProjectionMatrix.v.y) *
        this.settings.rendererTilesOnScreen) /
      this.settings.canvasElement.height
    )
  }

  _isOffscreenUpToDate (t, m3) {
    const screenHeight = this.settings.canvasElement.height
    const offscreenHeight = this.settings.offscreenCanvasElement.height
    const cameraOffset = -m3.product(new Vect(SQRT2 / 2, SQRT2 / 2, 0).multiply(this.game.getCameraPosition(t))).y

    return this.offscreenDrawn && cameraOffset > this.offscreenCameraOffset && cameraOffset < this.offscreenCameraOffset + offscreenHeight - screenHeight && (this.game.player.level === 0 || this.offscreenT >= this.game.player.levelSince + this.settings.rendererPowerUpAnimationDuration)
  }

  _drawOffscreen (t, m3, mm3, reason = '') {
    console.log(t, reason)
    const currentCameraOffset = -m3.product(new Vect(SQRT2 / 2, SQRT2 / 2, 0).multiply(this.game.getCameraPosition(this.game.t))).y
    const cameraOffset = -m3.product(new Vect(SQRT2 / 2, SQRT2 / 2, 0).multiply(this.game.getCameraPosition(t))).y

    this.offscreenDrawn = true
    this.offscreenCameraOffset = cameraOffset
    this.offscreenT = t

    const offscreenWidth = this.settings.offscreenCanvasElement.width
    const offscreenHeight = this.settings.offscreenCanvasElement.height

    const currentOrigin = new Vect(offscreenWidth / 2, offscreenHeight, 0).add(new Vect(0, currentCameraOffset, 0))
    const origin = new Vect(offscreenWidth / 2, offscreenHeight, 0).add(new Vect(0, cameraOffset, 0))

    const currentTopRight = mm3.product(new Vect(offscreenWidth, 0, 0).substract(currentOrigin))
    const currentBottomLeft = mm3.product(new Vect(0, offscreenHeight, 0).substract(currentOrigin))

    const topRight = mm3.product(new Vect(offscreenWidth, 0, 0).substract(origin))
    const bottomLeft = mm3.product(new Vect(0, offscreenHeight, 0).substract(origin))

    const start = Math.floor(Math.min(bottomLeft.x, currentBottomLeft.x))
    const end = Math.ceil(Math.max(topRight.x, currentTopRight.x))
    this.game.generateWorld(start, end)

    const scene = GameScene.fromGame(this.game)
    scene.player = null
    scene.t = t

    this.drawer.drawScene(new ProjectedContext(this.settings.offscreenCanvasContext, m3, origin), scene)
  }
}

class Renderer {
  /**
   * @param {GameSettings} settings
   * @param {State} state
   */
  constructor (settings, state) {
    this.settings = settings
    this.state = state
    this.gameSceneDrawer = new GameSceneDrawer(settings)
    this.gameRenderer = null
  }

  resize () {
    if (this.gameRenderer instanceof GameRenderer) {
      this.gameRenderer.resize()
    }
  }

  /**
   * @param {function} updateCallback
   */
  render (updateCallback) {
    let fps = 0
    let frames = 0

    let t0 = performance.now()
    /**
     * @param {number} t
     */
    const frame = /**
     * @param {number} t
     */
      t => {
        if (Math.floor(t / 1000) > Math.floor(t0 / 1000)) {
          fps = frames
          frames = 0
        }
        const dt = (t - t0) / 1000
        updateCallback(dt)
        this.frame()
        frames++
        this.settings.canvasContext.font = '50px "Segoe UI Semibold"'
        this.settings.canvasContext.fillStyle = '#fff'
        this.settings.canvasContext.fillText(fps.toString(), 50, 50)
        t0 = t
        requestAnimationFrame(frame)
      }

    this.frame()
    requestAnimationFrame(frame)
  }

  frame () {
    this.drawGameScene()
    this.drawUserInterface()
  }

  drawGameScene () {
    if (this.state.inGame) {
      if (!(this.gameRenderer instanceof GameRenderer) || this.gameRenderer.game !== this.state.game) {
        this.gameRenderer = new GameRenderer(this.settings, this.state.game, this.gameSceneDrawer)
      }
    }
    if (this.gameRenderer instanceof GameRenderer) {
      this.gameRenderer.draw()
    }
  }

  drawUserInterface () {
    if (this.state.inGame) {
      this.settings.canvasContext.fillStyle = '#fff'
      this.settings.canvasContext.font = '80px "Segoe UI Semibold"'
      this.settings.canvasContext.fillText(this.state.game.score.toString(), 300, 120)
    } else {
      this.settings.canvasContext.fillStyle = '#fff'
      this.settings.canvasContext.font = '26px "Segoe UI Semibold"'
      if (this.state.gameOver) {
        this.settings.canvasContext.fillText(this.state.gameScore.toString(), 100, 500)
      } else {
        this.settings.canvasContext.fillText('yeah, high scores here', 100, 500)
      }
    }
  }
}

// class Joystick {

//     constructor(settings, state) {
//         this.settings = settings
//         this.state = state
//         this.pad = false;
//         this.padCenter = null;
//         this.padEnd = null;
//         this.padFinger = null;
//         this.space = false;
//         this.spaceFinger = null;
//     }

// update33() {
//     if (this.state.inGame) {
//         this.state.game.inputs.space = this.space
//         let v = this.padEnd.substract(this.padCenter)
//         if (!this.pad || v.lengthSquared() < 400) {
//             this.state.game.inputs.direction = Vect.ZERO
//             return
//         }
//         v = v.normalize()
//         let direction = new Vect(1, -1, 0).multiply(v.x).add(
//             new Vect(-1, -1, 0).multiply(v.y)
//         )
//         this.state.game.inputs.direction = direction
//     } else if (this.pad || this.space) {
//         this.state.inGame = true
//         this.state.game = new Game(this.settings)
//     }
// }

// /**
//  * @param {TouchEvent} e
//  */
// touchStartHandler(e) {
//     e.preventDefault();
//     for (const t of e.changedTouches) {
//         if (!this.pad) {
//             this.pad = true;
//             this.padCenter = new Vect(t.pageX, t.pageY, 0);
//             this.padEnd = new Vect(t.pageX, t.pageY, 0);
//             this.padFinger = t.identifier;
//         } else if (!this.space) {
//             this.space = true;
//             this.spaceFinger = t.identifier;
//         }
//     }
//     this.update33()
// }

// /**
//  * @param {TouchEvent} e
//  */
// touchMoveHandler(e) {
//     e.preventDefault();
//     for (const t of e.changedTouches) {
//         if (t.identifier == this.padFinger) {
//             this.padEnd = new Vect(t.pageX, t.pageY, 0);
//         }
//     }
//     this.update33()
// }

// /**
//  * @param {TouchEvent} e
//  */
// touchEndHandler(e) {
//     e.preventDefault();
//     for (const t of e.changedTouches) {
//         if (t.identifier == this.padFinger) {
//             this.pad = false;
//             this.padFinger = null;
//         } else if (t.identifier == this.spaceFinger) {
//             this.space = false;
//             this.spaceFinger = null;
//         }
//     }
//     this.update33()
// }

// }

class UserInputs {
  constructor () {
    this.keySpace = false
    this.keyUp = false
    this.keyDown = false
    this.keyLeft = false
    this.keyRight = false
  }
}

// eslint-disable-next-line no-unused-vars
class Main {
  /**
   * @param {GameSettings} settings
   */
  constructor (settings) {
    this.settings = settings
    this.state = new State()
    this.inputs = new UserInputs()
    this.renderer = new Renderer(this.settings, this.state)
  }

  run () {
    this.resize()

    this.settings.window.addEventListener('keydown', e => this.keyDownHandler(e))
    this.settings.window.addEventListener('keyup', e => this.keyUpHandler(e))
    this.settings.window.addEventListener('touchstart', e => this.touchStartHandler(e))
    this.settings.window.addEventListener('touchmove', e => this.touchMoveHandler(e))
    this.settings.window.addEventListener('touchend', e => this.touchEndHandler(e))
    this.settings.window.addEventListener('resize', _ => this.resize())

    this.renderer.render(this.update.bind(this))
  }

  /**
   * @param {number} dt
   */
  update (dt) {
    this.state.t += dt

    if (this.state.inGame) {
      this.state.gameInputs.jump = this.inputs.keySpace

      // Directional inputs
      let direction = Vect.ZERO
      if (this.inputs.keyUp) {
        direction = direction.add(new Vect(1, 1, 0))
      }
      if (this.inputs.keyDown) {
        direction = direction.add(new Vect(-1, -1, 0))
      }
      if (this.inputs.keyLeft) {
        direction = direction.add(new Vect(-1, 1, 0))
      }
      if (this.inputs.keyRight) {
        direction = direction.add(new Vect(1, -1, 0))
      }

      this.state.gameInputs.direction = direction

      if (this.state.game.gameOver) {
        if (this.state.inGame) {
          this.state.gameOver = true
          this.state.gameOverAt = this.state.t
          this.state.gameScore = this.state.game.score
        }
        this.state.inGame = false
      }
    } else if (this.inputs.keySpace && this.state.ready) {
      this.state.ready = false
      this.inputs.keySpace = false
      this.newGame()
    }

    if (this.state.gameOver && this.state.gameOverAt + this.settings.rendererFallingAnimationDuration < this.state.t) {
      this.state.ready = true
    }

    if (this.state.game instanceof Game) {
      this.state.game.update(dt)
    }
  }

  newGame () {
    this.state.inGame = true
    this.state.gameOver = false
    this.state.gameInputs = new GameInputs()
    this.state.game = new Game(this.settings, this.state.gameInputs)
  }

  resize () {
    const w = this.settings.window.innerWidth
    const h = this.settings.window.innerHeight
    const ratio = this.settings.window.devicePixelRatio
    this.settings.canvasElement.width = w * ratio
    this.settings.canvasElement.height = h * ratio
    this.settings.canvasElement.style.width = `${w}px`
    this.settings.canvasElement.style.height = `${h}px`
    this.renderer.resize()
  }

  /**
   * @param {KeyboardEvent} e
   */
  keyDownHandler (e) {
    if (e.code === 'Space') {
      this.inputs.keySpace = true
    } else if (e.code === 'KeyW') {
      this.inputs.keyUp = true
    } else if (e.code === 'KeyS') {
      this.inputs.keyDown = true
    } else if (e.code === 'KeyA') {
      this.inputs.keyLeft = true
    } else if (e.code === 'KeyD') {
      this.inputs.keyRight = true
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
  keyUpHandler (e) {
    if (e.code === 'Space') {
      this.inputs.keySpace = false
    } else if (e.code === 'KeyW') {
      this.inputs.keyUp = false
    } else if (e.code === 'KeyS') {
      this.inputs.keyDown = false
    } else if (e.code === 'KeyA') {
      this.inputs.keyLeft = false
    } else if (e.code === 'KeyD') {
      this.inputs.keyRight = false
    }
  }

  /**
   * @param {TouchEvent} e
   */
  touchStartHandler (e) {
    if (!this.state.inGame) {
      this.newGame()
    }
  }

  /**
   * @param {TouchEvent} e
   */
  touchMoveHandler (e) {

  }

  /**
   * @param {TouchEvent} e
   */
  touchEndHandler (e) {

  }
}
