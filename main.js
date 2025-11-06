

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
var cameraPos = [0, 100., 100.0 ,1.0]; 
var lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
var up = [0.0, 1.0, 0.0, 1.0];
var near = 1.0;
var far = 200.0;
var left = -1.0;
var right = 1.0;
var bottom = -1.0;
var topCam = 1.0;


var isHeld = false;
var prevPoint;
var click;
var transMat;
var camVelo = .005;


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

    let transMatPointer = gl.getUniformLocation(program, "uTransMat");
    transMat = mat4()
    gl.uniformMatrix4fv(transMatPointer, false, matToFloat32Array(transpose(transMat)))
    

    buildBuffers();
    buildCamera();
    initHTMLEventListeners();
    render();
}




/**
 * This function loads in the teapot and the index buffer to the gpu
 */
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
 * This is the render loop, we clear the canvas and display the content and call render again
 */
function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.bindBuffer(gl.ARRAY_BUFFER,  dataBuffer);
    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.drawElements(gl.TRIANGLES, teapotIndexSet.length, gl.UNSIGNED_SHORT, 0);
 
    
    // sleep for 100 ms
    setTimeout(
		function (){requestAnimFrame(render);}, 100
    );
    
}

/**
 * Called when we want to initialize or change some specifications about our camera
 * It will rebuild the camera and set the html values to the new information
 */
function buildCamera(){
    camera = new Camera(cameraPos, lookAtPoint, up);
    updateCameraUniforms();
    let valueHolder = this.document.getElementById("cameraPos");
    valueHolder.innerHTML = ("Camera Position " + cameraPos);
}

/**
 * This should only be called after a camera has been built, it will 
 * call the camera perspective function which builds the projection/perspective matrix.
 * It will then load our projection and view matrices to the shader
 */
function updateCameraUniforms(){
    //console.log(left, right, bottom, topCam, near, far)
    camera.perspective(left, right, bottom, topCam, near, far);
    let modelMatrix = gl.getUniformLocation(program, "uCamera");
    let perspectiveMatrix = gl.getUniformLocation(program, "uPerspectiveMatrix");
    gl.uniformMatrix4fv(modelMatrix, false, matToFloat32Array(transpose(camera.modelViewMatrix)));
    gl.uniformMatrix4fv(perspectiveMatrix, false , matToFloat32Array(camera.perspectiveMatrix));
}





/**
 * This function initializes the html listener functions
 */

function initHTMLEventListeners(){
    // get the html elements
    let heightSliderOut = document.getElementById("Height-Slider-Value");
    let widthSliderOut = document.getElementById("Width-Slider-Value");
    let nearSliderOut = document.getElementById("Near-Slider-Value");
    let farSliderOut = document.getElementById("Far-Slider-Value");
    

    let heightSliderIn =  document.getElementById("height-slider");
    let widthSliderIn = document.getElementById("width-slider");
   
    let nearSliderIn = document.getElementById("near");
    let farSliderIn = document.getElementById("far");


    let resetButton = document.getElementById("reset");
    resetButton.addEventListener("click", () => {
        reset(heightSliderOut, widthSliderOut, nearSliderOut, farSliderOut);
    })

    /**
     * When the height slider is changed we will retain 
     * symmetry and rebuild our perspective matrix, then update the html value
     */
    heightSliderIn.oninput = function (){
        let value = parseFloat(this.value)/2;
        topCam = value;
        bottom = -1 * value;
        heightSliderOut.innerHTML = ("Current: " + value);
        updateCameraUniforms();
    }

    /**
     * When the width slider is changed we will retain 
     * symmetry and rebuild our perspective matrix, then update the html value
     */
    widthSliderIn.oninput = function (){
        let value = parseFloat(this.value)/2;
        right = value;
        left = -1 * value;

        widthSliderOut.innerHTML = ("Current: " + value);
        updateCameraUniforms();
    }
    
    /**
     * When the the near slider is changed, we update the html element and near global and 
     * rebuild the perspective matrix
     */
    nearSliderIn.oninput = function (){
        near = parseFloat(nearSliderIn.value);
       
    
      
        
        nearSliderOut.innerHTML = ("Current: " + near);
        updateCameraUniforms();
    }

      /**
     * When the the far slider is changed, we update the html element and far global and 
     * rebuild the perspective matrix
     */
    farSliderIn.oninput = function (){
        far = parseFloat(farSliderIn.value);


        
        farSliderOut.innerHTML = ("Current: " + far);
        updateCameraUniforms();
    }

    let cameraSpeed = 2;

    // this defines how to move our camera, and how to reset the camera/world
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
                    reset(heightSliderOut, widthSliderOut, nearSliderOut, farSliderOut);
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
            // if we encounter any camera changes we need to rebuild it
            buildCamera()

        });



    let transMatPointer = gl.getUniformLocation(program, "uTransMat");
    canvas.addEventListener("mousemove", (event) => {
        if(!isHeld || click === null)
            return; 
        

        if (prevPoint === undefined || prevPoint === null){
            
            let localCoords = getMousePosition(event)
            prevPoint = [localCoords[0], localCoords[1], 0.0 , 0.0];
            return;
        }

        if(click === 0 ){
            // pan x,y
            let localCoords = getMousePosition(event)
            let val = [localCoords[0], localCoords[1], 0.0 , 0.0];
            transMat[0][3] += val[0] - prevPoint[0];
            transMat[1][3] += val[1] - prevPoint[1];
            gl.uniformMatrix4fv(transMatPointer, false, matToFloat32Array(transpose(transMat)))
            prevPoint = val;

        }else if (click === 1){ 
            // zoom in/out
            let localCoords = getMousePosition(event)
            let val = [localCoords[0], localCoords[1], 0.0 , 0.0];

            if (val[1] - prevPoint[1] > 0){
                cameraPos =  vector_add(cameraPos, vector_scale(camera.lookAtDirection, -2));
            }else{
                cameraPos =  vector_add(cameraPos, vector_scale(camera.lookAtDirection, 2));
            }
            buildCamera()
            prevPoint = val;
        }
    });

    canvas.addEventListener("mousedown", (event) =>{
        isHeld = true;
        click = event.button;
    });

    this.document.addEventListener("mouseup", ()=>{
        isHeld = false;
        click = null;
        prevPoint = null;
    });
}



/**
 * A simple helper function to reset the world and camera view and position
 *  @param heightSliderOut: this is a reference to the HTML height slider
 *  @param widthSliderOut: this is a reference to the HTML height slider
 *  @param nearSliderOut: this is a reference to the HTML height slider
 *  @param farSliderOut: this is a reference to the HTML height slider
 */
function reset(){

    console.log("reset")
    let heightSliderOut = document.getElementById("Height-Slider-Value");
    let widthSliderOut = document.getElementById("Width-Slider-Value");
    let nearSliderOut = document.getElementById("Near-Slider-Value");
    let farSliderOut = document.getElementById("Far-Slider-Value");
    

    let heightSliderIn =  document.getElementById("height-slider");
    let widthSliderIn = document.getElementById("width-slider");
   
    let nearSliderIn = document.getElementById("near");
    let farSliderIn = document.getElementById("far");




    
    cameraPos = [0, 100., 100.0 ,1.0]; 
    lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
    up = [0.0, 1.0, 0.0, 1.0];
    near = 1.0;
    far = 200.0;
    left = -1.0;
    right = 1.0;
    bottom = -1.0;
    topCam = 1.0;

   
    
    heightSliderIn.value = 2*topCam;
    widthSliderIn.value = 2*right;
    nearSliderIn.value = near;
    farSliderIn.value = far;

    widthSliderOut.innerHTML = ("Current: " + 2*right);
    heightSliderOut.innerHTML = ("Current: " + 2*topCam);
    farSliderOut.innerHTML = ("Current: " + far);
    nearSliderOut.innerHTML = ("Current: " + near);

    let transMatPointer = gl.getUniformLocation(program, "uTransMat");
    transMat = mat4();
    gl.uniformMatrix4fv(transMatPointer, false, matToFloat32Array(transpose(transMat)));
    buildCamera();
}
    
    
 

  
