// Kinetic data for saponification of ethyl acetate
const A = 3.23 * Math.pow(10,7); // Frequency factor (L/mol.s)
const Ea = 48325.2; // Activation energy (Joule/mol)
const R = 8.314 // universal gas constant in SI units

const pi = Math.PI;

// let myChart = document.getElementById('myChart').getContext('2d');

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


$(function(){
    let reactorType, newStr, Xa1=0;
    $('#pfr-menu').click(function(){
        reactorType = 'PFR';
        $('#menu').hide().fadeIn();
        $('#cstr-config').hide();
        $('#pfr-config').show();
        newStr = '<div class="pipe"></div><div class="reactor blue">'+ reactorType +'</div><div class="pipe"></div>';
    });
    
    $('#cstr-menu').click(function(){
        reactorType = 'CSTR';
        $('#menu').hide().fadeIn();
        $('#pfr-config').hide();
        $('#cstr-config').show();
        newStr = '<div class="pipe"></div><div class="reactor pink">'+ reactorType +'</div><div class="pipe"></div>';

    });

    $('#add-reactor').click(function(){
        $('.reactor-display').html(pipe(newStr));
        const temperature = 25;
        
        let Fa, Fb, Na, Nb, d, l, k, v1, v2, Ca0, Cb0, tau1, tau2;
        
        switch (reactorType) {
            case 'PFR':
                console.log(reactorType);
                Fa = Number(document.getElementById("fa").value)/(60*60); // converting LPH in LPS
                Fb = Number(document.getElementById("fb").value)/(60*60); // converting LPH in LPS
                Na = Number(document.getElementById("na").value);
                Nb = Number(document.getElementById("nb").value);
                d = Number(document.getElementById("pfrDia").value);
                l = Number(document.getElementById("pfrLen").value);
                k = rateConstant(A, Ea, R, temperature);
                v1 = pfrVol(d, l); 
                Ca0 = getCa0(Fa, Fb, Na, Nb);
                Cb0 = getCb0(Fa, Fb, Na, Nb);
                tau1 = v1 / (Fa + Fb);

                Xa1 = pfr(k, Ca0, Cb0, tau1, Xa1);
                break;

            case 'CSTR':
                console.log(reactorType);
                Fa = Number(document.getElementById("fa").value)/(60*60); // converting LPH in LPS
                Fb = Number(document.getElementById("fb").value)/(60*60); // converting LPH in LPS
                Na = Number(document.getElementById("na").value);
                Nb = Number(document.getElementById("nb").value);
                v2 = Number(document.getElementById('cstrVol').value);
                k = rateConstant(A, Ea, R, temperature);
                Ca0 = getCa0(Fa, Fb, Na, Nb);
                Cb0 = getCb0(Fa, Fb, Na, Nb);
                tau2 = v2 / (Fa + Fb);

                Xa1 = cstr (k, Ca0, Cb0, tau2, Xa1);
                break;

            default:
                console.log('Invalid reactor');
                break;
        }

        console.log(Xa1);  
    });
});

let str = '';
function pipe(newStr) {
    str = str+ newStr;
    return str;
}
