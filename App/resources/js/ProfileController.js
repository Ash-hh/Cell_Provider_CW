let globalValue;

function PopUpHide(){
    popup.style.visibility = "hidden";               
}

function PopUpShow(){
    popup.style.visibility = "visible" 
}

function BallanceUpdate(value){

    PopUpShow();

    globalValue = value;

    BallanceUpdateButton.onclick = (event) =>{
       
        globalValue.ballance=parseInt(globalValue.ballance)+parseInt(ballancevalue.value)
       
        PopUpHide();
        profileController(globalValue);

        BallanceValue.innerHTML=`Ballance: ${globalValue.ballance}`


    }
}       

function profileController(value){ 
   
    
    let postBody;

    switch(value.name){

        case 'UserBallance':
            postBody= {
                id:value.id,
                userObj:{Ballance:value.ballance}
            }


        break;

        case 'UserDelete':
            if(confirm('??')){
                postBody= {
                    id:value.id,
                    userObj:{IsActive:false}
                } 
            }
        break;

        case 'NumberDelete':
            postBody={
                id:value.id,                       
            }
        break;
        default:return 0;
    }   


   
    
    fetch('http://localhost:5000/api/user',{
        method:'POST',                   
        headers:{'Content-Type':'application/json'},
       
        body:JSON.stringify(postBody)                
    }).then(result=>{
        if(result.redirected){
         
           window.location.href = result.url                   
           
        } else if(result.ok){
            return  result.json();
        }
    }).then(data=>{
        if(value.name === 'NumberDelete'){
            UserInfo(data);
            
        }
    })

    
}

function UserInfo(data){
   
    NumbersInfo.innerHTML = '';

    ProfileInfo.innerHTML = `
        <div>
            <h3>Profile Information </h3>
            <p>${data.User.User_Type == 1 ? 'Admin' : 'User'} login: ${data.User.Login} </p>
            <p>Name: ${data.User.User_Name} ${data.User.User_Surname} ${data.User.User_MidName}</p>
            <p>Status: ${data.User.IsActive ? 'Active' : 'Not Active'} </p>
        </div> 
    `

    if(data.IsLogin){
        AuthorizedUserInfo(data);
    }
}

//TODO: call history
function AuthorizedUserInfo(data){
    ProfileInfo.innerHTML += `
        <p><span id='BallanceValue'>Ballance: ${data.User.Ballance}</span>
            <button
                name="UserBallance"
                value='${data.User.User_Id}'
                onclick="BallanceUpdate({id:this.value,name:this.name,ballance:${data.User.Ballance}})">
            Top up</button> 
        </p>
        <button
            name="UserDelete"
            value='${data.User.User_Id}'
            onclick="profileController({id:this.value,name:this.name})">
        Delete My Account </button>    
        <hr>
    `

    if(data.hasOwnProperty('Numbers')){

        NumbersInfo.append(Renders('ProfileNumbers',data.Numbers))
   
    }

    if(data.hasOwnProperty('Calls')){
        
        CallHistory.append(Renders('ProfileCalls', data.Calls))
       
    }
}

function load(){  
    
    let urlstr = 'http://localhost:5000/';

    let login = document.URL
    .slice(document.URL
    .indexOf('/profile')+'/profile'.length+1,
            document.URL.length) 
   
    fetch(`${document.URL}`,{
        method:'POST', mode:'no-cors'
    })
    .then(result=>{                
        return result.json();
    })
    .then((data)=>{           
      
        
        UserInfo(data);
        
    })
}