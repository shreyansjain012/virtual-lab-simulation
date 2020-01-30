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

function cstrEqn (k, Ca0, Cb0, tau2, Xa1) {
    let M = Cb0/Ca0;
    let a = 1;
    let b = (M+1)+1/(k*tau2*Ca0);
    let c = M + Xa1/(k*tau2*Ca0);
    
    let res1 = (b + Math.sqrt(b*b - 4*a*c))/(2*a);
    let res2 = (b - Math.sqrt(b*b - 4*a*c))/(2*a);

    if(res1 > Xa1 && res1 <= 1){
        return res1;
    }
    else {
        return res2;
    }
}

function pfrEqn (k, Ca0, Cb0, tau1, Xa1) {
    let M = Cb0/Ca0;
    console.log('k = ' + k + ' Ca0 = ' + Ca0 + ' Cb0 = ' + Cb0 + ' tau1 = ' + tau1 + ' M = ' + M);
    if(M < 1){
        let a = (M - Xa1) * Math.exp(k*tau1*Ca0*(M-1)) - (1 - Xa1) * M;  
        let b = (M - Xa1) * Math.exp(k*tau1*Ca0*(M-1)) - (1 - Xa1);
        return a/b;
    } 
    else if(M === 1){
        let a = (k*tau1*Ca0)*(1-Xa1) + Xa1;
        let b = 1 + k*tau1*Ca0*(1-Xa1);
        return a/b
        
    }
    else {
        console.log('Flow rate of NaoH cannot be less than flow rate of Ethyl Acetate');
    }
}

let reactorList = [];

function addpfr() {
    reactorList.push('pfr');
}

function addcstr(){
    reactors.push('cstr');
}



function myFunction() {
    // Kinetic data for saponification of ethyl acetate
    const A = 3.23 * Math.pow(10,7); // Frequency factor (L/mol.s)
    const Ea = 48325.2; // Activation energy (Joule/mol)
    const R = 8.314 // SI units
    
    // Input data
    let Fa = Number(document.getElementById("fa").value);
    let Fb = Number(document.getElementById("fb").value);
    let Na = Number(document.getElementById("na").value);
    let Nb = Number(document.getElementById("nb").value);
    let d = Number(document.getElementById("pfrDiameter").value);
    let l = Number(document.getElementById("pfrLength").value);
    let temperature = Number(document.getElementById('temperature').value);
    let minTemp = Number(document.getElementById('temperature').min);
    let maxTemp = Number(document.getElementById('temperature').max);
    let v2 = Number(document.getElementById('cstrVolume').value);

    
    // converting LPH in LPS
    Fa = Fa/(60*60);
    Fb = Fb/(60*60);

    // Creating dataset for chart
    const tempData = [], XaData = [];
    const len = maxTemp - minTemp + 1;

    var myReactor;
    const reactorType = document.getElementsByName('reactor-type');
    for(let i = 0; i < reactorType.length; i++) {
        if(reactorType[i].checked) {
            myReactor = reactorType[i].value;
        }
    }

    for(let T = minTemp; T<=maxTemp; T++){
        let Xa1 = 0;
        // solving for pfr
        let k = rateConstant(A, Ea, R, T);
        let v1 = pfrVol(d, l); 
        let Ca0 = getCa0(Fa, Fb, Na, Nb);
        let Cb0 = getCb0(Fa, Fb, Na, Nb);
        let tau1 = v1 / (Fa + Fb);
        let tau2 = v2 / (Fa + Fb);

        switch (myReactor) {
            case 'pfr':
                Xa1 = pfrEqn(k, Ca0, Cb0, tau1, Xa1);
                break;
            case 'cstr':
                Xa1 = cstrEqn (k, Ca0, Cb0, tau2, Xa1);
                break;
            case 'cstr-pfr':
                Xa1 = cstrEqn (k, Ca0, Cb0, tau2, Xa1);
                Xa1 = pfrEqn(k, Ca0, Cb0, tau1, Xa1);
                break;
            case 'pfr-cstr':
                Xa1 = pfrEqn(k, Ca0, Cb0, tau1, Xa1);
                Xa1 = cstrEqn (k, Ca0, Cb0, tau2, Xa1);
                break;
        }
        console.log('Xa2: ' + Xa1);
        // showCalculation();
        tempData.push(T);
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
    chart.data.datasets[0].backgroundColor[index] = 'darkblue';
    chart.data.datasets[0].pointRadius[index] = 5;    
    chart.update();
}