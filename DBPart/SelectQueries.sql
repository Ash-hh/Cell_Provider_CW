use CELL_PROVIDER

go
create procedure FindUserByLogin
	@login nvarchar(50)
as
begin
	select * from USERS where Login = @login;
end;

go
use CELL_PROVIDER
go
create procedure FindNumberByNum
	@number int,
	@number_rec int = 0
as
begin
	select * from NUMBERS where Number = @number or Number = @number_rec
end;
go

select * from NUMBERS;

go
create procedure FindNumberByUserId
	@Id int
as
begin
	select * from NUMBERS where User_Id = @Id
end;


go
create procedure FindTariffByNumber 
	@Number int
as
begin
	select * from TARIFFS where Tariff_Id = (select Tariff_Id from NUMBERS where Number = @Number)
end;
go


--Solve Problems of NUMBERS table

go
alter procedure GetNumber
as
declare @freenum int =NULL
declare @num int
begin
	set @num = (select TOP (1)  Number from NUMBERS order by Number desc);
	set @num = @num+1;
	set @freenum = (select TOP(1) Number from ##FreeNumbers)
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

use CELL_PROVIDER
exec SetFreeNums 

select * from ##FreeNumbers

drop table ##FreeNumbers

use master
select * from tempdb.dbo.sysobjects 
	where name='##FreeNumbers' 
	select Number from NUMBERS order by Number