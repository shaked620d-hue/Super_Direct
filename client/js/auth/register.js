import { registerRequest } from './authService.js';
import { showToast, mergeGuestCartIntoUserCart } from '../cart/cart.js';
import { setCurrentUser } from '../shared/storage.js';

/**
 * מטפלת בשליחת טופס ההרשמה - בודקת שהסיסמאות תואמות, שולחת את הפרטים לשרת ושומרת את המשתמש שחזר.
 */
const handleRegisterSubmit = () => {

    const registerForm = document.getElementById('registerForm');
    if (!registerForm) { return };

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const details = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            password: document.getElementById('password').value,
        }

        if (details.password != document.getElementById('confirmPassword').value) {
            showToast('הסיסמא לא תואמת')
            return;
        }

        try {
            const response = await registerRequest(details);

            if (!response.ok) {
                showToast(response.status === 409 ? 'כתובת האימייל כבר רשומה' : 'ההרשמה נכשלה');
                return;
            }

            const user = await response.json();
            setCurrentUser(user);
            mergeGuestCartIntoUserCart();
            showToast('נרשמת בהצלחה');
            window.setTimeout(() => { window.location.href = '../index.html'; }, 1500);
        }
        catch {
            showToast('אירעה שגיאה בהתחברות לשרת');
        }
    })
}

document.addEventListener('DOMContentLoaded', handleRegisterSubmit)
