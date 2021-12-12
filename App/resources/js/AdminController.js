

let arr=[];   

let currentFirstRow = 1;

let currentLastRow = 50;
                
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

function pageChange(name){
   
    TableRowsChange(name,(firstRow,lastRow,canChange)=>{
       
        if(canChange){
           
          
            let tableName = BtnFirstRow.name;
            fetch(`http://localhost:5000/api/all/${tableName}/${firstRow}/${lastRow}`)
            .then(result=>{
                return result.json()
            }).then(data=>{    
                arr = data;
              
                resultDiv.innerHTML = '';
                resultDiv.append(Renders(tableName,arr))
                let rows = TableRowsControl(resultDiv,firstRow,arr,'pageChange',tableName)
                currentFirstRow = rows.firstRow;
                currentLastRow = rows.lastRow;
                
            })
        }
    })
}

function send(Button_Value){ 

    currentFirstRow = 1;

    currentLastRow = 50;

    if(Button_Value.indexOf('Xml')==-1){
        fetch(`http://localhost:5000/api/all/${Button_Value}/${currentFirstRow}/${currentLastRow}`)
        .then(result=>{
            return result.json()
        }).then(data=>{

            arr = data;
            ff = arr[0];
            resultDiv.innerHTML = '';
            resultDiv.append(Renders(Button_Value,arr))
            let rows = TableRowsControl(resultDiv,currentFirstRow,arr,'pageChange',Button_Value)
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

    let tableName='';  
   
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
        if(confirm('You can not to rollback delete, are you sure?')){
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
                return 0;
            } else {    
                tableName ='AllTariffs';
            }
        }   

        if(value.exec.indexOf('Number')!=-1) {
            tableName = 'AllNumbers';
        }
        if(value.exec.indexOf('User')!=-1) {
            tableName='AllUsers';
        }
        if(value.exec.indexOf('Call')!=-1) {
            tableName='AllCalls';
        }

        resultDiv.append(Renders(tableName,arr))
        let rows = TableRowsControl(resultDiv,currentFirstRow,arr,'pageChange',tableName)
       

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

    } else if (mode === 'Add'){
        
        popup_content.innerHTML =`
        <input class='custom-btn btn' type='button' value='close' onclick='PopUpHide()'>
        <form name="TariffFormAdd">
            <label> Description </label>
            <input type="text" name="Description">
            <br>
            <label> Call Cost </label>
            <input type="number" name ="Call_Cost" min='0' max='1000'>
            <br>
            <input class='custom-btn btn' type="button" value="Add" onclick="AddTariff()">
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
    console.log(form.Call_Cost.value)

    if(Number.isInteger(parseInt(form.Call_Cost.value))){
        if(form.Call_Cost.value < 0 || form.Call_Cost.value > 10000){
            alert(' Input correct data! \n You cant set call sot less then 0 and more then 10 000')
        } else {
    
            let Tariff = {
                Description : form.Description.value,
                Call_Cost_perm : form.Call_Cost.value
            }
           
            ControllerFunc(undefined,"Tariff_Id",{"exec":"AddTariff"},Tariff) 
            PopUpHide();
        }
    } else {
        alert(' Input correct data! \n You must input only number (0-9)')
    }
    

   
    
}


//Monitor Controller


function MonitorController(exec){
  
    fetch(`http://localhost:5000/api/admin/${exec}/0`)
    .then(result=>{
        if(result.ok)
            return result.json();
    }).then(data=>{
       
        if(exec == 'ProcExecsCount'){
            ExecsCount.innerHTML='';
            ExecsCount.append(Renders(exec,data));
        } else if(exec == 'LongestAVGexecTime' || exec == 'LogInfoCUDCount'){
            LastExecs.innerHTML='';
            ExecsCount.innerHTML=''
            Renders(exec,data)
        } else {
            LastExecs.innerHTML='';
            LastExecs.append(Renders(exec,data));
        }
        
    })
}

let currentLogFirstRow = 1;
let currentLogLastRow = 50;

function LogController(){

    currentLogFirstRow = 1;
    currentLogLastRow = 50;
    AverageExecTime.innerHTML=''

    

    let date;
    let daterange;
   
    let today = new Date()

    switch(TimeRange.value){
        case 'Today':
            date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            
        break;

        case '2 Days':
           
            date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            daterange = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()-1).padStart(2, '0')}`
        break;

        case 'Week':
            date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            daterange = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()-7).padStart(2, '0')}`
        break;
    }

   

    fetch(`http://localhost:5000/api/log/${currentLogFirstRow}/${currentLogLastRow}`,{ 
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            mode:Type.value,
            table:TableName.value == 'All' ? undefined : TableName.value,
            key:Operation.value == 'All' ? undefined : Operation.value,
            date:date,
            daterange:daterange
        })
    }).then(result=>{
        return result.json()
    }).then(data=>{
        LastExecs.innerHTML='';
        ExecsCount.innerHTML='';
        ExecsCount.append(Renders('LogInfo',data));
        let rows = TableRowsControl(ExecsCount,currentLogFirstRow,data,'pageChangeLog')
        currentLogFirstRow = rows.firstRow;
        currentLogLastRow = rows.lastRow;
       
    })


}

function pageChangeLog(name){
    TableRowsChange(name,(firstRow,lastRow,canChange)=>{

      

        if(canChange){

            let date;
            let daterange;
           
            let today = new Date()
        
            switch(TimeRange.value){
                case 'Today':
                    date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                    
                break;
        
                case '2 Days':
                   
                    date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                    daterange = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()-1).padStart(2, '0')}`
                break;
        
                case 'Week':
                    date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                    daterange = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()-7).padStart(2, '0')}`
                break;
            }

           
            fetch(`http://localhost:5000/api/log/${firstRow}/${lastRow}`,{ 
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    mode:Type.value,
                    table:TableName.value == 'All' ? undefined : TableName.value,
                    key:Operation.value == 'All' ? undefined : Operation.value,
                    date:date,
                    daterange:daterange
                })
            }).then(result=>{
                return result.json()
            }).then(data=>{
                LastExecs.innerHTML='';
                ExecsCount.innerHTML='';
                ExecsCount.append(Renders('LogInfo',data));
                let rows = TableRowsControl(ExecsCount,firstRow,data,'pageChangeLog')
                currentLogFirstRow = rows.firstRow;
                currentLogLastRow = rows.lastRow;
            
            })
        }
    })
}

