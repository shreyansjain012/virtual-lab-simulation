


 console.log(document.getElementById("myText").value);
 





let myChart = document.getElementById('myChart').getContext('2d');

const pi = Math.PI;

// Kinetic data for saponification of ethyl acetate
let A = 3.23 * Math.pow(10,7); // Frequency factor (m3/mol.s)
let Ea = 48325.2; // Activation energy (Joule/mol)
let R = 8.314 // SI units
var Fa = 12/(60*60), Fb = 12/(60*60), Na = 0.1, Nb = 0.1;

// change variables

function rateConstant (T) {
    // Arrhenius equation
    return A*Math.exp(-Ea/(R*T)); 
}

function pfrVol () {
    let d = 3.5/100, l = 1;
    return pi * Math.pow(d,2) * l / 4 * 1000; 
}

function getCa0 (){
    
    return Fa * Na / (Fa + Fb);
}

function getCb0 (){
    
    return Fb * Nb / (Fa + Fb);
}

let tempData = [], XaData = [];
for(let t = 298; t<=313; t++){
    tempData.push(t);
    let k = rateConstant(t);
    let v1 = pfrVol(); 
    let Ca0 = getCa0();
    let Cb0 = getCb0();
    let M = Cb0/Ca0;
    let tau1 = v1 / (Fa + Fb);
    if(M > 1) {
        let theta = Math.exp(k*tau1*Ca0*(M-1));
        Xa1 = ((theta - 1) * M)/(theta*M - 1);
    }
    else if(M === 1){
        Xa1  = (k*Ca0*tau1)/(1 + k*Ca0*tau1 );
    }
    XaData.push(Xa1);
}

let chart = new Chart(myChart, {
    type: 'line',
    data: {
        labels: tempData,
        datasets: [{
            label: 'Xa vs. T',
            backgroundColor: 'rgb(0,176,80)',
            borderColor: 'rgba(0,176,80,0.6)',
            fill: false,
            data: XaData
        }]
    },
    options: {
      responsive: false
    }
});