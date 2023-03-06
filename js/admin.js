var members_email =[];


function get_naga_members(){

    document.getElementById('admin_members_table').innerHTML=`
    <tr><th>Email</th>
    <th>Name</th>
    <th>Address</th>
    <th>Phone Number</th>
    <th>Admin</th>
    <th width=120>Actions</th>
    </tr><tr id='member_list'></tr></table>`;

    const api_url = 'https://g1t81zygbh.execute-api.us-east-1.amazonaws.com/prod/get_naga_members';
    var member_list = document.getElementById('member_list');
    
      
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        
        console.log(JSON.stringify(response));
        
        response['body']['Items'].forEach(element => {
            email=JSON.stringify(element['email']['S']).replace(/["']/g, "");
            members_email.unshift(email);
            first_name=JSON.stringify(element['first_name']['S']).replace(/["']/g, "");
            last_name=JSON.stringify(element['last_name']['S']).replace(/["']/g, "");
            street_address=JSON.stringify(element['street_address']['S']).replace(/["']/g, "");
            city=JSON.stringify(element['city']['S']).replace(/["']/g, "");
            province=JSON.stringify(element['province']['S']).replace(/["']/g, "");
            postal_code=JSON.stringify(element['postal_code']['S']).replace(/["']/g, "");
            phone_number=JSON.stringify(element['phone_number']['S']).replace(/["']/g, "");
            if(JSON.stringify(element['admin'])) { admin=JSON.stringify(element['admin']['BOOL']); } else {admin="";} 
            full_name=first_name + " " + last_name;
            full_address=street_address + "<br>" + city + ", " + province + "<br>" + postal_code;
            actions="<input type=button onclick='remove_member(\""+email+"\")' value='Remove'>";
            
            member_list.insertAdjacentHTML('beforebegin', `<tr>
                <td>${email}</td>
                <td>${full_name}</td>
                <td>${full_address}</td>
                <td>${phone_number}</td>
                <td>${admin} </td>
                <td>${actions}</td>
            </tr>`); 

        });
      
    })


}


function get_plots()
{
    document.getElementById('all_plots').innerHTML='<div id="all_plots_start"></div>';
    const api_url = 'https://q1ycf9s40a.execute-api.us-east-1.amazonaws.com/prod';
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => { 

        plot_types=JSON.parse(response); row=0;
        plot_types.forEach(plot_type => {
            row++
            document.getElementById('all_plots_start').insertAdjacentHTML('beforebegin', `
            <h3>${plot_type['Title']}</h3>

            <table class="list">
                <tr id="plots_row_${row}">
                <th>Plot Number</th>
                <th>Current occupant</th>
                <th>Actions</th>
                </tr>
            </table><br><br>
            `);
            
            plot_type['Body'].forEach(plot => {
                
                // Assign plot workflow
                plot_id=plot['plotId']['S'];
                occupant_form = (`
                <div  id='plot_assign_top_${plot_id}'>${plot['occupant']['S'] }</div>
                <div id='plot_assign_bottom_${plot_id}' style='display:none'>
                    Select from waiting list:
                    <br><select onchange='select_from_waiting_list("${plot_id}")' id='select_from_waiting_list_${plot_id}'><option></option></select>
                    <br><br>Email address:
                    <div class='autocomplete'><input id='occupant_${plot_id}' type='text' name='occupant_${plot_id}' value='${plot['occupant']['S'] }'></div>
                    <br><br><input type='button'  onclick='assign_plot("${plot_id}",document.getElementById("occupant_${plot_id}").value);' value='Submit'>  
                    <input type='button'  onclick='close_assign_window("${plot_id}")' value='Cancel 'style='background-color:tomato'><br><br></div>
                `)

                document.getElementById("plots_row_"+row).insertAdjacentHTML('afterend', `<tr>
                <td width>${plot_id}</td>
                <td width>${occupant_form}</td>
                <td valign=top>
                <input type='button' onclick='open_assign_window("${plot['plotId']['S']}","${plot['plot_type']['S'] }")' value='Assign'>
                <input type='button' onclick='remove_plot("${plot['plotId']['S']}")' value='Remove'>
                </td>
                </tr>`);

                // autocomplete(document.getElementById("occupant_"+ plot_id), members_email);
                

            });

        });

        
    });

}

function assign_plot(plot_id, email){
    
    
    fetch('https://q1hk67hzpe.execute-api.us-east-1.amazonaws.com/prod/', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "plotId": plot_id,
        "occupant":email
    })
    })
    .then(response => response.json())
    .then(response => { 
        
        console.log(JSON.stringify(response));
        delete_from_waiting_list(email);
        get_plots();
        
        
    
    })
    

    
}

function add_plot()
  {
    
    plotId = document.getElementById('input_plotId').value;
    plot_type = document.getElementById('input_plot_type').value;
    
    fetch('https://phpiuxuth7.execute-api.us-east-1.amazonaws.com/prod', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "plotId": plotId,
        "plot_type":plot_type
    })
    })
    .then(response => response.json())
    .then(response => { console.log(JSON.stringify(response));get_plots();})
    
    
  }

function remove_plot(plot_id){if(confirm("Are you sure you want to remove this plot? This cannot be undone.")==true){
    email = document.getElementById('member_email').innerHTML;
    const api_url = ' https://un7umkeqkc.execute-api.us-east-1.amazonaws.com/prod/remove_plot?plotId='+plot_id;
    
  
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {console.log(JSON.stringify(response)); get_plots();})
  
}
}


  function open_assign_window(plot_id,plot_type){

    const api_url = 'https://omwtz3crjb.execute-api.us-east-1.amazonaws.com/prod';
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => { 
        response=JSON.parse(response);
        console.log(response);
        response.forEach(element => {
        
        if(element['Title']==plot_type){
            
            element['Body'].forEach(item => {

                console.log(item)
                
                var select = document.getElementById("select_from_waiting_list_"+plot_id);
                var el = document.createElement("option");
                el.textContent = item['place']['N'] + " " + JSON.stringify(item['email']['S']).replace(/["']/g, "");
                el.value = JSON.stringify(item['email']['S']).replace(/["']/g, "");
                select.appendChild(el);
                
            });
        }
        

    });

   
    document.getElementById("plot_assign_top_" + plot_id).style.display="none";
    document.getElementById("plot_assign_bottom_" + plot_id).style.display="block";

    
    })

    


    

  }


function close_assign_window(plot_id){
    document.getElementById("plot_assign_top_" + plot_id).style.display="block";
    document.getElementById("plot_assign_bottom_" + plot_id).style.display="none";
  }



function select_from_waiting_list(plot_id){
    value=document.getElementById("select_from_waiting_list_"+plot_id).value;
    document.getElementById("occupant_"+plot_id).value=value;
  
}


function get_waiting_list()
{
    document.getElementById('all_waiting_lists').innerHTML='<div id="waiting_list"></div>';
    const api_url = 'https://omwtz3crjb.execute-api.us-east-1.amazonaws.com/prod';
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {  
        
        plot_types=JSON.parse(response); row=0;
        plot_types.forEach(plot_type => {
            
            row++
            document.getElementById('waiting_list').insertAdjacentHTML('beforebegin', `
            <h3>${plot_type['Title']}</h3>

            <table class="list">
                <tr id="waiting_list_row_${row}">
                <th>Position</th>
                <th>Email</th>
                <th>Plot Number</th>
                <th>Current member</th>
                <th>Date joined</th>
                <th>Actions</th>
                </tr>
                <tr></tr>
                <tr id="no_plots_${row}">
                </tr>
            </table><br><br>
            `);
            
            plot_type['Body'].forEach(plot => {
                
                document.getElementById("waiting_list_row_"+row).insertAdjacentHTML('afterend', `<tr>
                <td width>${plot['place']['N']}</td>
                <td>${plot['email']['S']}</td>
                <td width>${plot['plot_number']['S']}</td>
                <td width>${plot['has_plots']['BOOL']}</td>
                <td width>${plot['date_added']['S']}</td>
                <td width><input type='button' onclick='delete_from_waiting_list(\"${plot['email']['S']}\")' value='Remove'></td>
                </tr>`);
            });

        });
    
    });

}

function add_member(){
    
    email=document.getElementById('admin_input_email').value;
    first_name=document.getElementById('admin_input_first_name').value;
    last_name=document.getElementById('admin_input_last_name').value;
    street_address=document.getElementById('admin_input_street_address').value;
    city=document.getElementById('admin_input_city').value;
    province=document.getElementById('admin_input_province').value;
    postal_code=document.getElementById('admin_input_postal_code').value;
    phone_number=document.getElementById('admin_input_phone_number').value;
    admin=document.getElementById('admin_input_admin_checkbox').checked;
    
    fetch('https://baf4kiept7.execute-api.us-east-1.amazonaws.com/prod', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "email": email,
        "first_name":first_name,
        "last_name":last_name,
        "street_address":street_address,
        "city":city,
        "province":province,
        "postal_code":postal_code,
        "phone_number":phone_number,
        "admin":admin
    })
    })
    .then(response => response.json())
    .then(response => { console.log(JSON.stringify(response));get_naga_members();})
    
    
}


function remove_member(email){if(confirm("Are you sure you want to remove this user? This cannot be undone.")==true){
    const api_url = 'https://ddgo7c2d6l.execute-api.us-east-1.amazonaws.com/prod/remove_member?email='+ encodeURIComponent(email);
    
  
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        console.log(JSON.stringify(response)); 
        delete_from_waiting_list(email);
        get_naga_members();
    })
  
    
}}