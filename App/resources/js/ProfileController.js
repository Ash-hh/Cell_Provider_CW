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
        if(Number.isInteger(parseInt(ballancevalue.value))){
            if(ballancevalue.value > 0 && ballancevalue.value < 100000){
                globalValue.ballance=parseInt(globalValue.ballance)+parseInt(ballancevalue.value)
           
                PopUpHide();
                profileController(globalValue);
        
                BallanceValue.innerHTML=`Ballance: ${globalValue.ballance}`
            } else {
                alert(' Input correct data! \n You cant top up less then 0 and more then 100 000')
            }
        } else {
            alert(' Input correct data! \n You must input only number (0-9)')
        }
      
       


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
            if(confirm('Are you sure that you want to delete youe account?')){
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
            
            UserInfo(data,'Numbers');
            
        }
    })

    
}

function UserInfo(data,tableName){
   
    CallsNumsInfo.innerHTML = '';

    ProfileInfo.innerHTML = `
        <div>
            <h3>Profile Information </h3>
            <p>${data.User.User_Type == 1 ? 'Admin' : 'User'} login: ${data.User.Login} </p>
            <p>Name: ${data.User.User_Name} ${data.User.User_Surname} ${data.User.User_MidName}</p>
            <p>Status: ${data.User.IsActive ? 'Active' : 'Not Active'} </p>
        </div> 
    `

    if(data.IsLogin){
        AuthorizedUserInfo(data,tableName);
    }
}

let numbersFirstRow = 1;
let numbersLastRow =50;

let callsFirstRow = 1;
let callsLastRow = 50;

function AuthorizedUserInfo(data,tableName){
    ProfileInfo.innerHTML += `
        <p><span id='BallanceValue'>Ballance: ${data.User.Ballance}</span>
            <button
                class='custom-btn btn'
                name="UserBallance"
                value='${data.User.User_Id}'
                onclick="BallanceUpdate({id:this.value,name:this.name,ballance:${data.User.Ballance}})">
            <span>Top up</span></button> 
        </p>
        <button
            class='custom-btn btn'
            name="UserDelete"
            value='${data.User.User_Id}'
            onclick="profileController({id:this.value,name:this.name})">
        <span>Delete My Account</span> </button>    
       
        <button
            class='custom-btn btn'
            onclick="load('Numbers')">
        <span>My Numbers</span> </button>    
       
        <button
            class='custom-btn btn'
            name="UserDelete"
            value='${data.User.User_Id}'
            onclick="load('Calls')">
        <span>Call History</span> </button>    
        <hr>
    `

    if(data.hasOwnProperty('Numbers') && tableName == 'Numbers'){

        CallsNumsInfo.append(Renders('ProfileNumbers',data.Numbers))
        let rows = TableRowsControl(CallsNumsInfo, numbersFirstRow, data.Numbers,'pageChange','Numbers')
        numbersFirstRow = rows.firstRow;
        numbersLastRow = rows.lastRow
   
    }

    if(data.hasOwnProperty('Calls') && tableName=='Calls'){
        
        CallsNumsInfo.append(Renders('ProfileCalls', data.Calls))
        let rows = TableRowsControl(CallsNumsInfo, callsFirstRow, data.Calls,'pageChange','Calls')
        callsLastRow = rows.lastRow;
        callsFirstRow = rows.firstRow;
       
    }
}

function pageChange(name){
   
    TableRowsChange(name,(firstRow,lastRow,canChange)=>{
        if(canChange){
            if(BtnFirstRow.name === 'Numbers'){
                numbersFirstRow = firstRow;
                numbersLastRow = lastRow;
            } else {
                callsFirstRow = firstRow;
                callsLastRow = lastRow;
            }
            load(BtnFirstRow.name);
        }
    })
}

function load(tableName){
   
    fetch(`${document.URL}`,{
        method:'POST', 
       
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            callsFirstRow:callsFirstRow,
            callsLastRow:callsLastRow,
            numsFirstRow:numbersFirstRow,
            numsLastRow:numbersLastRow
        })
    })
    .then(result=>{                
        return result.json();
    })
    .then((data)=>{
        UserInfo(data,tableName);
    })
}