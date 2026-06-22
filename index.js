const btns= document.querySelectorAll(".btn");
const sec= document.querySelectorAll(".section");

for(let i=0;i<btns.length;i++)
{
    btns[i].addEventListener("click",function()
    {
        document.querySelector(".active-btn").classList.remove("active-btn");
        
        this.classList.add("active-btn");

        document.querySelector(".active").classList.remove("active");
        document.getElementById(this.dataset.id).classList.add("active");
    });
}

const materialItems=document.querySelectorAll(".material-item");

materialItems[0].addEventListener("click",()=>window.open("https://drive.google.com/drive/folders/1vPdELOVoNSym_2WZpehWJJ6QYClO_77c"));
materialItems[1].addEventListener("click",()=>window.open("https://drive.google.com/drive/folders/1U0XqPr-CV-XdQbuB23NggwOAUTbDsyG3"));
materialItems[2].addEventListener("click",()=>window.open("https://drive.google.com/drive/folders/1me_H18v5kmKVe60vp3e51oiRc3_qRmRi"));
materialItems[3].addEventListener("click",()=>window.open("https://drive.google.com/drive/folders/1cMTEnjsGLDC0__Di6qH-wZYjN7shxnoi"));
const menu=document.querySelector(".menu");
menu.addEventListener("click",()=>
{
    const vcontrols=document.querySelector(".vcontrols");
    vcontrols.classList.toggle("hidden");
});

const OK=document.getElementById("ok");
OK.onclick=()=>{
    const message= document.querySelector(".messagesent");
    message.classList.add("hidden");
}

function updateCounter() {
    // Get the current counter value from localStorage
    let visitCount = localStorage.getItem('visit-count');
    
    // If there's no counter in localStorage, initialize it to 0
    if (visitCount === null) {
        visitCount = 0;
    }
    
    // Increment the counter
    visitCount++;
    
    // Update localStorage with the new counter value
    localStorage.setItem('visit-count', visitCount);
    // console.log(visitCount);
    document.querySelector(".hitcount").innerHTML=visitCount;
    
    // Update the counter display on the page
    // document.getElementById('visit-counter').innerText = visitCount;
}

// Call the function to update the counter when the page loads
window.onload = updateCounter;