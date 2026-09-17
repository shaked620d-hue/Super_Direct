

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
      document.getElementById('attachmentPreviewWrap').hidden=false; 

});
    const clearAttachmentButton= document.getElementById('clearAttachmentButton');
    if(!clearAttachmentButton){return;}

    clearAttachmentButton.addEventListener('click', ()=>{
        attachment.value = '';
document.getElementById('attachmentPreviewWrap').hidden = true;
    });

    contactForm.addEventListener('submit', async (event)=>{
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('subject', document.getElementById('subject').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('message', document.getElementById('message').value);

        const file = attachment.files[0];
        if (file) {
            formData.append('attachment', file);
        }

        try {
            const response = await createMessage(formData);
            if (!response.ok) {
                showToast('שליחת ההודעה נכשלה');
                return;
            }
            showToast('ההודעה נשלחה בהצלחה');
        } catch {
            showToast('אירעה שגיאה בשליחת ההודעה');
        }
})
}



document.addEventListener('DOMContentLoaded', handleContactSubmit)
