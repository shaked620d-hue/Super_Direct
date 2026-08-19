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

server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000')
})