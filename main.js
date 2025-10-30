

/**
 * This will be the main file for a 3D-Cube and a camera
 * @author Richard Prange
 * @version 10/6/2025
 */

var program;
var canvas;
var gl;

var teapotIndexSet = [];
var dataBuffer;
var indexBuffer;

var camera; 


var worldCoords = [
    [-10,10],
    [-10,10],
    [-10,10]
];

const CAMERA_SPEED = 1;


var cameraPos = [0.0, 100.0, 100.0 ,1.0]; 
var lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
var up = [0.0, 1.0, 0.0, 1.0];
var near = 1;
var far = -100;
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
    gl.clearColor(.6,.6,.6,1.0);

    
    let modelData = getBounds();
    let uModel = gl.getUniformLocation(program, "uModel");
    gl.uniformMatrix4fv(uModel, false, matToFloat32Array(changeChoordsNew(modelData, worldCoords)));
    


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

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    


    indexBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(teapotIndexSet),
        gl.STATIC_DRAW
    );
}



/**
 * This is the render loop, we clear the canvas and display the content and call render again
 */
function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, teapotIndexSet.length, gl.UNSIGNED_SHORT, 0);
 
    setTimeout(
		function (){requestAnimFrame(render);}, 100
    );
    
}

function buildCamera(){
    camera = new Camera(cameraPos, lookAtPoint, up);

    console.log(
        "near", near, "far", far, "left", left, "right", right, "top", topCam, "bot", bottom
    )

    camera.perspective(left, right, bottom, topCam, near, far);
    console.log("Persp",  camera.perspectiveMatrix);

    let modelMatrix = gl.getUniformLocation(program, "uCamera");
    let perspectiveMatrix = gl.getUniformLocation(program, "uPerspectiveMatrix");
    gl.uniformMatrix4fv(modelMatrix, false, matToFloat32Array(transpose(camera.modelViewMatrix)));
    gl.uniformMatrix4fv(perspectiveMatrix, false, matToFloat32Array(transpose(camera.perspectiveMatrix)));

    let valueHolder = this.document.getElementById("cameraPos");
    valueHolder.innerHTML = ("Camera Position " + cameraPos);
}


function updateCameraUniforms(){
    camera.perspective(left, right, bottom, topCam, near, far);
    let modelMatrix = gl.getUniformLocation(program, "uCamera");
    let perspectiveMatrix = gl.getUniformLocation(program, "uPerspectiveMatrix");
    gl.uniformMatrix4fv(modelMatrix, false, matToFloat32Array(transpose(camera.modelViewMatrix)));
    gl.uniformMatrix4fv(perspectiveMatrix, false, matToFloat32Array(transpose(camera.perspectiveMatrix)));
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


    this.document.addEventListener("keydown", (event) =>{
            switch (event.code) {
                case "KeyW":
                    cameraPos[0] = cameraPos[0] + vector_scale(camera.lookAtDirection, CAMERA_SPEED)[0];
                    cameraPos[2] = cameraPos[2] + vector_scale(camera.lookAtDirection, CAMERA_SPEED)[2];


                    //console.log(cameraPos);
                    //cameraPos = vector_add(cameraPos, vector_scale(camera.lookAtDirection, CAMERA_SPEED));
                    //console.log(cameraPos);
                    break;
                case "KeyA":
                    
                    cameraPos = vector_sub(cameraPos ,camera.U);
                    
                    break;
                case "KeyD":
                    cameraPos = vector_add(cameraPos ,camera.U);
                    break;
                case "KeyS":
                    cameraPos[0] = cameraPos[0] - vector_scale(camera.lookAtDirection, CAMERA_SPEED)[0];
                    cameraPos[2] = cameraPos[2] - vector_scale(camera.lookAtDirection, CAMERA_SPEED)[2];

                    break;  
                case "KeyR":
                    cameraPos = [2.0, 2.0, 2.0 ,1.0]; 
                    lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
                    up = [0.0, 1.0, 0.0, 1.0]; 
                    break;
                case "Space":
                    cameraPos = vector_add(cameraPos, [0.0 , 1.0 , 0.0 ,0.0]);
                    break;
                case "ShiftLeft":
                    cameraPos = vector_sub(cameraPos, camera.V);
                    break; 
                default:
                    return;       

            }
            buildCamera();

        });

    }
    
  

