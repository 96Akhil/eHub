let username = document.getElementById("username");
let phone = document.getElementById("phone");
let email = document.getElementById("email");
let pwd = document.getElementById("pwd");
let confirmpwd = document.getElementById("confirmpwd");
let confirmpwderror = document.getElementById("confirmpwderror")
let usernameerror = document.getElementById("usernameerror");
let phoneerror = document.getElementById("phoneerror");
let emailerror = document.getElementById("emailerror");
let pwderror = document.getElementById("pwderror");
let error = document.getElementsByClassName("error");
let strengthbar = document.getElementById("strength-bar");
let msg = document.getElementById("msg");
let loginemail = document.getElementById("loginemail");
let loginpwd = document.getElementById("loginpwd");
let loginemailerror = document.getElementById("loginemailerror");
let loginpwderror = document.getElementById("loginpwderror");

function validateName() {
  let regexpname =
    /^([A-zÀ-ÿ]{2,}([.-])?)+( ?(([A-zÀ-ÿ]){2,}([.-])?))* (([A-zÀ-ÿ]){2,}([.-])?)+$/;

  //   let regexpname = /^([a-zA-Z ]{3,}[a-zA-Z])$/;

  if (regexpname.test(username.value)) {
    usernameerror.innerHTML = "Valid";
    usernameerror.style.color = "Green";
    username.style.border = "2px solid green";
    return true;
  } else if (username.value.trim() == "") {
    usernameerror.innerHTML = "Name field is empty";
    usernameerror.style.color = "Red";
    username.style.border = "2px solid red";
    return false;
  } else {
    usernameerror.innerHTML = "Invalid name";
    usernameerror.style.color = "Red";
    username.style.border = "2px solid red";
    return false;
  }
}

function validateEmail() {
  let regexpemail =
    /^([A-Za-z0-9_\-\.]{3,})@([A-Za-z]{3,})\.([A-Za-z]{2,5})(\.[A-za-z]{2,5})?$/;

  if (regexpemail.test(email.value)) {
    emailerror.innerHTML = "Valid";
    emailerror.style.color = "Green";
    email.style.border = "2px solid Green";
    return true;
  } else if (email.value.trim() == "") {
    emailerror.innerHTML = "Email field is empty";
    emailerror.style.color = "Red";
    email.style.border = "2px solid red";
    return false;
  } else {
    emailerror.innerHTML = "Invalid email";
    emailerror.style.color = "Red";
    email.style.border = "2px solid red";
    return false;
  }
}

function validatePhone() {
  let regexpphone = /^[789][0-9]{9}$/;

  if (regexpphone.test(phone.value)) {
    phoneerror.innerHTML = "Valid";
    phoneerror.style.color = "Green";
    phone.style.border = "2px solid green";
    return true;
  } else if (phone.value.trim() == "") {
    phoneerror.innerHTML = "Phone no. field is empty";
    phoneerror.style.color = "Red";
    phone.style.border = "2px solid red";
    return false;
  } else {
    phoneerror.innerHTML = "Invalid Phone no.";
    phoneerror.style.color = "Red";
    phone.style.border = "2px solid red";
    return false;
  }
}

function validatepwd(){

    let regexppwd = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,16}$/;
  
    if (regexppwd.test(pwd.value)) {
      pwderror.innerHTML = "Valid";
      pwderror.style.color = "green";
      pwd.style.border = "2px solid green";
      return true;
    } else if (pwd.value.trim() == "") {
      pwderror.innerHTML = "Password field is empty";
      pwderror.style.color = "Red";
      pwd.style.border = "2px solid red";
      return false;
    } else {
      pwderror.innerHTML = "Invalid Password";
      pwderror.style.color = "Red";
      pwd.style.border = "2px solid red";
      return false;
    }
  
}

function pwdmatch(){
    if(pwd.value == confirmpwd.value){
        confirmpwderror.innerHTML = "Passwords match";
        confirmpwderror.style.color = "Green";
        confirmpwd.style.border = "2px solid green";
        return true;  
    } else{
        confirmpwderror.innerHTML = "Passwords do not match";
        confirmpwderror.style.color = "Red";
        confirmpwd.style.border = "2px solid red";
        return false;
    }
}

  function validate(){

    if ((validateName()==true)&&(validateEmail()==true)&&(validatePhone()==true)&&(validatepwd()==true)&&(pwdmatch()==true)) {
    //   alert("Form submitted successfully!")
    //   location.reload();
      return true;
    }
    else {
      alert("Form not submitted, please check the empty fields!!");
      return false;
    }
  }
