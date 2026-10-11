
/**
 * מטפלת בשליחת טופס ההתחברות.
 */
const handleLoginSubmit = () => {
  // מוצאים את הטופס. אם אנחנו בדף אחר, אין צורך להמשיך.
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  // מונעים שליחה רגילה של הטופס ושולחים את הנתונים לשרת באמצעות JavaScript.
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      // שולחים את כתובת האימייל והסיסמה לראוטר האימות בשרת.
      const response = await  loginRequest(email, password);

      // תשובה שאינה 2xx מציינת שהאימייל או הסיסמה אינם תקינים.
      if (!response.ok) {
        showToast('אימייל או סיסמה שגויים');
        return;
      }

      // שומרים את המשתמש שהשרת החזיר כדי לזהות אותו בדפים הבאים.
      const user = await response.json();
      localStorage.setItem('superDirectCurrentUser', JSON.stringify(user));
      mergeGuestCartIntoUserCart();
      showToast('התחברת בהצלחה');
      // אחרי התחברות שנדרשה לצורך הזמנה או צפייה בהזמנות, חוזרים לעמוד המבוקש.
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      // מאפשרים רק יעדים פנימיים מוכרים, כדי לא להפנות לכתובת חיצונית שסופקה בכתובת הדף.
      const redirectPath = ['checkout.html', 'orders.html', 'admin-orders.html'].includes(returnTo)
        ? returnTo
        : '../index.html';
      window.setTimeout(() => { window.location.href = redirectPath; }, 1500);
    } catch {
      // מטפלים במצב שבו לא ניתן להגיע לשרת.
      showToast('אירעה שגיאה בהתחברות לשרת');
    }
  });
};

// מפעילים את הקוד רק לאחר טעינת טופס ההתחברות בדף.
document.addEventListener('DOMContentLoaded', handleLoginSubmit);