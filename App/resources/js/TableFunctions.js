

function TableRender(HeaderArray,PropertyArray,Data,Controller){

    
    if(Data.length == 0 || !Data){
        return 'Table is empty'
    }

    let ButtonControllerMain
    if(Controller && Controller.length>1){
        ButtonControllerMain = []

        for(let i =0;i<Controller.length;i++){
            ButtonControllerMain[i]= 
                {
                    id: PropertySet(Controller[i],'id'),
                    idValueProperty: PropertySet(Controller[i],'idValueProperty'),
                    name: PropertySet(Controller[i],'name'),
                    nameValueProperty: PropertySet(Controller[i],'nameValueProperty'),
                    value:PropertySet(Controller[i],'value'),
                    valueValueProperty:PropertySet(Controller[i],'valueValueProperty'),
                    onclick:PropertySet(Controller[i],'onclick'),
                    onclickArgs:PropertySet(Controller[i],'onclickArgs'),
                    text:Controller[i].text
                }

            
        }

    } else if(Controller){
        ButtonControllerMain ={
            id: PropertySet(Controller,'id'),
            idValueProperty: PropertySet(Controller,'idValueProperty'),
            name: PropertySet(Controller,'name'),
            nameValueProperty: PropertySet(Controller,'nameValueProperty'),
            value:PropertySet(Controller,'value'),
            valueValueProperty:PropertySet(Controller,'valueValueProperty'),
            onclick:PropertySet(Controller,'onclick'),
            onclickArgs:PropertySet(Controller,'onclickArgs'),
            text:Controller.text
        }
    }

    



    function PropertySet(obj,propertyName){
      
        return obj.hasOwnProperty(propertyName) ?  obj[propertyName] : undefined
    }

    function PropertySetData(obj,propertyArgs,Data){
        
        let dataProperty = obj[propertyArgs[1]];
     
        return obj[propertyArgs[0]] ?  obj[propertyArgs[0]] : Data[dataProperty] 

    }

    function ButtonRender(ButtonController, Data){
        let button = '<button class="custom-btn btn"'
           
        if(ButtonController.id || ButtonController.idValueProperty){
            button += ` id='${PropertySetData(ButtonController,['id','idValueProperty'],Data)}' `            
        }

        if(ButtonController.name || ButtonController.nameValueProperty){
            button += ` name='${PropertySetData(ButtonController,['name','nameValueProperty'],Data)}' `
        }

        if(ButtonController.value || ButtonController.valueValueProperty){
            button += ` value='${PropertySetData(ButtonController,['value','valueValueProperty'],Data)}'`
        }
           
        if(ButtonController.onclick || ButtonController.onclickArgs){
            button+=` onclick='${ButtonController.onclick}(${ButtonController.onclickArgs ? ButtonController.onclickArgs: ''})' `
        }
        button += `>${ButtonController.text}</button>` 
        
        
        return button
    }


    function DateParse(date){
        let result = new Date(date);
       
        if(result.getHours() != 3 && result.getMinutes() != 0 && result.getSeconds() != 0){
           
            return `${date.slice(0,10)}-${result.getHours()}:${result.getMinutes()}:${result.getSeconds()}`
        } else {
            return date.slice(0,10);
        }
    }

    let Table = document.createElement("table")

    let tableHeader = Table.insertRow();

    for(let i = 0;i<HeaderArray.length;i++){
       
        tableHeader.insertCell().innerHTML = HeaderArray[i];

    }

    if(Data.length>1){
        Data.forEach(element => {
            let row = Table.insertRow();
            for(let i = 0;i<PropertyArray.length;i++){
                if(PropertyArray[i].indexOf('Date')!=-1 || PropertyArray[i].indexOf('time') !=-1){
                   
                    row.insertCell().append(DateParse(element[PropertyArray[i]]))
                } else {
                    row.insertCell().append(element[PropertyArray[i]])
                }
              
            }

           

            if(ButtonControllerMain && ButtonControllerMain.length>1){
                
                ButtonControllerMain.forEach(elementButton => {
                    row.insertCell().innerHTML = ButtonRender(elementButton,element)
                });

            } else if(ButtonControllerMain){
                row.insertCell().innerHTML = ButtonRender(ButtonControllerMain, element);
            }
        });
    } else {
        if(Data[0]){
            Data =Data.pop()
        }
        let row = Table.insertRow();
       
        for(let i = 0;i<PropertyArray.length;i++){
            
            row.insertCell().append(Data[PropertyArray[i]])
        }

        if(ButtonControllerMain && ButtonControllerMain.length>1){
                
            ButtonControllerMain.forEach(elementButton => {
                row.insertCell().innerHTML = ButtonRender(elementButton,Data)
            });

        } else if(ButtonControllerMain){
            row.insertCell().innerHTML = ButtonRender(ButtonControllerMain, Data);
        }
    }

    return Table

}


function Renders(TableName,arr){

    console.log(TableName)

    switch(TableName){
        case 'AllUsers' : 
            
            return TableRender(
                ['Id','Login','Name','Surname','Second Name','Type','Ballance','Status'],
                ['User_Id','Login','User_Name','User_Surname','User_MidName','User_Type','Ballance','IsActive'],
                arr,
                [
                    {
                        idValueProperty:'User_Id',
                        name:'User_Id',
                        //value:'{exec:"UpdateUser",property:"IsActive"}',
                        onclick:'ControllerFunc',
                        onclickArgs:'this.id, this.name, {exec:"UpdateUser",property:"IsActive"}',
                        text:'Change Activity'
                    },
                    {
                        idValueProperty:'User_Id',
                        name:'User_Id',
                        //value:'{"exec":"UpdateUser","property":"User_Type"}' ,
                        onclick:'ControllerFunc',
                        onclickArgs:'this.id,this.name, {"exec":"UpdateUser","property":"User_Type"}',
                        text:'Change UserType'
                    },
                    {
                        idValueProperty:'User_Id',
                        name:'User_Id',
                        //value:'{"exec":"DeleteUser"}',
                        onclick:'ControllerFunc',
                        onclickArgs:'this.id,this.name, {"exec":"DeleteUser"}',
                        text:'Delete User' 
                    }
                ]
                
            )
        break;

        case 'AllTariffs' : 
           
            return TableRender(
                ['Id','Desription','Call Cost Per Min'],
                ['Tariff_Id','Description','Call_Cost_perm'],
                arr,
                [
                    {
                        idValueProperty:'Tariff_Id',
                        name:'Tariff_Id',
                        onclick:'ControllerFunc',
                        onclickArgs:'this.id, this.name, {"exec":"DeleteTariff"}',
                        text:'Delete Tariff'
                    },
                    {
                        idValueProperty:'Tariff_Id',
                        name:'Tariff_Id',
                        onclick:'PopUpShow',
                        onclickArgs:' "Edit",this.id,this.name',
                        text:'Edit'
                    }
                
                ]
            )
            

        break;
        case 'AllNumbers' : 

            return TableRender(
                ['Id','Number','User Id','Tariff Id','Open date'],
                ['Number_Id','Number','User_Id','Tariff_Id','Date_Open'],
                arr,
                {
                    idValueProperty:'Number_Id',
                    name:'Number_Id',
                    onclick:'ControllerFunc',
                    onclickArgs:'this.id,this.name,{"exec":"DeleteNumber"}',
                    text:'Delete Number'
                }
            )
        break;
        case 'AllCalls' : 
           
            return TableRender(
                ['Id','Sender Id','SenderNumber','Receiver Id','Receiver Number','Time','Cost'],
                ['Call_Id','User_Sender_Id','User_Sender_Number','User_Receiver_Id','User_Receiver_Number','Call_Time','Call_Cost'],
                arr,
                {
                    idValueProperty:'Call_Id',
                    name:'Call_Id',
                    onclick:'ControllerFunc',
                    onclickArgs:'this.id, this.name,{exec:"DeleteCall"}',
                    text:'Delete Call'
                }
            )
        
        break;

        case 'ProfileNumbers':  

            return TableRender(
                ['Number','Tariff','Call Cost','Date Open'],
                ['Number','Description','Call_Cost_perm','Date_Open'],
                arr,
                {
                    idValueProperty:'Number_Id',
                    name:'DeleteNumber',
                    onclick:'profileController',
                    onclickArgs:'{id:this.id,name:"NumberDelete"}',
                    text:'Delete Number'
                }
            )
        break;

        case 'ProfileCalls':

            return TableRender(
                ['My Number','Receiver Number','Time','Cost'],
                ['User_Sender_Number','User_Receiver_Number','Call_Time','Call_Cost'],
                arr
            )
        break;

        case 'LastExecs':
            return TableRender(
                ['Procedure Name','Last Execution'],
                ['name','last_execution_time'],
                arr
            )
        break;

        case 'ProcExecsCount':
            return TableRender(
                ['Procedure Name','Execution Count'],
                ['name','total_execution_count'],
                arr
            )
        break;

        case 'LongestAVGexecTime':
                ExecsCount.innerHTML =''
                let input = [];

                input.push(["name", "text", { role: "style" } ])

                arr.forEach(element => {
                    input.push([element.name, element.sumAvg/1000,`${element.sumAvg/1000 > 1000 ? 'red':'blue'}`])
                });



                google.charts.load("current", {packages:["corechart"]});
                google.charts.setOnLoadCallback(drawChart);
                function drawChart() {
                var data = google.visualization.arrayToDataTable(input);

                var view = new google.visualization.DataView(data);
                view.setColumns([0, 1,
                                { calc: "stringify",
                                    sourceColumn: 1,
                                    type: "string",
                                    role: "annotation" },
                                2]);

                var options = {
                    title: "Average procedure executions time",
                    width: 700,
                    height: 500,
                    bar: {groupWidth: "95%"},
                    legend: { position: "none" },
                };
                var chart = new google.visualization.BarChart(document.getElementById("AverageExecTime"));
                chart.draw(view, options);
            }
           
        break;


        case 'LogInfo':
           
            return TableRender(
                ['Id','Table','Operation','Value Before','Value After','Date'],
                ['OpId','TableName','Operation','BeforeVlue','AfterValue','Date'],
                arr
            )
        break;

        case 'LogInfoCUDCount':

            arr = arr.pop()

            AverageExecTime.innerHTML=`<div class=row> <p>Total operations: ${arr.OperationCount}  <br> Total Session operations: ${arr.OperationCountSession}</p><div id="CUD" class="col"> </div> <div id="CUDSession" class="col"> </div> </div>`

            google.charts.load("current", {packages:["corechart"]});
            google.charts.setOnLoadCallback(drawChart2);
            function drawChart2() {
                var data = google.visualization.arrayToDataTable([
                ["Operation", "Count"],
                ['Insert', arr.InsertCount],
                ['Update', arr.UpdateCount],
                ['Delete', arr.DeleteCount],
                
                ]);
        
                var options = {
                title: 'CUD Operations',
                is3D: true,
                };
        
                var chart = new google.visualization.PieChart(document.getElementById("CUD"));
                chart.draw(data, options);
            }

            google.charts.setOnLoadCallback(drawChartSession);
            function drawChartSession() {
                var data = google.visualization.arrayToDataTable([
                ["Operation", "Count"],
                ['Insert', arr.InsertCountSession],
                ['Update', arr.UpdateCountSession],
                ['Delete', arr.DeleteCountSession],
                
                ]);
        
                var options = {
                title: 'Session CUD Operations',
                is3D: true,
                };
        
                var chart = new google.visualization.PieChart(document.getElementById("CUDSession"));
                chart.draw(data, options);
            }
        break;


        
    }
}