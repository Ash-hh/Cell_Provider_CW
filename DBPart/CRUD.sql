use CELL_PROVIDER

go

--------------------------------
--USERS--
--------------------------------


--Add User
create procedure UserAdd
	@Username nvarchar(50),
	@Surname nvarchar(50),
	@MidName nvarchar(50),
	@DateOfBirth date,
	@login nvarchar(50),
	@password nvarchar(50),
	@UserType int,
	@Ballance money,
	@Activity bit
as
begin
	insert into USERS(User_Name,User_Surname,User_MidName,Date_Birth,Login,Password,User_Type,Ballance,IsActive)
	values(@Username,@Surname,@MidName,@DateOfBirth,@login,@password,@UserType,@Ballance,@Activity);
end;


--Update User
go
create procedure UserUpdate
	@Id int,
	@Username nvarchar(50) = NULL,
	@Surname nvarchar(50) = NULL,
	@MidName nvarchar(50) = NULL,
	@DateOfBirth date = NULL,
	@login nvarchar(50) = NULL,
	@password nvarchar(50) = NULL,
	@UserType int = NULL,
	@Ballance money = NULL,
	@Activity bit = NULL
as
begin
	update USERS
	SET User_Name = IsNull(@Username, User_Name),
	User_Surname = IsNull(@Surname,User_Surname),
	User_MidName = IsNull(@MidName,User_MidName),
	Date_Birth = IsNull(@DateOfBirth,Date_Birth),
	Login = IsNull(@login,Login),
	Password = IsNull(@password,Password),
	User_Type = IsNull(@UserType,User_Type),
	Ballance = IsNull(@Ballance,Ballance),
	IsActive = IsNull(@Activity,IsActive)
	where User_Id = @Id;
end;

--Delete User
go
create procedure UserDelete
	@Id int
as
begin
	delete from CALLS where User_Sender_Id = @Id or User_Receiver_Id = @Id;
	delete from NUMBERS where User_Id = @Id;
	delete from USERS where User_Id = @Id;
end;

--Select all users from USERS
go
create procedure AllUsers
as
begin
	select * from USERS;
end;

--Select user from USERS
go
create procedure FindUser
	@Id int
as
begin
	select * from USERS where User_Id=@Id;
end;

--------------------------------
--TARIFFS
--------------------------------

--Insert Into TARIFFS
go


alter procedure TariffAdd
	@Description ntext,
	@CallCostPerMin money
as
begin
	insert into TARIFFS(Description,Call_Cost_perm)
	values(@Description, @CallCostPerMin);
end;

--Update Tariff
go
alter procedure TariffUpdate
	@Id int,
	@Description text = NULL,
	@CallCostPerMin money = NULL
as
begin
	update TARIFFS
	set Description = IsNull(@Description,Description), 
	Call_Cost_perm = IsNull(@CallCostPerMin,Call_Cost_perm)
	where Tariff_Id = @Id;
end;

--Delete Tariff
go
alter procedure TariffDelete 
	@Id int
as
begin
	delete NUMBERS where Tariff_Id = @Id;
	delete from TARIFFS where Tariff_Id = @Id;
end;

--Select all tariffs
go
create procedure AllTariffs
as
begin
	select * from TARIFFS
end;

--Select Tariff from tariffs
go
create procedure FindTariff
	@Id int
as
begin
	select * from TARIFFS where Tariff_Id = @Id;
end;

--------------------------------
--NUMBERS
--------------------------------
use CELL_PROVIDER
--NumberAdd
go 

use CELL_PROVIDER
alter procedure NumberAdd
	@Number int,
	@UserId int,
	@TariffId int,
	@DateOpen date
as
begin
	insert into NUMBERS(Number,User_Id,Tariff_Id,Date_Open)
	values
	(@Number,@UserId,@TariffId,@DateOpen);
end;

--NumberUpdate
go
alter procedure NumberUpdate
	@Id int,
	@Number int = NULL,
	@UserId int = NULL,
	@TariffId int = NULL,
	@DateOpen date = NULL
as
begin
	update NUMBERS
		SET Number = IsNull(@Number,Number),
			User_Id=IsNull(@UserId,User_Id),
			Tariff_Id=IsNull(@TariffId,Tariff_Id),
			Date_Open=IsNull(@DateOpen,Date_Open)
	
		where Number_Id = @Id
end;
go

--DeleteNumber
go
create procedure NumberDelete
	@Id int
as
begin
	delete NUMBERS where Number_Id = @Id;
end;

go

--FindUser
create procedure FindNumber
	@Id int
as
begin
	select * from NUMBERS where Number_Id = @Id;
end;
go

--AllNumbers
go
create procedure AllNumbers
as
begin
	select * from NUMBERS order by Number;
end;
go


--------------------------------
--Calls
--------------------------------

--AddCall
go 
alter procedure CallAdd
	@User_Sender_Id int,
	@User_Receiever_Id int,
	@Call_Time int
as
begin
	insert into CALLS(User_Sender_Id, User_Receiver_Id,Call_Time)
	values(@User_Sender_Id,@User_Receiever_Id,@Call_Time);

	return (SELECT TOP 1 Call_Id FROM CALLS ORDER BY Call_Id DESC)
end;

--FindCall by Id
go
create procedure FindCall
	@Id int
as
begin
	select * from CALLS where Call_Id = @id;
end;
go

--AllCalls
go
create procedure AllCalls
as
begin
	select * from CALLS
end;

--UpdateCall
go
alter procedure CallUpdate
	@Id int,
	@User_Sender_Id int =NULL,
	@User_Receiever_Id int =NULL,
	@Call_Time int=NULL
as
begin
	update CALLS
	set User_Sender_Id = IsNull(@User_Sender_Id,User_Sender_Id),
		User_Receiver_Id = IsNull(@User_Receiever_Id,User_Receiver_Id),
		Call_Time = IsNull(@Call_Time,Call_Time)
	where Call_Id = @Id;
end;

--DeleteCall
go
create procedure CallDelete
	@Id int
as 
begin
	delete from CALLS where Call_Id = @Id;
end;



go
use CELL_PROVIDER;
drop procedure AllTariffs;
drop procedure AllUsers;
drop procedure AllNumbers;
drop procedure FindTariff;
drop procedure FindUser;
drop procedure FindUserByLogin;
drop procedure NumberUpdate;
drop procedure TariffAdd;
drop procedure TariffDelete;
drop procedure TariffUpdate;
drop procedure UserAdd;
drop procedure UserDelete;
drop procedure UserUpdate;
drop procedure CallAdd;

