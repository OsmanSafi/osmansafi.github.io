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


const animationName =
    document.getElementById(
        "active-animation-name"
    );


const sceneMessage =
    document.getElementById(
        "scene-message"
    );


const loadingOverlay =
    document.getElementById(
        "model-loading"
    );


const loadingText =
    document.getElementById(
        "loading-text"
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

        actionLabel:
            "Power Up",

        idleAnimation:
            null,

        actionAnimation:
            null,

        framing:
            "ironman"

    },


    trunks: {

        name:
            "Trunks",

        file:
            "./models/trunks.glb",

        description:
            "Rigged animated character demonstrating skeletal animation, embedded GLB animation clips, lighting, and real-time playback.",

        actionLabel:
            "Power Up",

        idleAnimation:
            "Parado",

        actionAnimation:
            "Poder",

        framing:
            "fullbody"

    },


    venom: {

        name:
            "Venom",

        file:
            "./models/venom.glb",

        description:
            "Fully rigged character featuring a large animation library with idle, movement, attack, crawling, swinging, and combat animations.",

        actionLabel:
            "Smash",

        idleAnimation:
            "Idle_C",

        actionAnimation:
            "Smashing",

        framing:
            "fullbody"

    },


    spartan: {

        name:
            "Spartan",

        file:
            "./models/spartan.glb",

        description:
            "Rigged Spartan model demonstrating embedded skeletal animation playback, real-time lighting, model integration, and camera controls.",

        actionLabel:
            "Replay Animation",

        idleAnimation:
            "Take 001",

        actionAnimation:
            "Take 001",

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

        32,

        1,

        0.1,

        100

    );


/* ==========================================
   Renderer
========================================== */

const renderer =
    new THREE.WebGLRenderer({

        antialias:
            true,

        alpha:
            true,

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

        3.2

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

        11,

        16

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

        16

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

        1.6

    );


rimLight.position.set(

    -3,

    2,

    -3

);


scene.add(
    rimLight
);


const effectLight =
    new THREE.PointLight(

        0x66ccff,

        0,

        12

    );


effectLight.position.set(

    0,

    1,

    3

);


scene.add(
    effectLight
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
    0.65;


/* ==========================================
   Loader / Clock
========================================== */

const loader =
    new GLTFLoader();


const clock =
    new THREE.Clock();


/* ==========================================
   State
========================================== */

let activeCharacterKey =
    null;


let activeModel =
    null;


let activeMixer =
    null;


let activeAction =
    null;


let idleAction =
    null;


let activeMaterials =
    [];


let ironManEffectActive =
    false;


let ironManEffectStart =
    0;


let ironManBasePosition =
    new THREE.Vector3();


let ironManBaseScale =
    new THREE.Vector3();


let ironManBaseRotation =
    new THREE.Euler();


const IRON_MAN_EFFECT_DURATION =
    1.1;


const loadedCharacters =
    new Map();


/* ==========================================
   Loading UI
========================================== */

function setLoading(
    loading,
    text = ""
) {

    if (!loadingOverlay) {

        return;

    }


    if (loading) {

        loadingOverlay
            .classList
            .remove(
                "is-hidden"
            );


        if (
            loadingText &&
            text
        ) {

            loadingText.textContent =
                text;

        }

    }

    else {

        loadingOverlay
            .classList
            .add(
                "is-hidden"
            );

    }

}


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
   Reset Model
========================================== */

function resetModelTransform(
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

    resetModelTransform(
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


    model.position.sub(
        center
    );


    const largest =
        Math.max(

            size.x,

            size.y,

            size.z

        ) || 1;


    model.scale.setScalar(

        5.3 /
        largest

    );


    model.position.set(

        0,

        -3.55,

        0

    );


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
        Math.PI /
        2.7;


    controls.maxPolarAngle =
        Math.PI /
        1.8;


    controls.update();

}


/* ==========================================
   Automatic Full-Body Framing
========================================== */

function frameFullBody(
    model
) {

    resetModelTransform(
        model
    );


    let box =
        new THREE.Box3()
            .setFromObject(
                model
            );


    const originalSize =
        box.getSize(
            new THREE.Vector3()
        );


    const targetHeight =
        3.6;


    const scale =
        targetHeight /
        Math.max(

            originalSize.y,

            0.0001

        );


    model.scale.setScalar(
        scale
    );


    model.updateMatrixWorld(
        true
    );


    box =
        new THREE.Box3()
            .setFromObject(
                model
            );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    model.position.x -=
        center.x;


    model.position.y -=
        center.y;


    model.position.z -=
        center.z;


    model.updateMatrixWorld(
        true
    );


    camera.position.set(

        0,

        0,

        6.3

    );


    controls.target.set(

        0,

        0,

        0

    );


    controls.minPolarAngle =
        Math.PI *
        0.35;


    controls.maxPolarAngle =
        Math.PI *
        0.65;


    controls.update();

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
   Animation Lookup
========================================== */

function findAnimation(
    animations,
    desiredName
) {

    if (
        !desiredName ||
        animations.length === 0
    ) {

        return null;

    }


    let clip =
        THREE.AnimationClip
            .findByName(

                animations,

                desiredName

            );


    if (clip) {

        return clip;

    }


    const desired =
        desiredName
            .toLowerCase();


    clip =
        animations.find(

            animation =>
                animation.name
                    .toLowerCase() ===
                desired

        );


    return (
        clip ||
        null
    );

}


/* ==========================================
   Stop Animations
========================================== */

function stopAnimations() {

    if (activeMixer) {

        activeMixer.stopAllAction();

    }


    activeAction =
        null;


    idleAction =
        null;

}


/* ==========================================
   Play Idle Animation
========================================== */

function playIdleAnimation() {

    if (
        !activeMixer ||
        !activeCharacterKey
    ) {

        return;

    }


    const data =
        loadedCharacters.get(
            activeCharacterKey
        );


    const config =
        CHARACTER_CONFIG[
        activeCharacterKey
        ];


    if (
        !data ||
        !config
    ) {

        return;

    }


    const clip =
        findAnimation(

            data.animations,

            config.idleAnimation

        );


    if (!clip) {

        animationName.textContent =
            "No Idle Animation";

        return;

    }


    if (activeAction) {

        activeAction.fadeOut(
            0.2
        );

    }


    idleAction =
        activeMixer.clipAction(
            clip
        );


    idleAction.reset();


    idleAction.setLoop(

        THREE.LoopRepeat,

        Infinity

    );


    idleAction.fadeIn(
        0.25
    );


    idleAction.play();


    activeAction =
        idleAction;


    animationName.textContent =
        clip.name;

}


/* ==========================================
   Play Character Action
========================================== */

function playCharacterAction() {

    if (!activeModel) {

        return;

    }


    if (
        activeCharacterKey ===
        "ironman"
    ) {

        ironManEffectActive =
            true;


        ironManEffectStart =
            clock.elapsedTime;


        controls.autoRotate =
            false;


        showMessage(
            "Iron Man power-up activated."
        );


        return;

    }


    const config =
        CHARACTER_CONFIG[
        activeCharacterKey
        ];


    const data =
        loadedCharacters.get(
            activeCharacterKey
        );


    if (
        !config ||
        !data ||
        !activeMixer
    ) {

        return;

    }


    const clip =
        findAnimation(

            data.animations,

            config.actionAnimation

        );


    if (!clip) {

        showMessage(
            "No action animation found."
        );

        return;

    }


    if (activeAction) {

        activeAction.fadeOut(
            0.2
        );

    }


    const action =
        activeMixer.clipAction(
            clip
        );


    action.reset();


    if (
        activeCharacterKey ===
        "spartan"
    ) {

        action.setLoop(

            THREE.LoopRepeat,

            Infinity

        );

    }

    else {

        action.setLoop(

            THREE.LoopOnce,

            1

        );


        action.clampWhenFinished =
            true;

    }


    action.fadeIn(
        0.2
    );


    action.play();


    activeAction =
        action;


    animationName.textContent =
        clip.name;


    showMessage(

        `${config.name}: ${clip.name}`

    );


    if (
        activeCharacterKey !==
        "spartan"
    ) {

        const onFinished =
            event => {

                if (
                    event.action !==
                    action
                ) {

                    return;

                }


                activeMixer.removeEventListener(

                    "finished",

                    onFinished

                );


                playIdleAnimation();

            };


        activeMixer.addEventListener(

            "finished",

            onFinished

        );

    }

}


/* ==========================================
   Activate Character
========================================== */

function activateCharacter(
    key,
    data
) {

    const config =
        CHARACTER_CONFIG[
        key
        ];


    if (
        !config ||
        !data
    ) {

        return;

    }


    if (activeModel) {

        scene.remove(
            activeModel
        );

    }


    stopAnimations();


    ironManEffectActive =
        false;


    effectLight.intensity =
        0;


    activeCharacterKey =
        key;


    activeModel =
        data.model;


    scene.add(
        activeModel
    );


    if (
        config.framing ===
        "ironman"
    ) {

        frameIronMan(
            activeModel
        );

    }

    else {

        frameFullBody(
            activeModel
        );

    }


    prepareMaterials(
        activeModel
    );


    if (
        key ===
        "ironman"
    ) {

        ironManBasePosition.copy(
            activeModel.position
        );


        ironManBaseScale.copy(
            activeModel.scale
        );


        ironManBaseRotation.copy(
            activeModel.rotation
        );

    }


    if (
        data.animations.length > 0
    ) {

        activeMixer =
            new THREE.AnimationMixer(
                activeModel
            );

    }

    else {

        activeMixer =
            null;

    }


    characterName.textContent =
        config.name;


    characterDescription.textContent =
        config.description;


    characterAction.textContent =
        config.actionLabel;


    characterCards.forEach(

        card => {

            card.classList.toggle(

                "active",

                card.dataset.character ===
                key

            );

        }

    );


    controls.autoRotate =
        !reduceMotion;


    if (
        config.idleAnimation &&
        activeMixer
    ) {

        playIdleAnimation();

    }

    else {

        animationName.textContent =
            "Procedural Effects";

    }


    setLoading(
        false
    );


    showMessage(

        `${config.name} selected.`

    );

}


/* ==========================================
   Load Character
========================================== */

function loadCharacter(
    key
) {

    const config =
        CHARACTER_CONFIG[
        key
        ];


    if (!config) {

        return;

    }


    if (
        loadedCharacters.has(
            key
        )
    ) {

        activateCharacter(

            key,

            loadedCharacters.get(
                key
            )

        );


        return;

    }


    setLoading(

        true,

        `Loading ${config.name}...`

    );


    if (
        key ===
        "venom"
    ) {

        showMessage(

            "Venom is a large model and may take a moment to load.",

            4500

        );

    }


    loader.load(

        config.file,


        gltf => {

            console.log(

                `${config.name} loaded successfully.`

            );


            console.log(

                `${config.name} animations:`,

                gltf.animations.map(
                    clip =>
                        clip.name
                )

            );


            loadedCharacters.set(

                key,

                {

                    model:
                        gltf.scene,

                    animations:
                        gltf.animations

                }

            );


            activateCharacter(

                key,

                loadedCharacters.get(
                    key
                )

            );

        },


        progress => {

            if (
                progress.total >
                0
            ) {

                const percent =
                    Math.round(

                        (
                            progress.loaded /
                            progress.total
                        ) *
                        100

                    );


                if (loadingText) {

                    loadingText.textContent =
                        `Loading ${config.name} — ${percent}%`;

                }

            }

        },


        error => {

            console.error(

                `${config.name} failed to load:`,

                error

            );


            setLoading(
                false
            );


            showMessage(

                `${config.name} could not be loaded. Check the model filename.`,

                0

            );

        }

    );

}


/* ==========================================
   Character Buttons
========================================== */

characterCards.forEach(

    card => {

        card.addEventListener(

            "click",

            () => {

                const key =
                    card.dataset.character;


                if (
                    key ===
                    activeCharacterKey
                ) {

                    return;

                }


                loadCharacter(
                    key
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

    playCharacterAction

);


/* ==========================================
   Iron Man Effect
========================================== */

function animateIronMan(
    elapsed
) {

    if (
        !activeModel ||
        activeCharacterKey !==
        "ironman"
    ) {

        return;

    }


    if (
        !ironManEffectActive &&
        !reduceMotion
    ) {

        activeModel.position.y =
            ironManBasePosition.y +
            Math.sin(

                elapsed *
                1.2

            ) *
            0.025;

    }


    const normalGlow =
        1.3 +
        Math.sin(

            elapsed *
            2.2

        ) *
        0.35;


    activeMaterials.forEach(

        data => {

            if (
                !data.material.emissive
            ) {

                return;

            }


            data.material
                .emissiveIntensity =

                ironManEffectActive

                    ? 4.5

                    : Math.max(

                        data.emissiveIntensity,

                        normalGlow

                    );

        }

    );


    if (
        !ironManEffectActive
    ) {

        return;

    }


    const elapsedEffect =
        elapsed -
        ironManEffectStart;


    const progress =
        THREE.MathUtils.clamp(

            elapsedEffect /
            IRON_MAN_EFFECT_DURATION,

            0,

            1

        );


    const strength =
        Math.sin(

            progress *
            Math.PI

        );


    activeModel.rotation.z =
        ironManBaseRotation.z +
        Math.sin(

            elapsed *
            35

        ) *
        0.018 *
        strength;


    activeModel.scale.set(

        ironManBaseScale.x *
        (
            1 +
            strength *
            0.035
        ),

        ironManBaseScale.y *
        (
            1 +
            strength *
            0.035
        ),

        ironManBaseScale.z *
        (
            1 +
            strength *
            0.035
        )

    );


    activeModel.position.z =
        ironManBasePosition.z +
        strength *
        0.08;


    effectLight.intensity =
        strength *
        35;


    if (
        progress >=
        1
    ) {

        ironManEffectActive =
            false;


        activeModel.position.copy(
            ironManBasePosition
        );


        activeModel.scale.copy(
            ironManBaseScale
        );


        activeModel.rotation.copy(
            ironManBaseRotation
        );


        effectLight.intensity =
            0;


        controls.autoRotate =
            !reduceMotion;

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


    const delta =
        clock.getDelta();


    const elapsed =
        clock.elapsedTime;


    if (
        activeMixer &&
        !reduceMotion
    ) {

        activeMixer.update(
            delta
        );

    }


    animateIronMan(
        elapsed
    );


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