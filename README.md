# Desc
This is project 2 for cs 6120. This project loads in and displays a teapot. To display the teapot we defined a camera and perspective/projection matrix
# Author: 
Richard Prange
# Version: 
11/7/2025


# How to control the model and camera
1. To pan the camera in the x and y direction the user needs to hold down left click and drag their mouse in the direction they want to pan.
2. To zoom the camera in (z-direction) the user needs to hold down the scroll well and drag their mouse up to zoom in and drag it backwards to zoom out.
3. There are also wasd
    - **W**: zooms in.
    - **S**: zooms out.
    - **A**: "rotates" the teapot to the left by simultaniously moving the camera towards the origin in the x,z axis.
    - **D**: Is similar to A but rotates to the right.
4. To reset the model their is a button or use the **R** key.     
5. The sliders will allow the user to change the definition of the viewing frustum.
The frustum will remain symmetric. There is a bug with the near plane slider. Moving the near plane slider before the far plane slider will cause the model to disappear. 

# How to run
1. Make sure you are in the project root directory then run **.\teapot.html**