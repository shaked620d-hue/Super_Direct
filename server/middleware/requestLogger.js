// מידלוואר מותאם אישית: רושם לכל בקשה את השיטה, הנתיב והזמן
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};
