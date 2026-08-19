import express from 'express'
import { categories } from './tmp.js';

const server = express();
server.use(express.json());   

server.get('/', (req, res) => {
  res.send('Server is working!');
});

//את כל אלו אחר כך משנים ומעבירים 

server.get('/categories', (req, res) => {
  res.json(categories);});
server.get('/categories/:id', (req, res) => {
  const category = categories.find(c => c.id == req.params.id);
   if(category){
    res.json(category);
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


// עד לפה
server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000')
})