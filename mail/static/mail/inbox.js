document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));

  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;
  document.querySelector('#to-text-error-message').style.display='none';
  
  load_mailbox('inbox');
});

  

function is_read(id){

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read:true
    })
  })


}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display='none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(emails => {emails.forEach(email=>{
  const item=document.createElement('div');
  
  const time=email.timestamp;
  const time_heading=document.createElement('span');
  time_heading.innerHTML=time;
  const sender=email.sender;
  const sender_heading=document.createElement('span');
  sender_heading.innerHTML=sender;
  subject_heading=document.createElement('span');
  subject_heading.innerHTML=email.subject;
  if (email.read){
    read="read";
  }
  else{
    read=""
  }
  item.className=`${read}`;
  
  item.innerHTML=`<div class="card-body" id="item-${email.id}">
  




  

<div class="content">

  <img src="https://www.macworld.co.uk/cmsdata/features/3682378/how-to-change-sender-name-in-mail-main_thumb1200_4-3.png" alt="email">
  <h4>${email.body.slice(0,30)}</h4>
  </div>
 <div class="footer">
 Time:${time_heading.outerHTML}| Sender:${sender_heading.outerHTML}|Subject:${subject_heading.outerHTML}
 </div>


  </div>`;


document.querySelector('#emails-view').append(item);
item.addEventListener('click', function(){
 
  show_email(email.id);
  
  
});

  
})

    // Print emails
    

    // ... do something else with emails ...
});
}

function send_email(){
  recipients=document.querySelector('#compose-recipients');
  subject=document.querySelector('#compose-subject');
  body=document.querySelector('#compose-body');

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients.value,
        subject: subject.value,
        body: body.value
    })
  })
  .then(response => response.json())
  .then(result => {
    
  if("message" in result){
    error=document.querySelector('#to-text-error-message')
    error.style.display='none';

    load_mailbox('sent');
  }
  else{ 
    error=document.querySelector('#to-text-error-message')
    error.innerHTML = result['error']
    error.style.display="block";

}

  })
return false;
 
}
function show_email(id)
{document.querySelector('#emails-view').style.display='none';


fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
   document.querySelector("#mail-view").innerHTML = "";
   
   const item=document.createElement('div');
   item.innerHTML=`<div class="mail-body" id=${email.id}>
   <h3> Sender: ${email.sender}</h3>
   <h3> Time: ${email.timestamp}</h3>
   <p> Body : ${email.body}
   </p>

   
   
   
   
   
   
   
   </div>
   `
   document.querySelector('#mail-view').append(item);
   document.querySelector('#mail-view').style.display='block';
   is_read(id);
   let archive = document.createElement("btn");
   let reply=document.createElement("btn");
   archive.className=`btn btn-secondary ${email.id}
   `
   reply.className="btn btn-secondary";
   reply.innerText="Reply";
   document.querySelector('#mail-view').append(archive);
   document.querySelector('#mail-view').append(reply);
   reply.addEventListener('click',()=>{
     reply_email(email.sender,email.subject,email.body,email.timestamp);
     document.querySelector('#mail-view').style.display='none';



   })
   if(email.archived){

    archive.innerText="Unarchive";
   }
   else{
     archive.innerText="Archive";
   }
   archive.addEventListener('click',()=>{
     toggle_archive(id,email.archived);
     





   })
   
   




})
}
 function toggle_archive(id,state)
{
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !state,
    }),
  });
  load_mailbox('inbox');



}
function reply_email(sender,subject,body,timestamp){


 document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-subject').value = `Re: ${subject}`
  document.querySelector('#compose-body').value = `On ${timestamp} ,${sender} wrote: ${body}`;


}
