import express from 'express'

const server = express();

server.get('/', (req, res) => {
  res.send('Server is working!');
});

server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000')
})