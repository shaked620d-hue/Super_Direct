

const handleRegisterSubmit  =()=>{

    const registerForm = document.getElementById('registerForm');
    if(!registerForm) {return};

    registerForm.addEventListener('submit', (event)=>{
        event.preventDefault();
        const  details= {
            firstName:document.getElementById('firstName').value,
            lastName:document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            password: document.getElementById('password').value,
            role: 'customer' 
        }

            if(details.password != document.getElementById('confirmPassword').value)
            {
                showToast ('הסיסמא לא תואמת')
                return;
            }
            saveLocalStorage( 'superDirectUsers', details);// זה משתנה כשיש שרת
            showToast('נרשמת בהצלחה'); 
            window.setTimeout(() => { window.location.href = '../index.html'; }, 1500);

            
    })
}

document.addEventListener('DOMContentLoaded', handleRegisterSubmit)