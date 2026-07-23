import * as THREE from "three";

import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";


const viewer =
    document.getElementById("character-viewer");

const characterFrame =
    document.querySelector(".character-frame");


if (!viewer) {

    console.warn(
        "Character viewer could not be found."
    );

} else {

    const reduceMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    /* ==========================================
       Scene
    ========================================== */

    const scene = new THREE.Scene();


    /* ==========================================
       Camera
    ========================================== */

    const camera =
        new THREE.PerspectiveCamera(
            30,
            1,
            0.1,
            100
        );

    camera.position.set(
        0,
        1.15,
        3
    );


    /* ==========================================
       Renderer
    ========================================== */

    const renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.setClearColor(
        0x000000,
        0
    );

    viewer.appendChild(
        renderer.domElement
    );


    /* ==========================================
       Lighting
    ========================================== */

    const hemisphereLight =
        new THREE.HemisphereLight(
            0xffffff,
            0x20242b,
            2.4
        );

    scene.add(
        hemisphereLight
    );


    const mainLight =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );

    mainLight.position.set(
        4,
        6,
        5
    );

    mainLight.castShadow = true;

    scene.add(
        mainLight
    );


    const blueLight =
        new THREE.PointLight(
            0x4f8ef7,
            10,
            15
        );

    blueLight.position.set(
        -3,
        2.5,
        3
    );

    scene.add(
        blueLight
    );


    const goldLight =
        new THREE.PointLight(
            0xd6b36a,
            11,
            15
        );

    goldLight.position.set(
        3,
        2,
        3
    );

    scene.add(
        goldLight
    );


    const rimLight =
        new THREE.DirectionalLight(
            0xd6b36a,
            1.5
        );

    rimLight.position.set(
        -3,
        2,
        -3
    );

    scene.add(
        rimLight
    );


    const attackLight =
        new THREE.PointLight(
            0x66ccff,
            0,
            12
        );

    attackLight.position.set(
        0,
        1.2,
        2
    );

    scene.add(
        attackLight
    );


    /* ==========================================
       Controls
    ========================================== */

    const controls =
        new OrbitControls(
            camera,
            renderer.domElement
        );

    controls.enablePan = false;
    controls.enableZoom = false;

    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    controls.autoRotate =
        !reduceMotion;

    controls.autoRotateSpeed =
        0.8;

    controls.target.set(
        0,
        1,
        0
    );

    controls.minPolarAngle =
        Math.PI / 2.7;

    controls.maxPolarAngle =
        Math.PI / 1.8;

    controls.update();


    /* ==========================================
       Model Variables
    ========================================== */

    const loader =
        new GLTFLoader();

    const clock =
        new THREE.Clock();

    let character = null;
    let mixer = null;

    let characterMaterials = [];

    let attackActive = false;
    let attackStartTime = 0;

    let basePositionY = 0;
    let baseScale = 1;
    let baseRotationZ = 0;

    const attackDuration = 1.1;


    /* ==========================================
       Prepare Model
    ========================================== */

    function prepareModel(model) {

        characterMaterials = [];

        model.traverse((child) => {

            if (!child.isMesh) {
                return;
            }

            child.castShadow = true;
            child.receiveShadow = true;

            const materials =
                Array.isArray(child.material)
                    ? child.material
                    : [child.material];

            materials.forEach((material) => {

                if (!material) {
                    return;
                }

                characterMaterials.push({
                    material,
                    originalEmissiveIntensity:
                        material.emissiveIntensity ?? 1
                });

                if (material.emissive) {

                    material.emissiveIntensity =
                        Math.max(
                            material.emissiveIntensity ?? 1,
                            1
                        );

                }

            });

        });

    }


    /* ==========================================
       Normalize Model
    ========================================== */

    function normalizeModel(
        model,
        targetSize = 5.3
    ) {

        const box =
            new THREE.Box3()
                .setFromObject(model);

        const size =
            new THREE.Vector3();

        const center =
            new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);

        model.position.sub(center);

        const largestDimension =
            Math.max(
                size.x,
                size.y,
                size.z
            ) || 1;

        const scale =
            targetSize /
            largestDimension;

        model.scale.setScalar(
            scale
        );

    }


    /* ==========================================
       Attack Effect
    ========================================== */

    function activateAttack() {

        if (
            !character ||
            attackActive ||
            reduceMotion
        ) {
            return;
        }

        attackActive = true;
        attackStartTime = clock.elapsedTime;

        controls.autoRotate = false;

        if (characterFrame) {

            characterFrame.classList.add(
                "attack-active"
            );

        }

    }


    renderer.domElement.addEventListener(
        "click",
        activateAttack
    );


    renderer.domElement.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                activateAttack();

            }

        }
    );


    renderer.domElement.tabIndex = 0;

    renderer.domElement.setAttribute(
        "role",
        "button"
    );

    renderer.domElement.setAttribute(
        "aria-label",
        "3D character. Click or press Enter to activate the energy effect."
    );


    /* ==========================================
       Load Character
    ========================================== */

    loader.load(

        "./models/character.glb",

        (gltf) => {

            console.log(
                "Character loaded successfully."
            );

            console.log(
                "Available animations:",
                gltf.animations
            );

            character =
                gltf.scene;

            prepareModel(
                character
            );

            normalizeModel(
                character,
                5.3
            );

            /*
                Keep the current bust framing.
            */

            character.position.set(
                0,
                -3.55,
                0
            );

            basePositionY =
                character.position.y;

            baseScale =
                character.scale.x;

            baseRotationZ =
                character.rotation.z;

            character.rotation.y = 0;

            scene.add(
                character
            );


            /*
                Play an idle animation if one exists.
            */

            if (
                gltf.animations.length > 0
            ) {

                mixer =
                    new THREE.AnimationMixer(
                        character
                    );

                const idleAnimation =
                    THREE.AnimationClip.findByName(
                        gltf.animations,
                        "Idle"
                    ) ||
                    THREE.AnimationClip.findByName(
                        gltf.animations,
                        "idle"
                    ) ||
                    gltf.animations[0];

                const action =
                    mixer.clipAction(
                        idleAnimation
                    );

                action.reset();
                action.play();

            }

        },

        (progress) => {

            if (
                progress.total > 0
            ) {

                const percent =
                    Math.round(
                        (
                            progress.loaded /
                            progress.total
                        ) * 100
                    );

                console.log(
                    `Character loading: ${percent}%`
                );

            }

        },

        (error) => {

            console.error(
                "Character failed to load:",
                error
            );

        }

    );


    /* ==========================================
       Resize
    ========================================== */

    function resizeViewer() {

        const rectangle =
            viewer.getBoundingClientRect();

        const width =
            Math.max(
                rectangle.width,
                1
            );

        const height =
            Math.max(
                rectangle.height,
                1
            );

        renderer.setSize(
            width,
            height,
            false
        );

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

    }


    const resizeObserver =
        new ResizeObserver(
            resizeViewer
        );

    resizeObserver.observe(
        viewer
    );

    resizeViewer();


    /* ==========================================
       Animation Loop
    ========================================== */

    function animate() {

        requestAnimationFrame(
            animate
        );

        const delta =
            clock.getDelta();

        const elapsed =
            clock.elapsedTime;


        if (
            mixer &&
            !reduceMotion
        ) {

            mixer.update(
                delta
            );

        }


        /*
            Normal floating movement.
        */

        if (
            character &&
            !reduceMotion &&
            !attackActive
        ) {

            character.position.y =
                basePositionY +
                Math.sin(
                    elapsed * 1.2
                ) * 0.025;

        }


        /*
            Normal emissive pulse and attack glow.
        */

        if (
            characterMaterials.length > 0
        ) {

            const normalGlow =
                1.3 +
                Math.sin(
                    elapsed * 2.2
                ) * 0.35;

            const attackGlow =
                4.5 +
                Math.sin(
                    elapsed * 18
                ) * 1.5;

            characterMaterials.forEach(
                ({
                    material,
                    originalEmissiveIntensity
                }) => {

                    if (!material.emissive) {
                        return;
                    }

                    material.emissiveIntensity =
                        attackActive
                            ? attackGlow
                            : Math.max(
                                originalEmissiveIntensity,
                                normalGlow
                            );

                }
            );

        }


        /*
            Click-activated power-up effect.
        */

        if (
            character &&
            attackActive
        ) {

            const attackElapsed =
                elapsed - attackStartTime;

            const attackProgress =
                THREE.MathUtils.clamp(
                    attackElapsed /
                    attackDuration,
                    0,
                    1
                );

            const attackStrength =
                Math.sin(
                    attackProgress *
                    Math.PI
                );


            /*
                Small vibration.
            */

            character.rotation.z =
                baseRotationZ +
                Math.sin(
                    elapsed * 35
                ) *
                0.018 *
                attackStrength;


            /*
                Scale pulse.
            */

            const pulse =
                1 +
                Math.sin(
                    elapsed * 24
                ) *
                0.025 *
                attackStrength;

            character.scale.setScalar(
                baseScale * pulse
            );


            /*
                Slight vertical vibration.
            */

            character.position.y =
                basePositionY +
                Math.sin(
                    elapsed * 22
                ) *
                0.018 *
                attackStrength;


            /*
                Slight movement toward the camera.
            */

            character.position.z =
                attackStrength * 0.08;


            /*
                Blue energy flash.
            */

            attackLight.intensity =
                attackStrength * 35;

            attackLight.color.setHSL(
                0.55 +
                Math.sin(
                    elapsed * 12
                ) * 0.03,
                1,
                0.65
            );


            /*
                Reset when the attack finishes.
            */

            if (
                attackProgress >= 1
            ) {

                attackActive = false;

                character.scale.setScalar(
                    baseScale
                );

                character.position.set(
                    0,
                    basePositionY,
                    0
                );

                character.rotation.z =
                    baseRotationZ;

                attackLight.intensity = 0;

                controls.autoRotate =
                    !reduceMotion;

                if (characterFrame) {

                    characterFrame.classList.remove(
                        "attack-active"
                    );

                }

            }

        }


        controls.update();

        renderer.render(
            scene,
            camera
        );

    }


    animate();

}