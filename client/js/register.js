

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
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(details)
            });

            if (!response.ok) {
                showToast('ההרשמה נכשלה');
                return;
            }

            const user = await response.json();
            localStorage.setItem('superDirectCurrentUser', JSON.stringify(user));
            showToast('נרשמת בהצלחה');
            window.setTimeout(() => { window.location.href = '../index.html'; }, 1500);
        }
        catch {
            showToast('אירעה שגיאה בהתחברות לשרת');
        }
    })
}

document.addEventListener('DOMContentLoaded', handleRegisterSubmit)
