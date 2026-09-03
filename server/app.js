import express from 'express'
import path from 'node:path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requestLogger } from './middleware/requestLogger.js';
import { requestDate } from './middleware/requestDate.js';
import indexRouter from './routes/index.route.js';


const server = express();
const clientDir = path.join(import.meta.dirname, '..', 'client');

// אבטחה: מוסיף כותרות HTTP
//  שמגנות על השרת מפני התקפות נפוצות, 
// כגון התחזות למניעת קליקים מזויפים וניסיון לעקוף הגבלות דפדפן
server.use(helmet());

//   IP אבטחה ויציבות: מגביל את מספר הבקשות מאותו 
//  brute force כדי למנוע פשיטת כוחות 
//  ולעומס על השרת
server.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'יותר מדי בקשות מהכתובת הזו, נסה שוב מאוחר יותר.'
}));

// מידלוואר cors: מאפשר לכל דפדפן לשלוח בקשות מה־client
// אל השרת, גם אם המקור שונה.
server.use(cors());

// מידלוואר מותאם אישית: רושם לכל בקשה את השיטה, הנתיב והזמן.
server.use(requestLogger);

// מידלוואר מותאם אישית:
// GET עבור בקשות ,
// req מוסיף לתוך 
//  את התאריך הנוכחי.
server.use(requestDate);

// מידלוואר morgan:
// HTTP רושם כל בקשת 
//  לקונסול
// כדי לעקוב אחרי מה שהלקוח מבקש והסטטוס המתקבל.
server.use(morgan('dev'));

// מידלוואר express.json:
// JSON מפרש  
// POST ו־PUT שנשלח בבקשות 
// וממלא את 
// req.body עם הנתונים.
server.use(express.json());

// מידלוואר express.static:
//  frontend משרת את קבצי ה־ 
// מהתיקייה client, 
// כולל HTML, CSS ו־JS.
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


// עד כאן
server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000')
})