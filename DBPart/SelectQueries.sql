use CELL_PROVIDER
----------------------------
go
create procedure FindUserByLogin
	@login nvarchar(50)
as
begin
	select * from USERS where Login = @login;
end;
----------------------------

USE CELL_PROVIDER
go
alter procedure FindUserNumbers
(
	@Id int
)
as
	begin
		select NUMS.Number_Id,NUMS.Number,NUMS.Date_Open,NUMS.Tariff_Id,TAF.Description,TAF.Call_Cost_perm from NUMBERS as NUMS JOIN TARIFFS as TAF ON NUMS.Tariff_Id =  TAF.Tariff_Id where NUMS.User_Id = @Id
	end;
go

--Call procedures

go
alter procedure CallStart
	@senderNumber int,
	@receiverNumber int,
	@time int
as
begin
	declare @sender int = dbo.FindUser_IdByNumber(@senderNumber);
	declare @receiver int =  dbo.FindUser_IdByNumber(@receiverNumber)

	declare @call_id int
	exec @call_id = CallAdd @sender,@receiver,@time;

	return @call_id
end;

go
create Function FindUser_IdByNumber(
	@Id int
) returns int
as
begin
return(
	select User_id from NUMBERS where Number = @Id
)
end

go
alter procedure CallEnd
	@callId int,
	@senderNumber int,
	@timeEnd int
as
begin
	declare @bill int = (
		select Call_Cost_perm from TARIFFS as TAF 
		JOIN NUMBERS as NUM 
		on TAF.Tariff_Id = NUM.Tariff_Id 
		where NUM.Number = @senderNumber) * @timeEnd
    
	declare @User_Id int = (select User_Id from NUMBERS where Number = @senderNumber)	
	declare @User_Ballance int = (select Ballance from USERS where User_Id = @User_Id)
	set @User_Ballance = @User_Ballance - @bill;
	exec UserUpdate @User_Id,@Ballance= @User_Ballance;
	exec CallUpdate @Id = @callid, @Call_Time = @timeEnd;

	select @bill as Bill,Ballance from USERS where User_Id = @User_Id;
end;



--Solve Problems of NUMBERS table
go
alter procedure GetNumber
as
declare @freenum int =NULL
declare @num int
begin
	set @num = (select TOP (1)  Number from NUMBERS order by Number desc);
	set @num = @num+1;

	if exists (select * from tempdb.dbo.sysobjects	where name='##FreeNumbers' )
	begin
		if exists (select TOP(1) Number from ##FreeNumbers)
		begin
			set @freenum = (select TOP(1) Number from ##FreeNumbers)
		end
	end
	print(@freenum)
	if(@freenum is null)
		begin
			print(@num)
			return @num	
		end
	else
		begin
			delete from  ##FreeNumbers where Number = @freenum
			print(@freenum)
			return @freenum
		end
end
go


go 
alter procedure SetFreeNums
as
if not exists (select * from tempdb.dbo.sysobjects 
	where name='##FreeNumbers' )
	begin
		create table ##FreeNumbers(Number int);
	end

delete from ##FreeNumbers

declare @numa int;
declare @numb int;

declare @start int;
declare @end int;

declare cursor_freeNums CURSOR FOR
select Number from NUMBERS order by Number

open cursor_freeNums
	FETCH NEXT from cursor_freeNums into @numa	
	FETCH NEXT from cursor_freeNums into @numb	
	while @@FETCH_STATUS = 0
	begin

		if(@numb-@numa != -1)
		begin
		set @start = @numa+1;
		set @end = @numb
			while @start <@end
			begin
				insert into ##FreeNumbers (Number) values (@start);
				set @start = @start+1
			end
		end;
		set @numa = @numb
		FETCH NEXT from cursor_freeNums into @numb

	end
close cursor_freeNums
deallocate cursor_freeNums
go

