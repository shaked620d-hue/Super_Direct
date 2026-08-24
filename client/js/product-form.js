let id;

const takeData = ()=>{
    const data =new URLSearchParams(window.location.search);
id=data.get('id');
if(id)
{
id=Number(id);
const product= products.find(i=>i.id == id );
if(product)
{
     document.getElementById('name').value = product.name;
     document.getElementById('category').value = product.category;
     document.getElementById('price').value = product.price;

     document.getElementById('image').value = product.image;

     document.getElementById('description').value = product.description;
document.getElementById('formTitle').textContent = 'עריכת מוצר';
    document.getElementById('submitButton').textContent = 'שמירת שינויים';

}
}
}


const addOrUpdateProduct = (event) =>{
   event.preventDefault();

if(id)
{
   const product = products.find(i=>i.id == id );
   product.name = document.getElementById('name').value;
   product.category = document.getElementById('category').value;
   product.price = document.getElementById('price').value;
   product.image = document.getElementById('image').value;
   product.description = document.getElementById('description').value;
}
else
{
   const  newProduct= {
      name :  document.getElementById('name').value,
      category :document.getElementById('category').value ,
   price :   document.getElementById('price').value ,
      image : document.getElementById('image').value ,
      description : document.getElementById('description').value ,
id: products.length+1, // בהמשך זה לפי הDB
   }
   products.push(newProduct);
}

}


document.getElementById('productForm').addEventListener('submit', addOrUpdateProduct);
document.addEventListener('DOMContentLoaded', takeData);
