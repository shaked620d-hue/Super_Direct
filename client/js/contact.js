

const handleContactSubmit=() =>{
    const contactForm=document.getElementById('contactForm');
const attachment=  document.getElementById('attachment');
    if(!contactForm)
    {
    return;
    }

    attachment.addEventListener('change', () => {
        const file = attachment.files[0];
        const preview = document.getElementById('attachmentPreview');
        preview.src = URL.createObjectURL(file);
        preview.hidden = false;

});
    contactForm.addEventListener('submit',  (event)=>{
        event.preventDefault();
        
        const details= { name: document.getElementById('name').value,
                         subject: document.getElementById('subject').value,
                         email: document.getElementById('email').value,
                         message: document.getElementById('message').value  }
    
        saveLocalStorage( 'superDirectMessages', details)// כשיהיה שרת זה ישתנה גם 
        showToast('ההודעה נשמרה בהצלחה'); 
})
}



document.addEventListener('DOMContentLoaded', handleContactSubmit)
