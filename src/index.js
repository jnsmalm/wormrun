// import * as PIXI from "pixi.js"
import * as Hammer from "hammerjs"
// import * as PIXI3D from "pixi3d"
import * as glMatrix from "gl-matrix"
import { Howl } from "howler"
import { gsap, Power1 } from "gsap"


// (function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()

var effects = new Howl({
  autoplay: false,
  src: [
    "assets/sounds.ogg",
    "assets/sounds.m4a",
    "assets/sounds.mp3",
    "assets/sounds.ac3"
  ],
  sprite: {
    "cry": [
      0,
      1428.684807256236
    ],
    "dead": [
      3000,
      936.0090702947846
    ],
    "hit": [
      5000,
      1108.7755102040812
    ],
    "jump": [
      8000,
      1315.1927437641716
    ],
    "lose": [
      11000,
      3004.1950113378684
    ],
    "music": [
      16000,
      30006.009070294782
    ],
    "recharge": [
      48000,
      1536.417233560094
    ],
    "tap": [
      51000,
      291.65532879818556
    ],
    "wincoin": [
      53000,
      1025.170068027208
    ]
  }
});

const loadScreen = document.getElementById("load-screen")

let music;

const startScreen = document.getElementById("start-screen")
startScreen.onclick = () => {
  stageIndex = 0
  lastDistance = obstacles.create(stage[stageIndex].level, stage[stageIndex].difficulty, stage[stageIndex].length)
  worm.distanceTravelled = 0
  worm.starsCollected = 0
  startScreen.classList.add("fadeout")
  effects.play('recharge');
  music = effects.play('music');
  effects.volume(0, music);
  effects.fade(0, 1, 2, music);
  effects.loop(true, music)
}

const gameOverScreen = document.getElementById("gameover-screen")
gameOverScreen.onclick = () => {
  stageIndex = 0
  lastDistance = obstacles.create(stage[stageIndex].level, stage[stageIndex].difficulty, stage[stageIndex].length)
  worm.distanceTravelled = 0
  worm.starsCollected = 0
  gameOverScreen.classList.add("fadeout")
  worm.running = true

  effects.play('recharge');
  music = effects.play('music');
  effects.volume(0, music);
  effects.fade(0, 1, 2, music);
  effects.loop(true, music)
}

const distanceUI = document.getElementById("distance-ui")
const powerUI = document.getElementById("power-ui")

const INTERSECTION_SPHERES = false
const ENABLE_PLANTS = true
const ALLOW_CAMERA_CONTROL = false

let app = new PIXI.Application({
  backgroundColor: 0xdddddd, resizeTo: window, antialias: false, view: document.getElementById("game")
})
document.body.appendChild(app.view)

app.loader.add("diffuse.cubemap", "assets/environments/autumn/diffuse.cubemap")
app.loader.add("specular.cubemap", "assets/environments/autumn/specular.cubemap")
app.loader.add("skybox.cubemap", "assets/environments/autumn/skybox.cubemap")
app.loader.add("worm.gltf", "assets/worm/scene.gltf")
app.loader.add("simple_bird.gltf", "assets/simple_bird/scene.gltf")
app.loader.add("low_poly_plants.gltf", "assets/low_poly_plants/scene2.gltf")
app.loader.add("low_poly_rock_set.gltf", "assets/low_poly_rock_set/scene2.gltf")
app.loader.add("low_poly_road_barrier.gltf", "assets/low_poly_road_barrier/scene2.gltf")
app.loader.add("traffic_cone_game_ready.gltf", "assets/traffic_cone_game_ready/scene2.gltf")
app.loader.add("star.gltf", "assets/star/scene3.gltf")
app.loader.add("path.jpg", "assets/path.jpg")
app.loader.add("grass.jpg", "assets/grass.jpg")
app.loader.add("sphere.glb", "assets/sphere.glb")

let lastDistance = 0, obstacles, worm

let stage = [
  { level: 0, difficulty: 1.0, length: 10 },
  { level: 0, difficulty: 2.0, length: 15 },
  { level: 0, difficulty: 2.0, length: 10 },
  { level: 0, difficulty: 3.0, length: 30 },
  { level: 0, difficulty: 3.0, length: 25 },
  { level: 0, difficulty: 3.0, length: 20 },
  { level: 0, difficulty: 3.0, length: 15 },
  { level: 0, difficulty: 3.0, length: 10 },
]

let stageIndex = 0

app.loader.load((loader, resources) => {
  // let skybox = app.stage.addChild(
  //   new PIXI3D.Skybox(resources["skybox.cubemap"].cubemap))

  const sphereModel = app.stage.addChild(
    PIXI3D.Model.from(loader.resources["sphere.glb"].gltf))

  worm = app.stage.addChild(
    new Worm(PIXI3D.Model.from(resources["worm.gltf"].gltf), sphereModel))

  let ground = app.stage.addChild(new Ground(app.loader, worm))

  obstacles = app.stage.addChild(new Obstacles(app.loader, worm, sphereModel))

  // lastDistance = obstacles.create(0)

  app.ticker.add(() => {
    if (!lastDistance) {
      return
    }
    // console.log(worm.z, lastDistance)
    if (worm.z > (lastDistance - 50)) {
      console.log("creating level")
      stageIndex = Math.min(stageIndex + 1, stage.length - 1)
      lastDistance = obstacles.create(stage[stageIndex].level, stage[stageIndex].difficulty, stage[stageIndex].length)
    }
    distanceUI.innerText = (worm.distanceTravelled * 0.03).toFixed(1) + " cm"
    powerUI.innerText = "POWER " + worm.powerString
    // sphere2.meshes.forEach(mesh => mesh.material.baseColor = new PIXI3D.Color(1, 1, 1, 1))
    // if (Vec3.distance(sphere1.position.array, sphere2.position.array) < 2) {
    //   sphere2.meshes.forEach(mesh => mesh.material.baseColor = new PIXI3D.Color(1, 0, 0, 1))
    // }
  })

  // let bird = app.stage.addChild(new Bird(
  //   PIXI3D.Model.from(resources["simple_bird.gltf"].gltf)))

  if (ENABLE_PLANTS) {
    let plants = app.stage.addChild(new Plants(
      PIXI3D.Model.from(resources["low_poly_plants.gltf"].gltf),
      PIXI3D.Model.from(resources["low_poly_rock_set.gltf"].gltf),
      worm)
    )
  }

  var hammertime = new Hammer(app.view);
  hammertime.on('swipe', function (ev) {
    if (ev.velocityX > 0) {
      worm.jumpRight()
    } else {
      worm.jumpLeft()
    }
  });
  hammertime.on('tap', function (ev) {
    worm.jumpUp()
  });
  hammertime.on('press', function (ev) {
    worm.jumpUp()
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      worm.jumpRight()
    }
    if (e.key === "ArrowLeft") {
      worm.jumpLeft()
    }
    if (e.key === "ArrowUp") {
      worm.jumpUp()
    }
  })

  PIXI3D.Camera.main.near = 0.3
  PIXI3D.Camera.main.far = 300

  let control = new PIXI3D.CameraOrbitControl(app.view)
  control.distance = 14
  control.angles.x = 35
  control.angles.y = 0
  control.allowControl = ALLOW_CAMERA_CONTROL

  app.ticker.add(() => {
    control.target = { x: 0, y: 5, z: worm.z + 2 }
  })

  let imageBasedLighting = new PIXI3D.ImageBasedLighting(
    resources["diffuse.cubemap"].cubemap,
    resources["specular.cubemap"].cubemap)

  PIXI3D.LightingEnvironment.main =
    new PIXI3D.LightingEnvironment(app.renderer, imageBasedLighting)

  setTimeout(() => {
    loadScreen.classList.add("fadeout")
  }, 1000)
})

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

const { Vec3, Quat, Container3D, Color } = PIXI3D

const LEVELS = [
  [0, 1, 2, 3, 4, 5],
  [5],
  [6]
]

class Obstacles extends Container3D {
  constructor(loader, worm, sphereModel) {
    super()

    this.worm = worm

    const coneModel = this.addChild(
      PIXI3D.Model.from(loader.resources["traffic_cone_game_ready.gltf"].gltf))
    coneModel.meshes.forEach(mesh => {
      mesh.material.metallic = 0
      mesh.material.alphaMode = "blend"
    })
    this.coneInstances = []
    for (let i = 0; i < 60; i++) {
      this.coneInstances.push(new Cone(coneModel, sphereModel))
    }

    const barrierModel = this.addChild(
      PIXI3D.Model.from(loader.resources["low_poly_road_barrier.gltf"].gltf))
    this.barrierInstances = []
    for (let i = 0; i < 15; i++) {
      this.barrierInstances.push(new Barrier(barrierModel, sphereModel))
    }

    const starModel = this.addChild(
      PIXI3D.Model.from(loader.resources["star.gltf"].gltf))
    this.starInstances = []
    for (let i = 0; i < 80; i++) {
      this.starInstances.push(new Star(starModel, sphereModel))
    }

    let birdModel = this.addChild(
      PIXI3D.Model.from(loader.resources["simple_bird.gltf"].gltf)
    )
    this.birdInstances = []
    for (let i = 0; i < 2; i++) {
      this.birdInstances.push(new Bird(birdModel, sphereModel))
      this.birdInstances[i].visible = false
    }
    birdModel.animations[0].loop = true
    birdModel.animations[0].speed = 2
    birdModel.animations[0].play()

    setInterval(() => {
      let timeline = gsap.timeline()
      timeline.to(birdModel.animations[0], { duration: 1, speed: 0.3 }, 0)
      timeline.to(birdModel.animations[0], { duration: 1, speed: 2 }, 3)
      timeline.play()
    }, 5000)

    this.endInstances = []
    for (let i = 0; i < 3; i++) {
      this.endInstances.push(new LevelEnd(sphereModel))
    }

    this.intersectableObjects = [
      ...this.coneInstances,
      ...this.starInstances,
      ...this.barrierInstances,
      ...this.birdInstances,
      ...this.endInstances
    ]

    this.ticker = new PIXI.Ticker()
    this.ticker.add(() => {
      if (!lastDistance) {
        return
      }
      worm.hit = false
      for (let i = 0; i < this.intersectableObjects.length; i++) {
        if (this.intersectableObjects[i].isIntersecting(worm)) {
          worm.hit = true
          if (this.intersectableObjects[i] instanceof Star) {
            this.intersectableObjects[i].visible = false
            worm.starsCollected++
            effects.play('wincoin');
          }
          else if (this.intersectableObjects[i] instanceof LevelEnd) {
            this.addBird(130)
            this.intersectableObjects[i].visible = false
          }
          else if (this.intersectableObjects[i] instanceof Bird) {
            if (Math.random() > worm.power) {
              gameOverScreen.classList.add("fadein")
              gameOverScreen.classList.remove("fadeout")
              lastDistance = 0
              this.worm.distanceTravelled = 0
              this.clear()
              this.worm.running = false
              effects.stop(music);
              effects.volume(0, music);
              effects.loop(false, music);
              effects.play('lose')
            } else {
              this.intersectableObjects[i].die()
            }
            worm.starsCollected = 0
          }
          else {
            gameOverScreen.classList.add("fadein")
            gameOverScreen.classList.remove("fadeout")
            lastDistance = 0
            this.worm.distanceTravelled = 0
            this.clear()
            this.worm.running = false

            effects.stop(music);
            effects.volume(0, music);
            effects.loop(false, music);
            effects.play('lose')
          }
        }
      }
    })
    this.ticker.start()
  }

  clear() {
    this.starInstances.forEach(instance => instance.visible = false)
    this.barrierInstances.forEach(instance => instance.visible = false)
    this.coneInstances.forEach(instance => instance.visible = false)
    this.endInstances.forEach(instance => instance.visible = false)
    this.birdInstances.forEach(instance => {
      instance.visible = false
      instance.dead = false
    })
  }

  create(level = 0, difficulty = 1, length = 10) {
    let step = (4 - difficulty) * 15
    let positions = shuffleArray([...LEVELS[level]])
    forlength: for (let i = 0; i < length; i++) {
      if (positions.length === 0) {
        positions = shuffleArray([...LEVELS[level]])
      }
      let pos = positions.splice(0, 1)[0]
      let starPositions = []
      switch (pos) {
        case 0: {
          this.addCone(130 + i * step, -1)
          starPositions = [-1, 0, 1]
          break
        }
        case 1: {
          this.addCone(130 + i * step, 0)
          starPositions = [-1, 0, 1]
          break
        }
        case 2: {
          this.addCone(130 + i * step, +1)
          starPositions = [-1, 0, 1]
          break
        }
        case 3: {
          this.addCone(130 + i * step, -1)
          this.addCone(130 + i * step, 0)
          starPositions = [-1, 0, 1]
          break
        }
        case 4: {
          this.addCone(130 + i * step, +1)
          this.addCone(130 + i * step, 0)
          starPositions = [-1, 0, 1]
          break
        }
        case 5: {
          this.addBarrier(130 + i * step)
          starPositions = [-1, 0, 1]
          break
        }
        // case 6: {
        //   this.addBird(130 + i * step)
        //   // break forlength
        //   return this.worm.z + 50
        // }
      }
      if (i < length - 1) {
        if (difficulty >= 3) {
          this.addStars(130 + i * step + step / 2, 1, 0, shuffleArray(starPositions)[0])
        } else {
          const difficultyStars = [3, 2, 1]
          const starCount = difficultyStars[difficulty - 1]
          const margin = (4 - difficulty) * 5.0
          this.addStars(130 + i * step + margin, starCount, (step - margin * 2) / (starCount - 1), shuffleArray(starPositions)[0])
        }
      }
    }
    this.addEnd(130 + (length - 1) * step)
    // this.addBird(130 + (length - 1) * step + 500)
    return this.worm.z + 130 + (length - 1) * step
  }

  addCone(distance, position) {
    const cone = this.addChild(this.coneInstances[0])
    cone.visible = true
    this.coneInstances.splice(0, 1)
    this.coneInstances.push(cone)
    cone.x = position * 3
    cone.z = this.worm.z + distance
  }

  addBarrier(distance) {
    const barrier = this.addChild(this.barrierInstances[0])
    barrier.visible = true
    this.barrierInstances.splice(0, 1)
    this.barrierInstances.push(barrier)
    barrier.z = this.worm.z + distance
  }

  addBird(distance) {
    const bird = this.addChild(this.birdInstances[0])
    this.birdInstances.splice(0, 1)
    this.birdInstances.push(bird)
    bird.z = this.worm.z + distance
    bird.incoming()
    bird.visible = true
  }

  addStars(distance, count, spacing, position) {
    for (let i = 0; i < count; i++) {
      const star = this.addChild(this.starInstances[0])
      star.visible = true
      this.starInstances.splice(0, 1)
      this.starInstances.push(star)
      star.z = this.worm.z + distance + i * spacing
      star.x = position * 3
    }
  }

  addEnd(distance) {
    const end = this.addChild(this.endInstances[0])
    end.visible = true
    this.endInstances.splice(0, 1)
    this.endInstances.push(end)
    end.z = this.worm.z + distance
    return end
  }
}

const GROUND_SIZE = 200

class Ground extends Container3D {
  constructor(loader, worm) {
    super()

    const paths = [
      this.addChild(this.createPathMesh(loader)),
      this.addChild(this.createPathMesh(loader))
    ]
    for (let i = 0; i < paths.length; i++) {
      paths[i].z = i * GROUND_SIZE * 2
      paths[i].y = 0.1
    }

    const grass = [
      this.addChild(this.createGrassMesh(loader)),
      this.addChild(this.createGrassMesh(loader))
    ]
    for (let i = 0; i < grass.length; i++) {
      grass[i].z = i * GROUND_SIZE * 2
    }

    this.parts = [...paths, ...grass]

    this.ticker = new PIXI.Ticker()
    this.ticker.add(() => {
      for (let i = 0; i < this.parts.length; i++) {
        if (this.parts[i].z > worm.z) {
          continue
        }
        if (Vec3.distance(this.parts[i].position.array, worm.position.array) > GROUND_SIZE * 1.5) {
          this.parts[i].z += GROUND_SIZE * 4
        }
      }
    })
    this.ticker.start()
  }

  createPathMesh(loader) {
    const mesh = PIXI3D.Mesh3D.createPlane()
    mesh.scale.set(5, 1, GROUND_SIZE)
    mesh.material.baseColorTexture = loader.resources["path.jpg"].texture
    mesh.material.baseColorTexture.uvTransform = glMatrix.mat3.fromScaling(new Float32Array(9), new Float32Array([1, GROUND_SIZE / 5, 0]))
    // mesh.material.baseColorTexture.uvTransform = PIXI3D.Mat3.fromScaling(new Float32Array([1, GROUND_SIZE / 5, 0]))
    mesh.material.baseColorTexture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT
    return mesh
  }

  createGrassMesh(loader) {
    const mesh = PIXI3D.Mesh3D.createPlane()
    mesh.scale.set(500, 1, GROUND_SIZE)
    mesh.material.baseColorTexture = loader.resources["grass.jpg"].texture
    mesh.material.baseColorTexture.uvTransform = glMatrix.mat3.fromScaling(new Float32Array(9), new Float32Array([100, GROUND_SIZE / 5, 0]))
    // mesh.material.baseColorTexture.uvTransform = PIXI3D.Mat3.fromScaling(new Float32Array([100, GROUND_SIZE / 5, 0]))
    mesh.material.baseColorTexture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT
    return mesh
  }
}

class Plants extends Container3D {
  constructor(plantsModel, rocksModel, worm) {
    super()
    this.worm = worm
    plantsModel.meshes.forEach(mesh => {
      mesh.material.unlit = true
    });
    this.instances = [];
    ([1, 3, 5, 7, 8]).forEach(num => {
      this.addChild(plantsModel.meshes[num])
    });
    ([1, 3, 5, 7, 8]).forEach(num => {
      let count = 20
      if (num === 1 || num === 3) {
        count = 40
      }
      for (let i = 0; i < count; i++) {
        let instance = this.addChild(plantsModel.meshes[num].createInstance())
        let fromCenter = 10, width = 25
        if (num === 1 || num === 3) {
          fromCenter = 4.3
          width = 10
        }
        if (Math.random() < 0.5) {
          instance.position.set(-(fromCenter + width) + width * Math.random(), 0, -20 + Math.random() * 200)
        } else {
          instance.position.set(fromCenter + Math.random() * width, 0, -20 + Math.random() * 200)
        }
        instance.scale.set(1.4 + Math.random() * 0.8)
        if (num === 1 || num === 3) {
          instance.scale.set(0.3 + Math.random() * 0.1)
        }
        instance.rotationQuaternion.setEulerAngles(0, Math.random() * 360, 0)
        this.instances.push(instance)
      }
    });
    ([0, 1, 4]).forEach(num => {
      this.addChild(rocksModel.meshes[num])
    });
    ([0, 1, 4]).forEach(num => {
      let count = 30
      for (let i = 0; i < count; i++) {
        let instance = this.addChild(rocksModel.meshes[num].createInstance())
        const fromCenter = 11
        const width = 10
        if (Math.random() < 0.5) {
          instance.position.set(-(fromCenter + width) + width * Math.random(), 0, -20 + Math.random() * 200)
        } else {
          instance.position.set(fromCenter + Math.random() * width, 0, -20 + Math.random() * 200)
        }
        instance.scale.set(0.015 + Math.random() * 0.05)
        instance.rotationQuaternion.setEulerAngles(0, Math.random() * 360, 0)
        this.instances.push(instance)
      }
    })
    app.ticker.add(() => {
      this.instances.forEach(instance => {
        if (instance.position.z > worm.position.z) {
          return
        }
        if (Vec3.squaredDistance(instance.position.array, worm.position.array) > 1500) {
          instance.position.z += 200
          // instance.material.baseColor = new Color(1, 0, 0, 1)
        } else {
          // instance.material.baseColor = new Color(1, 1, 1, 1)
        }
      })
    })
  }
}

class Star extends Container3D {
  constructor(model, sphereModel) {
    super()

    this.visible = false

    this.radius = 1.5

    if (sphereModel) {
      this.sphere = this.addChild(sphereModel.createInstance())
      this.sphere.scale.set(this.radius)
      this.sphere.meshes.forEach(mesh => mesh.renderable = INTERSECTION_SPHERES)
    }
    this.model = this.addChild(model.createInstance())
    this.model.scale.set(11)
    this.model.y = 1.8
    this.model.rotationQuaternion.setEulerAngles(0, 180, 0)

    // const target = { rotation: 0 }
    // gsap.to(target, {
    //   duration: 10, rotation: 360, repeat: Number.MAX_SAFE_INTEGER, ease: Power0.easeNone, onUpdate: () => {
    //     this.model.rotationQuaternion.setEulerAngles(0, target.rotation, 0)
    //   }
    // })

    // gsap.to(this.model, {
    //   duration: 1.5, y: 2.2, repeat: Number.MAX_SAFE_INTEGER, yoyo: true, yoyoEase: Sine.easeInOut
    // })
  }

  isIntersecting(object) {
    if (!this.visible || !this.sphere) {
      return false
    }
    return Vec3.distance(object.sphere.worldTransform.position, this.sphere.worldTransform.position) < (object.radius + this.radius)
  }
}

class LevelEnd extends Container3D {
  constructor(sphereModel) {
    super()

    this.radius = 3.5

    if (sphereModel) {
      this.sphere = this.addChild(sphereModel.createInstance())
      this.sphere.scale.set(this.radius)
      this.sphere.meshes.forEach(mesh => mesh.renderable = INTERSECTION_SPHERES)
    }
  }

  isIntersecting(object) {
    if (!this.visible || !this.sphere) {
      return false
    }
    return Vec3.distance(object.sphere.worldTransform.position, this.sphere.worldTransform.position) < (object.radius + this.radius)
  }
}

class Barrier extends Container3D {
  constructor(model, sphereModel) {
    super()

    this.radius = 1.0

    if (sphereModel) {
      this.sphere1 = this.addChild(sphereModel.createInstance())
      this.sphere1.scale.set(this.radius)
      this.sphere1.x = -3
      this.sphere1.meshes.forEach(mesh => mesh.renderable = INTERSECTION_SPHERES)
      this.sphere2 = this.addChild(sphereModel.createInstance())
      this.sphere2.scale.set(this.radius)
      this.sphere2.x = 0
      this.sphere2.meshes.forEach(mesh => mesh.renderable = INTERSECTION_SPHERES)
      this.sphere3 = this.addChild(sphereModel.createInstance())
      this.sphere3.scale.set(this.radius)
      this.sphere3.x = +3
      this.sphere3.meshes.forEach(mesh => mesh.renderable = INTERSECTION_SPHERES)
    }
    this.model = this.addChild(model.createInstance())
    this.model.scale.set(4)
    this.model.y = 1.3
    this.model.rotationQuaternion.setEulerAngles(0, 90, 0)
  }

  isIntersecting(object) {
    if (!this.visible) {
      return false
    }
    return Vec3.distance(object.sphere.worldTransform.position, this.sphere1.worldTransform.position) < (object.radius + this.radius) ||
      Vec3.distance(object.sphere.worldTransform.position, this.sphere2.worldTransform.position) < (object.radius + this.radius) ||
      Vec3.distance(object.sphere.worldTransform.position, this.sphere3.worldTransform.position) < (object.radius + this.radius)
  }
}

class Cone extends Container3D {
  constructor(model, sphereModel) {
    super()

    this.radius = 1.5

    if (sphereModel) {
      this.sphere = this.addChild(sphereModel.createInstance())
      this.sphere.y = 1.5
      this.sphere.scale.set(this.radius)
      this.sphere.meshes.forEach(mesh => mesh.renderable = INTERSECTION_SPHERES)
    }
    this.model = this.addChild(model.createInstance())
    this.model.scale.set(0.14)
    this.model.y = 0.1
  }

  isIntersecting(object) {
    if (!this.visible) {
      return false
    }
    return Vec3.distance(object.sphere.worldTransform.position, this.sphere.worldTransform.position) < (object.radius + this.radius)
  }
}

class Bird extends Container3D {
  constructor(model, sphereModel) {
    super()

    this.radius = 5

    if (sphereModel) {
      this.sphere = this.addChild(sphereModel.createInstance())
      this.sphere.scale.set(this.radius)
      this.sphere.meshes.forEach(mesh => mesh.renderable = INTERSECTION_SPHERES)
    }

    this.model = this.addChild(model.createInstance())
    this.model.scale.set(7, 7, -7)
  }

  incoming() {
    this.rotationQuaternion.setEulerAngles(0, 0, 0)
    this.dead = false
    gsap.to(this.position, { duration: 6, z: this.position.z - 130 })
    effects.play('cry')
  }

  die() {
    const target = { x: 0, z: 0 }
    gsap.to(target, {
      duration: 2, x: 180, z: 180, onUpdate: () => {
        this.rotationQuaternion.setEulerAngles(target.x, 0, target.z)
      }
    })
    effects.play('dead');
    gsap.to(this, { duration: 1, y: 3, z: this.position.z + 100 })
    this.dead = true
  }

  isIntersecting(object) {
    if (!this.visible || !this.sphere || this.dead) {
      return false
    }
    return Vec3.distance(object.sphere.worldTransform.position, this.sphere.worldTransform.position) < (object.radius + this.radius)
  }
}

class Worm extends Container3D {
  get powerString() {
    return Math.floor(this.power * 100) + "%"
  }

  get power() {
    return Math.min(1, this.starsCollected / 15)
  }

  constructor(model, sphereModel) {
    super()

    this.starsCollected = 0
    this.running = true
    this.radius = 0.8
    this.distanceTravelled = 0
    this.jumpingUp = false

    if (sphereModel) {
      this.sphere = this.addChild(sphereModel.createInstance())
      this.sphere.scale.set(this.radius)
      this.sphere.meshes.forEach(mesh => mesh.renderable = INTERSECTION_SPHERES)
    }
    // this.scale.set(0.5)
    this.model = this.addChild(model)
    this.model.scale.set(0.05)
    this.model.y = 4.05
    this.model.z = 1
    this.moveAnimation = this.model.animations[1]
    this.moveAnimation.position = 5.5
    this.jumpAnimation = this.model.animations[2]
    this.jumpAnimation.position = 1
    this.isMoving = false
    this.isTurningRight = false
    this.isTurningLeft = false
    // this.move = this.move.bind(this)
    this.playMoveAnimation()
    this.roadPosition = 0
  }

  set hit(value) {
    if (value) {
      this.sphere.meshes.forEach(mesh => mesh.material.baseColor.r = 0)
    } else {
      this.sphere.meshes.forEach(mesh => mesh.material.baseColor.r = 1)
    }
  }

  jumpLeft() {
    if (this.roadPosition === -1) {
      return
    }
    this.roadPosition--
    gsap.to(this.position, { duration: 0.2, x: this.roadPosition * -3 })
    effects.play('tap');
    if (!this.isJumping)
      this.playJumpAnimation()
  }

  jumpRight() {
    if (this.roadPosition === 1) {
      return
    }
    this.roadPosition++
    gsap.to(this.position, { duration: 0.2, x: this.roadPosition * -3 })
    effects.play('tap');
    if (!this.isJumping)
      this.playJumpAnimation()
  }

  jumpUp() {
    if (this.isJumping) {
      return
    }
    this.isJumping = true
    let timeline = gsap.timeline()
    effects.play('jump');
    timeline.to(this.position, { duration: 0.3, y: 3, ease: Power1.easeOut }, 0.0)
    timeline.to(this.position, {
      duration: 0.3, y: 0, ease: Power1.easeIn, onComplete: () => {
        this.isJumping = false
      }
    }, 0.3)
    this.playJumpAnimation(1.1)
  }

  playJumpAnimation(speed = 1.8) {
    if (this.jumpAnimationTicker) {
      this.jumpAnimationTicker.stop()
    }
    this.jumpAnimation.position = 1.4
    this.jumpAnimationTicker = new PIXI.Ticker()
    this.jumpAnimationTicker.add(() => {
      this.jumpAnimation.position += app.ticker.elapsedMS / 1000 * speed
      if (this.jumpAnimation.position >= 2.4) {
        this.jumpAnimationTicker.stop()
        // this.playMoveAnimation()
      }
    })
    this.jumpAnimationTicker.start()
  }

  playMoveAnimation() {
    this.jumpAnimation.position = 1.4
    // this.moveAnimationTicker = new PIXI.Ticker()
    PIXI.Ticker.shared.add(() => {
      if (!this.running) {
        return
      }
      this.moveAnimation.position += PIXI.Ticker.shared.elapsedMS / 1000 * 1.6
      if (this.moveAnimation.position >= 6.1) {
        this.moveAnimation.position = 5.5
      }
      this.position.z += PIXI.Ticker.shared.elapsedMS / 1000 * 20
      this.distanceTravelled += PIXI.Ticker.shared.elapsedMS / 1000 * 20
    })
    // this.moveAnimationTicker.start()
  }
}