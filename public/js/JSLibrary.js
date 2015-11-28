function submitRegisterForm() {
	var input1 = document.getElementById("firstname");
	var input2 = document.getElementById("lastname");
	var input3 = document.getElementById("username1");
	var input4 = document.getElementById("company");
	var input5 = document.getElementById("password1");

	var form = {
		firstname : input1.value,
		lastname : input2.value,
		username : input3.value,
		company : input4.value,
		password : input5.value,
	};

	$.ajax({
		type : "post",
		url : "/RegistrationPage",
		data : form,

		success : function(data, textStatus, jqXHR) {
			alert("data saved" + mesg);
		},
		error : function(mesg) {
			alert("error while saving data:" + mesg);
		}

	});
}

function submitLoginForm() {
	
	var input3 = document.getElementById("username");
	var input5 = document.getElementById("password");
	console.log(input3);
	
	var form = {
		username : input3.value,
		password : input5.value,
	};

	$.ajax({
		type : "post",
		url : "/CMPE280_FinalProject/LoginPage",
		data : form,

		success : function(response) {
			//alert("successful login" + response);
			if(response == "success")
			{
				$(location).attr('href', "index.jsp");
			}
			
		},
		error : function(mesg) {
			alert("error while log in:" + mesg);
			
		}

	});
}