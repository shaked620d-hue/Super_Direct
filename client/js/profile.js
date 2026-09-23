
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
const handleProfileSave = async (event) => {

    event.preventDefault();
        const currentUser= JSON.parse(localStorage.getItem('superDirectCurrentUser')) || [];
if(!currentUser){return;}

const details={
    firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        address: document.getElementById('address').value
}
try{
    const response= await updateUserRequest(currentUser.id, details);
    if(!response.ok)
    {
           showToast('שמירת הפרטים נכשלה');
            return;
    }
    const updateUser= await response.json();
    localStorage.setItem('superDirectCurrentUser', JSON.stringify(updateUser))

     showToast('הפרטים נשמרו בהצלחה');
    } catch {
        showToast('אירעה שגיאה בשמירת הפרטים');
    }
}

document.addEventListener('DOMContentLoaded', revealSaveButton);
document.addEventListener('DOMContentLoaded', fillProfileForm);
document.addEventListener('DOMContentLoaded', guardLoggedIn);
document.addEventListener('submit', handleProfileSave);
