// A very simple test/example of a selective glow effect combined with animation.
// Based on stemkowski's fantastic threejs effects.

var scene,renderer,camera,controls;

var stats = new Stats();
var clock = new THREE.Clock();
var datGUI;
var options = new function(){
    
    this.c = 0.10;
    this.p = 1.80;
    
    
}

init();
animate();


function init(){
    
    stats.showPanel(0);
    
    datGUI = new dat.GUI();
    datGUI.add(options,'c',0.00,0.5);
    datGUI.add(options,'p',0.00,4.00);
    
        
    renderer = new THREE.WebGLRenderer({antialias: false, logarithmicDepthBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
        
    //Setup camera and mouse controls.
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight,3,5000);
    camera.position.x=200;
    controls = new THREE.OrbitControls( camera );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 0.5;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = true;
    controls.minDistance = 50;
    controls.maxDistance=2e6;
    controls.keys = [ 65, 83, 68 ];
    controls.addEventListener( 'change', render );
    
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(stats.dom);
    
    scene = new THREE.Scene();
    
    // create custom material from the shader code above
	//   that is within specially labeled script tags
	
    
    
    
    
  var sun_text_loader = new THREE.TextureLoader();
  var sun_texture = sun_text_loader.load('./textures/sun_atmos.jpg');
  //sphere_texture.wrapS = sphere_texture.wrapT = THREE.RepeatWrapping;
  var sun_noise_text = sun_text_loader.load('./textures/sun_cloud_map.jpg');
  sun_noise_text.wrapS = sun_noise_text.wrapT = THREE.RepeatWrapping;
  
  
  var customAniMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: {
		baseTexture: 	{ type: "t", value: sun_texture },
		baseSpeed: 		{ type: "f", value: 0.002 },
		noiseTexture: 	{ type: "t", value: sun_noise_text },
		noiseScale:		{ type: "f", value: 0.5337 },
		alpha: 			{ type: "f", value: 0.5 },
		time: 			{ type: "f", value: 1.0 }
	},
		vertexShader:   document.getElementById( 'vertexShaderAni'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShaderAni' ).textContent
	}   );
  
  
  var sun_geometry=new THREE.SphereGeometry(40,50,50);
 // var sphere_material=new THREE.MeshBasicMaterial({map: sphere_texture});  
  this.sun_mesh = new THREE.Mesh(sun_geometry,customAniMaterial);
  
  scene.add(sun_mesh);
    
    var customMaterialGlow = new THREE.ShaderMaterial( 
	{
	    uniforms: 
		{ 
			"c":   { type: "f", value: 0.1 },
			"p":   { type: "f", value: 1.3 },
			glowColor: { type: "c", value: new THREE.Color(0xff0000) },
			viewVector: { type: "v3", value: camera.position }
		},
		vertexShader:   document.getElementById( 'vertexShaderGlow'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShaderGlow' ).textContent,
		side: THREE.FrontSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	}   );
		
    var sunGlowGeo = new THREE.SphereGeometry(75,50,50);  
    this.sunGlow = new THREE.Mesh( sunGlowGeo, customMaterialGlow.clone() );
	
	
    //sunGlow.position = moon.position;
	//moonGlow.scale.multiplyScalar(1.2);
	scene.add( sunGlow );
    
    render();
        
    
    
};


function animate(){
    
    
    render();
    sunGlow.material.uniforms[ "c" ].value = options.c; 
    sunGlow.material.uniforms[ "p" ].value = options.p; 
    sunGlow.material.uniforms.viewVector.value = 
		new THREE.Vector3().subVectors( camera.position, sunGlow.position );
    sun_mesh.material.uniforms.time.value += clock.getDelta();
    stats.update();
    requestAnimationFrame(animate);  
};

function render(){
    
    renderer.render(scene,camera);
    
    
};

function onWindowResize() {

  var windowHalfX = window.innerWidth/2;
  var windowHalfY = window.innerHeight/2;
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  //controls.handleResize();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
};


