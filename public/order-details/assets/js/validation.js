function nameValidate(id){
   let  customerName = document.getElementById('nameId').value;
   let nameRegx= /^[a-zA-Z\-]+$/;
   let error = document.getElementById('nameError')
   if (!nameRegx.test(customerName))

   {
    error.innerHTML= 'invalid name'
   }else{
    error.innerHTML= ''
   }
    
}

function emailValidate(id){
    let  customerEmail = document.getElementById('emailId').value;
    let nameRegx= /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    let error = document.getElementById('emailError')
    if (!nameRegx.test(customerEmail))
 
    {
     error.innerHTML= 'invalid email'
    }else{
     error.innerHTML = ''
    }
     
 }

 function passwordValidate(id){
    let  customerPass = document.getElementById('passId').value;
    let nameRegx= /^[a-zA-Z\-]+$/;
    let error = document.getElementById('passError').value
    if (!nameRegx.test(customerPass))
 
    {
     error.innerHtml= 'invalid password'
    }else{
     error.innerHtml = ''
    }
     
 }


