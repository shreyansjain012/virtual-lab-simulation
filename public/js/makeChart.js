let myChart = document.getElementById('myChart').getContext('2d');

const pi = Math.PI;

// Kinetic data for saponification of ethyl acetate
let A = 3.23 * Math.pow(10,7); // Frequency factor (L/mol.s)
let Ea = 11.55; // Activation energy (Kcal/mol)
let R = 8.314 // Si units
var Fa = 12, Fb = 12, Na = 0.1, Nb = 0.1;

// change variables

function getRateConstant (T) {
    // Arrhenius equation
    T = T + 273.15;
    return A*Math.exp(-Ea/(R*T)); 
}

function getPFRVolume () {
    let d = 3.5/100, l = 1;
    return pi * Math.pow(d,2) * l / 4; // v1 =  ko hata
}

function getCa0 (){
    
    return Fa * Na / (Fa + Fb);
}

function getCb0 (){
    
    return Fb * Nb / (Fa + Fb);
}

let mydata = [];

for(var t = 1; t<=100; t++){
    let dataPoint = {};
    dataPoint.x = t;
    let k = getRateConstant(t);
    let v1 = getPFRVolume();
    let Ca0 = getCa0();
    let Cb0 = getCb0();
    let M = Cb0/Ca0;
    let tau1 = v1 / (Fa + Fb);
    let Xa1 = -1;
    if(M > 1) {
        let theta = Math.exp(k*tau1*Ca0*(M-1));
        Xa1 = ((theta - 1) * M)/(theta*M - 1);
    }
    else if(M === 1){
        Xa1  = (k*Ca0*tau1)/(1 + k*Ca0*tau1 );
    }
    dataPoint.y = Xa1;
    mydata.push(dataPoint);
    console.log(dataPoint);
}
console.log(mydata);


let chart = new Chart(myChart, {
    type: 'scatter',
    data: {
        datasets: [{
        label: 'Scatter Dataset',
        data: mydata,
        backgroundColor: 'rgba(54,162,235,0.6)'
      }]
    },
    options: {
      responsive: false
    }
});