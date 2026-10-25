import { loginRequest } from './authService.js';
import { showToast, mergeGuestCartIntoUserCart } from '../cart/cart.js';
import { setCurrentUser } from '../shared/storage.js';

/**
 * מטפלת בשליחת טופס ההתחברות.
 */
const handleLoginSubmit = () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await  loginRequest(email, password);

      if (!response.ok) {
        if (response.status === 409) {
          showToast('נמצאו כמה חשבונות עם כתובת האימייל הזו; יש לפנות למנהל האתר');
          return;
        }
        showToast('אימייל או סיסמה שגויים');
        return;
      }

      const user = await response.json();
      setCurrentUser(user);
      mergeGuestCartIntoUserCart();
      showToast('התחברת בהצלחה');
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      // יעדי הפניה מורשים בלבד
      const redirectPath = ['checkout.html', 'orders.html', 'admin-orders.html'].includes(returnTo)
        ? returnTo
        : '../index.html';
      window.setTimeout(() => { window.location.href = redirectPath; }, 1500);
    } catch {
      showToast('אירעה שגיאה בהתחברות לשרת');
    }
  });
};

document.addEventListener('DOMContentLoaded', handleLoginSubmit);