import { env } from './config/env.js';
import path from 'node:path';
import express from 'express'
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requestLogger } from './middleware/requestLogger.js';
import { requestDate } from './middleware/requestDate.js';
import { createTimeBlocker } from './middleware/timeBlocker.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import indexRouter from './routes/index.route.js';
import { connectDB } from './config/db.js';


const server = express();
const clientDir = path.join(import.meta.dirname, '..', 'client');

connectDB();

// מפרש JSON שנשלח בבקשות POST/PUT.
server.use(express.json());
// מאפשר לבקשות מהדפדפן להגיע לשרת גם אם המקור שונה.
server.use(cors());
// זמני כדי שהתמונות יעלו כשהם עדיין לא בשרת 
// אבטחה: מוסיף כותרות HTTP
// שמגנות על השרת מפני התקפות נפוצות.
// img-src מורחב כדי לאפשר תמונות מוצר מ-Unsplash (מוק זמני, עד שיהיו תמונות אמיתיות מ-public/).
 server.use(helmet({
   contentSecurityPolicy: {
     directives: {
       ...helmet.contentSecurityPolicy.getDefaultDirectives(),
       'img-src': ["'self'", 'data:', 'blob:', 'https://images.unsplash.com']
     }
   }
 }));

 


// רושם לכל בקשה את השיטה, הנתיב והזמן.
server.use(requestLogger);

// מוסיף ל־req את currentDate עבור בקשות GET.
server.use(requestDate);

// חוסם גישה בימי שישי ושבת בתקופה האסורה.
server.use(createTimeBlocker({
  blockedDays: [5, 6],
  startHour: 12,
  endHour: 22,
  statusCode: 503,
  message: 'השרת סגור בשעות אלו. נסה שוב מאוחר יותר.'
}));


// רושם לכל בקשת HTTP לקונסולה. )
server.use(morgan('dev'));


server.use('/public', express.static(path.join(import.meta.dirname, 'public')));
// משרת קבצים סטטיים מהתיקיית client.
server.use(express.static(clientDir));
server.use('/css', express.static(path.join(clientDir, 'css')));
server.use('/js', express.static(path.join(clientDir, 'js')));

server.get('/favicon.svg', (req, res) => {
  res.sendFile(path.join(clientDir, '..', 'favicon.svg'));
});

server.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(clientDir, '..', 'favicon.ico'));
});


// הגבלה מחמירה במיוחד על התחברות/הרשמה - זה המקום שבו תוקף באמת ינסה לנחש סיסמאות.
server.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'יותר מדי ניסיונות התחברות/הרשמה, נסה שוב מאוחר יותר.'
}));

server.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'יותר מדי בקשות מהכתובת הזו, נסה שוב מאוחר יותר.'
}), indexRouter);


// Middleware לטיפול בנתיבים שלא קיימים.
server.use(notFoundHandler);

// Middleware לטיפול בשגיאות כלליות.
server.use(errorHandler);

// עד כאן
server.listen(env.PORT, () => {
  console.log('Server is running on http://localhost:5000')
})