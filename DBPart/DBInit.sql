go
create database CELL_PROVIDER;

go
use CELL_PROVIDER;

create table USER_TYPE
(
	Id int identity(1,1) constraint USER_TYPE_PK primary key,
	User_Type nvarchar(20)
);

go

create table USERS
(
	User_Id int identity(1,1) constraint USER_PK primary key,
	User_Name nvarchar(50),
	User_Surname nvarchar(50),
	User_MidName nvarchar(50),
	Date_Birth date,
	Login nvarchar(50) unique,
	Password nvarchar(50),
	User_Type int constraint USER_TYPE_FK foreign key references USER_TYPE(Id),
	Ballance money,
	IsActive bit
);

create table TARIFFS
(
	Tariff_Id int identity(1,1) constraint TARIFFS_PK primary key,
	Description ntext,
	Call_Cost_perm money
);


create table NUMBERS
(
	Number_Id int identity(1,1) constraint NUMBER_PK primary key,
	Number int,
	User_Id int constraint USER_ID_FK foreign key references USERS(User_Id),
	Tariff_Id int constraint TARRIF_ID_FK foreign key references TARIFFS(Tariff_Id),
	Date_Open date
);
go

create table CALLS
(
	Call_Id int identity(1,1) constraint CALL_PK primary key,
	User_Sender_Id int constraint SENDER_FK foreign key references USERS(User_Id),
	User_Sender_Number int,
	User_Receiver_Id int constraint RECEIVER_FK foreign key references USERS(User_Id),
	User_Receiver_Number int,
	Call_Time int,
	Call_Cost money
);



drop table CALLS
drop table NUMBERS
drop table USERS
drop table TARIFFS
drop table USER_TYPE







