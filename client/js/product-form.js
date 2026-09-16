let id;

const takeData = async ()=>{
    const data =new URLSearchParams(window.location.search);
id=data.get('id');
if(id)
{
    try{
    const response = await getProductById(id);
const product = await response.json();



  document.getElementById('name').value = product.name;
     document.getElementById('categoryId').value = product.categoryId;
     document.getElementById('price').value = product.price;

     document.getElementById('description').value = product.description;
document.getElementById('formTitle').textContent = 'עריכת מוצר';
    document.getElementById('submitButton').textContent = 'שמירת שינויים';

    }
  catch{
       showToast('שגיאה בטעינת המוצר');
  }
}
}


const addOrUpdateProduct = (event) =>{
   event.preventDefault();

if(id)
{
   const product = products.find(i=>i.id == id );
   product.name = document.getElementById('name').value;
   product.categoryId = Number(document.getElementById('categoryId').value);
   product.price = document.getElementById('price').value;
   product.image = document.getElementById('image').value;
   product.description = document.getElementById('description').value;
}
else
{
   const  newProduct= {
      name :  document.getElementById('name').value,
      categoryId : Number(document.getElementById('categoryId').value) ,
   price :   document.getElementById('price').value ,
      image : document.getElementById('image').value ,
      description : document.getElementById('description').value ,
id: products.length+1, // בהמשך זה לפי הDB
   }
   products.push(newProduct);
}

showToast('המוצר נשמר בהצלחה');
window.setTimeout(() => { window.location.href = '../index.html'; }, 1500);

}


const guardAdminOnly = () => {
    if (!isAdmin()) {
        window.location.href = '../index.html';

    }
}


document.addEventListener('DOMContentLoaded', guardAdminOnly);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('productForm').addEventListener('submit', addOrUpdateProduct);
});

document.addEventListener('DOMContentLoaded', takeData);
