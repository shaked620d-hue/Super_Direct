import express from 'express'
import path from 'node:path';
import cors from 'cors';
import indexRouter from './routes/index.route.js';


const server = express();
const clientDir = path.join(import.meta.dirname, '..', 'client');
server.use(cors());
server.use(express.json());
server.use(express.static(clientDir));
server.use('/css', express.static(path.join(clientDir, 'css')));
server.use('/js', express.static(path.join(clientDir, 'js')));

server.get('/favicon.svg', (req, res) => {
  res.sendFile(path.join(clientDir, '..', 'favicon.svg'));
});

server.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(clientDir, '..', 'favicon.ico'));
});

server.get('/', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

server.use('/api', indexRouter);


// עד לפה
server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000')
})