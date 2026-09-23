// כשיהיה שרת זה ישתנה 

const ADMIN_EMAIL = 'admin@superdirect.co.il'; // זמני
const ADMIN_PASSWORD = '123456789';// כנל
const ADMIN_NAME= 'ADMIN'

const getBasePath = () => window.location.pathname.includes('/HTML/') ? '' : 'HTML/';


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
            firstName:ADMIN_NAME, 
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

// מחזיר את כותרת ההרשאה עבור בקשות שדורשות משתמש מחובר.
const getAuthHeaders = () => {
    const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));
    // מצרפים את האסימון לכל בקשה מוגנת שנשלחת מהלקוח.
    return currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {};
};

const updateAuthUI = ()=>{
    const authButton= document.getElementById('authButton');
    if(!authButton){return;}

        const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));

          if(currentUser)
    {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) { logoutButton.hidden = false; }

        authButton.textContent = currentUser.firstName || currentUser.email;
        authButton.href = getBasePath() + 'profile.html';

        if (currentUser.role === 'admin') {
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                const ordersLink = document.createElement('a');
                ordersLink.href = getBasePath() + 'admin-orders.html';
                ordersLink.className = 'admin-add-product';
                ordersLink.textContent = 'ניהול הזמנות';
                headerActions.append(ordersLink);
            }
        }
    }

}
const handleLogout = ()=>{
    
    const logoutButton  = document.getElementById('logoutButton');
    if(!logoutButton  ){return; }
    logoutButton .addEventListener('click', (event)=>{
      

   const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));
   if(currentUser){ 
   event.preventDefault();
    localStorage.removeItem('superDirectCurrentUser'); 
    showToast('התנתקת בהצלחה'); 

    location.reload();
    }
    })
}



document.addEventListener('DOMContentLoaded', updateAuthUI);
document.addEventListener('DOMContentLoaded', handleLogout);
