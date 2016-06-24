// Calculate mean and true anamoly to find angle as a function of time as:
// I have already found x,y as a function of the angle.
// I have found the time period as a function of Newtons law of gravitation.

var GRAV_CONSTANT = 6.674E-11;
var SECONDS_IN_YEAR = 3.15576e7;
var SUN_MASS = 1.989e30; // Kilograms


var MERCURY_SEMIMAJOR_AXIS = 5.791e7; // 57.91e6 in reality...
var MERCURY_SEMIMINOR_AXIS = 5.667e7;
var MERCURY_ECCENTRICITY = 0.21;
var MERCURY_PERIAPSIS = (MERCURY_SEMIMAJOR_AXIS*(1-MERCURY_ECCENTRICITY));
var MERCURY_APOAPSIS = (MERCURY_SEMIMAJOR_AXIS*(1-MERCURY_ECCENTRICITY));
var MERCURY_MASS = 3.285e23;

var EARTH_ECCENTRCITIY = 0.0167;
var EARTH_SEMIMAJOR_AXIS = 1.496e8;



var Mercury_Orbital_Period;
var Earth_Orbital_Period;

var Mercury_Orbital_Speed; // Will be calculated in Radians per second.
var Earth_Orbital_Speed;

var x_ell = [];
var y_ell = [];

var Clock = new THREE.Clock();
var SCALING_TIME = 10;

Mercury_Orbital_Period = CalculateOrbitalPeriod(MERCURY_SEMIMAJOR_AXIS);
var Mercury_N = CalculateN(MERCURY_SEMIMAJOR_AXIS);
var Mt = CalculateMT(Mercury_N);
var EccentricAnom, TrueAnom;

Mercury_Orbital_Speed = (2*Math.PI)/Mercury_Orbital_Period;


//Equation of an ellipse:
//
// x = acos(theta)
// y = bsin(theta)
// Where a and b are the semimajor and semiminor_axis respectively


console.log(Mercury_Orbital_Period);
console.log(Mercury_Orbital_Speed);
console.log(Mercury_N);
console.log(Mt);

var y=0;
for (var i = 0; i < (2*Math.PI); (i = i + 0.01)) {

  x_ell[y] = MERCURY_SEMIMAJOR_AXIS*Math.cos(i) + (MERCURY_SEMIMAJOR_AXIS -MERCURY_PERIAPSIS);
  y++;
}
y=0;
for (var i = 0; i < (2*Math.PI); (i = i + 0.01)) {
  y_ell[y] = MERCURY_SEMIMINOR_AXIS*Math.sin(i);
  y++;
}



console.log(x_ell);
console.log(y_ell);
/*for (var i = 0; i < x_ell.length; i++) {
  $('body').append('<div>' + x_ell[i] + '</div>');
}
$('body').append('<br>');

for (var i = 0; i < y_ell.length; i++) {
  $('body').append('<div>' + y_ell[i] + '</div>');
} */

window.setInterval(function(){
EccentricAnom = KeplerSolve(MERCURY_ECCENTRICITY,CalculateMT(CalculateN(MERCURY_SEMIMAJOR_AXIS)));
TrueAnom = CalculateTrueAnamoly(EccentricAnom,MERCURY_ECCENTRICITY);
$("#Ecc_anom").html(EccentricAnom);
$("#True_anom").html(TrueAnom);
},200);



function CalculateOrbitalPeriod(semimajor_axis){

  var Orbital_Period = ((2*Math.PI*(Math.sqrt(Math.pow(semimajor_axis,3)/(GRAV_CONSTANT*SUN_MASS))))/1000)*SECONDS_IN_YEAR;
  return(Orbital_Period);

};

function CalculateN(semimajor_axis){
  
  var N = (Math.sqrt((GRAV_CONSTANT*SUN_MASS)/(Math.pow(semimajor_axis,3))));
  return(N);
  
};

function CalculateMT(n,t){
  
  var Mt = n*(Clock.getElapsedTime())*SCALING_TIME;
  return(Mt);
};

function KeplerStart(e,M){
  
  var t33,t35,t34;
  t34 = (Math.pow(e,2));
  t35 = e*t34;
  t33 = Math.cos(M);
  return((M+((-1/2*t35)+e+(t34+3/2*t33*t35)*t33)*Math.sin(M)));
  
};

function eps3(e,M,x){
  
  var t1,t2,t3,t4,t5;
  t1 = Math.cos(x);
  t2 = -1+e*t1;
  t3 = Math.sin(x);
  t4 = e*t3;
  t5 = -x+t4+M;
  t6 = t5/(1/2*t5*t4/t2+t2);
  return(t5/((1/2*t3 - 1/6*t1*t6)*e*t6+t2));
  
};

/*function CalculateTrueAnamoly(Eccentric_Anamoly,Eccentricity){
  
  var e1,e2;
  e1 = (Math.cos(Eccentric_Anamoly)-Eccentricity);
  e2 = (1-(Eccentricity*Math.cos(Eccentric_Anamoly)));
  return(Math.acos(e1/e2));
  
}; */

function CalculateTrueAnamoly(Eccentric_Anamoly,Eccentricity){
  
  var e1,e2,e3,e4,e5;
  e1 = Math.sqrt(1-Eccentricity);
  e2 = Math.cos(Eccentric_Anamoly/2);
  
  e3 = Math.sqrt(1+Eccentricity);
  e4 = Math.sin(Eccentric_Anamoly/2);
  
  e5 = 2*Math.atan2(e3*e4,e1*e2);
  
  return(e5);
  
  
  
};

function KeplerSolve(e,M){
  
  var DE,E,E0,Mnorm,count;
  var tol = 1.0e-14;
  Mnorm = M%(2*Math.PI);
  E0 = KeplerStart(e,Mnorm);
  DE = tol + 1;
  
  count = 0;
  while(DE>tol){
    E = E0 - eps3(e,Mnorm,E0);
    DE = Math.abs(E-E0);
    E0 = E;
    count++;
    if(count==100){
       console.log("Too many iterations!");
       break;
    }
    
    
  };
  return(E);
  
  
};