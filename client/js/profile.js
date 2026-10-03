
const guardLoggedIn =()=>{
    const currentUser = getCurrentUser();

   if (!currentUser) {
    window.location.href = 'login.html';
}
}
const fillProfileForm =()=>{
    const currentUser = getCurrentUser();

    document.getElementById('firstName').value = currentUser.firstName || '';// ה או זה בשביל המנהל כי לו אין פרטים
    document.getElementById('lastName').value = currentUser.lastName || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('address').value = currentUser.address || '';
}

const revealSaveButton=()=>{
 const   profileForm = document.getElementById('profileForm');
    const profileSaveButton= document.getElementById('profileSaveButton');
        profileForm.addEventListener('input', ()=>{
         profileSaveButton.hidden=false;
})
}
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
           showToast('שמירת הפרטים נכשלה');
            return;
    }
    const updateUser= await response.json();
    localStorage.setItem('superDirectCurrentUser', JSON.stringify({ ...updateUser, token: currentUser.token }));

     showToast('הפרטים נשמרו בהצלחה');
    } catch {
        showToast('אירעה שגיאה בשמירת הפרטים');
    }
}

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

const setupPasswordVisibility = () => {
    const passwordInput = document.getElementById('newPassword');
    const visibilityButton = document.getElementById('newPasswordVisibility');

    const hidePassword = () => {
        passwordInput.type = 'password';
        visibilityButton.setAttribute('aria-label', 'הצגת הסיסמה החדשה');
        visibilityButton.title = 'הצגת הסיסמה החדשה';
    };

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
