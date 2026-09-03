// GET מידלוואר שמופעל רק לבקשות 
// req מוסיף לתוך  
// את התאריך/שעה הנוכחיים
export const requestDate = (req, res, next) => {
  if (req.method === 'GET') {
    req.requestDate = new Date().toISOString();
    console.log(`GET request date: ${req.requestDate}`);
  }

  next();
};
