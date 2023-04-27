function addTocart(id,price){

 
    let quantity = document.getElementById("quantity").innerHTML
   let quant = parseInt(quantity)
   let pri = parseInt(price)

   let subt= quant*pri
    console.log("id : ",id, "quantity :",quantity);
 
    $.ajax({
     url: '/add-to-cart',
     type: 'GET',
     data: {
       proId: id,
       quantity: quant,
       subTotal:subt
     },
     success: function (response) {
       console.log(response);
     }
   });
 
 }



 