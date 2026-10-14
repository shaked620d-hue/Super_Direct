import { getCurrentUser, setCurrentUser } from '../shared/storage.js';
import { updateUserRequest } from './userService.js';
import { changePasswordRequest } from '../auth/authService.js';
import { showToast } from '../cart/cart.js';

/**
 * מפנה לעמוד ההתחברות אם אין משתמש מחובר, כדי להגן על עמוד הפרופיל.
 */
const guardLoggedIn =()=>{
    const currentUser = getCurrentUser();

   if (!currentUser) {
    window.location.href = 'login.html';
}
}
/**
 * ממלאת את טופס הפרופיל בפרטי המשתמש המחובר.
 */
const fillProfileForm =()=>{
    const currentUser = getCurrentUser();

    document.getElementById('firstName').value = currentUser.firstName || '';// ה או זה בשביל המנהל כי לו אין פרטים
    document.getElementById('lastName').value = currentUser.lastName || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('address').value = currentUser.address || '';
}

/**
 * מציגה את כפתור השמירה בטופס הפרופיל ברגע שהמשתמש משנה שדה כלשהו.
 */
const revealSaveButton=()=>{
 const   profileForm = document.getElementById('profileForm');
    const profileSaveButton= document.getElementById('profileSaveButton');
        profileForm.addEventListener('input', ()=>{
         profileSaveButton.hidden=false;
})
}
/**
 * מטפלת בשמירת פרטי הפרופיל - שולחת את הפרטים המעודכנים לשרת ומעדכנת את המשתמש השמור ב-localStorage.
 * @param {Event} event - אירוע שליחת הטופס.
 */
const handleProfileSave = async (event) => {

    event.preventDefault();
        const currentUser= getCurrentUser() || [];
if(!currentUser){return;}

const details={
    firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        address: document.getElementById('address').value
}
try{
    const response= await updateUserRequest(currentUser._id, details);
    if(!response.ok)
    {
           // מסבירים שהשמירה נכשלה בגלל כתובת שכבר משויכת לחשבון אחר.
           showToast(response.status === 409 ? 'כתובת האימייל כבר רשומה' : 'שמירת הפרטים נכשלה');
            return;
    }
    const updateUser= await response.json();
    setCurrentUser({ ...updateUser, token: currentUser.token });

     showToast('הפרטים נשמרו בהצלחה');
    } catch {
        showToast('אירעה שגיאה בשמירת הפרטים');
    }
}

/**
 * מטפלת בשינוי סיסמה - בודקת שהסיסמה החדשה ואימותה תואמים ושולחת את הבקשה לשרת.
 * @param {Event} event - אירוע שליחת טופס שינוי הסיסמה.
 */
const handlePasswordChange = async (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        showToast('הסיסמה החדשה ואימות הסיסמה אינם תואמים');
        return;
    }

    try {
        const response = await changePasswordRequest(currentPassword, newPassword);
        if (!response.ok) {
            showToast(response.status === 401 ? 'הסיסמה הנוכחית שגויה' : 'שינוי הסיסמה נכשל');
            return;
        }

        event.currentTarget.reset();
        showToast('הסיסמה עודכנה בהצלחה');
    } catch {
        showToast('אירעה שגיאה בשינוי הסיסמה');
    }
};

/**
 * מחברת את כפתור פתיחת/סגירת טופס שינוי הסיסמה.
 */
const togglePasswordForm = () => {
    const toggleButton = document.getElementById('changePasswordToggle');
    const passwordForm = document.getElementById('passwordForm');

    toggleButton.addEventListener('click', () => {
        const isOpening = passwordForm.hidden;
        passwordForm.hidden = !isOpening;
        toggleButton.setAttribute('aria-expanded', String(isOpening));
        toggleButton.textContent = isOpening ? 'ביטול שינוי סיסמה' : 'שינוי סיסמה';

        if (isOpening) {
            document.getElementById('currentPassword').focus();
        } else {
            passwordForm.reset();
        }
    });
};

/**
 * מחברת את כפתור "הצגת סיסמה" לשדה הסיסמה החדשה - מציג את הסיסמה כל עוד הכפתור לחוץ (עכבר, מגע או מקלדת).
 */
const setupPasswordVisibility = () => {
    const passwordInput = document.getElementById('newPassword');
    const visibilityButton = document.getElementById('newPasswordVisibility');

    /**
     * מחזירה את שדה הסיסמה למצב מוסתר (type="password").
     */
    const hidePassword = () => {
        passwordInput.type = 'password';
        visibilityButton.setAttribute('aria-label', 'הצגת הסיסמה החדשה');
        visibilityButton.title = 'הצגת הסיסמה החדשה';
    };

    /**
     * חושפת את שדה הסיסמה כטקסט רגיל (type="text").
     */
    const showPassword = () => {
        passwordInput.type = 'text';
        visibilityButton.setAttribute('aria-label', 'הסתרת הסיסמה החדשה');
        visibilityButton.title = 'הסתרת הסיסמה החדשה';
    };

    visibilityButton.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        visibilityButton.setPointerCapture(event.pointerId);
        showPassword();
    });
    visibilityButton.addEventListener('pointerup', hidePassword);
    visibilityButton.addEventListener('pointercancel', hidePassword);
    visibilityButton.addEventListener('lostpointercapture', hidePassword);
    visibilityButton.addEventListener('pointerleave', hidePassword);
    visibilityButton.addEventListener('keydown', (event) => {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            showPassword();
        }
    });
    visibilityButton.addEventListener('keyup', hidePassword);
    window.addEventListener('blur', hidePassword);
};

document.addEventListener('DOMContentLoaded', revealSaveButton);
document.addEventListener('DOMContentLoaded', fillProfileForm);
document.addEventListener('DOMContentLoaded', guardLoggedIn);
document.addEventListener('DOMContentLoaded', () => {
    togglePasswordForm();
    setupPasswordVisibility();
    document.getElementById('profileForm').addEventListener('submit', handleProfileSave);
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordChange);
});
