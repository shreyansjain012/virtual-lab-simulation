$(function(){
    let chartdata = JSON.parse(localStorage.getItem('chartdata'));
    let Xa_data = chartdata[0];
    let tau_data = chartdata[1];
    let str = '<tr><th>X<math><sub>a</sub></math></th><th>Tau (s)</th></tr>';
    for(let i=0; i < tau_data.length; i++){
        str += '<tr>';
        str += '<td>' + Xa_data[i].toPrecision(3) + '</td>';
        str += '<td>' + tau_data[i] + '</td>';
        str += '</tr>';
    }
    $('#table-1').html(str);
    $('#table-1 tr td').addClass('border');
    $('#table-1 tr th').addClass('border');
    localStorage.clear();
});
