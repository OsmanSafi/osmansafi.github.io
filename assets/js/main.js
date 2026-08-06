import * as THREE from "three";

import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";


/* ==========================================
   DOM Elements
========================================== */

const viewer =
    document.getElementById(
        "character-viewer"
    );

const characterName =
    document.getElementById(
        "active-character-name"
    );

const characterDescription =
    document.getElementById(
        "active-character-description"
    );

const characterAction =
    document.getElementById(
        "character-action"
    );

const sceneMessage =
    document.getElementById(
        "scene-message"
    );

const characterCards =
    document.querySelectorAll(
        "button.character-card"
    );


const reduceMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


/* ==========================================
   Character Configuration
========================================== */

const CHARACTER_CONFIG = {

    ironman: {

        name:
            "Iron Man",

        file:
            "./models/ironman.glb",

        description:
            "Static model demonstrating real-time lighting, materials, camera controls, emissive effects, and interactive visual effects.",

        action:
            "Power Up",

        framing:
            "ironman"

    },


    zero: {

        name:
            "Zero",

        file:
            "./models/zero.glb",

        description:
            "Rigged character model demonstrating skeletal structure, bone transforms, procedural motion, and interactive posing.",

        action:
            "Sword Pose",

        framing:
            "fullbody"

    }

};


/* ==========================================
   Scene
========================================== */

const scene =
    new THREE.Scene();


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


/* ==========================================
   Renderer
========================================== */

const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        alpha: true,

        powerPreference:
            "high-performance"

    });


renderer.setPixelRatio(

    Math.min(

        window.devicePixelRatio,

        2

    )

);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.shadowMap.enabled =
    true;


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


mainLight.castShadow =
    true;


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

    1,

    3

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


controls.enablePan =
    false;


controls.enableZoom =
    false;


controls.enableDamping =
    true;


controls.dampingFactor =
    0.06;


controls.autoRotate =
    !reduceMotion;


controls.autoRotateSpeed =
    0.7;


/* ==========================================
   Loader / Clock
========================================== */

const loader =
    new GLTFLoader();


const clock =
    new THREE.Clock();


/* ==========================================
   Model State
========================================== */

let activeCharacterKey =
    null;


let activeModel =
    null;


let activeMaterials =
    [];


let basePosition =
    new THREE.Vector3();


let baseScale =
    new THREE.Vector3(
        1,
        1,
        1
    );


let baseRotation =
    new THREE.Euler();


const loadedModels =
    new Map();


/* ==========================================
   Zero Rig
========================================== */

const zeroBones =
    new Map();


const zeroBaseRotations =
    new Map();


/* ==========================================
   Action State
========================================== */

let actionActive =
    false;


let actionStart =
    0;


const ACTION_DURATION =
    1.4;


/* ==========================================
   Messages
========================================== */

let messageTimeout =
    null;


function showMessage(
    text,
    duration = 2200
) {

    if (!sceneMessage) {

        return;

    }


    sceneMessage.textContent =
        text;


    sceneMessage
        .classList
        .remove(
            "is-hidden"
        );


    clearTimeout(
        messageTimeout
    );


    if (duration > 0) {

        messageTimeout =
            setTimeout(

                () => {

                    sceneMessage
                        .classList
                        .add(
                            "is-hidden"
                        );

                },

                duration

            );

    }

}


/* ==========================================
   Reset Raw Model Transform
========================================== */

function resetRawModel(
    model
) {

    model.position.set(
        0,
        0,
        0
    );


    model.rotation.set(
        0,
        0,
        0
    );


    model.scale.set(
        1,
        1,
        1
    );


    model.updateMatrixWorld(
        true
    );

}


/* ==========================================
   Iron Man Framing
========================================== */

function frameIronMan(
    model
) {

    resetRawModel(
        model
    );


    const box =
        new THREE.Box3()
            .setFromObject(
                model
            );


    const size =
        box.getSize(
            new THREE.Vector3()
        );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    /*
        Preserve the original Iron Man
        normalization behavior.
    */

    model.position.sub(
        center
    );


    const largestDimension =
        Math.max(
            size.x,
            size.y,
            size.z
        ) || 1;


    const scale =
        5.3 /
        largestDimension;


    model.scale.setScalar(
        scale
    );


    model.position.set(
        0,
        -3.55,
        0
    );


    model.rotation.y =
        0;


    camera.position.set(
        0,
        1.15,
        3
    );


    controls.target.set(
        0,
        1,
        0
    );


    controls.minPolarAngle =
        Math.PI / 2.7;


    controls.maxPolarAngle =
        Math.PI / 1.8;


    controls.minAzimuthAngle =
        -Infinity;


    controls.maxAzimuthAngle =
        Infinity;


    controls.update();

}


/* ==========================================
   Full Body Framing
========================================== */

function frameFullBody(
    model
) {

    /*
        Start clean.
    */

    resetRawModel(
        model
    );


    /*
        First calculate the true model bounds.
    */

    let box =
        new THREE.Box3()
            .setFromObject(
                model
            );


    let size =
        box.getSize(
            new THREE.Vector3()
        );


    /*
        Scale Zero to a predictable height.
    */

    const targetHeight =
        3.5;


    const scale =
        targetHeight /
        Math.max(
            size.y,
            0.0001
        );


    model.scale.setScalar(
        scale
    );


    model.updateMatrixWorld(
        true
    );


    /*
        Recalculate after scaling.
    */

    box =
        new THREE.Box3()
            .setFromObject(
                model
            );


    size =
        box.getSize(
            new THREE.Vector3()
        );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    /*
        This is the important change.

        We move the complete bounding box
        to the center of the Three.js world,
        regardless of where Sketchfab stored
        the GLB origin.
    */

    model.position.x -=
        center.x;


    model.position.y -=
        center.y;


    model.position.z -=
        center.z;


    model.updateMatrixWorld(
        true
    );


    /*
        Camera now looks directly at
        the centered full character.
    */

    camera.position.set(
        0,
        0,
        6
    );


    controls.target.set(
        0,
        0,
        0
    );


    controls.minPolarAngle =
        Math.PI * 0.38;


    controls.maxPolarAngle =
        Math.PI * 0.62;


    controls.minAzimuthAngle =
        -Math.PI;


    controls.maxAzimuthAngle =
        Math.PI;


    controls.update();


    console.log(
        "Full-body model size:",
        size
    );


    console.log(
        "Full-body model center:",
        center
    );

}


/* ==========================================
   Materials
========================================== */

function prepareMaterials(
    model
) {

    activeMaterials =
        [];


    model.traverse(

        child => {

            if (!child.isMesh) {

                return;

            }


            child.castShadow =
                true;


            child.receiveShadow =
                true;


            const materials =
                Array.isArray(
                    child.material
                )
                    ? child.material
                    : [child.material];


            materials.forEach(

                material => {

                    if (!material) {

                        return;

                    }


                    activeMaterials.push({

                        material,

                        emissiveIntensity:
                            material.emissiveIntensity ??
                            1

                    });

                }

            );

        }

    );

}


/* ==========================================
   Zero Rig Preparation
========================================== */

function prepareZeroRig(
    model
) {

    zeroBones.clear();


    zeroBaseRotations.clear();


    model.traverse(

        child => {

            if (!child.isBone) {

                return;

            }


            zeroBones.set(

                child.name,

                child

            );


            zeroBaseRotations.set(

                child.name,

                child.quaternion.clone()

            );

        }

    );


    console.log(

        "Zero bones:",

        [...zeroBones.keys()]

    );

}


/* ==========================================
   Reset Zero Pose
========================================== */

function resetZeroPose() {

    zeroBaseRotations.forEach(

        (
            rotation,
            name
        ) => {

            const bone =
                zeroBones.get(
                    name
                );


            if (bone) {

                bone.quaternion.copy(
                    rotation
                );

            }

        }

    );

}


/* ==========================================
   Rotate Zero Bone
========================================== */

function rotateZeroBone(
    name,
    x = 0,
    y = 0,
    z = 0
) {

    const bone =
        zeroBones.get(
            name
        );


    const original =
        zeroBaseRotations.get(
            name
        );


    if (
        !bone ||
        !original
    ) {

        return;

    }


    const offset =
        new THREE.Quaternion()
            .setFromEuler(

                new THREE.Euler(
                    x,
                    y,
                    z,
                    "XYZ"
                )

            );


    bone.quaternion
        .copy(
            original
        )
        .multiply(
            offset
        );

}


/* ==========================================
   Load Character
========================================== */

function loadCharacter(
    key
) {

    const config =
        CHARACTER_CONFIG[key];


    if (!config) {

        return;

    }


    showMessage(

        `Loading ${config.name}...`,

        0

    );


    if (
        loadedModels.has(
            key
        )
    ) {

        activateCharacter(

            key,

            loadedModels.get(
                key
            )

        );


        return;

    }


    loader.load(

        config.file,


        gltf => {

            console.log(

                `${config.name} loaded successfully.`

            );


            console.log(

                `${config.name} animations:`,

                gltf.animations

            );


            const model =
                gltf.scene;


            loadedModels.set(

                key,

                model

            );


            activateCharacter(

                key,

                model

            );

        },


        undefined,


        error => {

            console.error(

                `${config.name} failed to load:`,

                error

            );


            showMessage(

                `${config.name} could not load.`,

                0

            );

        }

    );

}


/* ==========================================
   Activate Character
========================================== */

function activateCharacter(
    key,
    model
) {

    const config =
        CHARACTER_CONFIG[key];


    /*
        Remove previous character.
    */

    if (activeModel) {

        scene.remove(
            activeModel
        );

    }


    actionActive =
        false;


    attackLight.intensity =
        0;


    activeCharacterKey =
        key;


    activeModel =
        model;


    scene.add(
        activeModel
    );


    /*
        Character-specific framing.
    */

    if (
        config.framing ===
        "ironman"
    ) {

        frameIronMan(
            activeModel
        );

    }


    if (
        config.framing ===
        "fullbody"
    ) {

        frameFullBody(
            activeModel
        );

    }


    prepareMaterials(
        activeModel
    );


    if (
        key === "zero"
    ) {

        prepareZeroRig(
            activeModel
        );


        resetZeroPose();

    }


    /*
        Capture finished transform as
        animation starting point.
    */

    basePosition.copy(
        activeModel.position
    );


    baseScale.copy(
        activeModel.scale
    );


    baseRotation.copy(
        activeModel.rotation
    );


    controls.autoRotate =
        !reduceMotion;


    characterName.textContent =
        config.name;


    characterDescription.textContent =
        config.description;


    characterAction.textContent =
        config.action;


    characterCards.forEach(

        card => {

            card.classList.toggle(

                "active",

                card.dataset.character ===
                    key

            );

        }

    );


    showMessage(

        `${config.name} selected.`

    );

}


/* ==========================================
   Character Selector
========================================== */

characterCards.forEach(

    card => {

        card.addEventListener(

            "click",

            () => {

                loadCharacter(
                    card.dataset.character
                );

            }

        );

    }

);


/* ==========================================
   Action Button
========================================== */

characterAction.addEventListener(

    "click",

    () => {

        if (!activeModel) {

            return;

        }


        actionActive =
            true;


        actionStart =
            clock.elapsedTime;


        controls.autoRotate =
            false;


        if (
            activeCharacterKey ===
            "ironman"
        ) {

            showMessage(
                "Iron Man power-up activated."
            );

        }


        if (
            activeCharacterKey ===
            "zero"
        ) {

            showMessage(
                "Zero sword pose activated."
            );

        }

    }

);


/* ==========================================
   Iron Man Animation
========================================== */

function animateIronMan(
    elapsed,
    progress
) {

    if (!actionActive) {

        activeModel.position.y =
            basePosition.y +
            Math.sin(
                elapsed * 1.2
            ) *
            0.025;

    }


    const normalGlow =
        1.3 +
        Math.sin(
            elapsed * 2.2
        ) *
        0.35;


    const strength =
        Math.sin(
            progress *
            Math.PI
        );


    activeMaterials.forEach(

        info => {

            if (
                !info.material.emissive
            ) {

                return;

            }


            info.material
                .emissiveIntensity =

                actionActive

                    ? 4 +
                        strength * 2

                    : Math.max(
                        info.emissiveIntensity,
                        normalGlow
                    );

        }

    );


    if (!actionActive) {

        return;

    }


    activeModel.rotation.z =
        baseRotation.z +
        Math.sin(
            elapsed * 35
        ) *
        0.018 *
        strength;


    activeModel.scale.set(

        baseScale.x *
            (1 + strength * 0.035),

        baseScale.y *
            (1 + strength * 0.035),

        baseScale.z *
            (1 + strength * 0.035)

    );


    activeModel.position.z =
        basePosition.z +
        strength *
        0.08;


    attackLight.intensity =
        strength *
        35;

}


/* ==========================================
   Zero Animation
========================================== */

function animateZero(
    elapsed,
    progress
) {

    /*
        Gentle idle rotation remains handled
        by OrbitControls.

        Keep Zero's centered root transform
        stable so he doesn't disappear again.
    */

    resetZeroPose();


    /*
        Slight head movement when idle.
    */

    if (!actionActive) {

        rotateZeroBone(

            "Bip Head_033",

            0,

            Math.sin(
                elapsed * 0.8
            ) *
            0.05,

            0

        );


        return;

    }


    const strength =
        Math.sin(
            progress *
            Math.PI
        );


    /*
        Look toward viewer.
    */

    rotateZeroBone(

        "Bip Neck_032",

        0,

        -0.20 *
        strength,

        0

    );


    rotateZeroBone(

        "Bip Head_033",

        0,

        -0.25 *
        strength,

        0

    );


    /*
        Raise sword arm.
    */

    rotateZeroBone(

        "Bip R UpperArm_042",

        -0.95 *
        strength,

        0.15 *
        strength,

        -0.42 *
        strength

    );


    rotateZeroBone(

        "Bip R Forearm_043",

        -0.70 *
        strength,

        0,

        0.15 *
        strength

    );


    rotateZeroBone(

        "Bip R Hand_044",

        0,

        0,

        -0.18 *
        strength

    );

}


/* ==========================================
   Finish Action
========================================== */

function finishAction() {

    actionActive =
        false;


    if (!activeModel) {

        return;

    }


    activeModel.position.copy(
        basePosition
    );


    activeModel.scale.copy(
        baseScale
    );


    activeModel.rotation.copy(
        baseRotation
    );


    attackLight.intensity =
        0;


    controls.autoRotate =
        !reduceMotion;


    if (
        activeCharacterKey ===
        "zero"
    ) {

        resetZeroPose();

    }

}


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
        width /
        height;


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


    clock.getDelta();


    const elapsed =
        clock.elapsedTime;


    if (activeModel) {

        let progress =
            0;


        if (actionActive) {

            progress =
                THREE.MathUtils.clamp(

                    (
                        elapsed -
                        actionStart
                    ) /
                    ACTION_DURATION,

                    0,

                    1

                );

        }


        if (
            activeCharacterKey ===
            "ironman"
        ) {

            animateIronMan(
                elapsed,
                progress
            );

        }


        if (
            activeCharacterKey ===
            "zero"
        ) {

            animateZero(
                elapsed,
                progress
            );

        }


        if (
            actionActive &&
            progress >= 1
        ) {

            finishAction();

        }

    }


    controls.update();


    renderer.render(
        scene,
        camera
    );

}


animate();


/* ==========================================
   Initial Character
========================================== */

loadCharacter(
    "ironman"
);