

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
    
// זה משתנה כשיש שרת
     const messages=  JSON.parse(localStorage.getItem('superDirectMessages')) || [];
     messages.push(details);
    localStorage.setItem('superDirectMessages', JSON.stringify(messages));
      showToast('ההודעה נשמרה בהצלחה'); 
    })
}

document.addEventListener('DOMContentLoaded', handleContactSubmit)
