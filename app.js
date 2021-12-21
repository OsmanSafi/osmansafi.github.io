'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var sunGeometry = null;
var mercuryGeometry = null;
var venusGeometry = null;
var earthGeometry = null;
var marsGeometry = null;
var jupiterGeometry = null;
var saturnGeometry = null;
var neptuneGeometry = null;
var uranusGeometry = null;
var plutoGeometry = null;
var cloudsGeometry = null;
var moonGeometry = null;
var ringsGeometry = null;
var sunOutter = null; 
var commetGeometry = null;
var particalOne = null;
var particalTwo = null;
var particalThree = null;
var particalFour = null;
var particalFive = null;

var spaceBack = null;
var spaceBottom = null;
var spaceTop = null;
var spaceLeft = null;
var spaceRight = null;
var spaceFront = null;

var planetPositions = new Vector3();
var mercuryPosition = new Vector3();
var venusPosition = new Vector3();
var earthPosition = new Vector3();
var marsPosition = new Vector3();
var jupiterPosition = new Vector3();
var saturnPosition = new Vector3();
var uranusPosition = new Vector3();
var plutoPosition = new Vector3();
var neptunePosition = new Vector3();
var ringsPosition = new Vector3();
var commetPosition = new Vector3();
var ParticalPosition = new Vector3();

var projectionMatrix = new Matrix4();
var lightPosition = new Vector3();

// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
var basicColorProgram;
var textureShaderProgram;
// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    
    phongTextVS: null, 
    phongTextFS: null,
    vertexColorVS: null, 
    vertexColorFS: null,
    sphereJSON: null,
    sunImage: null, 
    mercuryImage: null,
    venusImage: null,
    earthImage: null,
    marsImage: null,
    jupiterImage: null,
    saturnImage: null,
    neptuneImage: null,
    uranusImage: null,
    plutoImage: null, 
    cloudImage: null,
    textureTextVS: null, 
    textureTextFS: null,
    moonImage: null,
    backImage: null,
    botomImage: null,
    frontImage: null,
    leftImage: null,
    rightImage: null, 
    topImage: null,
    ringsImage: null,

};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
        
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.fs.glsl').then((response) => { return response.text(); }),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/sun.jpg'), 
        loadImage('./data/mercury.jpg'),
        loadImage('./data/venus.jpg'),
        loadImage('./data/earth.jpg'),
        loadImage('./data/mars.jpg'),
        loadImage('./data/jupiter.jpg'),
        loadImage('./data/saturn.jpg'), 
        loadImage('./data/neptune.jpg'), 
        loadImage('./data/uranus.jpg'),
        loadImage('./data/pluto.jpg'),
        loadImage('./data/clouds.jpg'),
        fetch('./shaders/unlit.textured.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/unlit.textured.fs.glsl').then((response) => { return response.text(); }),
        loadImage('./data/moon.jpg'),
        loadImage('./data/back.png'),
        loadImage('./data/bottom.png'),
        loadImage('./data/front.png'), 
        loadImage('./data/left.png'), 
        loadImage('./data/right.png'), 
        loadImage('./data/top.png'),
        loadImage('./data/saturnsRing.png')
        
    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.vertexColorVS = values[2];
        loadedAssets.vertexColorFS = values[3];
        loadedAssets.sphereJSON = values[4];
        loadedAssets.sunImage = values[5];
        loadedAssets.mercuryImage = values[6];
        loadedAssets.venusImage = values[7];
        loadedAssets.earthImage = values[8];
        loadedAssets.marsImage = values[9];
        loadedAssets.jupiterImage = values[10];
        loadedAssets.saturnImage = values[11];
        loadedAssets.neptuneImage = values[12];
        loadedAssets.uranusImage = values[13];
        loadedAssets.plutoImage = values[14];
        loadedAssets.cloudImage = values[15];
        loadedAssets.textureTextVS = values[16];
        loadedAssets.textureTextFS = values[17];
        loadedAssets.moonImage = values[18];
        loadedAssets.backImage = values[19]; 
        loadedAssets.botomImage = values[20];
        loadedAssets.frontImage = values[21];
        loadedAssets.leftImage = values[22];
        loadedAssets.rightImage = values[23];
        loadedAssets.topImage = values[24];
        loadedAssets.ringsImage = values[25];
    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
        lightRotationUniform: gl.getUniformLocation(phongShaderProgram, "lightRotation"), 
        
    };

    basicColorProgram = createCompiledAndLinkedShaderProgram(loadedAssets.vertexColorVS, loadedAssets.vertexColorFS);

    basicColorProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(basicColorProgram, "aVertexPosition"),
        vertexColorsAttribute: gl.getAttribLocation(basicColorProgram, "aVertexColor"),
        vertexTexcoordsAttribute: gl.getAttribLocation(basicColorProgram, "aTexcoords")
    };

    basicColorProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(basicColorProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(basicColorProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(basicColorProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(basicColorProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(basicColorProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(basicColorProgram, "uTexture"),
        lightRotationUniform: gl.getUniformLocation(basicColorProgram, "lightRotation"), 
    };

    textureShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.textureTextVS, loadedAssets.textureTextFS);

    textureShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(textureShaderProgram, "aVertexPosition"),
        vertexTexcoordsAttribute: gl.getAttribLocation(textureShaderProgram, "aTexcoords")
    };

    textureShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(textureShaderProgram, "uTexture"),
        alphaUniform: gl.getUniformLocation(textureShaderProgram, "uAlpha"),
        
    };


        // take exist





}

// -------------------------------------------------------------------------
function createScene() {

    var ringsScale = new Matrix4().makeScale(0.075, 0.005, 0.075);

    var sunScale = new Matrix4().makeScale(0.25, 0.25, 0.25);
    var mercuryScale = new Matrix4().makeScale(0.015, 0.015, 0.015);
    var venusScale = new Matrix4().makeScale(0.03, 0.03, 0.03); 
    var earthScale = new Matrix4().makeScale(0.033, 0.033, 0.033); //was 0.033
    var marsScale = new Matrix4().makeScale(0.017, 0.017, 0.017);
    var jupiterScale = new Matrix4().makeScale(0.07, 0.07, 0.07); 
    var saturnScale = new Matrix4().makeScale(0.05, 0.05, 0.05); 
    var neptuneScale = new Matrix4().makeScale(0.04, 0.04, 0.04); 
    var uranusScale = new Matrix4().makeScale(0.04, 0.04, 0.04); 
    var plutoScale = new Matrix4().makeScale(0.01, 0.01, 0.01); 
    var cloudScale = new Matrix4().makeScale(0.033335, 0.033335, 0.033335);  
    var particalScale = new Matrix4().makeScale(0.015, 0.015, 0.015); 

    var spaceScale = new Matrix4().makeScale(150.0, 150.0, 150.0); 
    
    var topRotation = new Matrix4().makeRotationX(-90); 
    var spaceTopTranslation = new Matrix4().makeTranslation(0, 0, -1);
    
    var bottomRotation = new Matrix4().makeRotationX(-90);
    var spaceBottomTranslation = new Matrix4().makeTranslation(0, 0, 1); 
    
    var backRotation = new Matrix4().makeRotationX(0);
    var spaceBackTranslation = new Matrix4().makeTranslation(0, 0, -1);

    var leftRotation = new Matrix4().makeRotationY(90); 
    var spaceLeftTranslation = new Matrix4().makeTranslation(0, 0, 1);

    var rightRotation = new Matrix4().makeRotationY(90); 
    var spaceRightTranslation = new Matrix4().makeTranslation(0, 0,-1);

    var frontRotation = new Matrix4().makeRotationX(0); 
    var spaceFrontTranslation = new Matrix4().makeTranslation(0,0,1); 

    var ringsRoation = new Matrix4().makeRotationX(0); 
    
    var translation = new Matrix4().makeTranslation(0, 0, 0);

    moonGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    moonGeometry.create(loadedAssets.sphereJSON, loadedAssets.moonImage); 

    commetGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    commetGeometry.create(loadedAssets.sphereJSON, loadedAssets.neptuneImage); 

    particalOne = new WebGLGeometryQuad(gl, basicColorProgram); 
    particalOne.create(loadedAssets.uranusImage); 

    particalTwo = new WebGLGeometryQuad(gl, basicColorProgram);
    particalTwo.create(loadedAssets.neptuneImage); 

    particalThree = new WebGLGeometryQuad(gl, basicColorProgram); 
    particalThree.create(loadedAssets.uranusImage); 

    particalFour = new WebGLGeometryQuad(gl, basicColorProgram); 
    particalFour.create(loadedAssets.venusImage); 

    particalFive = new WebGLGeometryQuad(gl, basicColorProgram); 
    particalFive.create(loadedAssets.uranusImage); 
   
    spaceTop = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceTop.create(loadedAssets.topImage); 

    spaceBottom = new WebGLGeometryQuad(gl, basicColorProgram); 
    spaceBottom.create(loadedAssets.botomImage);

    spaceBack = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceBack.create(loadedAssets.backImage);

    spaceLeft = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceLeft.create(loadedAssets.leftImage);

    spaceRight = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceRight.create(loadedAssets.rightImage);

    spaceFront = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceFront.create(loadedAssets.frontImage);

    sunGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    sunGeometry.create(loadedAssets.sphereJSON, loadedAssets.sunImage);

    sunOutter = new WebGLGeometryJSON(gl, phongShaderProgram);
    sunOutter.create(loadedAssets.sphereJSON, loadedAssets.sunImage);

    mercuryGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    mercuryGeometry.create(loadedAssets.sphereJSON, loadedAssets.mercuryImage); 

    venusGeometry = new WebGLGeometryJSON(gl, basicColorProgram); 
    venusGeometry.create(loadedAssets.sphereJSON, loadedAssets.venusImage); 

    earthGeometry = new WebGLGeometryJSON(gl, basicColorProgram); 
    earthGeometry.create(loadedAssets.sphereJSON, loadedAssets.earthImage); 

    marsGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    marsGeometry.create(loadedAssets.sphereJSON, loadedAssets.marsImage); 

    jupiterGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    jupiterGeometry.create(loadedAssets.sphereJSON, loadedAssets.jupiterImage);

    saturnGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    saturnGeometry.create(loadedAssets.sphereJSON, loadedAssets.saturnImage);

    neptuneGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    neptuneGeometry.create(loadedAssets.sphereJSON, loadedAssets.neptuneImage); 

    uranusGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    uranusGeometry.create(loadedAssets.sphereJSON, loadedAssets.uranusImage);

    plutoGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    plutoGeometry.create(loadedAssets.sphereJSON, loadedAssets.plutoImage);

    cloudsGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    cloudsGeometry.create(loadedAssets.sphereJSON, loadedAssets.cloudImage); 

    ringsGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    ringsGeometry.create(loadedAssets.sphereJSON, loadedAssets.ringsImage);


    spaceTop.worldMatrix.makeIdentity();
    spaceTop.worldMatrix.multiply(topRotation).multiply(spaceScale).multiply(spaceTopTranslation);

    spaceBottom.worldMatrix.makeIdentity();
    spaceBottom.worldMatrix.multiply(bottomRotation).multiply(spaceScale).multiply(spaceBottomTranslation);

    spaceBack.worldMatrix.makeIdentity();
    spaceBack.worldMatrix.multiply(backRotation).multiply(spaceScale).multiply(spaceBackTranslation);

    spaceLeft.worldMatrix.makeIdentity(); 
    spaceLeft.worldMatrix.multiply(leftRotation).multiply(spaceScale).multiply(spaceLeftTranslation);

    spaceRight.worldMatrix.makeIdentity();
    spaceRight.worldMatrix.multiply(rightRotation).multiply(spaceScale).multiply(spaceRightTranslation);

    spaceFront.worldMatrix.makeIdentity();
    spaceFront.worldMatrix.multiply(frontRotation).multiply(spaceScale).multiply(spaceFrontTranslation);


    sunOutter.worldMatrix.makeIdentity();
    sunOutter.worldMatrix.multiply(translation).multiply(new Matrix4().makeScale(0.265, 0.265, 0.265));

    sunGeometry.worldMatrix.makeIdentity();
    sunGeometry.worldMatrix.multiply(translation).multiply(sunScale); 

    mercuryGeometry.worldMatrix.makeIdentity(); 
    mercuryGeometry.worldMatrix.multiply(mercuryScale); 

    venusGeometry.worldMatrix.makeIdentity(); 
    venusGeometry.worldMatrix.multiply(venusScale); 

    earthGeometry.worldMatrix.makeIdentity(); 
    earthGeometry.worldMatrix.multiply(earthScale);

    marsGeometry.worldMatrix.makeIdentity(); 
    marsGeometry.worldMatrix.multiply(marsScale);

    jupiterGeometry.worldMatrix.makeIdentity();
    jupiterGeometry.worldMatrix.multiply(jupiterScale); 

    saturnGeometry.worldMatrix.makeIdentity();
    saturnGeometry.worldMatrix.multiply(saturnScale);

    neptuneGeometry.worldMatrix.makeIdentity(); 
    neptuneGeometry.worldMatrix.multiply(neptuneScale);

    uranusGeometry.worldMatrix.makeIdentity(); 
    uranusGeometry.worldMatrix.multiply(uranusScale); 

    plutoGeometry.worldMatrix.makeIdentity(); 
    plutoGeometry.worldMatrix.multiply(plutoScale);

    cloudsGeometry.worldMatrix.makeIdentity(); 
    cloudsGeometry.worldMatrix.multiply(cloudScale); 

    ringsGeometry.worldMatrix.makeIdentity(); 
    ringsGeometry.worldMatrix.multiply(ringsScale).multiply(ringsRoation); 

    moonGeometry.worldMatrix.makeIdentity(); 
    moonGeometry.worldMatrix.multiply(plutoScale); 
    
    commetGeometry.worldMatrix.makeIdentity(); 
    commetGeometry.worldMatrix.multiply(mercuryScale); 

    particalOne.worldMatrix.makeIdentity(); 
    particalOne.worldMatrix.multiply(particalScale); 

    particalTwo.worldMatrix.makeIdentity(); 
    particalTwo.worldMatrix.multiply(particalScale);

    particalThree.worldMatrix.makeIdentity(); 
    particalThree.worldMatrix.multiply(particalScale);

    particalFour.worldMatrix.makeIdentity(); 
    particalFour.worldMatrix.multiply(particalScale);

    particalFive.worldMatrix.makeIdentity(); 
    particalFive.worldMatrix.multiply(particalScale);
    
}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    time.update();
    camera.update(time.deltaTime);


    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var uniforms = basicColorProgram.uniforms;

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);  

    
    gl.useProgram(basicColorProgram);
    gl.uniform4f(basicColorProgram.uniforms.colorUniform, 1.0, 1.0, 1.0, 1.0);

    gl.useProgram(textureShaderProgram);
    gl.uniform1f(gl.getUniformLocation(textureShaderProgram,"time"),time.secondsElapsedSinceStart);

    // special case rotation where the vector is along the x-axis (4, 0)

    var cosTime = Math.cos(time.secondsElapsedSinceStart); 
    var sinTime = Math.sin(time.secondsElapsedSinceStart); 


    var lightDistance = 4;
    lightPosition.x = cosTime * lightDistance;
    lightPosition.y = 1.5;
    lightPosition.z = sinTime * lightDistance;

    mercuryPosition.x = Math.cos( 4 * time.secondsElapsedSinceStart); 
    mercuryPosition.y =1.5;
    mercuryPosition.z = Math.sin( 4 * time.secondsElapsedSinceStart); 

    venusPosition.x = Math.cos(1.6 * time.secondsElapsedSinceStart);
    venusPosition.y = 1.5;
    venusPosition.z = Math.sin(1.6 * time.secondsElapsedSinceStart); 

    earthPosition.x =  Math.cos(time.secondsElapsedSinceStart);
    earthPosition.y = 1.5;
    earthPosition.z = Math.sin(time.secondsElapsedSinceStart);

    marsPosition.x = Math.cos(0.5 * time.secondsElapsedSinceStart); 
    marsPosition.y = 1.5; 
    marsPosition.z = Math.sin( 0.5 * time.secondsElapsedSinceStart);

    jupiterPosition.x = Math.cos(0.12 *time.secondsElapsedSinceStart);
    jupiterPosition.y = 1.5;
    jupiterPosition.z = Math.sin( 0.12 *time.secondsElapsedSinceStart); 

    saturnPosition.x = Math.cos(0.06 * time.secondsElapsedSinceStart); 
    saturnPosition.y = 1.5; 
    saturnPosition.z = Math.sin(0.06 * time.secondsElapsedSinceStart); 

    neptunePosition.x = Math.cos(0.02 * time.secondsElapsedSinceStart); 
    neptunePosition.y = 1.5; 
    neptunePosition.z = Math.sin(0.02 * time.secondsElapsedSinceStart); 

    uranusPosition.x = Math.cos(0.015 * time.secondsElapsedSinceStart); 
    uranusPosition.y = 1.5; 
    uranusPosition.z = Math.sin(0.015 * time.secondsElapsedSinceStart); 

    plutoPosition.x = Math.cos(0.01 * time.secondsElapsedSinceStart); 
    plutoPosition.y = 1.5; 
    plutoPosition.z = Math.sin(0.01 * time.secondsElapsedSinceStart); 

    commetPosition.x = Math.cos(time.secondsElapsedSinceStart); 
    commetPosition.z = Math.sin(time.secondsElapsedSinceStart);

    mercuryGeometry.worldMatrix.elements[3] = mercuryPosition.x * 20;
    mercuryGeometry.worldMatrix.elements[7] = mercuryPosition.y; 
    mercuryGeometry.worldMatrix.elements[11] = mercuryPosition.z * 20;  

    venusGeometry.worldMatrix.elements[3] = venusPosition.x * 25;
    venusGeometry.worldMatrix.elements[7] = venusPosition.y;
    venusGeometry.worldMatrix.elements[11] = venusPosition.z * 25;
    
    earthGeometry.worldMatrix.elements[3] = earthPosition.x * 34; 
    earthGeometry.worldMatrix.elements[7] = earthPosition.y;
    earthGeometry.worldMatrix.elements[11] = earthPosition.z * 34; 

    marsGeometry.worldMatrix.elements[3] = marsPosition.x * 42;
    marsGeometry.worldMatrix.elements[7] = marsPosition.y;
    marsGeometry.worldMatrix.elements[11] = marsPosition.z * 42;
    
    jupiterGeometry.worldMatrix.elements[3] = jupiterPosition.x * 49;
    jupiterGeometry.worldMatrix.elements[7] = jupiterPosition.y;
    jupiterGeometry.worldMatrix.elements[11] = jupiterPosition.z * 49;

    saturnGeometry.worldMatrix.elements[3] = saturnPosition.x * 59;
    saturnGeometry.worldMatrix.elements[7] = saturnPosition.y;
    saturnGeometry.worldMatrix.elements[11] = saturnPosition.z * 59;

    neptuneGeometry.worldMatrix.elements[3] = neptunePosition.x * 67;
    neptuneGeometry.worldMatrix.elements[7] = neptunePosition.y;
    neptuneGeometry.worldMatrix.elements[11] = neptunePosition.z * 67;

    uranusGeometry.worldMatrix.elements[3] = uranusPosition.x * 74; 
    uranusGeometry.worldMatrix.elements[7] = uranusPosition.y;
    uranusGeometry.worldMatrix.elements[11] = uranusPosition.z * 74;

    plutoGeometry.worldMatrix.elements[3] = plutoPosition.x * 79;
    plutoGeometry.worldMatrix.elements[7] = plutoPosition.y;
    plutoGeometry.worldMatrix.elements[11] = plutoPosition.z * 79;

    cloudsGeometry.worldMatrix.elements[3] = earthPosition.x * 34; 
    cloudsGeometry.worldMatrix.elements[7] = earthPosition.y; 
    cloudsGeometry.worldMatrix.elements[11] = earthPosition.z * 34;

    ringsGeometry.worldMatrix.elements[3] = saturnPosition.x * 59;
    ringsGeometry.worldMatrix.elements[7] = saturnPosition.y; 
    ringsGeometry.worldMatrix.elements[11] = saturnPosition.z * 59;

    moonGeometry.worldMatrix.elements[3] = earthPosition.x * 30;
    moonGeometry.worldMatrix.elements[7] = earthPosition.y;
    moonGeometry.worldMatrix.elements[11] = earthPosition.z * 37;

    commetGeometry.worldMatrix.elements[3] = commetPosition.x * 70 + 50;  
    commetGeometry.worldMatrix.elements[7] = commetPosition.y; 
    commetGeometry.worldMatrix.elements[11] = commetPosition.z * 80; 

    particalOne.worldMatrix.elements[3] = commetPosition.x * 70 + 45;
    particalOne.worldMatrix.elements[7] = commetPosition.y; 
    particalOne.worldMatrix.elements[11] = commetPosition.z * 80;
    
    particalTwo.worldMatrix.elements[3] = commetPosition.x * 70 + 40;
    particalTwo.worldMatrix.elements[7] = commetPosition.y; 
    particalTwo.worldMatrix.elements[11] = commetPosition.z * 80;

    particalThree.worldMatrix.elements[3] = commetPosition.x * 70 + 35;
    particalThree.worldMatrix.elements[7] = commetPosition.y; 
    particalThree.worldMatrix.elements[11] = commetPosition.z * 80;

    particalFour.worldMatrix.elements[3] = commetPosition.x * 70 + 37;
    particalFour.worldMatrix.elements[7] = commetPosition.y; 
    particalFour.worldMatrix.elements[11] = commetPosition.z * 80;

    particalFive.worldMatrix.elements[3] = commetPosition.x * 70 + 43;
    particalFive.worldMatrix.elements[7] = commetPosition.y; 
    particalFive.worldMatrix.elements[11] = commetPosition.z * 80;
    
    sunGeometry.worldMatrix.multiply(new Matrix4().makeRotationY(5));
    earthGeometry.worldMatrix.multiply(new Matrix4().makeRotationY(2));
    cloudsGeometry.worldMatrix.multiply(new Matrix4().makeRotationY(-2));
    ringsGeometry.worldMatrix.multiply(new Matrix4().makeRotationZ(2));
    moonGeometry.worldMatrix.multiply(new Matrix4().makeRotationX(2));
    sunOutter.worldMatrix.multiply(new Matrix4().makeRotationY(-5));
    


    // specify what portion of the canvas we want to draw to (all of it, full width and height)

    mercuryGeometry.render(camera, projectionMatrix, basicColorProgram);
    venusGeometry.render(camera, projectionMatrix, basicColorProgram);
    earthGeometry.render(camera, projectionMatrix, basicColorProgram);
    marsGeometry.render(camera, projectionMatrix, basicColorProgram);
    jupiterGeometry.render(camera, projectionMatrix, basicColorProgram);
    saturnGeometry.render(camera, projectionMatrix, basicColorProgram);
    neptuneGeometry.render(camera, projectionMatrix, basicColorProgram);
    uranusGeometry.render(camera, projectionMatrix, basicColorProgram);
    plutoGeometry.render(camera, projectionMatrix, basicColorProgram);
    spaceTop.render(camera, projectionMatrix, basicColorProgram);
    spaceBottom.render(camera, projectionMatrix, basicColorProgram);
    spaceBack.render(camera, projectionMatrix, basicColorProgram);
    spaceLeft.render(camera, projectionMatrix, basicColorProgram);
    spaceRight.render(camera, projectionMatrix, basicColorProgram);
    spaceFront.render(camera, projectionMatrix, basicColorProgram);
    ringsGeometry.render(camera, projectionMatrix, basicColorProgram);
    moonGeometry.render(camera, projectionMatrix, basicColorProgram);
    commetGeometry.render(camera, projectionMatrix, basicColorProgram);
    particalOne.render(camera, projectionMatrix, basicColorProgram);
    particalTwo.render(camera, projectionMatrix, basicColorProgram);
    particalThree.render(camera, projectionMatrix, basicColorProgram);
    particalFour.render(camera, projectionMatrix, basicColorProgram);
    particalFive.render(camera, projectionMatrix, basicColorProgram);

    gl.useProgram(phongShaderProgram); 
    var uniformsphong = phongShaderProgram.uniforms;
    var cameraPosition = camera.getPosition();
   
    //gl.uniform1f(uniforms.lightRotationUniform, Math.sin(time.secondsElapsedSinceStart * 4)+ 25);    
    gl.uniform3f(uniformsphong.lightPositionUniform, lightPosition.x, lightPosition.y, lightPosition.z);
    gl.uniform3f(uniformsphong.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);
    
    sunGeometry.render(camera, projectionMatrix, phongShaderProgram);
    

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    sunOutter.render(camera, projectionMatrix, phongShaderProgram);
    cloudsGeometry.render(camera, projectionMatrix, phongShaderProgram);
    
    gl.disable(gl.BLEND);
    
    

    
}
