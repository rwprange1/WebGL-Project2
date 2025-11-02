

/**
 * This will be the main file for displaying a 3d teapot and the camera 
 * movement and updates
 * @author Richard Prange
 * @version 11/7/2025
 */

var program;
var canvas;
var gl;

var teapotIndexSet = [];
var dataBuffer;




var camera; 
var theta = .05;

var worldCoords = [
    [-80,80],
    [-35,42],
    [-50,50]
];

const CAMERA_SPEED = 1;


var cameraPos = [0, 100., 100.0 ,1.0]; 
var lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
var up = [0.0, 1.0, 0.0, 1.0];
var near = 1;
var far = 100;
var left = -1;
var right = 1;
var bottom = -1;
var topCam = 1;






window.onload = function init(){
    canvas = document.getElementById("gl-canvas");
    gl = initWebGL(canvas);

    
    if (!gl) {
        this.alert("WebGL isnt available");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.,.5,.25,1.0);

    
    let modelData = getBounds();
    let uModel = gl.getUniformLocation(program, "uModel");
    gl.uniformMatrix4fv(uModel, false, matToFloat32Array(changeChoordsNew(modelData, worldCoords)));
    
    //test identity mat
    //gl.uniformMatrix4fv(uModel, false, matToFloat32Array(mat4()));


    buildBuffers();
    buildCamera();

    initHTMLEventListeners();
    
   
    render();
}





function buildBuffers(){
    let data = matToFloat32Array(teapot_vertices);
    teapotIndexSet = teapot_indices;
    
    
    dataBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        data,
        gl.STATIC_DRAW
    )



    


    indexBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(teapotIndexSet),
        gl.STATIC_DRAW
    );
}


/**
 * This function sets up a simple rotation of the camera around the cardinal axis; 
 */
function rotateCamera(){
    let radius = 2.0;
    let camX = Math.sin(theta) * radius;
    let camZ = Math.cos(theta) * radius; 
    theta += .1
    cameraPos = [camX , 1.0, camZ , 1.0];
    buildCamera();
}




/**
 * This is the render loop, we clear the canvas and display the content and call render again
 */
function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //rotateCamera()
    gl.bindBuffer(gl.ARRAY_BUFFER,  dataBuffer);
    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.drawElements(gl.TRIANGLES, teapotIndexSet.length, gl.UNSIGNED_SHORT, 0);
 
    


    setTimeout(
		function (){requestAnimFrame(render);}, 100
    );
    
}

function buildCamera(){
    camera = new Camera(cameraPos, lookAtPoint, up);
    updateCameraUniforms();

    let valueHolder = this.document.getElementById("cameraPos");
    valueHolder.innerHTML = ("Camera Position " + cameraPos);
}


function updateCameraUniforms(){
    camera.perspective(left, right, bottom, topCam, near, far);
    let modelMatrix = gl.getUniformLocation(program, "uCamera");
    let perspectiveMatrix = gl.getUniformLocation(program, "uPerspectiveMatrix");
    gl.uniformMatrix4fv(modelMatrix, false, matToFloat32Array(transpose(camera.modelViewMatrix)));
    gl.uniformMatrix4fv(perspectiveMatrix, false , matToFloat32Array(camera.perspectiveMatrix));
}







function initHTMLEventListeners(){

    let heightSliderOut = document.getElementById("Height-Slider-Value");
    let widthSliderOut = document.getElementById("Width-Slider-Value");
    let nearSliderOut = document.getElementById("Near-Slider-Value");
    let farSliderOut = document.getElementById("Far-Slider-Value");
    

    let heightSliderIn =  document.getElementById("height-slider");
    let widthSliderIn = document.getElementById("width-slider");
   
    let nearSliderIn = document.getElementById("near");
    let farSliderIn = document.getElementById("far");

    heightSliderIn.oninput = function (){
        let value = this.value/2;
        topCam = value;
        bottom = -1 * value;
        heightSliderOut.innerHTML = ("Current " + value);
        updateCameraUniforms();
    }

    widthSliderIn.oninput = function (){
        let value = this.value/2;
        right = value;
        left = -1 * value;
        

        widthSliderOut.innerHTML = ("Current " + value);
        updateCameraUniforms();
    }

    nearSliderIn.oninput = function (){
       
        near = this.value;
        nearSliderOut.innerHTML = ("Current " + near);
        updateCameraUniforms();
    }

    farSliderIn.oninput = function (){
       
        far = this.value;
        farSliderOut.innerHTML = ("Current " + far);
        updateCameraUniforms();
    }

    let cameraSpeed = 2;

    this.document.addEventListener("keydown", (event) =>{
            switch (event.code) {
                case "KeyW":
                    cameraPos =  vector_add(cameraPos, vector_scale(camera.lookAtDirection, -1 *cameraSpeed));
                    break;
                case "KeyA": {
                    let norm = normalize(cross_product(camera.lookAtDirection, camera.V));
                    norm.push(0.0);
                    cameraPos = vector_add(cameraPos, vector_scale (norm, cameraSpeed));
                    break;
                }
                case "KeyD": {
                     
                    let norm = normalize(cross_product(camera.lookAtDirection, camera.V));
                    norm.push(0.0);

                    cameraPos = vector_sub(cameraPos, vector_scale (norm, cameraSpeed));
                    break;
                }
                case "KeyS":
                    cameraPos =  vector_add(cameraPos, vector_scale(camera.lookAtDirection, cameraSpeed));
                    break;  
                case "KeyR":
                    cameraPos = [0.0, 100.0, 100.0 ,1.0]; 
                    lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
                    up = [0.0, 1.0, 0.0, 1.0];
                    near = 1;
                    far = 100;
                    left = -1;
                    right = 1;
                    bottom = -1;
                    topCam = 1;

                    widthSliderOut.innerHTML = ("Current " + 2*right);
                    heightSliderOut.innerHTML = ("Current " + 2*topCam);
                    farSliderOut.innerHTML = ("Current " + far);
                    nearSliderOut.innerHTML = ("Current " + near);

                    break;
                case "Space":
                    cameraPos[1] += camera.V[1];
                   
                    break;
                case "ShiftLeft":
                    cameraPos[1] -= camera.V[1];
                    break; 
                default:
                    return;       

            }
            buildCamera()

        });

    }
    
  

