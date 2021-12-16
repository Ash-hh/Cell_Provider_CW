const Db = require('./DB');
const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const DB = new Db();
const bcrypt = require('bcrypt')
app.use(cookieParser('key'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));



app.route('/register') 
    .get((req,res)=>{
        res.sendFile(__dirname+'/resources/register.html');
    })
    .post((req,res)=>{   
        DB.FindUserByLogin(req.body.username)
        .then(records=>{
            if(!records){
                
                if(DB.Validation([
                    req.body.surname,
                    req.body.midname,
                    req.body.dateOfBirth,
                    req.body.login,
                    req.body.password])
                ){
                   
                    let hash = bcrypt.hashSync(req.body.password.trim(), 5);
              
                    DB.AddUser(req.body.username,
                        req.body.surname,
                        req.body.midname,
                        req.body.dateOfBirth,
                        req.body.login,
                        hash,
                        2,0,1);
                    res.redirect('/login'); 
                } else {
                    res.redirect('/register'); 
                }
                
            } else {
                res.redirect('/register');
            }
        });    
         
    });

app.route('/login') 
    .get((req,res)=>{
        res.clearCookie('User');
        res.sendFile(__dirname+'/resources/login.html');        
    })
    .post((req,res)=>{

        if(DB.Validation([req.body.login,req.body.password])){
            DB.FindUserByLogin(req.body.login)
            .then(records=>{
                if(records){  
                    if(records.IsActive){    
                           
                        if(bcrypt.compareSync(req.body.password,records.Password)){
                            
                            delete records.Password;       
                            res.cookie('User',records);
                           
                            res.redirect('/');                       
                        } else {
                            
                            res.redirect('/login');
                        }
                    } else {
                        res.redirect('/login')
                    }
                } else {
                    res.redirect('/login'); 
                }
            });            
        } else {
            res.redirect('/login')
        }
       
    });


app.get('/logout',(req,res)=>{    
    res.clearCookie('User');
    res.redirect('/');
});    

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/resources/index.html');
});


app.get('/api/all/:exec/:firstRow/:lastRow',(req,res)=>{ 
   
    DB.PrintAll(req.params.exec,req.params.firstRow,req.params.lastRow)
    .then(records=>{
        res.json(records);
    })
});


app.get('/api/findbyid/:exec/:id',(req,res)=>{
    if(req.params.id && req.params.exec){
       
        let id = req.params.id === 'cookie' ? 
        (req.cookies.User ? req.cookies.User.User_Id : undefined)
        : req.params.id;

        DB.FindById(req.params.exec,id)
        .then(records=>{
            if(records){                
                res.json(records);
            } else {
                res.sendStatus(404);               
            }
        })
    }
})



app.post('/api/user',(req,res)=>{ 
    
    if(req.body.hasOwnProperty('userObj')){
        if(req.body.userObj.hasOwnProperty('Ballance')){
            DB.UpdateUser(req.body.id,req.body.userObj);
           
            let BuffUser=req.cookies.User;
            BuffUser.Ballance = req.body.userObj.Ballance;
           
            res.cookie('User', BuffUser);
            res.end();
            
        } else {           
            DB.UpdateUser(req.body.id,req.body.userObj)
            
            res.clearCookie('User');  
            res.redirect('/');     
        }
    } else {
        async function awaitDelete(){
            await  DB.DeleteNumber(req.body.id)
        }
        
        awaitDelete()

        DB.FindByIdWithRowsRange('FindUserNumbers',req.cookies.User.User_Id,1,50)
        .then(records=>{
            res.json({
                IsLogin:true,
                User:req.cookies.User,             
                Numbers:records
            })
        })
    }
    

})

app.route('/profile/:login') 
    .get((req,res)=>{

        if(req.params.login){
            res.sendFile(__dirname+'/resources/profile.html')

        } else {
            res.sendStatus(404); 
        }
    })
    .post((req,res)=>{ 

        if(req.cookies.User && req.cookies.User.Login === req.params.login){ 
            

            console.log(req.body)

            DB.FindByIdWithRowsRange(
                'FindUserNumbers',
                req.cookies.User.User_Id,
                req.body.numsFirstRow,
                req.body.numsLastRow
            ).then((records)=>{
                DB.FindByIdWithRowsRange(
                    'FindUserCalls',
                    req.cookies.User.User_Id,
                    req.body.callsFirstRow,
                    req.body.callsLastRow
                ).then(CallRecords=>{
                    CallRecords ?
                    res.json({
                        IsLogin:true,
                        User:req.cookies.User,
                        Numbers:records,
                        Calls:CallRecords
                    }) : 

                    res.json({
                        IsLogin:true,
                        User:req.cookies.User,
                        Numbers:records
                    });

                })
               
            })

        } else {

            DB.FindUserByLogin(req.params.login)
            .then(records=>{

                if(records){
                    if(req.cookies.User && req.cookies.User.User_Type == 1){

                        delete records.Password;
                        res.json({
                            IsLogin:false,
                            User:records
                        });
    
                    } else {
                        
                        delete records.User_Type;                       
                        delete records.Password;
                        res.json({
                            IsLogin:false,
                            User:records
                        });
                    }
                }                
            })
            
        }
    })

app.route('/subtariff') 
    .get((req,res)=>{
        if(req.query.id){   
            if(req.cookies.User){
                res.sendFile(__dirname+'/resources/number.html');
            } else {
                res.redirect('/login');
            }  
        } else {
            res.sendStatus(404);
        }
    })
    .post((req,res)=>{

        let number;
        
        if(req.cookies.User){
            DB.GetNumber()
            .then(result=>{            
                number = result;
               
                DB.AddNumber(
                    number,
                    req.cookies.User.User_Id,
                    req.query.id,
                    '2021-01-01'
                );
            
                res.send(`Your number is ${number}`)
                res.end();
            })
        } else {
           
            res.send('You must authorize before get number')
        }
        
      
               
       

       
       
    })

app.route('/api/admin/:exec/:id') 
    .post((req,res)=>{      

        if(req.params.exec != 'AddTariff'){
            if(req.params.id == req.cookies.User.User_Id){
               
                res.send('-1')
            } else {
                DB[req.params.exec](req.params.id,req.body)
            }
        } else {
            
            DB[req.params.exec](req.body)
        }

        res.end();
    })
    .get((req,res)=>{ 

        if(req.params.exec.indexOf('Xml')==-1){
            DB.DbMonitoring(req.params.exec)
            .then(records=>{            
                res.json(records);
            })
        } else {
         
            DB.XMLFunc(req.params.exec,(result)=>{
                
                switch(result){
                    case 0: res.end('Operation Succesfully done'); break;
                    case -1: res.end('Import end with errors'); break;
                    default: res.end('Export done with error'); break;
                }
            })
        }
    })


app.post('/api/log/:firstRow/:lastRow',(req,res)=>{
    DB.LogInfo(
        req.body.mode,
        req.body.table,
        req.body.key,
        req.body.date,
        req.body.daterange,
        req.params.firstRow,
        req.params.lastRow
    ).then(result=>{
        res.json(result)
    })
})

app.get('/Admin/:page',(req,res)=>{

        if(req.cookies.User){           
            if(req.cookies.User.User_Type == 1){
                
                switch(req.params.page){
                    case 'monitor' : res.sendFile(__dirname+'/resources/monitorpage.html'); break;
                    case 'main':  res.sendFile(__dirname+'/resources/adminpage.html'); break;
                }
               
            } else {
                res.redirect('/')  
            }
           
        } else {
            res.redirect('/login')
        }
        
    })  

app.route('/call') 
    .get((req,res)=>{
        res.sendFile(__dirname+'/resources/call.html')
    })
    .post((req,res)=>{

        if(req.body.submit === 'Start Call'){
           
            DB.StartCall(req.body.sender,req.body.receiver,(req.body.min*60)+req.body.second)
            .then(records=>{
              
                res.end(`${records}`);
            })


            
        } else if (req.body.submit === 'End Call' || req.body.submit==='End Call Emergency'){

            let User = req.cookies.User ? req.cookies.User : undefined;

            DB.EndCall(
                req.body.callId,
                req.body.sender,
                (req.body.min*60)+req.body.second
            ).then(records=>{     
                if(User){
                    let BuffUser=req.cookies.User;
                    BuffUser.Ballance = records.Ballance;
                    res.cookie('User',BuffUser)
                }          
                res.end(`Call cost: ${records.Bill}. Account ballance: ${records.Ballance}`)
            })

        }
        
    })

app.get('/api/resources/:dir/:filename',(req,res)=>{
    console.log(`${req.params.dir}/${req.params.filename}`)
    res.sendFile(__dirname+`/resources/${req.params.dir}/${req.params.filename}`)
})

app.listen(5000);

DB.SetFreeNumbers();


    
