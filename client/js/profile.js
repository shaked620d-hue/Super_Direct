
const guardLoggedIn =()=>{
    const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));

   if (!currentUser) {
    window.location.href = 'login.html';
}
}
const fillProfileForm =()=>{
    const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));

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
const handleProfileSave= (event)=>{
    event.preventDefault();
        const currentUser= JSON.parse(localStorage.getItem('superDirectCurrentUser')) || [];
if(!currentUser){return;}
    currentUser.firstName = document.getElementById('firstName').value;
    currentUser.lastName=document.getElementById('lastName').value;
  
    currentUser.address=document.getElementById('address').value;


    localStorage.setItem('superDirectCurrentUser', JSON.stringify(currentUser))
    showToast('הפרטים נשמרו בהצלחה');
}

document.addEventListener('DOMContentLoaded', revealSaveButton);
document.addEventListener('DOMContentLoaded', fillProfileForm);
document.addEventListener('DOMContentLoaded', guardLoggedIn);
document.addEventListener('submit', handleProfileSave);
