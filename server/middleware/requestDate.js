// מידלוואר שמוסיף לתוך req את התאריך/שעה הנוכחיים רק לבקשות GET
export const requestDate = (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  req.currentDate = new Date();
  console.log(`GET request date: ${req.currentDate.toISOString()}`);
  next();
};
