let sql = require('mssql/msnodesqlv8');

let ConnectionPool;
const config = {
    "driver":"msnodesqlv8",
    "connectionString":"Driver={SQL Server Native Client 11.0};Server={DESKTOP-23913PP};Database={CELL_PROVIDER};Trusted_Connection={yes};"
};

class DB{
    constructor()
    {
        ConnectionPool = new sql.ConnectionPool(config).connect().then(pool=>{
            console.log('Connected to CELL_PROVIDER');
            return pool;
        }).catch(err=>{
            console.log(`Connection Failed ${err}`);
        })
    }

    AddUser(Username,Surname,MidName,DateOfBirth,login,password,UserType,Ballance,Activity){
        sql.connect(config).then(pool=>{
            return pool.request()
            .input('Username',sql.NVarChar,Username)
            .input('Surname',sql.NVarChar,Surname)
            .input('MidName',sql.NVarChar,MidName)
            .input('DateOfBirth',sql.Date,DateOfBirth)
            .input('login',sql.NVarChar,login)
            .input('password',sql.NVarChar,password)
            .input('UserType',sql.Int,UserType)
            .input('Ballance',sql.Money,Ballance)
            .input('Activity',sql.Bit,Activity)
            .execute('UserAdd');
        }).catch(err=>{
            console.log(err);
        })    
    }    

    AddNumber(Number,UserId,TariffId,DateOpen){
        sql.connect(config).then(pool=>{
            return pool.request()
            .input('Number',sql.Int,Number)
            .input('UserId',sql.Int,UserId)
            .input('TariffId',sql.Int,TariffId)
            .input('DateOpen',sql.Date,DateOpen)           
            .execute('NumberAdd')
        }).catch(err=>{
            console.log(err);
        })
    }

    AddCall(Sender,Receiver,Time){ //FIXME: useless

        return sql.connect(config).then(pool=>{
            return pool.request()
            .input('User_Sender_Id',sql.Int,Sender)
            .input('User_Receiever_Id',sql.Int,Receiver)
            .input('Call_Time',sql.Int,Time)
            .execute('CallAdd')
            .then(result=>{               
                return result.recordset.pop();
            })
        }).catch(err=>{
            console.log(err);
        })
    }

    AddTariff(Tariff){
        console.log(Tariff)
        sql.connect(config).then(pool=>{
            pool.request()
            .input('Description',sql.NText,Tariff.Description)
            .input('CallCostPerMin',sql.Money,Tariff.Call_Cost_perm)
            .execute('TariffAdd')
        }).catch(err=>{
            console.log(err);
        })
    }

    FindById(exec,id){
        return sql.connect(config).then(pool=>{
            return pool.request()
             .input('Id',sql.Int,id)
             .execute(`${exec}`)
             .then(result=>{
                 console.log(result)
                return result.recordset.length <= 1 ? result.recordset.pop() : result.recordset;
             });            
         });    
    }

    FindUserByLogin(Login){       
        return sql.connect(config).then(pool=>{
           return pool.request()
            .input('login',sql.NVarChar,Login)
            .execute('FindUserByLogin')
            .then(result=>{               
                return result.recordset.pop();
            });            
        });    
    }

    UpdateCall(id,sender,receiver,time){ //FIXME: useless?
        return sql.connect(config).then(pool=>{
            return pool.request()
            .input('Id',sql.Int,id)
            .input('User_Sender_Id',sql.Int,sender)
            .input('User_Receiever_Id',sql.Int,receiver)
            .input('Call_Time',sql.Int,time)
            .execute('CallUpdate')
        })
    }

    UpdateUser(id,UserObject){ //takes object

        return sql.connect(config).then(pool=>{

            let result = pool.request().input('Id',sql.Int,id)
            if (UserObject.hasOwnProperty('User_Name')){
               
                result.input('Username',sql.NVarChar,UserObject.User_Name);
            } 
            if (UserObject.hasOwnProperty('User_Surname')) result.input('Surname',sql.NVarChar,UserObject.User_Surname);
            if (UserObject.hasOwnProperty('User_MidName')) result.input('MidName',sql.NVarChar,UserObject.User_MidName);
            if (UserObject.hasOwnProperty('Date_Birth')) result.input('DateOfBirth',sql.Date,UserObject.Date_Birth);
            if (UserObject.hasOwnProperty('Login')) result.input('login',sql.NVarChar,UserObject.Login);
            if (UserObject.hasOwnProperty('Password')) result.input('password',sql.NVarChar,UserObject.Password);
            if (UserObject.hasOwnProperty('User_Type')) result.input('UserType',sql.Int,UserObject.User_Type);
            if (UserObject.hasOwnProperty('Ballance')) result.input('Ballance',sql.Money,UserObject.Ballance);
            if (UserObject.hasOwnProperty('IsActive')) result.input('Activity',sql.Bit,UserObject.IsActive);

            return result.execute('UserUpdate');
            
        })
    }

    UpdateNumber(id,NumberObject){
        return sql.connect(config).then(pool=>{
            let result = pool.request().input('Id',sql.Int,id)
        
            if (NumberObject.hasOwnProperty('Number')) result.input('Number',sql.Int,NumberObject.Number);
            if (NumberObject.hasOwnProperty('User_Id')) result.input('UserId',sql.Int,NumberObject.User_Id);
            if (NumberObject.hasOwnProperty('Tariff_Id')) result.input('TariffId',sql.Int,NumberObject.Tariff_Id);
            if (NumberObject.hasOwnProperty('Date_Open')) result.input('DateOpen',sql.Date,NumberObject.Date_Open);
          
            return result.execute('NumberUpdate'); 
        })
    } 

    UpdateTariff(id,TariffObject){
        return sql.connect(config).then(pool=>{
            let result = pool.request().input('Id',sql.Int,id)
        
            if (TariffObject.hasOwnProperty('Description')) result.input('Description',sql.Text,TariffObject.Description);
            if (TariffObject.hasOwnProperty('Call_Cost_perm')) result.input('CallCostPerMin',sql.Money,TariffObject.Call_Cost_perm);
            
            return result.execute('TariffUpdate'); 
        });
    }

    
    //TODO: Union start
    DeleteUser(id){
        sql.connect(config).then(pool=>{
            pool.request().input('Id',sql.Int,id).execute('UserDelete')
        });
    }

    DeleteNumber(id){
        sql.connect(config).then(pool=>{
            pool.request().input('Id',sql.Int,id).execute('NumberDelete')
        });
    }

    DeleteTariff(id){
        sql.connect(config).then(pool=>{
            pool.request().input('Id',sql.Int,id).execute('TariffDelete')
        });
    }

    DeleteCall(id){
        sql.connect(config).then(pool=>{
            pool.request().input('Id',sql.Int,id).execute('CallDelete')
        });
    }
      //TODO: Union end

    DeleteFromTable(id,exec){
        sql.connect(config).then(pool=>{
            pool.request().input('Id',sql.Int,id).execute(exec)
        });
    }

    PrintAll(exec){
        return sql.connect(config).then(pool=>{
            return pool.request()
            .execute(exec)
            .then(result=>{
                return result.recordset;
            })            
        })
    }

    GetNumber(){
        return sql.connect(config).then(pool=>{
            return pool.request()
            .execute("GetNumber")
            .then(result=>{
                return result.returnValue;
            })
        })
    }

    SetFreeNumbers(){
        sql.connect(config).then(pool=>{
            pool.request()
            .execute("SetFreeNums")
        })
    }

    StartCall(User_Sender_Id,User_Receiver_Id,Time){
        return sql.connect(config).then(pool=>{
            return pool.request()
            .input('senderNumber',sql.Int,User_Sender_Id)
            .input('receiverNumber',sql.Int,User_Receiver_Id)
            .input('time',sql.Int,Time)
            .execute('CallStart')
            .then(result=>{   
                console.log(result);
                return result.returnValue; 
            })
        })
    }

    EndCall(Call_Id,SenderNumber,Time){
        return sql.connect(config).then(pool=>{
            return pool.request()
            .input('callId',sql.Int,Call_Id)
            .input('senderNumber',sql.Int,SenderNumber)
            .input('timeEnd',sql.Int,Time)
            .execute('CallEnd')
            .then(result=>{                   
                return result.recordset.pop(); 
            })
        })
    }


    //Xml Functions
    XMLFunc(exec,callback){
        sql.connect(config).then(pool=>{
            pool.request()
            .execute(exec)
            .then(result=>{   
                console.log(result);          
                callback(result.returnValue);
            })
        }).catch(err=>{
            console.log(err.message)
            callback(-2)
        })

        
    }

    //Monitoring Functions

    GetLastExecs(){
        return sql.connect(config).then(pool=>{
            return pool.request()
            .execute("LastExecs")
            .then(result=>{
                return result.recordset;
            })
        })
    }

    GetExecsCount(){
        return sql.connect(config).then(pool=>{
            return pool.request()
            .execute("ProcExecsCount")
            .then(result=>{
                return result.recordset;
            })
        })
    }



}

module.exports = DB;