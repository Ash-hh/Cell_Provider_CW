use CELL_PROVIDER;

insert into USER_TYPE(User_Type) values ('Admin'),('User');

insert into TARIFFS(Description,Call_Cost_perm)
values
('Tarif tupa ogon',1),
('Tarif nu prosta bomba',2),
('Pushka a ne tarif',3);

select * from USERS;

insert into NUMBERS(Number,User_Id,Tariff_Id,Date_Open,IsActive,Ballance)
values 
(8021,1,1,'2000-01-01',1,100),
(8022,1,1,'2000-02-02',1,100),
(8023,2,1,'2000-02-02',1,100);

select * from NUMBERS
select * from CALLS




