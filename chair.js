// draw a 3D cone
// experiment with depth test and cull face features in 3D drawing
var gl, program, canvas;

var projectionMatrix;
var projectionMatrixLoc;
var modelviewMatrix;
var modelviewMatrixLoc;

var xrot=200;
var yrot=315;
var zrot=0;
var deg=5;

// start with normal view
var dtindex=1;  // enable depth test
var cfindex=2;  // disable cull face
var NumVertices=36;

var points = []; //pointsArray
var colors = []; //

var BASE_HEIGHT      = 1.0;
var BASE_WIDTH       = 8.0;
var LOWER_ARM_HEIGHT = 5.0;
var LOWER_ARM_WIDTH  = 0.5;
var UPPER_ARM_HEIGHT = 5.0;
var UPPER_ARM_WIDTH  = 0.5;

var DESTEK_HEIGHT=8.0;
var DESTEK_WIDTH=1.0;


var vertices = [
     vec4( -0.5, -0.5,  0.5, 1.0 ),
     vec4( -0.5,  0.5,  0.5, 1.0 ),
     vec4(  0.5,  0.5,  0.5, 1.0 ),
     vec4(  0.5, -0.5,  0.5, 1.0 ),
     vec4( -0.5, -0.5, -0.5, 1.0 ),
     vec4( -0.5,  0.5, -0.5, 1.0 ),
     vec4(  0.5,  0.5, -0.5, 1.0 ),
     vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
];

function main()   {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    ConfigWebGL();

    colorCube();
    
    PassInfoToGPU();

    SetupUserInterface();

    render();
};

function ConfigWebGL()   {
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );//

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
}

function PassInfoToGPU()  {

    // Load shaders and use the resulting shader program
	var colorLocation=gl.getUniformLocation(program,"vColor");
	gl.uniform4fv(colorLocation,vertexColors);

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer(); //bizde nBuffer cBuffer olmus
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" ); //normal yerine
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    projectionMatrixLoc= gl.getUniformLocation(program, "projectionMatrix");
    modelviewMatrixLoc= gl.getUniformLocation(program, "modelviewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);//?	
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
}

function SetupUserInterface()  {
    // support user interface
    document.getElementById("xrotPlus").onclick=function(){xrot += deg;};
    document.getElementById("xrotMinus").onclick=function(){xrot -= deg;};
    document.getElementById("yrotPlus").onclick=function(){yrot += deg;};
    document.getElementById("yrotMinus").onclick=function(){yrot -= deg;};

    /*ocument.getElementById("ToggleDepth").onclick=function()
    {	 if (dtindex==1)  dtindex=2;
         else     dtindex=1;
    };

    document.getElementById("ToggleCull").onclick=function()
    {    if (cfindex==1)  cfindex=2;
         else     cfindex=1;
    };*/

    // keyboard handle
    window.onkeydown = HandleKeyboard;
}

function HandleKeyboard(event)  {
    switch (event.keyCode) 
    {
    case 37:  // left cursor key
              yrot -= deg;
              break;
    case 39:   // right cursor key
              yrot += deg;
              break;
    case 38:   // up cursor key
              xrot -= deg;
              break;
    case 40:    // down cursor key
              xrot += deg;
              break;
    }
}

function quad(  a,  b,  c,  d ) {	
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}

function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );	
}

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
 }

//----------------------------------------------------------------------------
function base() {
    var s = scale4(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelviewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
//----------------------------------------------------------------------------
function ust() {
    var s = scale4(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelviewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
//----------------------------------------------------------------------------
function alt()
{
    var s = scale4(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelviewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
//----------------------------------------------------------------------------
function alt2()
{
    var s = scale4(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelviewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
//----------------------------------------------------------------------------
function ust2() {
    var s = scale4(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelviewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
	
	
}
//--------------------------------------------------------------
function destek() {
    var s = scale4(DESTEK_WIDTH, DESTEK_HEIGHT, DESTEK_HEIGHT);
    var instanceMatrix = mult( translate( 0.0, 0.1* DESTEK_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelviewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
//--------------------------------------------------------------

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT );
    
    // toggle Depth test: initially enabled
    if (dtindex == 1)
         gl.enable(gl.DEPTH_TEST);
    else if (dtindex == 2)
         gl.disable(gl.DEPTH_TEST);

    // toggle Cull face: initially enabled
    if (cfindex == 1)     {
         gl.enable(gl.CULL_FACE);
         gl.cullFace(gl.BACK);   // do not show back face 
         //gl.cullFace(gl.FRONT);   // do not show front
    }
    else if (cfindex == 2) {
         gl.disable(gl.CULL_FACE);
    } 

    modelViewMatrix = mat4();
	modelViewMatrix = mult(modelViewMatrix, rotate(xrot, [1, 0, 0] ));
	modelViewMatrix = mult(modelViewMatrix, rotate(yrot, [0, 1, 0] ));
	modelViewMatrix = mult(modelViewMatrix, rotate(zrot, [0, 0, 1] ));
    base();	

	modelViewMatrix  = mult(modelViewMatrix, translate(3.0, BASE_HEIGHT, 3.5));
    ust();		
	
	modelViewMatrix = mult(modelViewMatrix, translate(-6.0, 0, -0.0));
    alt();

	modelViewMatrix  = mult(modelViewMatrix, translate(0.0, 0, -7.0));
    ust2();

	modelViewMatrix = mult(modelViewMatrix, translate(6.0, 0, 0.0));
    alt2();	

	modelViewMatrix = mult(modelViewMatrix, translate(0.4,-5.0,3.5));
    destek();

    requestAnimFrame(render);
}
