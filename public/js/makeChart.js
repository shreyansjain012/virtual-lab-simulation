let myChart = document.getElementById('myChart').getContext('2d');
const pi = Math.PI;

function rateConstant (A,Ea,R,T) {
    // Arrhenius equation
    T = T + 273;
    return A*Math.exp(-Ea/(R*T)); 
}

function pfrVol (d,l) {
    d = d/100;
    return pi * Math.pow(d,2) * l / 4 * 1000; 
}

function getCa0 (Fa, Fb, Na, Nb){
    
    return Fa * Na / (Fa + Fb);
}

function getCb0 (Fa, Fb, Na, Nb){
    
    return Fb * Nb / (Fa + Fb);
}

function myFunction() {
    // Kinetic data for saponification of ethyl acetate
    const A = 3.23 * Math.pow(10,7); // Frequency factor (L/mol.s)
    const Ea = 48325.2; // Activation energy (Joule/mol)
    const R = 8.314 // SI units
    
    // Input data
    let Fa = document.getElementById("fa").value;
    let Fb = document.getElementById("fb").value;
    const Na = document.getElementById("na").value;
    const Nb = document.getElementById("nb").value;
    const d = document.getElementById("pfrDiameter").value;
    const l = document.getElementById("pfrLength").value;
    const temperature = Number(document.getElementById('temperature').value);
    const minTemp = Number(document.getElementById('temperature').min);
    const maxTemp = Number(document.getElementById('temperature').max);
    
    // converting LPH in LPS
    Fa = Fa/(60*60);
    Fb = Fb/(60*60);

    // Creating dataset for chart
    const tempData = [], XaData = [];
    const len = maxTemp - minTemp + 1;

    for(let T = minTemp; T<=maxTemp; T++){
        tempData.push(T);
        let k = rateConstant(A, Ea, R, T);
        let v1 = pfrVol(d, l); 
        let Ca0 = getCa0(Fa, Fb, Na, Nb);
        let Cb0 = getCb0(Fa, Fb, Na, Nb);
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
                backgroundColor: new Array(len).fill('darkcyan'),
                borderColor: 'rgb(63, 182, 182)',
                fill: false,
                data: XaData,
                label: 'Xa vs. T',
                pointRadius: new Array(len).fill(3)
            }]
        },
        options: {
          responsive: false,
          scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
        }
    });

    // Changing input temperature color to red and increasing its radius to 5  
    let index = chart.data.labels.indexOf(temperature);
    chart.data.datasets[0].backgroundColor[index] = '#ff0000';
    chart.data.datasets[0].pointRadius[index] = 5;    
    chart.update();
}