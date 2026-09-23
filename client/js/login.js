
// מטפלת בשליחת טופס ההתחברות.
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
      showToast('התחברת בהצלחה');
      window.setTimeout(() => { window.location.href = '../index.html'; }, 1500);
    } catch {
      // מטפלים במצב שבו לא ניתן להגיע לשרת.
      showToast('אירעה שגיאה בהתחברות לשרת');
    }
  });
};

// מפעילים את הקוד רק לאחר טעינת טופס ההתחברות בדף.
document.addEventListener('DOMContentLoaded', handleLoginSubmit);