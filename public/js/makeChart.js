// Kinetic data for saponification of ethyl acetate
const A = 3.23 * Math.pow(10,7); // Frequency factor (L/mol.s)
const Ea = 48325.2; // Activation energy (Joule/mol)
const R = 8.314 // universal gas constant in SI units

const pi = Math.PI;

let myChart = document.getElementById('myChart').getContext('2d');

/*
 * Uses Arrhenius equation to calculate the rate constant for a reaction 
 *
 * @param   (Number)    A    frequency factor
 * @param   (Number)    Ea   activation energy for the reaction 
 * @param   (Number)    R    universal gas constant
 * @param   (Number)    T    temperature during reaction     
 *    
 * @return  (Number)    rate constant of a reaction
 */
function rateConstant (A,Ea,R,T) {
    T = T + 273; // temperature conversion
    return A*Math.exp(-Ea/(R*T)); 
}

/*
 * PFR volume is given by pi*(r^2)*l
 *
 * @param   (Number)    d    diameter of PFR
 * @param   (Number)    l    length of PFR
 *    
 * @return  (Number)    Volume of PFR 
 */
function pfrVol (d,l) {
    d = d/100;  // cm to m conversion
    return pi * Math.pow(d,2) * l / 4 * 1000; 
}


/*
 * @param   (Number)    Fa    molar flow rate of A
 * @param   (Number)    Fb    molar flow rate of B
 * @param   (Number)    Na    normality of A
 * @param   (Number)    Nb    normality of B
 *    
 * @return  (Number)    initial concentration of A 
 */
function getCa0 (Fa, Fb, Na, Nb){  
    return Fa * Na / (Fa + Fb);
}

/*
 * @param   (Number)    Fa    molar flow rate of A
 * @param   (Number)    Fb    molar flow rate of B
 * @param   (Number)    Na    normality of A
 * @param   (Number)    Nb    normality of B
 *    
 * @return  (Number)    initial concentration of B
 */
function getCb0 (Fa, Fb, Na, Nb){    
    return Fb * Nb / (Fa + Fb);
}

/*
 * @param   (Number)    k       rate constant
 * @param   (Number)    Ca0     initial conc. of A
 * @param   (Number)    Cb0     initial conc. of B
 * @param   (Number)    tau1    time constant of PFR
 * @param   (Number)    Xa1     conversion from previous reactor
 *    
 * @return  (Number)    conversion from PFR
 */
function pfr (k, Ca0, Cb0, tau1, Xa1) {
    let M = Cb0/Ca0;
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

/*
 * @param   (Number)    k       rate constant
 * @param   (Number)    Ca0     initial conc. of A
 * @param   (Number)    Cb0     initial conc. of B
 * @param   (Number)    tau2    time constant of CSTR
 * @param   (Number)    Xa1     conversion from previous reactor
 *    
 * @return  (Number)    conversion from CSTR 
 */
function cstr (k, Ca0, Cb0, tau2, Xa1) {
    let M = Cb0/Ca0;

    // solving quadratic equation ax^2 + bx + c = 0
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

function myFunction() {   
    // Input data
    const Fa = Number(document.getElementById("fa").value)/(60*60); // converting LPH in LPS
    const Fb = Number(document.getElementById("fb").value)/(60*60); // converting LPH in LPS
    const Na = Number(document.getElementById("na").value);
    const Nb = Number(document.getElementById("nb").value);
    const d = Number(document.getElementById("pfrDiameter").value);
    const l = Number(document.getElementById("pfrLength").value);
    const temperature = Number(document.getElementById('temperature').value);
    const minTemp = Number(document.getElementById('temperature').min);
    const maxTemp = Number(document.getElementById('temperature').max);
    const v2 = Number(document.getElementById('cstrVolume').value);


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
                Xa1 = pfr(k, Ca0, Cb0, tau1, Xa1);
                break;
            case 'cstr':
                Xa1 = cstr (k, Ca0, Cb0, tau2, Xa1);
                break;
            case 'cstr-pfr':
                Xa1 = cstr (k, Ca0, Cb0, tau2, Xa1);
                Xa1 = pfr(k, Ca0, Cb0, tau1, Xa1);
                break;
            case 'pfr-cstr':
                Xa1 = pfr(k, Ca0, Cb0, tau1, Xa1);
                Xa1 = cstr (k, Ca0, Cb0, tau2, Xa1);
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