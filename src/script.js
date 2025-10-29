import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

/**
 * Mouse
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1
    mouse.y = -(event.clientY / sizes.height) * 2 + 1
})

let currentIntersect = null

/**
 * Objects - Three Cones
 */
const object1 = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.MeshStandardMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.MeshStandardMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.MeshStandardMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

const objectsToTest = [object1, object2, object3]

window.addEventListener('click', () => {
    // Cast a ray to detect what was clicked
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(objectsToTest)
    
    // Check for cone clicks
    for (const intersect of intersects) {
        if (intersect.object === object1) {
            console.log('Clicked cone 1')
            return
        }
        if (intersect.object === object2) {
            console.log('Clicked cone 2')
            return
        }
        if (intersect.object === object3) {
            console.log('Clicked cone 3')
            return
        }
    }
    
    // Check for duck click
    if (model) {
        const duckIntersects = raycaster.intersectObject(model, true)
        if (duckIntersects.length > 0) {
            console.log('Clicked duck!')
        }
    }
})

/**
 * Loader
 */
const gltfLoader = new GLTFLoader()

/**
 * Model
 */
let model = null
const modelTargetScale = new THREE.Vector3(1, 1, 1)
gltfLoader.load(
    '/models/Duck/glTF-Binary/Duck.glb',
    (gltf) => {
        model = gltf.scene
        model.position.set(4, 0, -1)
        scene.add(model)
        console.log('Duck model loaded!')
    }
)

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
controls.enableDamping = true

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(3, 5, 3)
scene.add(directionalLight)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animate objects
    object1.position.y = Math.sin(elapsedTime * 1.5) * 1.5
    object2.position.y = Math.sin(elapsedTime * 2) * 1.5
    object3.position.y = Math.sin(elapsedTime * 3) * 1.5

    // Raycaster from mouse
    raycaster.setFromCamera(mouse, camera)
    
    const intersects = raycaster.intersectObjects(objectsToTest)

    // Reset colors back to red
    for (const object of objectsToTest) {
        object.material.color.set('#ff0000')
    }

    // Turn intersected objects blue
    for (const intersect of intersects) {
        intersect.object.material.color.set('#0000ff')
    }

    // Handle duck model interaction
    if (model) {
        const duckIntersects = raycaster.intersectObject(model, true)
        
        // Set target scale based on hover
        if (duckIntersects.length > 0) {
            if (modelTargetScale.x === 1) {
                console.log('mouse enter duck')
            }
            modelTargetScale.set(1.2, 1.2, 1.2)
        } else {
            if (modelTargetScale.x > 1) {
                console.log('mouse leave duck')
            }
            modelTargetScale.set(1, 1, 1)
        }
        
        // Smoothly interpolate the scale
        model.scale.lerp(modelTargetScale, 0.1)
    }

    // Detect mouse enter/leave
    if (intersects.length) {
        if (!currentIntersect) {
            console.log('mouse enter')
        }
        currentIntersect = intersects[0]
    } else {
        if (currentIntersect) {
            console.log('mouse leave')
        }
        currentIntersect = null
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()