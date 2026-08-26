// כשיהיה שרת זה ישתנה 
const saveMessage= (details)=>{
    
 const messages=  JSON.parse(localStorage.getItem('superDirectMessages')) || [];
     messages.push(details);
    localStorage.setItem('superDirectMessages', JSON.stringify(messages));
      showToast('ההודעה נשמרה בהצלחה'); 
}


const handleContactSubmit=() =>{
    const contactForm=document.getElementById('contactForm');

    if(!contactForm)
    {
    return;
    }
    contactForm.addEventListener('submit',  (event)=>{
        event.preventDefault();
        
        const details= { name: document.getElementById('name').value,
                         subject: document.getElementById('subject').value,
                         email: document.getElementById('email').value,
                         message: document.getElementById('message').value  }
    
        saveMessage(details)// כשיהיה שרת זה ישתנה גם 
})
}



document.addEventListener('DOMContentLoaded', handleContactSubmit)
