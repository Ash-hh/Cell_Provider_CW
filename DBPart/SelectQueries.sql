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

exec FindTariffByNumber 8023



SELECT t.[text], s.last_execution_time
FROM sys.dm_exec_cached_plans AS p
INNER JOIN sys.dm_exec_query_stats AS s
   ON p.plan_handle = s.plan_handle
CROSS APPLY sys.dm_exec_sql_text(p.plan_handle) AS t 
ORDER BY s.last_execution_time DESC;


use CELL_PROVIDER

go




