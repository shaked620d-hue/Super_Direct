
const handleLoginSubmit  =()=>{

seedAdminUser();
  const loginForm= document.getElementById('loginForm');
if(!loginForm) {return};

  loginForm.addEventListener('submit', (event)=>{
    event.preventDefault();

   const password = document.getElementById('password').value;
const email = document.getElementById('email').value;

    const users= JSON.parse(localStorage.getItem('superDirectUsers')) || []; 
 const u  =    users.find(u=>u.password==password && u.email== email);


    if(!u)
    {
        showToast('אימייל או סיסמה שגויים');
        return;
    }
    else{
        localStorage.setItem('superDirectCurrentUser' , JSON.stringify(u));
        showToast('התחברת בהצלחה');
    }

    });
    }
    document.addEventListener('DOMContentLoaded',handleLoginSubmit  );