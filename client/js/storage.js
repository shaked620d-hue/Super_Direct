// כשיהיה שרת זה ישתנה 

const ADMIN_EMAIL = 'admin@superdirect.co.il'; // זמני
const ADMIN_PASSWORD = '123456789';// כנל



  const saveLocalStorage= (key, item)=>{
    
 const messages=  JSON.parse(localStorage.getItem(key)) || [];
     messages.push(item);
    localStorage.setItem(key, JSON.stringify(messages));
      
}

const seedAdminUser= ()=>{
    const users= JSON.parse(localStorage.getItem('superDirectUsers')) || []; 
   const a=  users.find(u => u.role === 'admin')
    if(!a)
    {
        const admin= {
            role:'admin', 
            password: ADMIN_PASSWORD, 
            email: ADMIN_EMAIL 
        }
        users.push(admin);
        localStorage.setItem('superDirectUsers', JSON.stringify(users))
    }
}

const isAdmin = ()=>{
    const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));
    return currentUser?.role === 'admin';
}

const updateAuthUI = ()=>{
    const authButton= document.getElementById('authButton');
    if(!authButton){return;}

        const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));

    if(currentUser)
    {
        authButton.textContent = currentUser.firstName || currentUser.email;
    }
}
document.addEventListener('DOMContentLoaded', updateAuthUI);