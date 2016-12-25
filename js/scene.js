// Main File. All shader and effects are from stemkowski. 

//TODO:

// Rotation? Physically accurate would be ludicrously fast so perhaps slow it down for show purposes.
// Add showier 3D effects.
// Add more stuff: Rings, asteroids? Perhaps a few famous comets?
// Loading manager.





//Define Geometry
var ZOOM_SCALE_FACTOR = 1200;

const TRANSPARENT_SPHERE_SIZE = 5;
const TRANSPARENT_SPHERE_NAME = "TransparentSphere";
//var ZOOM_SCALE_FACTOR = 1200;

var scene, camera, controls, renderer; // The basics
var camera_position = new THREE.Vector3(0,0,0); // Define where the camera is pointing at.
var lights = [];
var scene_tree;

var manager = new THREE.LoadingManager();

document.getElementById("loadbar").innerHTML="<b> Loading: </b> 0%";

manager.onProgress = function(item,loaded,total){
    document.getElementById("loadbar").innerHTML="<b> Loading: </b>" + (loaded/total*100).toFixed(2)+"%";
};

manager.onLoad= function(){
    document.getElementById("loadbar").innerHTML="";
};




var mercury_group, mercury_group_orbit,venus_group, venus_group_orbit,
earth_group, earth_group_orbit, earth_moon_group, mars_group, mars_group_orbit, jupiter_group, jupiter_group_orbit,  saturn_group, saturn_group_orbit, saturn_local_system,
neptune_group, neptune_group_orbit, uranus_group, uranus_group_orbit, pluto_group, pluto_group_orbit,sun_group,
skybox, orbit_outlines; // 3D objects and groups. Hierarchy is (in descending order of importance) orbit_group > planet_group. Sun and skybox group are special exceptions.
// ^^^^^^^^^^ I must do this in a generic way but ugh re-architecting, hindsight how blessed art thou 
// Setup FPS/Render Time/Memory usage monitor

var Mercury,Venus,Earth,Moon,Mars,Jupiter,Saturn,Uranus,Neptune,Pluto;

var stats_fps = new Stats();


// Setup the GUI Options
var datGUI;
var options = new function(){

  this.OrbitSpeedMultiplier= 1.0;
  this.ShowOrbitOutline = true;
  this.HighlightPlanets = true;
  this.AntiAliasing = false;
  this.Alpha = false;
  this.PlanetScale = 1;
  this.OrbitScale = 0.02;
  this.CameraFocus = 'Sun';
  this.Render_Updated_Scaling = function(){UpdateScene();};
  this.sun_effect_speed = 0.01;
  this.sun_effect_noise = 0.5337;
  this.SceneToConsole = function(){
    console.log("X Position: " + camera.position.x);
    console.log("Y Position: " + camera.position.y);
    console.log("Z Position: " + camera.position.z);
  };
  this.MercuryToConsole = function(){
    console.log("X Position: " + mercury_group.position.x);
    console.log("Y Position: " + mercury_group.position.y);
    console.log("Z Position: " + mercury_group.position.z);
  }
  this.MercurySize = function(){
    console.log(Mercury.semimajor_axis_scene());
  }



};



 



init();
animate();

function init(){

 
  


    stats_fps.showPanel(0);


    //Setup Renderer!
    renderer = new THREE.WebGLRenderer({antialias: false, logarithmicDepthBuffer: false,alpha:true}); // Logarithmic depth buffer set to true causes severe shader artifacts.
    renderer.setSize(window.innerWidth, window.innerHeight);
    //  renderer.autoClear = false;

    //Setup camera and mouse controls.
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight,10,3e8);
    camera.position.x=-15000;
    camera.position.y=7000;
    camera.position.z=2000;
    controls = new THREE.OrbitControls( camera ,renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 0.5;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.enablePan = false;
    controls.minDistance = 2000;
    controls.maxDistance=0.8e8;
    controls.addEventListener( 'change', render );

    //Setup GUI

    datGUI = new dat.GUI();

    var Camera_Focus = datGUI.add(options,'CameraFocus',['Sun','Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']);
    //  var Camera_style = datGUI.add(options, 'CameraStyle', ['Orbit','Free']);

    var OrbitalFolder = datGUI.addFolder("Orbital Parameters");
    OrbitalFolder.add(options,'OrbitSpeedMultiplier',0.0,20000000.0);
    OrbitalFolder.add(options,'PlanetScale',1,30);
    var ShowOutlines = OrbitalFolder.add(options,'ShowOrbitOutline');
    var HighlightPlanets = OrbitalFolder.add(options,'HighlightPlanets');

    var EffectsFolder = datGUI.addFolder("3D Options");
    var SunEffectsFolder = EffectsFolder.addFolder("Sun Shader");
    SunEffectsFolder.add(options,'sun_effect_noise',0.00,1.00);
    SunEffectsFolder.add(options,'sun_effect_speed',0.00,1.00)
    var RenderOptionsFolder = EffectsFolder.addFolder("Renderer Options");
    var AntiAliasing = RenderOptionsFolder.add(options,'AntiAliasing');
    RenderOptionsFolder.add(options,'Alpha');

    var DebugFolder = datGUI.addFolder("Debug");
    DebugFolder.add(options,'SceneToConsole');
    DebugFolder.add(options,'MercuryToConsole');
    DebugFolder.add(options,'MercurySize');



    ShowOutlines.onChange(function(value) {
    orbit_outlines.visible = value;

    });

    HighlightPlanets.onChange(function(value){

    if(value == true){
      ZOOM_SCALE_FACTOR = 1200;
    }
    else {
      ZOOM_SCALE_FACTOR = 2e5;
    }

    });


    // TO change the WebGL renderer context requires recreating the renderer with new context, need to re-architect for that.
    /*AntiAliasing.onChange(function(value){
    renderer.clear();
    antialias = value;
    init();

    });*/ // THis never worked.


    //datGUI.close();


    //Add our 3D scene to the html web page!
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(stats_fps.dom);



    //Setup lights...
    scene = new THREE.Scene();
    lights[ 0 ] = new THREE.AmbientLight(0xffffff,0.1);
    lights[ 1 ] = new THREE.PointLight( 0xffffff,2,1000000,2);
    lights[ 1 ].position.set = (0,0,0); // Center of the sun.
    scene.add(lights[ 0 ]);
    scene.add(lights[ 1 ]);



    //Setup lens flare.
    var lensloader = new THREE.TextureLoader;
    var lensflare0 = new lensloader.load('./textures/lens_flare/lensflare0.png');
    var lensflare2 = new lensloader.load('./textures/lens_flare/lensflare2.png');
    var lensflare3 = new lensloader.load('./textures/lens_flare/lensflare3.png');

    this.sun_flare = new THREE.LensFlare(lensflare0,200,0.0,THREE.AdditiveBlending,new THREE.Color(0xffffff))


    this.sun_flare.add( lensflare2, 512, 0.0, THREE.AdditiveBlending );
    this.sun_flare.add( lensflare2, 512, 0.0, THREE.AdditiveBlending );
    this.sun_flare.add( lensflare2, 512, 0.0, THREE.AdditiveBlending );

    this.sun_flare.add( lensflare3, 60, 0.6, THREE.AdditiveBlending );
    this.sun_flare.add( lensflare3, 70, 0.7, THREE.AdditiveBlending );
    this.sun_flare.add( lensflare3, 120, 0.9, THREE.AdditiveBlending );
    this.sun_flare.add( lensflare3, 70, 1.0, THREE.AdditiveBlending );
    this.sun_flare.position.set(0,0,0);

    scene.add(sun_flare);
  


    //Setup planet objects...
    skybox_group = new THREE.Object3D();
    sun_group = new THREE.Object3D();
    orbit_outlines = new THREE.Object3D();


    mercury_group_orbit = new THREE.Object3D();
    mercury_group = new THREE.Object3D();
    //  mercury_transparent_group = new THREE.Group();
    mercury_group_orbit.add(mercury_group);

    earth_group_orbit = new THREE.Object3D();
    earth_group = new THREE.Object3D();
    earth_moon_group = new THREE.Object3D();
    earth_group.add(earth_moon_group);
    earth_group_orbit.add(earth_group);

    venus_group_orbit=new THREE.Object3D();
    venus_group = new THREE.Object3D();
    venus_group_orbit.add(venus_group);

    mars_group_orbit = new THREE.Object3D();
    mars_group = new THREE.Object3D();
    mars_group_orbit.add(mars_group);

    jupiter_group_orbit = new THREE.Object3D();
    jupiter_group = new THREE.Object3D();
    jupiter_group_orbit.add(jupiter_group);

    saturn_group_orbit = new THREE.Object3D();
    saturn_group = new THREE.Object3D();
    saturn_local_system = new THREE.Object3D();
    saturn_group.add(saturn_local_system);
    saturn_group_orbit.add(saturn_group);


    uranus_group_orbit = new THREE.Object3D();
    uranus_group = new THREE.Object3D();
    uranus_group_orbit.add(uranus_group);

    neptune_group_orbit = new THREE.Object3D();
    neptune_group = new THREE.Object3D();
    neptune_group_orbit.add(neptune_group);

    pluto_group_orbit = new THREE.Object3D();
    pluto_group = new THREE.Object3D();
    pluto_group_orbit.add(pluto_group);

    scene.add(skybox_group);
    scene.add(mercury_group_orbit);
    scene.add(venus_group_orbit);
    scene.add(earth_group_orbit);
    scene.add(mars_group_orbit);
    scene.add(jupiter_group_orbit);
    scene.add(saturn_group_orbit);
    scene.add(uranus_group_orbit);
    scene.add(neptune_group_orbit);
    scene.add(pluto_group_orbit);
    scene.add(sun_group);




    // Generate Planets. Objects handle physics as well as adding 3d object to scene.
    Mercury = new Planet_Gen(Mercury_Info,mercury_group);
    Venus = new Planet_Gen(Venus_Info,venus_group);
    Earth = new Planet_Gen(Earth_Info,earth_group);
    Mars = new Planet_Gen(Mars_Info,mars_group);
    Moon = new Planet_Gen(Moon_Info,earth_moon_group);
    Jupiter = new Planet_Gen(Jupiter_Info,jupiter_group); 
    Saturn = new Planet_Gen(Saturn_Info,saturn_group);
    Uranus = new Planet_Gen(Uranus_Info,uranus_group)
    Neptune = new Planet_Gen(Neptune_Info,neptune_group);
    Pluto = new Planet_Gen(Pluto_Info,pluto_group);






    // Create skydome. 

    var SkyboxMesh = CreateSphere('./textures/eso_dark.jpg',1e8,50,"Skybox",true);
    SkyboxMesh.material.side= THREE.BackSide;
    SkyboxMesh.rotation.x = (Math.PI/180*63);
    skybox_group.add(SkyboxMesh);



    // Add the sun.
    var sun_text_loader = new THREE.TextureLoader();
    var sun_texture = sun_text_loader.load('./textures/sun_atmos.jpg');
    sun_texture.wrapS = sun_texture.wrapT = THREE.RepeatWrapping;
    var sun_noise_text = sun_text_loader.load('./textures/sun_cloud_map.jpg');
    sun_noise_text.wrapS = sun_noise_text.wrapT = THREE.RepeatWrapping;

    // Define sun surface effect through shader.
    var customAniMaterial = new THREE.ShaderMaterial( 
        {
            uniforms: {
                baseTexture: 	{ type: "t", value: sun_texture },
                baseSpeed: 		{ type: "f", value: 0.01 },
                noiseTexture: 	{ type: "t", value: sun_noise_text },
                noiseScale:		{ type: "f", value: 0.5337 },
                alpha: 			{ type: "f", value: 0.5 },
                time: 			{ type: "f", value: 1.0 }
        },
                vertexShader:   document.getElementById( 'vertexShaderAni'   ).textContent,
                fragmentShader: document.getElementById( 'fragmentShaderAni' ).textContent
        }   );


    var sun_geometry=new THREE.SphereGeometry(SUN_SIZE,50,50);
    this.sun_mesh = new THREE.Mesh(sun_geometry,customAniMaterial); 
    this.sun_mesh.name = "sun";
    this.sun_mesh.depthWrite = false;
    sun_group.add(sun_mesh);



    // Define glowing/halo shader effect for sun.
    var customMaterialGlow = new THREE.ShaderMaterial( 
        {
            uniforms: 
                { 
                        "c":   { type: "f", value: 0.44 },
                        "p":   { type: "f", value: 2.0 },
                        glowColor: { type: "c", value: new THREE.Color(0xffff00) },
                        viewVector: { type: "v3", value: camera.position }
                },
                vertexShader:   document.getElementById( 'vertexShaderGlow'   ).textContent,
                fragmentShader: document.getElementById( 'fragmentShaderGlow' ).textContent,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                transparent: true
        }   );
                
    var sunGlowGeo = new THREE.SphereGeometry(SUN_SIZE*1.8,50,50);  
    this.sunGlow = new THREE.Mesh( sunGlowGeo, customMaterialGlow.clone() );
    this.sunGlow.name = "sunGlow";
          sun_group.add( sunGlow );
        
    //Trace Orbits 

    TraceOrbitOutlines();



    window.addEventListener('resize',onWindowResize,false);



    render();
    document.getElementById("loadbar").innerHTML="";
};

function TraceOrbitOutlines(){

  orbit_outlines.add(CreateOrbitalLine(Mercury.semimajor_axis_scene(),Mercury.semiminor_axis_scene(),Mercury.periapsis_scene(),Mercury.orbital_inclination,Mercury.longitude_ascending,Mercury.argument_periapsis,Mercury.orbital_eccentricity));
  orbit_outlines.add(CreateOrbitalLine(Venus.semimajor_axis_scene(),Venus.semiminor_axis_scene(),Venus.periapsis_scene(),Venus.orbital_inclination,Venus.longitude_ascending,Venus.argument_periapsis,Venus.orbital_eccentricity));
  orbit_outlines.add(CreateOrbitalLine(Earth.semimajor_axis_scene(),Earth.semiminor_axis_scene(),Earth.periapsis_scene(),Earth.orbital_inclination,Earth.longitude_ascending,Earth.argument_periapsis,Earth.orbital_eccentricity));
  orbit_outlines.add(CreateOrbitalLine(Mars.semimajor_axis_scene(),Mars.semiminor_axis_scene(),Mars.periapsis_scene(),Mars.orbital_inclination,Mars.longitude_ascending,Mars.argument_periapsis,Mars.orbital_eccentricity));
  orbit_outlines.add(CreateOrbitalLine(Jupiter.semimajor_axis_scene(),Jupiter.semiminor_axis_scene(),Jupiter.periapsis_scene(),Jupiter.orbital_inclination,Jupiter.longitude_ascending,Jupiter.argument_periapsis,Jupiter.orbital_eccentricity));
  orbit_outlines.add(CreateOrbitalLine(Saturn.semimajor_axis_scene(),Saturn.semiminor_axis_scene(),Saturn.periapsis_scene(),Saturn.orbital_inclination,Saturn.longitude_ascending,Saturn.argument_periapsis,Saturn.orbital_eccentricity));
  orbit_outlines.add(CreateOrbitalLine(Uranus.semimajor_axis_scene(),Uranus.semiminor_axis_scene(),Uranus.periapsis_scene(),Uranus.orbital_inclination,Uranus.longitude_ascending,Uranus.argument_periapsis,Uranus.orbital_eccentricity));
  orbit_outlines.add(CreateOrbitalLine(Neptune.semimajor_axis_scene(),Neptune.semiminor_axis_scene(),Neptune.periapsis_scene(),Neptune.orbital_inclination,Neptune.longitude_ascending,Neptune.argument_periapsis,Neptune.orbital_eccentricity));
  orbit_outlines.add(CreateOrbitalLine(Pluto.semimajor_axis_scene(),Pluto.semiminor_axis_scene(),Pluto.periapsis_scene(),Pluto.orbital_inclination,Pluto.longitude_ascending,Pluto.argument_periapsis,Pluto.orbital_eccentricity));
  scene.add(orbit_outlines);

}

function CreateSphere(texture_u,radius,polygon_count,name,basic){

    var sphere_loader = new THREE.TextureLoader(manager);
    var sphere_texture = sphere_loader.load(texture_u);
    var sphere_geometry=new THREE.SphereGeometry(radius,polygon_count,polygon_count);
    if (basic==true) {
    var sphere_material=new THREE.MeshBasicMaterial({map: sphere_texture});
    } else {
    var sphere_material=new THREE.MeshLambertMaterial({map: sphere_texture});
    }
    var sphere_mesh = new THREE.Mesh(sphere_geometry,sphere_material);
    sphere_mesh.name = name;
    return(sphere_mesh);

};

// Creates the orbital outlines on the scene.
function CreateOrbitalLine(semimajor_axis,semiminor_axis,periapsis,orbital_inclination,longitude_ascending,argument_periapsis,eccentricity){

    var linematerial = new THREE.LineBasicMaterial({color: 0x7c7c7c});
    var linegeometry = new THREE.Geometry();


    for (var i = 0; i < ((2*Math.PI)+0.02); (i = i + 0.01)) {

    var R = semimajor_axis * (1-Math.pow(eccentricity,2))/(1+(eccentricity*Math.cos(i+argument_periapsis)));
    var y = R*Math.sin(i+argument_periapsis)*Math.sin(orbital_inclination);
    var x = R*(Math.cos(longitude_ascending)*Math.cos(i+argument_periapsis) - Math.sin(longitude_ascending)*Math.sin(i+argument_periapsis))*Math.cos(orbital_inclination);
    var z = R*(Math.sin(longitude_ascending)*Math.cos(i+argument_periapsis)+Math.cos(longitude_ascending)*Math.sin(i+argument_periapsis))*Math.cos(orbital_inclination);
    linegeometry.vertices.push(new THREE.Vector3(x,y,z));
      
    }

    var orbitline = new THREE.Line(linegeometry,linematerial);
    return(orbitline);
    
  
};

function CreateTransparentSphere(radius,polygon_count,name){

    var sphere_geometry = new THREE.SphereGeometry(radius,polygon_count,polygon_count);
    var sphere_material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.05, color: 0xffffff})
    var sphere_mesh = new THREE.Mesh(sphere_geometry,sphere_material);
    sphere_mesh.name = name;
    return(sphere_mesh);

};

function CreateSpriteText(text,colour,name,offset){

    var SpriteText = new THREE_Text.SpriteText2D(text, { align: THREE_Text.textAlign.center, font: '30px Arial', fillStyle: colour, antialias: true });
    SpriteText.position.set(0,offset+10,0);
    SpriteText.name = name;
    return(SpriteText);

}
// Pretty sure Three.Vector3 makes this redundant. Has a deltaV measurement I am pretty sure.
function CalculateDistanceFromObject(camera_x,camera_y,camera_z,object_x,object_y,object_z){

    var delta_x = Math.abs((camera_x - object_x));
    var delta_y = Math.abs((camera_y - object_y));
    var delta_z = Math.abs((camera_z - object_z));
    var distance = Math.sqrt(Math.pow(delta_x,2)+Math.pow(delta_y,2)+Math.pow(delta_z,2));
    return(distance);

};

function ScaleOverlaySpheres(sphere_name,object_group,distance_from_group,scale_constant){

    var distance_from_planet = 0.0;
    var distance_from_planet = CalculateDistanceFromObject(camera.position.x,camera.position.y,
        camera.position.z,distance_from_group.position.x,distance_from_group.position.y,
        distance_from_group.position.z);
    object_group.getObjectByName(sphere_name,true).scale.x = (distance_from_planet)/scale_constant;
    object_group.getObjectByName(sphere_name,true).scale.y = (distance_from_planet)/scale_constant;
    object_group.getObjectByName(sphere_name,true).scale.z = (distance_from_planet)/scale_constant;


};

function ScalePlanet(planet,scale_constant){


    planet.parent_group.getObjectByName(planet.name,true).scale.x = scale_constant;
    planet.parent_group.getObjectByName(planet.name,true).scale.y = scale_constant;
    planet.parent_group.getObjectByName(planet.name,true).scale.z = scale_constant;


};

// Sets camera target point.
//This needs a lot of work...
function UpdateCameraLocation(){
    switch(options.CameraFocus){

        case 'Sun':
            controls.minDistance=2000;
            camera_position.x=0;
            camera_position.y=0;
            camera_position.z=0;
            break;
        case 'Mercury':
            controls.minDistance=100;
            
            camera_position.x=mercury_group.position.x;
            camera_position.y=mercury_group.position.y;
            camera_position.z=mercury_group.position.z;
            break; 
            //mercury_group.add(camera);
        case 'Venus':
            controls.minDistance=100;
            camera_position.x=venus_group.position.x;
            camera_position.y=venus_group.position.y;
            camera_position.z=venus_group.position.z;
            break;
        case 'Earth':
            controls.minDistance=100;
            camera_position.x=earth_group.position.x;
            camera_position.y=earth_group.position.y;
            camera_position.z=earth_group.position.z;
            break;
        case 'Mars':
            controls.minDistance=100;
            camera_position.x=mars_group.position.x;
            camera_position.y=mars_group.position.y;
            camera_position.z=mars_group.position.z;
            break;
        case 'Jupiter':
            controls.minDistance=100;
            camera_position.x=jupiter_group.position.x;
            camera_position.y=jupiter_group.position.y;
            camera_position.z=jupiter_group.position.z;
            break;
        case 'Saturn':
          controls.minDistance=100;
            camera_position.x=saturn_group.position.x;
            camera_position.y=saturn_group.position.y;
            camera_position.z=saturn_group.position.z;
            break;
        case 'Uranus':
          controls.minDistance=100;
            camera_position.x=uranus_group.position.x;
            camera_position.y=uranus_group.position.y;
            camera_position.z=uranus_group.position.z;
            break;
        case 'Neptune':
          controls.minDistance=100;
            camera_position.x=neptune_group.position.x;
            camera_position.y=neptune_group.position.y;
            camera_position.z=neptune_group.position.z;
            break;
        case 'Pluto':

            controls.minDistance=100;
            camera_position.x=pluto_group.position.x;
            camera_position.y=pluto_group.position.y;
            camera_position.z=pluto_group.position.z;
            break;

        default:
            camera_position.x=0;
            camera_position.y=0;
            camera_position.z=0; 
         
    }

}



// Where the magic happens: Takes a 3D planet_group in and planet physics object, and adjusts the position in the scene.
// Uses eulers angles and astrodynamics to compute keplerian elements to cartesian co-ordinates. Google was very helpful with getting head round some of the maths.
function AdjustPlanetLocation(group,planet){
  
    //var y = planet.semimajor_axis_scene()*Math.sin(planet.orbital_inclination*(Math.PI/180)) * Math.sin(planet.true_anamoly());
    var R = planet.semimajor_axis_scene() * (1-Math.pow(planet.orbital_eccentricity,2))/(1+(planet.orbital_eccentricity*Math.cos(planet.true_anamoly()+planet.argument_periapsis)));
    group.position.y = R*Math.sin(planet.orbital_inclination) * Math.sin(planet.true_anamoly()+planet.argument_periapsis);
    group.position.x = R*(Math.cos(planet.longitude_ascending)*Math.cos(planet.true_anamoly()+planet.argument_periapsis) - Math.sin(planet.longitude_ascending)*Math.sin(planet.true_anamoly()+planet.argument_periapsis))*Math.cos(planet.orbital_inclination);
    group.position.z = R*(Math.sin(planet.longitude_ascending)*Math.cos(planet.true_anamoly()+planet.argument_periapsis)+Math.cos(planet.longitude_ascending)*Math.sin(planet.true_anamoly()+planet.argument_periapsis))*Math.cos(planet.orbital_inclination);


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

function animate() {
  
    render();

    //Keep camera pointed at target.
    controls.target= camera_position;

    // Sun glow effect is calculated from view matrix so ensure as view matrix changes effect updates.
    sunGlow.material.uniforms.viewVector.value = 
          new THREE.Vector3().subVectors( camera.position, sunGlow.position );
    sun_mesh.material.uniforms.baseSpeed.value = options.sun_effect_speed;
    sun_mesh.material.uniforms.noiseScale.value = options.sun_effect_noise;
    sun_mesh.material.uniforms.time.value += Clock.getDelta();
    stats_fps.update();
    update();
    requestAnimationFrame(animate);


};

function render() {

    renderer.render( scene, camera );


};


// This encapsulates the majority of the physics and animations. Helpful to profile performance in chrome dev tools.
function update(){
  
  
    controls.update();
    controls.target= camera_position;
    UpdateCameraLocation();

    //Set Scaling Time from GUI
    SCALING_TIME = options.OrbitSpeedMultiplier;


    //Calculate orbits!

    AdjustPlanetLocation(mercury_group,Mercury);
    AdjustPlanetLocation(venus_group,Venus);
    AdjustPlanetLocation(earth_group,Earth);
    AdjustPlanetLocation(earth_moon_group,Moon);
    AdjustPlanetLocation(mars_group,Mars);
    AdjustPlanetLocation(jupiter_group,Jupiter);
    AdjustPlanetLocation(saturn_group,Saturn);
    AdjustPlanetLocation(uranus_group,Uranus);
    AdjustPlanetLocation(neptune_group,Neptune);
    AdjustPlanetLocation(pluto_group,Pluto);  
    if(CalculateDistanceFromObject(camera.position.x,camera.position.y,camera.position.z,0,0,0)>25000){
        this.sun_mesh.visible = false;
        this.sunGlow.visible = false;
    }
    else{
        this.sun_mesh.visible = true;
        this.sunGlow.visible = true;
    }
     
        
  
    //Scale Planets. This can definitely be optimised but not an issue atm. Optimise once per scaling update instead of once per frame.
 
    ScalePlanet(Mercury,options.PlanetScale);
    ScalePlanet(Venus,options.PlanetScale);
    ScalePlanet(Earth,options.PlanetScale);
    ScalePlanet(Mars,options.PlanetScale);
    ScalePlanet(Jupiter,options.PlanetScale);
    ScalePlanet(Saturn,options.PlanetScale);
    ScalePlanet(Neptune,options.PlanetScale);
    ScalePlanet(Uranus,options.PlanetScale);
    ScalePlanet(Pluto,options.PlanetScale);
    // Also can be optimised. Same as above.

    ScaleOverlaySpheres('Mercury_text',mercury_group,mercury_group,ZOOM_SCALE_FACTOR);
    ScaleOverlaySpheres('Venus_text',venus_group,venus_group,ZOOM_SCALE_FACTOR);
    ScaleOverlaySpheres('Earth_text',earth_group,earth_group,ZOOM_SCALE_FACTOR);
    ScaleOverlaySpheres('Moon_text',earth_moon_group,earth_group,ZOOM_SCALE_FACTOR);
    ScaleOverlaySpheres('Mars_text',mars_group,mars_group,ZOOM_SCALE_FACTOR);
    ScaleOverlaySpheres('Jupiter_text',jupiter_group,jupiter_group,ZOOM_SCALE_FACTOR);
    ScaleOverlaySpheres('Saturn_text',saturn_group,saturn_group,ZOOM_SCALE_FACTOR);
    ScaleOverlaySpheres('Uranus_text',uranus_group,uranus_group,ZOOM_SCALE_FACTOR);
    ScaleOverlaySpheres('Neptune_text',neptune_group,neptune_group,ZOOM_SCALE_FACTOR);
    ScaleOverlaySpheres('Pluto_text',pluto_group,pluto_group,ZOOM_SCALE_FACTOR);


    // Give sun a bit of rotation per frame.
    sun_mesh.rotation.y += 0.0005;
  
  
  
};
