

function signInButton() {
      
  var data = { 
    UserPoolId : _config.cognito.userPoolId,
    ClientId : _config.cognito.clientId
  };

  var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  var cognitoUser = userPool.getCurrentUser();

  var authenticationData = {
    Username : document.getElementById("inputUsername").value,
    Password : document.getElementById("inputPassword").value,
  };

  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  
  var userData = {
    Username : document.getElementById("inputUsername").value,
    Pool : userPool,
  };
  
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  
  cognitoUser.authenticateUser(authenticationDetails, {
    
    onSuccess: function (result) {

      var accessToken = result.getAccessToken().getJwtToken();
      console.log(result);	
      
      cognitoUser.getUserAttributes(function(err, result) {
        if (err) {
          console.log(err);
          return;
        }
        window.location.href='./profile.html';
    
      });

    },
      onFailure: function(err) {
        alert(err.message || JSON.stringify(err));
    },
  });
      
}



function signOut() {

  document.getElementById('loader').style.display = "block";
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
        console.log(email);
        document.getElementById('member_email').innerHTML =  email;
        showUserInfo(email);

      });

    });
  } else {
    console.log("User is signed-out");
    document.getElementById('loader').style.display = "none";
  document.getElementById('sign-in').style.display = "block"
    
  }
}



async function showUserInfo(email) {
  
  
  const api_url = 'https://thv3sn3j63.execute-api.us-east-1.amazonaws.com/prod/get_naga_user_by_email?user_email=' + encodeURIComponent(email);
  const api_response = await fetch(api_url);
  const api_data = await(api_response).json();
  
  

  if(JSON.parse(api_data['body'])['first_name'] != null) { document.getElementById('member_name').innerHTML =  JSON.parse(api_data['body'])['first_name']; }
  
  
  document.getElementById('sign-out').style.display = "block";
  document.getElementById('loader').style.display = "none";
  

  }


window.onload = function(){
  const temp_var = getUserAttributes();
}

