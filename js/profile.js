var date_options = { year: 'numeric', month: 'long', day: 'numeric' };

function getUserAttributes() {

  var data = {
    UserPoolId : _config.cognito.userPoolId,
    ClientId : _config.cognito.clientId
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
      if (err) {
        alert(err);
        return;
      }
    console.log('session validity: ' + session.isValid());
      
      cognitoUser.getUserAttributes(function(err, result) {
        if (err) {
          console.log(err);
          return;
        }
        
        email=result[2].getValue();
        console.log("Logged in user:" + email);
        showUserInfo(email);
        get_my_plots(email);
        get_my_waiting_list(email);

      });

    });
  } else {
    console.log("User is signed-out");
    window.location.href='./index.html';
  }
}



async function showUserInfo(email) {
  
  // gets user from DynamoDB using email address  
  const api_url = 'https://thv3sn3j63.execute-api.us-east-1.amazonaws.com/prod/get_naga_user_by_email?user_email=' + encodeURIComponent(email);
  const api_response = await fetch(api_url);
  const api_data = await(api_response).json();
  
  document.getElementById('member_email').innerHTML =  JSON.parse(api_data['body'])['email'];
  document.getElementById('sign-out').style.display = "inline-block";
  document.getElementById('loader').style.display = "none";
  
  if(JSON.parse(api_data['body'])['first_name']) { 
    document.getElementById('input_first_name').value  =  JSON.parse(api_data['body'])['first_name'];
    document.getElementById('profile_name').innerHTML  =  "<br><h5>Name:</h5>" + JSON.parse(api_data['body'])['first_name'];}
  if(JSON.parse(api_data['body'])['last_name']) { 
    document.getElementById('input_last_name').value =  JSON.parse(api_data['body'])['last_name'];
    document.getElementById('profile_name').innerHTML  =  document.getElementById('profile_name').innerHTML  + " " + JSON.parse(api_data['body'])['last_name'];
  }
  if(JSON.parse(api_data['body'])['street_address']) {
     document.getElementById('input_street_address').value =  JSON.parse(api_data['body'])['street_address'];
     document.getElementById('profile_mailing_address').innerHTML = "<br><h5>Address:</h5>" + JSON.parse(api_data['body'])['street_address'];
  }
  if(JSON.parse(api_data['body'])['city']) { document.getElementById('input_city').value =  JSON.parse(api_data['body'])['city'];
  if(JSON.parse(api_data['body'])['street_address']) {document.getElementById('profile_mailing_address').innerHTML =document.getElementById('profile_mailing_address').innerHTML +  "<br>" + JSON.parse(api_data['body'])['city'];}
  }
  if(JSON.parse(api_data['body'])['province']) { document.getElementById('input_province').value =  JSON.parse(api_data['body'])['province'];
  if(JSON.parse(api_data['body'])['street_address']) {document.getElementById('profile_mailing_address').innerHTML =document.getElementById('profile_mailing_address').innerHTML +  ", " + JSON.parse(api_data['body'])['province'];}
}
  if(JSON.parse(api_data['body'])['postal_code']) { document.getElementById('input_postal_code').value =  JSON.parse(api_data['body'])['postal_code'];
  if(JSON.parse(api_data['body'])['street_address']) {document.getElementById('profile_mailing_address').innerHTML =document.getElementById('profile_mailing_address').innerHTML +  ". " + JSON.parse(api_data['body'])['postal_code'];}
}
  if(JSON.parse(api_data['body'])['phone_number']) { document.getElementById('input_phone_number').value =  JSON.parse(api_data['body'])['phone_number']; 
  document.getElementById('profile_phone_number').innerHTML = "<br><h5>Phone number:</h5>"  + JSON.parse(api_data['body'])['phone_number'];}
    

  }

  function open_edit_profile(){
    document.getElementById('profile_info').style.display="none";
    document.getElementById('profile_form').style.display="inline-block";

  }

  function close_edit_profile(){
    document.getElementById('profile_info').style.display="inline-block";
    document.getElementById('profile_form').style.display="none";

  }

function update_profile(){
    
  email = document.getElementById('member_email').innerHTML;
  first_name = document.getElementById('input_first_name').value;
  last_name = document.getElementById('input_last_name').value;
  street_address = document.getElementById('input_street_address').value;
  city = document.getElementById('input_city').value;
  province = document.getElementById('input_province').value;
  postal_code = document.getElementById('input_postal_code').value;
  phone_number= document.getElementById('input_phone_number').value;
  
  
  fetch('https://ixih1qmuzb.execute-api.us-east-1.amazonaws.com/prod', {
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
      "phone_number":phone_number
  })
  })
  .then(response => response.json())
  .then(response => { console.log(JSON.stringify(response)); close_edit_profile(); getUserAttributes();})
    
}


function get_my_plots(email){
  document.getElementById('my_plots_content').innerHTML="";
  document.getElementById('my_plots_tabs').innerHTML="";
  
  
  
  var no_plots=true;
  var item_number=0;

  const api_url = 'https://90oukjmsob.execute-api.us-east-1.amazonaws.com/prod/get_my_plots?email=' + encodeURIComponent(email);;
  fetch(api_url, {
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(response => { 
    
    response.forEach(element => {
      item_number++;
      plotId=JSON.stringify(element['plotId']['S']).replace(/["']/g, "");
      if(element['date_assigned']) {
         date_assigned=new Date(element['date_assigned']['S']).toLocaleDateString("en-US", date_options);
         date_deadline = new Date(date_assigned)
         date_deadline.setDate(date_deadline.getDate() + 30);
         today=new Date()
         var days = Math.ceil((date_deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
      } else {date_assigned="";date_deadline=""; days="";}
      if(element['plot_type']) { plot_type=JSON.stringify(element['plot_type']['S']).replace(/["']/g, "") } else {plot_type="";}
      if(element['height']) { height=JSON.stringify(element['height']['S']).replace(/["']/g, "") } else {height="";}
      if(element['width']) { width=JSON.stringify(element['width']['S']).replace(/["']/g, "") } else {width="";}
      if(element['rate']) { rate="$"+JSON.stringify(element['rate']['S']).replace(/["']/g, "") } else {rate="";}
      if(element['occupant']) { occupant=JSON.stringify(element['occupant']['S']).replace(/["']/g, "") } else {occupant="";}
      if(element['payment']) { payment=JSON.stringify(element['payment']['S']).replace(/["']/g, "") } else {payment="";}
      if(payment=="Unpaid") { payment = `<font color=red>Payment pending.</font>
      <br><br>You have until <b> ${date_deadline}</b> to make a payment. If a payment is not received in the next <b>${days}</b> days the plot will be assigned to someone else.
      <br><br><input type="button" value ="Make a payment" onclick="window.open('https://square.link/u/UyZb9hJo','_blank') "style="width:200px">`;}
      
      

      no_plots=false; 
      document.getElementById('exchange_plot_form').style.display="block";
      var option = document.createElement("option");
      option.text = "Yes - " + plotId ;
      option.value=plotId;
      document.getElementById('trade_option').add(option);

      var tab_buttons = document.createElement("button");
      tab_buttons.innerHTML = "<h5>"+plotId+"</h5>";
      tab_buttons.classList.add('tab_buttons');
      tab_buttons.value=plotId;
      tab_buttons.onclick= function() { openCity(event, 'plot_tab_'+this.value) };
      document.getElementById('my_plots_tabs').appendChild(tab_buttons);
      
      
      var tab_content = document.createElement("div");
      tab_content.setAttribute('id',"plot_tab_" + plotId);
      tab_content.classList="tab_content";
      tab_content.innerHTML = `
        <br><b>Plot details:</b>
        <br>Plot Id: ${plotId}
        <br>Plot Type: ${plot_type}
        <br>Size: ${width}x ${height} feet
        <br>
        <br><br><b>Lease: </b>
        <br>Date assigned:  ${date_assigned}
        <br>Period: May 1st, 2024 - October 31st, 2024
        <br>Rate: ${rate}
        <br>Status: ${payment}
        <br><br>`;
        document.getElementById('my_plots_content').appendChild(tab_content);
      if(item_number == 1) {tab_buttons.click();}

    });

    if(no_plots) { document.getElementById("my_plots_content").innerHTML="You have no plots assigned to you at the moment."; document.getElementById('perennial_option').disabled=true;}
    

    console.log ('My plots loaded')
  })

}


function get_my_waiting_list(email){
  
  var has_waiting_list = false;
  
  const api_url = 'https://70tip4ggnj.execute-api.us-east-1.amazonaws.com/prod/get_my_waiting_list?email=' + encodeURIComponent(email);
  fetch(api_url, {
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(response => { 
      
      if(response['Item']){
        
        if(response['Item']['plot_type']) { plot_type=JSON.stringify(response['Item']['plot_type']).replace(/["']/g, "") } else {plot_type="";}
        if(response['Item']['trade_option']) { trade_option=JSON.stringify(response['Item']['trade_option']).replace(/["']/g, "") } else {trade_option="";}
        if(response['Item']['plot_number']) { plot_number=JSON.stringify(response['Item']['plot_number']).replace(/["']/g, "") } else {plot_number="";}
        if(response['Item']['place']) { place=JSON.stringify(response['Item']['place']).replace(/["']/g, "") } else {place="";}
        
        has_waiting_list=true; 
        waiting_list_details = `
        <br><h3>Waiting list</h3>
        <br>We have received your request and you are currently on our waiting list:<br><br>
        <div class="request_plot"><b>Plot type:</b> ${plot_type}.
          <br><b>Plot number:</b> ${plot_number}.
          <br><b>Trade:</b> ${trade_option}.
          <br><b>Date joined:</b> ${ new Date(response['Item']['date_added']).toLocaleDateString("en-US", date_options)  }
          <br><br>You are currently #${place} in line. 
        <br><br><input type=button value='Cancel request' style='background-color:tomato; width:200px' onclick='delete_from_waiting_list(\"${email}\", true)'>
        </div>
        `;
        

      }
      
    if (has_waiting_list) {
      document.getElementById('my_waiting_list_container').innerHTML=waiting_list_details;
      document.getElementById("request_plot_container").style.display="none";
    } else {
      document.getElementById('my_waiting_list_container').innerHTML = "";
      document.getElementById("request_plot_container").style.display="inline-block";
    }
    })

    console.log ('My waiting list loaded')
}


function add_to_waiting_list(){
    
  email = document.getElementById('member_email').innerHTML;
  plot_type = document.getElementById('request_plot_type').value;
  if (document.getElementById('trade_option')) { trade_option = document.getElementById('trade_option').value; } else { trade_option="No";}
  plot_number = document.getElementById('request_plot_number').value;
  if(!plot_number){plot_number="First available"}

  
  fetch('https://ln7qb82w92.execute-api.us-east-1.amazonaws.com/prod', {
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
      "email": email,
      "plot_type":plot_type,
      "plot_number":plot_number,
      "trade_option":trade_option
  })
  })
  .then(response => response.json())
  .then(response => { 
    console.log(response); console.log("trade_option: " + trade_option)
    get_my_waiting_list(email);
    get_waiting_list();
  })
    
}


function signOut() {

  document.getElementById('loader').style.display = "inline-block";
  document.getElementById('sign-out').style.display = "none"
  
  const data = { 
    UserPoolId : _config.cognito.userPoolId,
    ClientId : _config.cognito.clientId
  };
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  const cognitoUser = userPool.getCurrentUser();
  
    if (cognitoUser != null) {
      cognitoUser.getSession(function(err, session) {
      if (err) {
          alert(err);
        return;
      }
      console.log('session validity: ' + session.isValid());
      
            // sign out
            cognitoUser.signOut();
            console.log("Sign out successful");
            
      });
    } else {
        console.log("Already signed-out")
    }
    window.location.href='./index.html';
    
}


function openCity(evt, cityName) {
  console.log(cityName)
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tab_content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tab_buttons");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

function open_admin_tab(evt, tabName) {
  console.log(tabName)
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("admin_tab_content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("admin_tab_buttons");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function delete_from_waiting_list(email,ask_confirm){
  
  if(ask_confirm)
  {if(!confirm('Are you sure you want to cancel this request? You will loose your place in line')){ return;}}

  const api_url = 'https://naqr1xdbd7.execute-api.us-east-1.amazonaws.com/prod/delete_from_waiting_list?email='+encodeURIComponent(email);
  
  fetch(api_url, {
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(response => {
    console.log('Item deleted from waiting list');
    get_my_waiting_list(email); get_waiting_list();})
}
  


function request_plot_number(value){
  if(value=="special_request")
  {
    document.getElementById('request_plot_number').style.display="inline-block";
  } else { 
    document.getElementById('request_plot_number').style.display="none";
  }
}


function add_photo(file){
  console.log(file);

  var data = new FormData()
  data.append('file', file)
  data.append('user', 'hubot')

fetch('https://06inolvp65.execute-api.us-east-1.amazonaws.com/add_photo', {
  method: 'POST',
  headers: {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true'
  },
  body: data
})


}