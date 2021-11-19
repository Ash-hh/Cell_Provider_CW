const Db = require('./DB');
const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const DB = new Db();
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
                DB.AddUser(req.body.username,
                    req.body.surname,
                    req.body.midname,
                    req.body.dateOfBirth,
                    req.body.login,
                    req.body.password,
                    2,0,1);
                res.redirect('/login');  
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

        if(req.body.login && req.body.password){
            DB.FindUserByLogin(req.body.login)
            .then(records=>{
                if(records){                    
                    if(records.Password === req.body.password){
                        if(records.User_Type != 1){ 
                            delete records.User_Type;
                        }  
                        delete records.Date_Birth;      
                        delete records.Password;       
                        res.cookie('User',records);
                        console.log('ok');
                        res.redirect('/');                       
                    } else {
                        console.log('ne ok');
                        res.redirect('/login');
                    }
                } else {
                    res.redirect('/login'); 
                }
            });            
        }
       
    });


app.get('/logout',(req,res)=>{    
    res.clearCookie('User');
    res.redirect('/');
});    

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/resources/index.html');
});


app.get('/api/all/:exec',(req,res)=>{
    DB.PrintAll(req.params.exec)
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
           
            res.json({
                User:req.cookies.User,
                IsAdmin: req.cookies.User.User_Type == 1 ? 1 : 0
            });

        } else {

            DB.FindUserByLogin(req.params.login)
            .then(records=>{

                if(records){
                    if(req.cookies.User && req.cookies.User.User_Type == 1){
                        res.json({
                            User:records
                        });
    
                    } else {
                        
                        delete records.User_Type;                       
                        delete records.Password;
                        res.json(records);
                    }
                }                
            })
            
        }        
        
    })

app.route('/subtariff') //TODO: rotate to profile.html
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
            
        DB.GetNumber()
        .then(result=>{            
            number = result;

            DB.AddNumber(
                number,
                req.cookies.User.User_Id,
                req.query.id,
                '2021-01-01',
                1,
                0
            );
        
            res.send(`Your number is ${number}`)
            res.end();
        })
               
       

       
       
    })

app.post('/api/admin/:exec/:id',(req,res)=>{ //TODO: current task

    console.log(req.params.exec,req.params.id)
    console.log(req.body);
    
    DB[req.params.exec](req.params.id,req.body)
   
    res.end();

})



app.route('/Admin')
    .get((req,res)=>{
        if(req.cookies.User){           
            if(req.cookies.User.User_Type == 1){
                res.sendFile(__dirname+'/resources/adminpage.html')
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

            DB.FindNumberByNumber(req.body.sender,req.body.receiver)
            .then(records=>{
                if(records.length==2){
                    DB.AddCall(
                        req.body.sender == records[0].Number ? records[0].User_Id : records[1].User_Id,
                        req.body.receiver == records[0].Number ? records[0].User_Id : records[1].User_Id, 
                        (req.body.min*60)+req.body.second
                    ).then(records=>{
                    res.end(`${records.Call_Id}`);
                    })
                } else {
                    res.end('at least one number does not exist')
                }
            })
            
        } else if (req.body.submit === 'End Call' || req.body.submit==='End Call Emergency'){

            let User = req.cookies.User ? req.cookies.User : undefined;

            DB.FindNumberByNumberSynch(req.body.sender,(records)=>{
                
                if(!User || User.User_Id != records.User_Id){
                    DB.FindById('FindUser',records.User_Id) 
                   .then(records=>{                      
                       User = records;
                   })
                }
                
                DB.FindTariffByNum(req.body.sender)                
                .then(recordss=>{
                    let bill = recordss.Call_Cost_perm * ((req.body.min*60)+req.body.second);
                    User.Ballance -= bill;   
                    console.log(`Cookie: ${req.cookies.User.User_Id}| Current: ${User.User_Id}`)                
                    DB.UpdateUser(User.User_Id,{Ballance:User.Ballance})

                    if(req.cookies.User.User_Id == User.User_Id){
                        res.cookie('User',User);
                    }
                    
                    res.end(`call cost: ${bill} account ballance: ${User.Ballance}`)
                })

            })

            DB.FindById('FindCall',req.body.callId)
            .then(records=>{
                DB.UpdateCall(
                    req.body.callId,
                    records.User_Sender_Id,
                    records.User_Receiver_Id,
                    (req.body.min*60)+req.body.second
                )
            });

        }
        
    })

app.listen(5000);

DB.SetFreeNumbers();

    
