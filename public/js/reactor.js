// Kinetic data for saponification of ethyl acetate
const A = 3.23 * Math.pow(10,7); // Frequency factor (L/mol.s)
const Ea = 48325.2; // Activation energy (Joule/mol)
const R = 8.314 // universal gas constant in SI units

// Variables which are used throughout the code
const color1 = 'rgb(54, 162, 235)'; // blue
const color2 = 'rgb(75, 192, 10)';  // green
const color3 = 'rgb(255, 99, 132)'; // red
const pi = Math.PI;
const myChart = document.getElementById('canvas-1').getContext('2d');

let chart;

$(function(){
    let flag = false, reactorType, reactors = [];
    let Fa, Fb, Na, Nb, k1, k2, k3, temp1, temp2, temp3, Ca0, Cb0, Xa=0;

    function setparmeters(){

        Fa = Number(document.getElementById("fa").value)/(60*60); // converting LPH in LPS
        Fb = Number(document.getElementById("fb").value)/(60*60); // converting LPH in LPS
        Na = Number(document.getElementById("na").value);
        Nb = Number(document.getElementById("nb").value);
        temp1 =  Number(document.getElementById("temp-range").value);
        temp2 = temp1+5;
        temp3 = temp1-5;
        k1 = rateConstant(A, Ea, R, temp1);
        k2 = rateConstant(A, Ea, R, temp2);
        k3 = rateConstant(A, Ea, R, temp3);
        Ca0 = getCa0(Fa, Fb, Na, Nb);
        Cb0 = getCb0(Fa, Fb, Na, Nb);

    }

    function setpfr(){

        let d, l, v1, tau1;
        d = Number(document.getElementById("pfrDia").value);
        l = Number(document.getElementById("pfrLen").value);
        v1 = pfrVol(d, l); 
        tau1 = v1 / (Fa + Fb);   
        tau += tau1;
        Xa = pfr(k1, Ca0, Cb0, tau1, Xa);
    }
    
    function setcstr(){

        let v2, tau2;
        v2 = Number(document.getElementById('cstrVol').value);
        tau2 = v2 / (Fa + Fb);    
        tau += tau2;
        Xa = cstr(k1, Ca0, Cb0, tau2, Xa);

    }

    function displayResult(){
        
        $('#res-config').show();
        $('#res-1').html(Xa.toPrecision(6));
        $('#res-2').html(tau.toPrecision(6) + ' s');
        
    }

    //variables for creating the chart data
    let tau=0, dataSize = 25;
    let tau_data = new Array(dataSize); 
    let Xa_data1 = new Array(dataSize);
    let Xa_data2 = new Array(dataSize);
    let Xa_data3 = new Array(dataSize);
    tau_data.fill(0);
    Xa_data1.fill(0);
    Xa_data2.fill(0); 
    Xa_data3.fill(0);
    
    function createData(){
        let tauMin = Math.floor(tau*0.1/reactors.length);
        let tauMax = Math.floor(tau*10/reactors.length);
        let increment = Math.ceil((tauMax - tauMin)/dataSize);
        
        for(let i=0; i<reactors.length; i++){
            let j=0;
            for(let currTau=tauMin; currTau<=tauMax; currTau+=increment){
                tau_data[j] += currTau;
                if(reactors[i] === 'CSTR') {
                    Xa_data1[j] = cstr(k1, Ca0, Cb0, currTau, Xa_data1[j]);
                    Xa_data2[j] = cstr(k2, Ca0, Cb0, currTau, Xa_data2[j]);
                    Xa_data3[j] = cstr(k3, Ca0, Cb0, currTau, Xa_data3[j]);
                }
                else {
                    Xa_data1[j] = pfr(k1, Ca0, Cb0, currTau, Xa_data1[j]);
                    Xa_data2[j] = pfr(k2, Ca0, Cb0, currTau, Xa_data2[j]);
                    Xa_data3[j] = pfr(k3, Ca0, Cb0, currTau, Xa_data3[j]);
                }
                j++;
            }
        }
    }

    $('#next-btn').click(function (){
        
        setparmeters();
        $('#menu-1').hide();
        $('#menu-2').fadeIn();

    });

    $('#pfr-btn').click(function(){
        
        reactorType = 'PFR';
        reactors.push(reactorType);
        displayPipe(reactorType);
        setpfr();

    });
    
    $('#cstr-btn').click(function(){
        
        reactorType = 'CSTR';
        reactors.push(reactorType);
        displayPipe(reactorType);
        setcstr();       

    });

    $('#draw-btn').click(function () {
        flag = true; // for preventing directly going to datasheet

        displayResult();
        createData();
        
        // code to display chart
        chart = new Chart(myChart, {
            type: 'line',
            data: {
                labels: tau_data,
                datasets: [{
                    backgroundColor: color2,
                    borderColor: color2,
                    data: Xa_data2,
                    fill: false,
                    label: 'T = '+ temp2 + '°C' ,
                }, {
                    backgroundColor: color1,
                    borderColor: color1,
                    data: Xa_data1,
                    fill: false,
                    label: 'T = '+ temp1 + '°C',
                }, {
                    backgroundColor: color3,
                    borderColor: color3,
                    data: Xa_data3,
                    fill: false,
                    label: 'T = '+ temp3 + '°C',
                }]
            },
            options: {
                responsive: false,
                scales: {
                    ticks: {    
                        stepSize: 15
                    },
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: "Conversion, Xa"
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Overall residence time, 𝜏 (s)"
                        }
                    }]
                }
            }
        });    
    });

    $('#data-btn').click(async function(){
        
        if(flag === false){
            if(confirm('Are you sure?')){
                $('#draw-btn').click();
                flag = true;
            }
            else {
                flag = false;
            }
        }
        if(flag === true){
            let data = {tau_data, Xa_data1, Xa_data2, Xa_data3}
            localStorage.setItem('data', JSON.stringify(data));
        } 
    });
});

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
 * @param   (Number)    Xa      conversion from previous reactor
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
        return a/b;
        
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
 * @param   (Number)    Xa      conversion from previous reactor
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

/*
 * updates html code for pipe flow 
 * 
 * @param   (string)    reactorType     type of reactor ie. CSTR or PFR
 *    
 * @return  (string)    updated string str
 */
let pipehtml = '';
function displayPipe(reactorType){
    let pipeStr;
    if(reactorType === 'PFR'){
        pipeStr = '<div class="pipe"></div><div class="reactor blue">'+ reactorType +'</div><div class="pipe"></div>';
    }else {
        pipeStr = '<div class="pipe"></div><div class="reactor pink">'+ reactorType +'</div><div class="pipe"></div>'; 
    }
    pipehtml += pipeStr
    $('.reactor-display').html(pipehtml).hide().fadeIn();
}

    // $('#reset-btn').click(function(){
    //     if(confirm('Are you sure?')){
    //         str = '';
    //         $('.reactor-display').html(str);
    //         tau_data.fill(0), Xa_data1.fill(0), Xa_data2.fill(0), Xa_data3.fill(0);
    //         Xa = 0, tau = 0;
    //         $('#res-config').hide();
    //         chart.update();
    //     }
    // });