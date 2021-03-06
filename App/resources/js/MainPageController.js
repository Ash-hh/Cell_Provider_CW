
function PopUpHide(){
    popup.style.visibility = "hidden";               
}

function PopUpShow(id){
    fetch(`http://localhost:5000/api/findbyid/FindTariff/${id}`)
    .then(result=>{
        return result.json();
    }).then(data=>{
        popup_content.innerHTML=`
            <p>${data.Description} ${data.Call_Cost_perm}</p>
            <input class='custom-btn btn' type="button" value="submit" onclick="numSubmit(${data.Tariff_Id})">
        `
    })

    popup.style.visibility = "visible" 
}

function onloadTariffs(){

    let refconfig = 'http://localhost:5000';

    fetch('http://localhost:5000/api/all/AllTariffs/1/50')
    .then(response=>{
        
        return response.json();
    })
    .then((data)=>{   
                  
        data.forEach(element => {
            Tariffs.innerHTML+=`
            <tr> 
                <td>${element.Description}</td> 
                <td>${element.Call_Cost_perm}</td> 
                <td>    
                    <button
                        class='custom-btn btn'
                        id=${element.Tariff_Id}"
                        onclick="PopUpShow(this.id)">
                    Get Tariff</button> 
                    
                </td>
            </tr>`;
        });
        
    })
}

function GetUser(){
    fetch('http://localhost:5000/api/findbyid/FindUser/cookie')
    .then(response=>{
        if(response.ok){
            return response.json();
        }    
        else{
            return 0;
        }
    })
    .then((data)=>{   
                        
        if(!data){
            header.innerHTML+=`
            <a class="underline" href='http://localhost:5000/login'>Log In</a> 
                
            <a class="underline" href='http://localhost:5000/register'>Register</a>`
        } else {
            
            header.innerHTML+=`
                <a class="underline" href='http://localhost:5000/profile/${data.Login}'>Profile</a>
                
                <a class="underline" href='http://localhost:5000/logout'>Log Out</a>`

            if(data.User_Type == 1){
            header.innerHTML+=`
            <a class="underline" href='http://localhost:5000/Admin/main'>Admin</a>`
            }
            
        }
    })
}

function load(){
    onloadTariffs();
    GetUser();
}

function numSubmit(id){

    fetch(`/subtariff?id=${id}`,{
        method:"POST"
    }).then(result=>{
        return result.text();
    }).then(data=>{
        
        alert(data);
    })
    PopUpHide();
   
}