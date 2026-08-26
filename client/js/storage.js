// כשיהיה שרת זה ישתנה 
  const saveLocalStorage= (key, item)=>{
    
 const messages=  JSON.parse(localStorage.getItem(key)) || [];
     messages.push(item);
    localStorage.setItem(key, JSON.stringify(messages));
      
}