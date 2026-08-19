import express from 'express'
import { categories } from './tmp.js';

const server = express();
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
    res.json(category);
   }
else{
    res.status(404).json({ message: "Category not found" });
}
});

server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000')
})