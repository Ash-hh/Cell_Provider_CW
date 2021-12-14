let timer;
let second;
let min;

let callId=0;


function GetUserNums(){

    fetch('http://localhost:5000/api/findbyid/FindUserNumbers/cookie')
    .then(result=>{
      
        return result.ok ? result.json() : false;
    }).then(data=>{
        

        if(data){
            let select = document.createElement('select');
            select.onchange = (element) =>{
                document.callform.sender.value = element.srcElement[element.srcElement.selectedIndex].value;
            }

            select.add(new Option());

            if(data.length>1){
                data.forEach(element => {
                    select.add(new Option(element.Number,element.Number))   
                });
            } else {
                select.add(new Option(data.Number,data.Number))
            }
            document.getElementById('userNums').append(select);
        }
    })                            
}

function CallForm(mode){

    let form = document.callform;
    form.submit.value = form.submit.value === "Start Call" ? "End Call" : "Start Call"
    form.sender.disabled = form.sender.disabled ? false : true;
    form.receiver.disabled = form.receiver.disabled ? false : true;

    if(mode=="Start Call"){

        window.addEventListener("beforeunload",(e)=>{
            if(document.callform.submit.value === "End Call"){
                fetch('http://localhost:5000/call',{
                    method:'POST',                   
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({
                        sender:form.sender.value,
                        receiver:form.receiver.value,
                        submit:"End Call Emergency",
                        min:min,
                        second:second,
                        callId:callId
                    })
                })
            }
        })
        
        second=0;
        min = 0;

        timer = setInterval(()=>{

            second++;
            min = second == 60 ? Math.floor(second/60) : min;
            second =  second < 60 ? second : 0;
            diagnostic.innerHTML = `Call timer: ${min<10 ? "0"+min : min}:${second < 10 ? "0"+second : second}`;
        },1000)

    } else {
        clearInterval(timer);
    }   

    fetch('http://localhost:5000/call',{
        method:'POST',                   
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            sender:form.sender.value,
            receiver:form.receiver.value,
            submit:mode,
            min:min,
            second:second,
            callId:callId
        })
    }).then(result=>{
        return result.text()
    }).then(data=>{
        callId = Number.isInteger(parseInt(data)) ? parseInt(data) : 0;
        //diagnostic.innerHTML += data;
       
        if(mode=='Start Call' && callId!=-1){
            call_id.innerHTML='Your call in process'
        } else {
            call_id.innerHTML='At least one number diesnt exist, pleace input correct number'
            clearInterval(timer);
            form.submit.value = "Start Call";
            form.sender.disabled = false;
            form.receiver.disabled = false;
        }
       
    })
}