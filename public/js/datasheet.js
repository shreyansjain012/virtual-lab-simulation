$(function(){
    let data = JSON.parse(localStorage.getItem('data'));
    let tau_data = data.tau_data;
    let Xa_data1 = data.Xa_data1;
    let Xa_data2 = data.Xa_data2;
    let Xa_data3 = data.Xa_data3;
    let html = `
        <tr>
            <th>Tau</th>
            <th>Xa_data1</th>
            <th>Xa_data2</th>
            <th>Xa_data3</th>
        </tr>
    `;
    // for(let i=0; i < tau_data.length; i++){
    //     str += '<tr>';
    //     str += '<td>' + Xa_data[i].toPrecision(3) + '</td>';
    //     str += '<td>' + tau_data[i] + '</td>';
    //     str += '</tr>';
    // }
    // $('#table-1').html(str);
    // $('#table-1 tr td').addClass('border');
    // $('#table-1 tr th').addClass('border');
    // localStorage.clear();
});
