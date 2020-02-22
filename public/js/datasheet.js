$(function(){
    let data = JSON.parse(localStorage.getItem('data'));
    let tau_data = data.tau_data;
    let Xa_data1 = data.Xa_data[0];
    let Xa_data2 = data.Xa_data[1];
    let Xa_data3 = data.Xa_data[2];
    let str = `
        <tr>
            <th>Tau(s)</th>
            <th>Xa(${data.temps[2]}°C)</th>
            <th>Xa(${data.temps[0]}°C)</th>
            <th>Xa(${data.temps[1]}°C)</th>
        </tr>
    `;
    for(let i=0; i < tau_data.length; i++){
        str += `
            <tr>
                <td>${tau_data[i]}</td>
                <td>${Xa_data3[i].toPrecision(3)}</td>
                <td>${Xa_data1[i].toPrecision(3)}</td>
                <td>${Xa_data2[i].toPrecision(3)}</td>
            </tr>
            `;
    }
    $('#table-1').html(str);
    $('#table-1 tr td').addClass('border');
    $('#table-1 tr th').addClass('border');
    // localStorage.clear();
});
