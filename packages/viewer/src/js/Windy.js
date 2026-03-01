import * as Cesium from 'cesium'
import Particle from './Particle.js'// 粒子
import WindField from './WindField.js'// 包装风向数据的属性

let _primitives = null
let SPEED_RATE = 0.15 // 粒子移动的速度
let PARTICLES_NUMBER = 10000 // 默认2000粒子数
let MAX_AGE = 10// 粒子最大的生命周期
let BRIGHTEN = 1.5
let windData

function Windy(json, cesiumViewer) {
  windData = json
  this.windField = null
  this.particles = []
  this.lines = null
  _primitives = cesiumViewer.scene.primitives
  this._init()
}
Windy.prototype = {
  constructor: Windy,
  _init() {
    // 创建风场网格
    this.windField = this.createField()
    // 创建风场粒子
    for (let i = 0; i < PARTICLES_NUMBER; i++) {
      this.particles.push(this.randomParticle(new Particle()))
    }
  },
  createField() {
    let data = this._parseWindJson()
    return new WindField(data)
  },
  animate() {
    let self = this
    let field = self.windField
    let particles = self.particles

    let instances = []
    let nextX = null
    let nextY = null
    let uv = null
    particles.forEach((particle) => {
      if (particle.age <= 0) {
        self.randomParticle(particle)
      }
      if (particle.age > 0) {
        let x = particle.x
        let y = particle.y

        if (!field.isInBound(x, y)) {
          particle.age = 0
        }
        else {
          uv = field.getIn(x, y)
          nextX = x + SPEED_RATE * uv[0]
          nextY = y + SPEED_RATE * uv[1]
          particle.path.push(nextX, nextY)
          particle.x = nextX
          particle.y = nextY
          instances.push(self._createLineInstance(self._map(particle.path), particle.age / particle.birthAge))
          particle.age--
        }
      }
    })
    if (instances.length <= 0)
      this.removeLines()

    self._drawLines(instances)
  },
  destroy() {
    if (this.lines) {
      _primitives.remove(this.lines)
      // this.lines.destroy();
    }
  },
  _parseWindJson() {
    let uComponent = null
    let vComponent = null
    let header = null
    if (windData !== {}) {
      windData.forEach((record) => {
        let type = `${record.header.parameterCategory},${record.header.parameterNumber}`
        switch (type) {
          case '2,2':
            uComponent = record.data
            header = record.header
            break
          case '2,3':
            vComponent = record.data
            break
          default:
            break
        }
      })
    }

    return {
      header,
      uComponent,
      vComponent,
    }
  },
  removeLines() {
    if (this.lines) {
      _primitives.remove(this.lines)
      // this.lines.destroy();
    }
  },
  // 求路径上点
  _map(arr) {
    let length = arr.length
    let field = this.windField
    let dx = field.dx
    let dy = field.dy
    let west = field.west
    let south = field.north
    let newArr = []
    for (let i = 0; i <= length - 2; i += 2) {
      newArr.push(
        west + arr[i] * dx,
        south - arr[i + 1] * dy,
      )
    }
    return newArr
  },
  _createLineInstance(positions, ageRate) {
    let colors = []
    let length = positions.length
    let count = length / 2
    for (let i = 0; i < length; i++) {
      colors.push(Cesium.Color.WHITE.withAlpha(i / count * ageRate * BRIGHTEN))
    }
    return new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(positions),
        colors,
        width: 1.5,
        colorsPerVertex: true,
      }),
    })
  },
  _drawLines(lineInstances) {
    this.removeLines()
    let linePrimitive = new Cesium.Primitive({
      appearance: new Cesium.PolylineColorAppearance({
        translucent: true,
      }),
      geometryInstances: lineInstances,
      asynchronous: false,
    })
    this.lines = _primitives.add(linePrimitive)
  },
  randomParticle(particle) {
    let safe = 30
    let x; let y

    do {
      x = Math.floor(Math.random() * (this.windField.cols - 2))
      y = Math.floor(Math.random() * (this.windField.rows - 2))
    } while (this.windField.getIn(x, y)[2] <= 0 && safe++ < 30)

    particle.x = x
    particle.y = y
    particle.age = Math.round(Math.random() * MAX_AGE) // 每一次生成都不一样
    particle.birthAge = particle.age
    particle.path = [x, y]
    return particle
  },
}
export default Windy
