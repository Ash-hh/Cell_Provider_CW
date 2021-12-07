let arr=[];     
                
function DBInfo(){
    fetch(`http://localhost:5000/api/admin/DBObjCount/0`)
    .then(result =>{
        
        return result.json()
    }).then(data=>{                    
        data = data.pop();
       
        header.innerHTML +=`
            Total objects in Database: ${data.Obj_Count}   Tables:${data.Table_Count}   Procedures:${data.Procedures_Count}
            <br>
        `
    })
}

function send(Button_Value){

    if(Button_Value.indexOf('Xml')==-1){
        fetch(`http://localhost:5000/api/all/${Button_Value}`)
        .then(result=>{
            return result.json()
        }).then(data=>{

            arr = data;
            ff = arr[0];
            resultDiv.innerHTML = '';
            resultDiv.append(Renders(Button_Value,arr))
            
        })
    } else {
        
        awaitPopUp.style.visibility = 'visible';

        fetch(`http://localhost:5000/api/admin/${Button_Value}/0`)
        .then(result =>{
            return result.text()
        }).then(data=>{
            awaitPopUp.style.visibility = 'hidden';
            alert(data);
            
        })
    }
}

function ControllerFunc(id,name,value,Tariff=undefined){

   console.log(value)

   // value = JSON.parse(value)
    
    let searchelem = arr.find(user => user[name] == id);
    
    let elemId =  arr.indexOf(searchelem); 

    if(value.exec.indexOf('Delete')==-1){
        if(!Tariff && value.exec.indexOf('Update')!=-1){
            if(value.property === 'User_Type'){
                searchelem[value.property] = searchelem[value.property] == 1 ? 2 : 1;
            } else{
                searchelem[value.property] = !searchelem[value.property]
            }
        } else {
            searchelem = Tariff ? Tariff : searchelem;
            arr[elemId] = searchelem; 
        }   
    } else {
        if(confirm('U cant rollbcak Delete')){
            arr.splice(elemId,1);
                                  
        } else {
           
            return 0;
        }
    }

 
    
    fetch(`http://localhost:5000/api/admin/${value.exec}/${id}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(searchelem)
    })
    .then(result=>{
        if(result.ok)
            return result.text();
    }).then(data=>{
        resultDiv.innerHTML = '';
       
        if(value.exec.indexOf('Tariff')!=-1) 
        {   
            if(value.exec == 'AddTariff'){
                send('AllTariffs')
            } else {    
                resultDiv.append(Renders('AllTariffs',arr))
            }
        }   

        if(value.exec.indexOf('Number')!=-1) {
            resultDiv.append(Renders('AllNumbers',arr))
        }
        if(value.exec.indexOf('User')!=-1) {
            resultDiv.append(Renders('AllUsers',arr))
        }
        if(value.exec.indexOf('Call')!=-1) {
            resultDiv.append(Renders('AllCalls',arr))
        }

    })

}

function PopUpHide(){
    popup.style.visibility = "hidden";               
}

function PopUpShow(mode,id,name){

    let searchelem = arr.find(user => user[name] == id);

    if(mode === 'Edit'){

        popup_content.innerHTML = `
        <input type='button' value='close' onclick='PopUpHide()'>
        <form name="TariffForm">
            <label name="id" id="${id}">Edit Tariff Id: ${id}</label>
            <br>
            <input type="text" name="Description" value="${searchelem.Description}">
            <br>
            <input type="text" name ="Call_Cost" value="${searchelem.Call_Cost_perm}">
            <br>
            <input type="button" value="Edit" onclick="TariffEdit(${id})">
        </form>`

    } else if (mode === 'Delete'){
        
        popup_content.innerHTML =`
        <input type='button' value='close' onclick='PopUpHide()'>
        <form name="TariffFormAdd">
            <label> Description </label>
            <input type="text" name="Description">
            <br>
            <label> Call Cost </label>
            <input type="text" name ="Call_Cost" >
            <br>
            <input type="button" value="Add" onclick="AddTariff()">
        </form>`
    }

    popup.style.visibility = "visible" 
}

function TariffEdit(id){
    let form = document.forms.TariffForm;

    let Tariff = {
        Tariff_Id :id,
        Description : form.Description.value,
        Call_Cost_perm : form.Call_Cost.value
    }
    ControllerFunc(id,"Tariff_Id",{exec:"UpdateTariff"},Tariff)

    PopUpHide();
}

function AddTariff(){
    let form = document.forms.TariffFormAdd;

    let Tariff = {
        Description : form.Description.value,
        Call_Cost_perm : form.Call_Cost.value
    }
   
    ControllerFunc(undefined,"Tariff_Id",{"exec":"AddTariff"},Tariff) 
    PopUpHide();
    
}


//Monitor Controller


function MonitorController(exec){

    fetch(`http://localhost:5000/api/admin/${exec}/0`)
    .then(result=>{
        if(result.ok)
            return result.json();
    }).then(data=>{
        console.log(data)
        ExecsCount.innerHTML='';
        ExecsCount.append(Renders(exec,data));
    })
}

