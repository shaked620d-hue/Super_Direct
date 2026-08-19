import express from 'express'
import { categories , products } from './tmp.js';


const server = express();
server.use(express.json());   

server.get('/', (req, res) => {
  res.send('Server is working!');
});

//את כל אלו אחר כך משנים ומעבירים 

server.get('/categories', (req, res) => {
   res.json(categories);
  });
server.get('/categories/:id', (req, res) => {
  const category = categories.find(c => c.id == req.params.id);
   if(category){
    res.status(200).json(category);
   }
else{
    res.status(404).json({ message: "Category not found" });
}
});
 server.post('/categories', (req, res) => { //רק למנהל
          
              const newCategory = {
            id: categories.length + 1,// אחר כך צריך לשנות את זה לID אוטומתי
            name: req.body.name
          };
          categories.push(newCategory);
            res.status(201).send(newCategory);
 });
   server.put('/categories/:id',  (req, res) => { 
            const category =categories.find(c=>c.id == req.params.id);
            if(category)
            {
                category.name=req.body.name;
                res.json(category);
              }
              else{
                res.status(404).json({message: "category not found"});
             }

  });
   server.put('/categories/:id',  (req, res) => { 
            const category =categories.find(c=>c.id == req.params.id);
            if(category)
            {
                category.name=req.body.name;
                res.json(category);
              }
              else{
                res.status(404).json({message: "category not found"});
             }

  });
     server.delete('/categories/:id',  (req, res) => { 
            const index =categories.findIndex(c=>c.id == req.params.id);
            if(index !== -1)
            {
              categories.splice(index, 1);
                res.status(200).send({message : "deleted successfuly"});
              }
              else{
                res.status(404).json({message: "category not found"});
             }

  });


    server.get('/products/:id', (req, res)=> {
     const product= products.find(p=>p.id == req.params.id);
     if(product)
     {
      res.status(200).json(product);
     }
     else{
      res.status(404).json({message :"product not found"});
     }
  });
  server.get('/products', (req, res)=> {
    if(req.query.category)
    {
      const productsWithSameCategory= products.filter(p=>p.categoryId == req.query.category);
      res.status(200).json(productsWithSameCategory);
    }
    else{
      res.json(products);
    }
  });
server.post('/products',  (req, res)=> {

  const newProduct={
      id: products.length +1,// משתנה אחכ
    name: req.body.name, 
    description: req.body.description,
    price: req.body.price,
    categoryId: req.body.categoryId,
    stock: req.body.stock,
    image: req.body.image
  }
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// עד לפה
server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000')
})