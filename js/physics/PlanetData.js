// Define some plantery data. This is used to calculate orbits according to Keplers laws.
// Package these as objects to make it more efficient...

const GRAV_CONSTANT = 6.674E-11;
const SECONDS_IN_YEAR = 3.15576e7;
const SUN_SIZE = 695;
const SUN_MASS = 1.989e30; // Kilograms
//var SCALING_TIME = 10.0;
const PLANET_SCALE = 10000;

//Prototype for planet objects. Encapsulates property and physics. Paired with 3d object.
function Planet(size,mass,semimajor_axis,semiminor_axis,orbital_eccentricity,orbital_inclination,mean_anamoly_epoch){
    
    //This is for ES5 compatability in safari. Would prefer to use default parameters as ES6 defines it but Chrome/Firefox have basic support currently.
    if(mean_anamoly_epoch === undefined){
        mean_anamoly_epoch = 0.0;
    }

    this.size = size;
    this.mass = mass;
    this.semimajor_axis = semimajor_axis;
    this.semiminor_axis = semiminor_axis;
    this.orbital_eccentricity = orbital_eccentricity;
    this.orbital_inclination = orbital_inclination;
    this.mean_anamoly_epoch = mean_anamoly_epoch*((Math.PI)/180); 
    
    this.semimajor_axis_scene = function(){return(this.semimajor_axis/PLANET_SCALE)};
    this.semiminor_axis_scene = function(){return(this.semiminor_axis/PLANET_SCALE)};
    this.periapsis = function(){return(this.semimajor_axis*(1-this.orbital_eccentricity))};
    this.apoapsis = function(){return(this.semimajor_axis*(1+this.orbital_eccentricity))};
    this.periapsis_scene = function(){return(this.periapsis()/PLANET_SCALE)};
    this.apoapsis_scene = function(){return(this.apoapsis()/PLANET_SCALE)};

    this.eccentric_anamoly = function(){return( KeplerSolve(this.orbital_eccentricity,CalculateMT(CalculateN(this.semimajor_axis))))};
    this.true_anamoly = function(){return(CalculateTrueAnamoly(this.eccentric_anamoly(),this.orbital_eccentricity,true)+this.mean_anamoly_epoch)};
};


const MERCURY_SIZE = 2.4;
const MERCURY_SEMIMAJOR_AXIS = 5.791e7; // 57.91e6 in reality...
const MERCURY_SEMIMINOR_AXIS = 5.667e7;
const MERCURY_ECCENTRICITY = 0.21;
const MERCURY_MASS = 3.285e23;
const MERCURY_HELIOCENTRIC_INCLINATION = 7;
const MERCURY_MEAN_ANAMOLY_EPOCH = 252.25;

const VENUS_SIZE = 6;
const VENUS_SEMIMAJOR_AXIS = 108.2089e6;
const VENUS_SEMIMINOR_AXIS = 108.2064e6;
const VENUS_ECCENTRICITY = 0.0067;
const VENUS_MASS = 4.867e24; 
const VENUS_HELIOCENTRIC_INCLINATION = 3.86;
const VENUS_MEAN_ANAMOLY_EPOCH = 181.98;


const EARTH_SIZE = 6.1;
const EARTH_SEMIMAJOR_AXIS = 149.598e6;
const EARTH_SEMIMINOR_AXIS = 149.577e6;
const EARTH_ECCENTRICITY = 0.0167;
const EARTH_MASS = 5.972e24; 
const EARTH_HELIOCENTRIC_INCLINATION = 7.155;
const EARTH_MEAN_ANAMOLY_EPOCH = 100.46;

const EARTH_MOON_SIZE = 1.73;
const EARTH_MOON_SEMIMAJOR_AXIS = 0.384e6;
const EARTH_MOON_SEMIMINOR_AXIS = 0.3633e6;
const EARTH_MOON_ECCENTRICITY = 0.0549;
const EARTH_MOON_MASS = 0.07346e24;
const EARTH_MOON_HELIOCENTRIC_INCLINATION = 5.145;

const MARS_SIZE = 3.4;
const MARS_SEMIMAJOR_AXIS = 227.937e6;
const MARS_SEMIMINOR_AXIS = 226.94e6;
const MARS_ECCENTRICITY = 0.0934;
const MARS_MASS = 6.417e23; 
const MARS_HELIOCENTRIC_INCLINATION = 5.65;
const MARS_MEAN_ANAMOLY_EPOCH = 355.45;


const JUPITER_SIZE = 69.9;
const JUPITER_SEMIMAJOR_AXIS = 778e6;
const JUPITER_SEMIMINOR_AXIS = 777.5e6;
const JUPITER_ECCENTRICITY = 0.049;
const JUPITER_MASS = 1.9e27; 
const JUPITER_HELIOCENTRIC_INCLINATION = 6.09;
const JUPITER_MEAN_ANAMOLY_EPOCH = 34.4;


const SATURN_SIZE = 58.2;
const SATURN_SEMIMAJOR_AXIS = 1.427e9;
const SATURN_SEMIMINOR_AXIS = 1.425e9;
const SATURN_ECCENTRICITY = 0.0542;
const SATURN_MASS = 5.683e26; 
const SATURN_HELIOCENTRIC_INCLINATION = 5.51;
const SATURN_MEAN_ANAMOLY_EPOCH = 49.94;


const URANUS_SIZE = 25.36;
const URANUS_SEMIMAJOR_AXIS = 2.871e9;
const URANUS_SEMIMINOR_AXIS = 2.8678e9;
const URANUS_ECCENTRICITY = 0.047167;
const URANUS_MASS = 8.68103e25; 
const URANUS_HELIOCENTRIC_INCLINATION = 6.48;
const URANUS_MEAN_ANAMOLY_EPOCH = 313.23;


const NEPTUNE_SIZE = 24.62;
const NEPTUNE_SEMIMAJOR_AXIS = 4.495e9;
const NEPTUNE_SEMIMINOR_AXIS = 4.495e9;
const NEPTUNE_ECCENTRICITY = 0.00934;
const NEPTUNE_MASS = 1e26; 
const NEPTUNE_HELIOCENTRIC_INCLINATION = 6.43;
const NEPTUNE_MEAN_ANAMOLY_EPOCH = 304.88;

const PLUTO_SIZE = 1.186;
const PLUTO_SEMIMAJOR_AXIS = 5.906e9;
const PLUTO_SEMIMINOR_AXIS = 5.7203e9;
const PLUTO_ECCENTRICITY = 0.2488;
const PLUTO_MASS = 1.3e22; 
const PLUTO_HELIOCENTRIC_INCLINATION = 17;
const PLUTO_MEAN_ANAMOLY_EPOCH = 0; // Couldn't find any data on plutos mean anom at epoch :-(

/////////////////////////





