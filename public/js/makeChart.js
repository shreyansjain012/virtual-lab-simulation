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
    let A = 3.23 * Math.pow(10,7); // Frequency factor (L/mol.s)
    let Ea = 48325.2; // Activation energy (Joule/mol)
    let R = 8.314 // SI units
    
    // Input data
    let Fa = document.getElementById("fa").value;
    let Fb = document.getElementById("fb").value;
    let Na = document.getElementById("na").value;
    let Nb = document.getElementById("nb").value;
    let d = document.getElementById("pfrDiameter").value;
    let l = document.getElementById("pfrLength").value;
    let temperature = document.getElementById('temperature').value;
    // converting LPH in LPS
    Fa = Fa/(60*60);
    Fb = Fb/(60*60);

    // Creating dataset for chart
    let tempData = [], XaData = [];
    for(let T = 25; T<=40; T++){
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
                backgroundColor: [],
                label: 'Xa vs. T',
                borderColor: '#5a66d362',
                fill: false,
                data: XaData
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

    // Changing color to red of input temperature
    chart.data.labels.forEach(function (item){
        if(item == temperature ){
            chart.data.datasets[0].backgroundColor.push('#ff0000');
        }
        else {
            chart.data.datasets[0].backgroundColor.push('#5a66d3');
        }
        chart.update();
    });   
}
