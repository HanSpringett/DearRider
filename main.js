import { GLTFLoader } from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/controls/OrbitControls.js';

//event names
const cameraFowardEventName = "moveCameraFoward"
const cameraBackwardEventName = "moveCameraBackward"
const initialCameraMovement = "initCameraMovement"

const sceneAssets = [
    'assets/Building.gltf',
    'assets/Cubes.gltf',
    'assets/DearRider_1977.gltf',
    'assets/DearRider_1983.gltf',
    'assets/DearRider_1986.gltf',
    'assets/DearRider_1989.gltf',
    'assets/DearRider_1996_Dolphin.gltf',
    'assets/DearRider_1996_Custom.gltf',
    'assets/DearRider_1993.gltf',
    'assets/DearRider_2002.gltf',
    'assets/DearRider_2013.gltf',
    'assets/DearRider_2020.gltf',
    'assets/DearRider_2021.gltf'
]
const loadedItems = {}
const timelineObj = [
    {
        id: 0,
        position: { x: -201.961180449289, y: 125.06806194991873, z: -857.6556653244023 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: -201.961180449289, y: 112.06806194991873, z: -757.6556653244023 }
    },
    {
        id: 1,
        position: { x: 506, y: 150, z: -350 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: 506, y: 190, z: -160 }
    },
    {
        id: 2,
        position: { x: 106, y: 150, z: -350 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: 106, y: 190, z: -105 }
    },
    {
        id: 3,
        position: { x: -397, y: 150, z: -350 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: -397, y: 190, z: -105 }
    },
    {
        id: 4,
        position: { x: -900, y: 150, z: -350 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: -900, y: 190, z: -105 }
    },
    {
        id: 5,
        position: { x: -599, y: 150, z: 85 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: -599, y: 190, z: 300 }
    },
    {
        id: 6,
        position: { x: -225, y: 150, z: 85 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: -200, y: 190, z: 300 }
    },
    {
        id: 7,
        position: { x: 281, y: 150, z: 85 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: 281, y: 190, z: 300 }
    },
    {
        id: 8,
        position: { x: 495, y: 150, z: 500 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: 500, y: 190, z: 700 }
    },
    {
        id: 9,
        position: { x: 104, y: 150, z: 500 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: 104, y: 190, z: 700 }
    },
    {
        id: 10,
        position: { x: -396, y: 150, z: 500 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: -400, y: 190, z: 700 }
    },
    {
        id: 11,
        position: { x: -913, y: 150, z: 500 },
        rotation: { x: 3.096496824068951, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: -900, y: 190, z: 700 }
    },
    {
        id: 12,
        position: { x: 0, y: 150, z: 1400 },
        rotation: { x: 2.8, y: -0.03892926785276455, z: 3.1398363604390074 },
        obj: false,
        pivot: { x: 0, y: 190, z: 1400 }
    }
]
const listeners = []

const mouse = new THREE.Vector2();
const threeScene = {

    init(container) {
        this.scene = new THREE.Scene();
        this.container = container
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.width / this.height,
            0.1,
            100000
        );

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMapSoft = true;
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);


        this.camera.position.set(0, 20, 100);
        //resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(this.width, this.height);

            this.renderer.render(this.scene, this.camera)
        });

        this.currentTimelinePos = 0
        this.movementTimeline = gsap.timeline()

        this.raycaster = new THREE.Raycaster();

        this.index = 0
        this.spinAnim
        this.rotateCoords = { x: 0, y: 0, z: 0 }

        const light = new THREE.AmbientLight(0x404040, 2); // soft white light
        this.scene.add(light);
    },
    loadModels() {
        this.manager = new THREE.LoadingManager();
        this.manager.onStart = function (url, itemsLoaded, itemsTotal) {
            // console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        };
        this.manager.onLoad = () => {
            console.log('Loading complete!');
            this.setUpScene()
        };
        this.manager.onProgress = function (url, itemsLoaded, itemsTotal) {
            // console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        };
        this.manager.onError = function (url) {
            // console.log('There was an error loading ' + url);
        };

        //Loading of assets
        const loader = new GLTFLoader(this.manager);
        // Load a glTF resource
        for (let i = 0; i < sceneAssets.length; i++) {
            loader.load(
                // resource URL
                sceneAssets[i],
                // called when the resource is loaded
                (gltf) => {
                    this.scene.add(gltf.scene);
                    loadedItems[i] = gltf.scene
                }
            );
        }
        this.scene.background = new THREE.CubeTextureLoader()
            .setPath('assets/cube/')
            .load([
                'right.png',
                'left.png',
                'top.png',
                'bottom.png',
                'front.png',
                'back.png'
            ]);
    },
    setUpScene() {
        loadedItems[0].position.set(-1000, 0, 0)

        loadedItems[1].position.set(-200, 140, -550)
        loadedItems[1].scale.set(2, 2, 2)

        loadedItems[2].position.set(500, 70, -125)
        loadedItems[2].scale.set(3, 3, -3)
        loadedItems[2].scale.set(2, 2, -2)
        loadedItems[2].children[0].children[0].material.side = THREE.FrontSide
        loadedItems[2].children[0].children[1].material.side = THREE.FrontSide
        loadedItems[2].children[0].children[2].material.side = THREE.FrontSide
        timelineObj[1].obj = loadedItems[2]
        this.addLight(500, 500, -300, loadedItems[2])

        loadedItems[3].position.set(100, 70, -120)
        loadedItems[3].scale.set(1.5, 1.5, -1.5)
        timelineObj[2].obj = loadedItems[3]
        this.addLight(100, 500, -295, loadedItems[3])

        loadedItems[4].position.set(-400, 70, -100)
        loadedItems[4].scale.set(1, 1, -1)
        loadedItems[4].children[0].children[0].material.side = THREE.FrontSide
        loadedItems[4].children[0].children[1].material.side = THREE.FrontSide
        loadedItems[4].children[0].children[2].material.side = THREE.FrontSide
        loadedItems[4].children[0].children[3].material.side = THREE.FrontSide
        timelineObj[3].obj = loadedItems[4]
        this.addLight(-400, 500, -175, loadedItems[4])

        loadedItems[5].position.set(-900, 70, -100)
        loadedItems[5].scale.set(0.45, 0.45, -0.45)
        loadedItems[5].children[0].children[0].material.side = THREE.FrontSide
        loadedItems[5].children[0].children[1].material.side = THREE.FrontSide
        loadedItems[5].children[0].children[2].material.side = THREE.FrontSide
        timelineObj[4].obj = loadedItems[5]
        this.addLight(-900, 500, -175, loadedItems[5])

        loadedItems[6].position.set(300, 70, 300)
        loadedItems[6].scale.set(1.15, 1.15, -1.15)
        loadedItems[6].children[0].children[0].material.side = THREE.FrontSide
        loadedItems[6].children[0].children[1].material.side = THREE.FrontSide
        loadedItems[6].children[0].children[2].material.side = THREE.FrontSide
        timelineObj[5].obj = loadedItems[8]
        this.addLight(300, 500, 125, loadedItems[6])

        loadedItems[7].position.set(-200, 70, 300)
        loadedItems[7].scale.set(1, 1, -1)
        loadedItems[7].children[0].children[0].material.side = THREE.FrontSide
        loadedItems[7].children[0].children[1].material.side = THREE.FrontSide
        loadedItems[7].children[0].children[2].material.side = THREE.FrontSide
        timelineObj[6].obj = loadedItems[7]
        this.addLight(-200, 500, 125, loadedItems[7])

        loadedItems[8].position.set(-600, 70, 300)
        loadedItems[8].scale.set(1, 1, -1)
        loadedItems[8].children[0].children[0].material.side = THREE.FrontSide
        loadedItems[8].children[0].children[1].material.side = THREE.FrontSide
        loadedItems[8].children[0].children[2].material.side = THREE.FrontSide
        timelineObj[7].obj = loadedItems[6]
        this.addLight(-600, 500, 125, loadedItems[8])

        loadedItems[9].position.set(500, 50, 700)
        loadedItems[9].scale.set(0.3, 0.3, 0.3)
        loadedItems[9].rotateOnAxis(new THREE.Vector3(0, 1, 0), 4.8)
        loadedItems[9].children[0].children[0].material.side = THREE.FrontSide
        loadedItems[9].children[0].children[1].material.side = THREE.FrontSide
        loadedItems[9].children[0].children[2].material.side = THREE.FrontSide
        timelineObj[8].obj = loadedItems[9]
        this.addLight(500, 500, 525, loadedItems[9])

        loadedItems[10].position.set(100, 70, 700)
        loadedItems[10].scale.set(1, 1, -1)
        loadedItems[10].children[0].children[0].material.side = THREE.FrontSide
        loadedItems[10].children[0].children[1].material.side = THREE.FrontSide
        loadedItems[10].children[0].children[2].material.side = THREE.FrontSide
        timelineObj[9].obj = loadedItems[10]
        this.addLight(100, 500, 525, loadedItems[10])

        loadedItems[11].position.set(-400, 70, 700)
        loadedItems[11].scale.set(1, 1, -1)
        loadedItems[11].children[0].children[0].material.side = THREE.FrontSide
        loadedItems[11].children[0].children[1].material.side = THREE.FrontSide
        loadedItems[11].children[0].children[2].material.side = THREE.FrontSide
        timelineObj[10].obj = loadedItems[11]
        this.addLight(-400, 500, 525, loadedItems[11])

        loadedItems[12].position.set(-900, 35, 700)
        loadedItems[12].scale.set(1, 1.5, -1)
        loadedItems[12].children[0].children[0].material.side = THREE.FrontSide
        loadedItems[12].children[0].children[1].material.side = THREE.FrontSide
        loadedItems[12].children[0].children[2].material.side = THREE.FrontSide
        timelineObj[11].obj = loadedItems[12]
        this.addLight(-900, 500, 525, loadedItems[12])

        document.addEventListener(cameraFowardEventName, () => {
            this.fowards()
        })
        listeners.push({ eventName: cameraFowardEventName, eventFunc: this.fowards })

        document.addEventListener(cameraBackwardEventName, () => {
            this.backwards()
        })
        listeners.push({ eventName: cameraBackwardEventName, eventFunc: this.backwards })

        this.camera.position.set(-852, 300, -1158)
        this.camera.rotation.set(3.75, -0.5, 3.5)

        // this.moveCamera(11)

        document.addEventListener(initialCameraMovement, () => {
            this.startAnim()
        })
        listeners.push({ eventName: initialCameraMovement, eventFunc: this.startAnim })
    },
    backwards() {
        if (this.index > 0) {
            this.index--
            this.moveCamera(this.index, this.index + 1)
        }
    },
    fowards() {
        if (this.index < timelineObj.length - 1) {
            this.index++
            this.moveCamera(this.index, this.index - 1)
        }
    },
    startAnim() {
        this.moveCamera(0, false)
    },
    addLight(x, y, z, target) {
        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(x, y, z);
        spotLight.target = target;
        spotLight.penumbra = 1
        spotLight.angle = 1
        spotLight.castShadow = true;

        this.scene.add(spotLight);
    },
    moveCamera(index, oldIndex) {
        const self = this
        if (oldIndex) {
            this.endSpinBoard(oldIndex)
        }
        gsap.to(this.camera.position, {
            x: timelineObj[index].position.x,
            y: timelineObj[index].position.y,
            z: timelineObj[index].position.z,
            duration: 1,
            onComplete: () => {
                self.startSpinBoard(index)
            }
        })
        gsap.to(this.camera.rotation, {
            x: timelineObj[index].rotation.x,
            y: timelineObj[index].rotation.y,
            z: timelineObj[index].rotation.z,
            duration: 1,
        })
    },
    startSpinBoard(index) {
        if (timelineObj[index].obj) {
            this.rotateCoords = {
                x: timelineObj[index].obj.rotation.x,
                y: timelineObj[index].obj.rotation.y,
                z: timelineObj[index].obj.rotation.z
            }
            this.spinAnim = gsap.timeline({ repeat: -1, duration: 0.1 })
            this.spinAnim.add(() => {
                let q = new THREE.Quaternion();
                let point = new THREE.Vector3(timelineObj[index].pivot.x, timelineObj[index].pivot.y, timelineObj[index].pivot.z)
                q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.01);

                timelineObj[index].obj.applyQuaternion(q);

                timelineObj[index].obj.position.sub(point);
                timelineObj[index].obj.position.applyQuaternion(q);
                timelineObj[index].obj.position.add(point);
            })
        }
    },
    endSpinBoard(index) {
        // timelineObj[index].obj.rotation.set(this.rotateCoords.x, this.rotateCoords.y, this.rotateCoords.z)
        // this.spinAnim.kill()
    },
    dispose() {
        // stop sounds
        const cleanMaterial = material => {
            // dispose material
            material.dispose()
            // dispose textures
            for (const key of Object.keys(material)) {
                const value = material[key]
                if (value && typeof value === 'object' && 'minFilter' in value) {
                    value.dispose()
                }
            }
        }
        this.scene.traverse(object => {
            if (!object.isMesh) return

            // dispose geometry
            object.geometry.dispose()

            if (object.material.isMaterial) {
                cleanMaterial(object.material)
            } else {
                // an array of materials
                for (const material of object.material) cleanMaterial(material)
            }
        })

        //remove events
        for (let i = 0; i < listeners.length; i++) {
            document.removeEventListener(listeners[i].eventName, listeners[i.eventFunc]);
        }

        //kill all tweens
        gsap.globalTimeline.clear()

        this.scene = null
        this.camera = null
        this.renderer && this.renderer.renderLists.dispose()
        this.renderer = null

        cancelAnimationFrame(this.animFrame)
    },
    animate() {
        const animate = () => {
            this.renderer.render(this.scene, this.camera);
            this.animFrame = requestAnimationFrame(animate);
        }
        animate()
    },
    onMouseMove(event) {

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }
}

threeScene.init(document.getElementById("threeDiv"))
threeScene.loadModels()
threeScene.animate()
