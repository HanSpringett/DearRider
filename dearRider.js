import * as THREE from 'three'
import {
	ACESFilmicToneMapping,
	CineonToneMapping,
	Group,
	Intersection,
	LinearEncoding,
	LinearToneMapping,
	Mesh,
	NoToneMapping,
	PerspectiveCamera,
	Raycaster,
	ReinhardToneMapping,
	Scene,
	sRGBEncoding,
	Texture,
	Vector2,
	WebGLRenderer,
} from 'three'
import { Shoe, ShoeComponent } from 'domain/shoe.model'
import { Inject, Injectable, OnDestroy } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { AngularFireStorage } from '@angular/fire/storage'
import { AnimationSerivce } from './animation.service'
import { LoadService } from './load.service'
import CameraControls from 'camera-controls'
import { fromEvent, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

@Injectable()
export class ThreeViewService implements OnDestroy {
	highlightedParts: Array<object> = []
	public scene: Scene = new Scene()

	constructor(
		@Inject(DOCUMENT) private readonly document: Document,
		@Inject(AngularFireStorage) private readonly storage: AngularFireStorage,
		@Inject(AnimationSerivce) private readonly animationSerivce: AnimationSerivce,
		@Inject(LoadService) private readonly loadService: LoadService
	) {
		CameraControls.install({ THREE })
		fromEvent(window, 'resize')
			.pipe(takeUntil(this.destroyed$))
			.subscribe((evt: any) => {
				this.resize()
			})
	}

	public destoryAll() {
		this.scene.traverse((o: any) => {
			if (o.geometry) {
				o.geometry.dispose()
				o.geometry = null
			}
			if (o.material) {
				for (const key of Object.keys(o.material)) {
					const value = o.material[key]
					if (value && typeof value === 'object' && 'image' in value) {
						value.dispose()
						o.material[key] = null
					}
				}
				o.material.dispose()
				o.material = null
			}
			this.scene.remove(o)
		})
		this.scene.environment?.dispose()
		this.scene.environment = null
		this.loadService.disposeLocalMaps()
		this.animationSerivce.pause()

		this.animationSerivce.dispose()

		this.controls.removeAllEventListeners()
		if (this.renderer) {
			this.renderer.dispose()
			this.renderer.forceContextLoss()
			this.renderer.renderLists.dispose()
			this.renderer.info.reset()
		}
		cancelAnimationFrame(this.animationFrameId)
		// @ts-ignore
		this.renderer = null
		// @ts-ignore
		this.raycaster = null
		// @ts-ignore
		this._hammer = null
		// @ts-ignore
		this.loaderTexture = null
		// @ts-ignore
		this.currentModel = null
		// @ts-ignore
		this.container = null
	}

	ngOnDestroy(): void {
		this.destroyed$.next()
		this.destoryAll()
	}

	init(container: HTMLElement): Promise<void> {
		this.deviceRatio = window.devicePixelRatio
		// beginning of constructor code
		this.container = container
		fromEvent(this.container, 'wheel')
			.pipe(takeUntil(this.destroyed$))
			.subscribe((e) => this.needToRender())
		const width = this.container.clientWidth
		const height = this.container.clientHeight
		// this.renderer.outputEncoding = LinearEncoding
		this.camera2 = new PerspectiveCamera(30, width / height, 0.01, 10)
		this.camera = new PerspectiveCamera(30, 1, 0.01, 10)
		this.camera2.position.set(0.5, 0.4, -0.5)
		this.camera2.rotation.set(-2.530866689200585, 0.6863582089584193, 2.724067871173089)
		this.camera.position.set(0.5, 0.4, -0.5)
		this.controls = new CameraControls(this.camera, this.renderer.domElement)
		this.loadService.init(this.renderer, this.scene, this.camera, () => this.needToRender())
		this.animationSerivce.init(() => this.needToRender(), this.controls)
		// @ts-ignore
		return new Promise((resolve, reject) => {
			this.renderer.setSize(width, height)
			this.renderer.outputEncoding = sRGBEncoding
			this.renderer.setClearColor(0xdddddd, 1)

			this.renderer.toneMapping = CineonToneMapping
			this.renderer.toneMappingExposure = 1.16

			this.resize()
			this.renderer.render(this.scene, this.camera)
			this.container.appendChild(this.renderer.domElement)
			this.setControls()

			// window.addEventListener('resize', () => this.resize())
			this.loadService.addCubeMap(this.renderer).then((cubeMap) => {
				this.environmentMap = cubeMap
				this.scene.environment = cubeMap
				resolve()
			})
		})
	}

	setStitchMaterial(stitch: any) {
		this.stitchMaterialProps = stitch
	}

	public changeMaterialAndColor(component: ShoeComponent, shoe: Shoe): void {
		this.loadService.changeComponent(component, shoe)
	}

	load(modelSrc: string, shoe: Shoe, logo: string): void {
		this.loadService.loadShoe(shoe, logo, this.stitchMaterialProps).then((_) => {
			this.animate()
			this.idle()
			this.needToRender()
		})
	}

	public needToRender(value: number = 2): void {
		this.renderTime = value
	}

	public createSnapshots(): Promise<[string, string]> {
		const lastCameraPos = this.camera.position.clone()
		// this.controls.enabled = false
		this.controls.verticalDragToForward = false
		return new Promise((resolve, reject) => {
			this.camera2.position.set(0.5, 0.4, -0.5)
			this.camera2.rotation.set(-2.530866689200585, 0.6863582089584193, 2.724067871173089)

			this.renderer.clear()
			this.renderer.setSize(500, 500)
			this.camera2.aspect = 1
			this.camera2.updateProjectionMatrix()
			this.camera2.setViewOffset(500, 500, 0, 0, 500, 500)
			this.renderer.render(this.scene, this.camera2)

			const imgData = this.renderer.domElement.toDataURL()

			this.camera2.position.set(-0.37907487800834483, 0.6899026497332409, 0.2632998969375713)
			this.camera2.rotation.set(-1.180442422602691, -0.501176731997375, -0.8625929912917003)

			this.renderer.clear()
			this.renderer.setSize(500, 500)
			this.renderer.render(this.scene, this.camera2)

			const imgData2 = this.renderer.domElement.toDataURL()
			this.resize()

			resolve([imgData, imgData2])
		})
	}

	idle(): void {
		this.animationSerivce.idle()
	}

	highlightObjectByName(name: string): void {
		this.animationSerivce.highlightObjectByName(name, this.controls, this.camera, this.scene)
	}

	highlightObject(object: Mesh): void {
		this.animationSerivce.highlightObject(object)
	}

	itemSelected(): boolean {
		return this.animationSerivce.itemSelected()
	}

	disposeAll(): void {
		this.animationSerivce.pause()
		this._dispose()
		// this.loadService.dispose()
		this.environmentMap.dispose()
		if (this.renderer) {
			this.renderer.renderLists.dispose()
			this.renderer.dispose()
		}
		this.animationSerivce.dispose()
		cancelAnimationFrame(this.animationFrameId)
		// @ts-ignore
		this.environmentMap = null
		// @ts-ignore
		this.scene = null
		// @ts-ignore
		this.renderer = null
		// @ts-ignore
		this.camera = null
		// @ts-ignore
		this.controls = null
		// @ts-ignore
		this.raycaster = null
		// @ts-ignore
		this._hammer = null
		// @ts-ignore
		this.loaderTexture = null
		// @ts-ignore
		this.currentModel = null
	}

	getHammerIntersections(mouseX: number, mouseY: number): Intersection | undefined {
		const bounding = this.container.getBoundingClientRect()
		const mouse = new Vector2()
		mouse.x = ((mouseX - bounding.left) / (bounding.width - bounding.left)) * 2 - 1
		mouse.y = -((mouseY - bounding.top) / (bounding.bottom - bounding.top)) * 2 + 1
		return this.getIntersections(mouse)
	}

	private animate(): void {
		this.container.appendChild(this.renderer.domElement)
		const clock = new THREE.Clock()
		const animate = () => {
			this.animationFrameId = requestAnimationFrame(animate)

			if (this.renderTime >= 1) {
				if (this.renderTime > 1) {
					// this.renderer.setPixelRatio(1.0)
					this.renderTime -= 1
					const delta = clock.getDelta()
					if (this.controls.verticalDragToForward) {
						this.controls.rotate(0.0003, 0, false)
					}
					this.controls.update(delta)
					this.renderer.render(this.scene, this.camera)

					// clearInterval(this.waitToRender)
					// this.waitToRender = setTimeout(() => {
					// 	// this.renderer.setPixelRatio(2)
					// 	this.renderer.render(this.scene, this.camera)
					// }, 100)
				}
			}
		}
		animate()
	}

	private setControls(): CameraControls {
		// @ts-ignore
		this.controls.verticalDragToForward = false
		this.controls.mouseButtons.right = 99999
		this.controls.touches.three = 99999
		this.controls.setTarget(0, 0.05, 0)
		this.controls.dampingFactor = 0.08
		this.controls.maxDistance = 1.2
		this.controls.minDistance = 0.275
		this.controls.draggingDampingFactor = 0.8
		this.controls.addEventListener('controlstart', () => {
			this.needToRender(1000)
		})
		this.controls.addEventListener('controlend', () => {
			this.needToRender(2)
		})

		return this.controls
	}

	private resize(): void {
		const bounding = this.container.getBoundingClientRect()
		const width = bounding.width
		const height = bounding.height
		if (width <= 768) {
			this.camera.setViewOffset(bounding.width, bounding.height, 0, 0, bounding.width, bounding.height)
		} else {
			this.camera.setViewOffset(bounding.width, bounding.height, 187.5, 0, bounding.width, bounding.height)
		}
		if (this.camera) {
			this.camera.aspect = width / height
			this.camera.updateProjectionMatrix()
			this.renderer.setSize(width, height)
			this.needToRender()
		}
	}

	private _dispose(): void {
		// window.removeEventListener('resize', () => this.resize())
		if (!this.currentModel) {
			return
		}

		this.currentModel.traverse((node: any) => {
			if (node instanceof Mesh) {
				if (node.geometry) {
					node.geometry.dispose()
				}
				if (node.material) {
					if (node.material.map) {
						node.material.map.dispose()
					}
					if (node.material.lightMap) {
						node.material.lightMap.dispose()
					}
					if (node.material.bumpMap) {
						node.material.bumpMap.dispose()
					}
					if (node.material.normalMap) {
						node.material.normalMap.dispose()
					}
					if (node.material.specularMap) {
						node.material.specularMap.dispose()
					}
					if (node.material.envMap) {
						node.material.envMap.dispose()
					}
					if (node.material.metalnessMap) {
						node.material.metalnessMap.dispose()
					}
					if (node.material.roughnessMap) {
						node.material.roughnessMap.dispose()
					}
					if (node.material.aoMap) {
						node.material.aoMap.dispose()
					}
					node.material.dispose()
				}
			}
		})

		this.scene.remove(this.currentModel)
	}

	private clearHighlight(): void {
		this.animationSerivce.clearHighlight()
	}

	private getIntersections(from: Vector2): Intersection | undefined {
		this.raycaster.setFromCamera(from, this.camera)
		const intersections = this.raycaster.intersectObjects(this.scene.children, true)

		if (intersections && intersections.length) {
			let maxValue = 2
			for (let i = 0; i < intersections.length; i++) {
				if (
					intersections[i].object.userData.isShoe &&
					intersections[i].object.userData.editable &&
					intersections[i].object.visible === true
				) {
					return intersections[i]
				}
			}
		}

		return undefined
	}

	private container!: HTMLElement
	private camera!: PerspectiveCamera
	private camera2!: PerspectiveCamera
	private renderer: WebGLRenderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
	private shouldRender: boolean = false
	private renderTime: number = 1
	private controls!: CameraControls
	private raycaster: Raycaster = new Raycaster()
	private currentModel!: Group
	// tslint:disable-next-line:variable-name
	private environmentMap: Texture = new Texture()
	private animationFrameId!: number
	private stitchMaterialProps: any
	private readonly destroyed$: Subject<void> = new Subject<void>()
	private deviceRatio: any = window.devicePixelRatio
	private waitToRender: any = setTimeout(() => {})
}
