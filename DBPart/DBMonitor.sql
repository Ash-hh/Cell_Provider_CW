use CELL_PROVIDER

-- Last Executions On Database
go
create procedure LastExecs 
as
begin
	SELECT TOP 20
		obj.name,
		rs.last_execution_time
	FROM sys.query_store_query_text AS qt 
		JOIN sys.query_store_query AS q
			ON qt.query_text_id = q.query_text_id
		JOIN sys.objects AS obj
			ON q.object_id = obj.object_id
		JOIN sys.query_store_plan AS p
			ON q.query_id = p.query_id
		JOIN sys.query_store_runtime_stats AS rs
			ON p.plan_id = rs.plan_id	
	where obj.name != 'LastExecs'
	ORDER BY rs.last_execution_time DESC;
end;
go

exec LastExecs
exec ProcExecsCount
go
create procedure ProcExecsCount
as
begin
	SELECT DISTINCT obj.name, MAX(rs.count_executions) as total_execution_count
		
	FROM sys.query_store_query_text AS qt
		JOIN sys.query_store_query AS q
			ON qt.query_text_id = q.query_text_id
		JOIN sys.objects AS obj
			ON q.object_id = obj.object_id
		JOIN sys.query_store_plan AS p
			ON q.query_id = p.query_id
		JOIN sys.query_store_runtime_stats AS rs
			ON p.plan_id = rs.plan_id
	where q.query_text_id !=34
		GROUP BY obj.name
		ORDER BY total_execution_count DESC
end;

go
exec AllTariffs
exec ProcExecsCount


go
alter procedure LongestAVGexecTime 
as
begin
	SELECT TOP 10 obj.name,SUM(rs.avg_duration) as sumAvg FROM sys.query_store_query_text AS qt
					JOIN sys.query_store_query AS q
						ON qt.query_text_id = q.query_text_id
					JOIN sys.objects AS obj
						ON q.object_id = obj.object_id
					JOIN sys.query_store_plan AS p
						ON q.query_id = p.query_id
					JOIN sys.query_store_runtime_stats AS rs
						ON p.plan_id = rs.plan_id
	WHERE rs.last_execution_time > DATEADD(hour, -1, GETUTCDATE())
	GROUP BY obj.name order by SUM(rs.avg_duration) desc  ;	
end;

go
create procedure DBObjCount
as
begin
	select COUNT(*) as Obj_Count, 
		(select COUNT(*) from SYS.objects where type = 'U' ) as Table_Count,
		(select COUNT(*) from SYS.objects where type = 'P' ) as Procedures_Count 
	from  sys.objects where type = 'U' or type = 'P'
end
go
select * from sys.objects
exec  DBObjCount

exec LongestAVGexecTime


ALTER DATABASE CELL_PROVIDER SET QUERY_STORE = ON;

ALTER DATABASE CELL_PROVIDER
SET QUERY_STORE CLEAR;
GO

ALTER DATABASE CELL_PROVIDER
SET QUERY_STORE (OPERATION_MODE = READ_WRITE);
GO

exec ProcExecsCount


create table ##CUDlogSession(
	OpId int identity(1,1) constraint OpId_PK primary key,
	OperationKey varchar(2),
	Operation varchar(20),
	TableName varchar(20),
	BeforeVlue varchar(max),
	AfterValue varchar(max),
	Date date
)
	
go
alter trigger NumberTrigger on NUMBERS AFTER INSERT, UPDATE, DELETE
as
	declare @Number int,
	@User_Id int, 
	@Tariff_Id int

	declare @Date_Open varchar(40)
	declare @BeforeString varchar(max);
	declare @AfterString varchar(max);

	declare @Operation varchar(10) = 'INSERT';
	declare @Key varchar(2) = 'I';

IF EXISTS(SELECT 1 FROM inserted)
begin	
	IF EXISTS(SELECT 1 FROM deleted)
	begin
		set @Operation = 'UPDATE'
		set @Key = 'U'

		SELECT  @Number = Number, 
			@User_Id=User_Id, 
			@Tariff_Id=Tariff_Id,
			@Date_Open=Date_Open 
		FROM deleted

		set @BeforeString = 'Number: '+CAST(@Number as varchar(50))+', User_Id:'+CAST(@User_Id as varchar(50))+', Tariff_Id:'+CAST(@Tariff_Id as varchar(50))+'\n Date_Open:'+@Date_Open
	end
	SELECT  @Number = Number, 
			@User_Id=User_Id, 
			@Tariff_Id=Tariff_Id,
			@Date_Open=Date_Open 
	FROM inserted
	
	set @AfterString = 'Number: '+CAST(@Number as varchar(50))+' User_Id:'+CAST(@User_Id as varchar(50))+' Tariff_Id:'+CAST(@Tariff_Id as varchar(50))+' Date_Open:'+@Date_Open
	exec CUDlog @Key,@Operation,'NUMBERS',@BeforeString,@AfterString
end;
IF EXISTS(SELECT 1 FROM deleted) and @Operation !='UPDATE'
begin
	declare delete_cursor CURSOR for
	SELECT  Number, 
			User_Id, 
			Tariff_Id,
			Date_Open 
	FROM deleted

	open delete_cursor
	FETCH NEXT FROM delete_cursor INTO @Number, @User_Id, @Tariff_Id, @Date_Open	
	while @@FETCH_STATUS = 0
	begin
		set @BeforeString = 'Number: '+CAST(@Number as varchar(50))+' User_Id:'+CAST(@User_Id as varchar(50))+' Tariff_Id:'+CAST(@Tariff_Id as varchar(50))+' Date_Open:'+@Date_Open
		exec CUDlog 'D','DELETE','NUMBERS',@BeforeString,NULL
		FETCH NEXT FROM delete_cursor INTO @Number, @User_Id, @Tariff_Id, @Date_Open	
	end
	deallocate delete_cursor
end

go
create trigger UserTrigger on USERS AFTER INSERT, UPDATE, DELETE
as
	declare @User_Name varchar(50),
			@User_Surname varchar(50), 
			@User_Midname varchar(50),
			@Date_Birth varchar(40),
			@Login nvarchar(50),
			@User_Type int,
			@Ballance money,
			@IsActive bit

	
	declare @BeforeString varchar(max);
	declare @AfterString varchar(max);
	declare @Operation varchar(10) = 'INSERT';
	declare @Key varchar(2) = 'I'

IF EXISTS(SELECT 1 FROM inserted)
begin	
	IF EXISTS(SELECT 1 FROM deleted)
	begin
		set @Operation = 'UPDATE'
		set @Key = 'U'

		SELECT  @User_Name = User_Name,
				@User_Surname = User_Surname, 
				@User_Midname = User_MidName,
				@Date_Birth = Date_Birth,
				@Login= Login,
				@User_Type = User_Type,
				@Ballance = Ballance,
				@IsActive = IsActive
		FROM deleted

		set @BeforeString = 'User_Name: '+CAST(@User_Name as varchar(50))+',
		User_Surname:'+CAST(@User_Surname as varchar(50))+',
		User_Midname:'+CAST(@User_Midname as varchar(50))+',
		Date_Birth:'+CAST(@Date_Birth as varchar(50))+',
		Login:'+CAST(@Login as varchar(50))+',
		User_Type:'+CAST(@User_Type as varchar(50))+',
		Ballance:'+CAST(@Ballance as varchar(50))+',
		IsActive:'+CAST(@IsActive as varchar(50))
	end
	SELECT  @User_Name = User_Name,
			@User_Surname = User_Surname, 
			@User_Midname = User_MidName,
			@Date_Birth = Date_Birth,
			@Login= Login,
			@User_Type = User_Type,
			@Ballance = Ballance,
			@IsActive = IsActive
	FROM inserted
	
	set @AfterString = 'User_Name: '+CAST(@User_Name as varchar(50))+',
	User_Surname:'+CAST(@User_Surname as varchar(50))+',
	User_Midname:'+CAST(@User_Midname as varchar(50))+',
	Date_Birth:'+CAST(@Date_Birth as varchar(50))+',
	Login:'+CAST(@Login as varchar(50))+',
	User_Type:'+CAST(@User_Type as varchar(50))+',
	Ballance:'+CAST(@Ballance as varchar(50))+',
	IsActive:'+CAST(@IsActive as varchar(50))

	exec CUDlog @Key,@Operation,'USERS',@BeforeString,@AfterString
end;
IF EXISTS(SELECT 1 FROM deleted) and @Operation !='UPDATE'
begin
	declare delete_cursor CURSOR for
	SELECT  User_Name,
			User_Surname, 
			User_MidName,
			Date_Birth,
			Login,
			User_Type,
			Ballance,
			IsActive
	FROM deleted

	open delete_cursor
	FETCH NEXT FROM delete_cursor INTO  
		@User_Name,
		@User_Surname, 
		@User_Midname,
		@Date_Birth,
		@Login,
		@User_Type,
		@Ballance,
		@IsActive
	while @@FETCH_STATUS = 0
	begin
		set @BeforeString = 'User_Name: '+CAST(@User_Name as varchar(50))+',
		User_Surname:'+CAST(@User_Surname as varchar(50))+',
		User_Midname:'+CAST(@User_Midname as varchar(50))+',
		Date_Birth:'+CAST(@Date_Birth as varchar(50))+',
		Login:'+CAST(@Login as varchar(50))+',
		User_Type:'+CAST(@User_Type as varchar(50))+',
		Ballance:'+CAST(@Ballance as varchar(50))+',
		IsActive:'+CAST(@IsActive as varchar(50))

		exec CUDlog 'D','DELETE','USERS',@BeforeString,NULL
		FETCH NEXT FROM delete_cursor INTO 
			@User_Name,
			@User_Surname, 
			@User_Midname,
			@Date_Birth,
			@Login,
			@User_Type,
			@Ballance,
			@IsActive	
	end
	deallocate delete_cursor
end

 go          


create trigger TariffTrigger on Tariffs AFTER INSERT, UPDATE, DELETE
as
	declare @Description varchar(max),
	@Call_Cost_perm money	
	declare @BeforeString varchar(max);
	declare @AfterString varchar(max);
	declare @Operation varchar(10) = 'INSERT';
	declare @Key varchar(2) = 'I';
IF EXISTS(SELECT 1 FROM inserted)
begin	
	IF EXISTS(SELECT 1 FROM deleted)
	begin
		set @Operation = 'UPDATE'
		set @Key = 'U'

		SELECT  @Description = Description,
			@Call_Cost_perm = Call_Cost_perm
		FROM deleted

		set @BeforeString = 'Description: '+@Description+', Call_Cost_perm:'+CAST(@Call_Cost_perm as varchar(50))
	end
	SELECT   @Description = Description,
			@Call_Cost_perm = Call_Cost_perm
	FROM inserted	
	set @AfterString = 'Description: '+@Description+', Call_Cost_perm:'+CAST(@Call_Cost_perm as varchar(50))
	exec CUDlog @Key,@Operation,'TARIFFS',@BeforeString,@AfterString
end;
IF EXISTS(SELECT 1 FROM deleted) and @Operation !='UPDATE'
begin
	declare delete_cursor CURSOR for
	SELECT  Description,
			Call_Cost_perm 
	FROM deleted
	open delete_cursor
	FETCH NEXT FROM delete_cursor INTO @Description, @Call_Cost_perm
	while @@FETCH_STATUS = 0
	begin
		set @BeforeString = 'Description: '+@Description+', Call_Cost_perm:'+CAST(@Call_Cost_perm as varchar(50))
		exec CUDlog 'D','DELETE','NUMBERS',@BeforeString,NULL
		FETCH NEXT FROM delete_cursor INTO  @Description, @Call_Cost_perm
	end
	deallocate delete_cursor
end
go


alter trigger CallTrigger on CALLS AFTER INSERT, UPDATE, DELETE
as
	declare @User_Sender_Id int,
	@User_Sender_Number int,
	@User_Receiver_Id int,
	@User_Receiver_Number int,
	@Call_Time int,
	@Call_Cost money
	
	declare @BeforeString varchar(max);
	declare @AfterString varchar(max);

	declare @Operation varchar(10) = 'INSERT';
	declare @Key varchar(2) = 'I';

IF EXISTS(SELECT 1 FROM inserted)
begin	
	IF EXISTS(SELECT 1 FROM deleted)
	begin
		set @Operation = 'UPDATE'
		set @Key = 'U'

		SELECT  @User_Sender_Id = User_Sender_Id,
			@User_Sender_Number = User_Sender_Number,
			@User_Receiver_Id = User_Receiver_Id,
			@User_Receiver_Number = User_Receiver_Number,
			@Call_Time =Call_Time,
			@Call_Cost = Call_Time
		FROM deleted

		set @BeforeString = 'User_Sender_Id: '+CAST(@User_Sender_Id as varchar(50))+',
		User_Sender_Number:'+CAST(@User_Sender_Number as varchar(50))+',
		User_Receiver_Id:'+CAST(@User_Receiver_Id as varchar(50))+',
		User_Receiver_Number:'+CAST(@User_Receiver_Number as varchar(50))+',
		Call_Time:'+CAST(@Call_Time as varchar(50))+', Call_Cost:'+CAST(@Call_Cost as varchar(50))

	end
	SELECT   @User_Sender_Id = User_Sender_Id,
			@User_Sender_Number = User_Sender_Number,
			@User_Receiver_Id = User_Receiver_Id,
			@User_Receiver_Number = User_Receiver_Number,
			@Call_Time =Call_Time,
			@Call_Cost = Call_Time
	FROM inserted
	
	set @AfterString = 'User_Sender_Id: '+CAST(@User_Sender_Id as varchar(50))+',
	User_Sender_Number:'+CAST(@User_Sender_Number as varchar(50))+',
	User_Receiver_Id:'+CAST(@User_Receiver_Id as varchar(50))+',
	User_Receiver_Number:'+CAST(@User_Receiver_Number as varchar(50))+',
	Call_Time:'+CAST(@Call_Time as varchar(50))+', Call_Cost:'+CAST(@Call_Cost as varchar(50))
	exec CUDlog @Key,@Operation,'CALLS',@BeforeString,@AfterString
end;
IF EXISTS(SELECT 1 FROM deleted) and @Operation !='UPDATE'
begin
	declare delete_cursor CURSOR for
	SELECT User_Sender_Id,
			User_Sender_Number,
			User_Receiver_Id,
			User_Receiver_Number,
			Call_Time,
			Call_Time
	FROM deleted

	open delete_cursor
	FETCH NEXT FROM delete_cursor INTO @User_Sender_Id,
			@User_Sender_Number,
			@User_Receiver_Id,
			@User_Receiver_Number,
			@Call_Time,
			@Call_Cost
	while @@FETCH_STATUS = 0
	begin
		set @BeforeString = 'User_Sender_Id: '+CAST(@User_Sender_Id as varchar(50))+',
		User_Sender_Number:'+CAST(@User_Sender_Number as varchar(50))+',
		User_Receiver_Id:'+CAST(@User_Receiver_Id as varchar(50))+',
		User_Receiver_Number:'+CAST(@User_Receiver_Number as varchar(50))+',
		Call_Time:'+CAST(@Call_Time as varchar(50))+', Call_Cost:'+CAST(@Call_Cost as varchar(50))

		exec CUDlog 'D','DELETE','CALLS',@BeforeString,NULL
		FETCH NEXT FROM delete_cursor INTO  @User_Sender_Id,
			@User_Sender_Number,
			@User_Receiver_Id,
			@User_Receiver_Number,
			@Call_Time,
			@Call_Cost
	end
	deallocate delete_cursor
end
go


create procedure CUDlog
	@OperationKey varchar(2),
	@Operation varchar(20),
	@TableName varchar(20),
	@BeforeVlue varchar(max),
	@AfterValue varchar(max)
as
begin
if not exists (select * from tempdb.dbo.sysobjects 
	where name='##CUDlogSession' )
	begin
		create table ##CUDlogSession(
			OpId int identity(1,1),
			OperationKey varchar(2),
			Operation varchar(20),
			TableName varchar(20),
			BeforeVlue varchar(max),
			AfterValue varchar(max),
			Date date);
	end
	insert into  ##CUDlogSession values(
		@OperationKey,
		@Operation,
		@TableName,
		@BeforeVlue,
		@AfterValue,
		CURRENT_TIMESTAMP)

	insert into  CUDlogAllTime values(
		@OperationKey,
		@Operation,
		@TableName,
		@BeforeVlue,
		@AfterValue,
		CURRENT_TIMESTAMP)
end;
go 

create table CUDlogAllTime(
	OpId int identity(1,1) constraint OpId_PK primary key,
	OperationKey varchar(2),
	Operation varchar(20),
	TableName varchar(20),
	BeforeVlue varchar(max),
	AfterValue varchar(max),
	Date date
)



select * from CUDlogAllTime
select * from ##CUDlogSession

drop procedure ClearLog
go
alter procedure ClearLog
	@mode int = NULL
as
begin
	if(@mode = 2)
	begin
		delete from  CUDlogAllTime
	end
	if exists (select * from tempdb.dbo.sysobjects where name='##CUDlogSession' )
	begin
		delete from  ##CUDlogSession
	end
end
go


go
alter procedure LogInfo 
	@TableName varchar(20) = NULL,
	@Key varchar(2) = NULL,
	@Date date = NULL,
	@DateRange date = NULL,
	@firstRow int = NULL,
	@lastRow int = NULL
as
begin
	print(@Date)
	if @Date is NOT NULL
	begin
	
		if @DateRange is NOT NULL
		begin
			with row_nums as
			(
				SELECT row_number() over(order by OpId) as num, *
				from(
			
					select * from CUDlogAllTime where Date between @DateRange and  @Date
					except
					select * from CUDlogAllTime where OperationKey != @Key
					except
					select * from CUDlogAllTime where TableName != @TableName
				) as resultSet
			)
			select * from row_nums where num between @firstRow and @lastRow;
			
		end else 
				begin
				with row_nums as
				(
					SELECT row_number() over(order by OpId) as num, *
					from(
						select * from CUDlogAllTime where Date = @Date
						except
						select * from CUDlogAllTime where OperationKey != @Key
						except
						select * from CUDlogAllTime where TableName != @TableName
					) as resultSet
				) select * from row_nums where num between @firstRow and @lastRow;
				end
	end 
	else
	begin 
	with row_nums as
		(
			SELECT row_number() over(order by OpId) as num, *
			from(
				select * from CUDlogAllTime
				except
				select * from CUDlogAllTime where OperationKey != @Key
				except
				select * from CUDlogAllTime where TableName != @TableName
			) as resultSet
		)
		select * from row_nums where num between @firstRow and @lastRow;
	end
end

go
alter procedure LogInfoSession 
	@TableName varchar(20) = NULL,
	@Key varchar(2) = NULL,
	@Date date = NULL,
	@DateRange date = NULL,
	@firstRow int = NULL,
	@lastRow int = NULL
as
begin
	if not exists (select * from tempdb.dbo.sysobjects where name='##CUDlogSession' )
	begin
		create table ##CUDlogSession(
			OpId int identity(1,1),
			OperationKey varchar(2),
			Operation varchar(20),
			TableName varchar(20),
			BeforeVlue varchar(max),
			AfterValue varchar(max),
			Date date);
	end
		if @Date is NOT NULL
		begin
			if @DateRange is NOT NULL
			begin
				with row_nums as
				(
					SELECT row_number() over(order by OpId) as num, *
					from(
						select * from ##CUDlogSession where Date between @DateRange and @Date
						except
						select * from ##CUDlogSession where OperationKey != @Key
						except
						select * from ##CUDlogSession where TableName != @TableName
					)as resultSet
				)
				select * from row_nums where num between @firstRow and @lastRow;
			end else
					begin
					with row_nums as
					(
						SELECT row_number() over(order by OpId) as num, *
						from(
							select * from ##CUDlogSession where Date = @Date
							except
							select * from ##CUDlogSession where OperationKey != @Key
							except
							select * from ##CUDlogSession where TableName != @TableName
						) as resultSet
					) select * from row_nums where num between @firstRow and @lastRow;
					end

		end else 
			begin 
			with row_nums as
			(
				SELECT row_number() over(order by OpId) as num, *
				from(
					select * from ##CUDlogSession
					except
					select * from ##CUDlogSession where OperationKey != @Key
					except
					select * from ##CUDlogSession where TableName != @TableName
				) as resultSet
			) select * from row_nums where num between @firstRow and @lastRow;
			end
end


create type LogStats as TABLE(
	InsertCount int,
	UpdateCount int,
	DeleteCount int,
	InsertCountSession int,
	UpdateCountSession int,
	DeleteCountSession int,
	OperationCount int,
	OperationCountSession int
)

	
go
create procedure LogInfoCUDCount
as
begin
declare @Stat as [dbo].[LogStats]
	insert into @Stat (InsertCount,UpdateCount,DeleteCount,OperationCount) VALUES (
		(SELECT COUNT(OperationKey) FROM CUDlogAllTime where OperationKey = 'I'),
		(SELECT COUNT(OperationKey) FROM CUDlogAllTime where OperationKey = 'U'),
		(SELECT COUNT(OperationKey) FROM CUDlogAllTime where OperationKey = 'D'),
		(SELECT COUNT(OperationKey) FROM CUDlogAllTime)
	)
	if exists (select * from tempdb.dbo.sysobjects where name='##CUDlogSession' )
	begin
		update @Stat
		SET InsertCountSession = (SELECT COUNT(OperationKey) FROM ##CUDlogSession where OperationKey = 'I'),
			UpdateCountSession = (SELECT COUNT(OperationKey) FROM ##CUDlogSession where OperationKey = 'U'),
			DeleteCountSession = (SELECT COUNT(OperationKey) FROM ##CUDlogSession where OperationKey = 'D'),
			OperationCountSession =(SELECT COUNT(OperationKey) FROM ##CUDlogSession)
		end
	select * from @Stat
end

exec LogInfo  @firstRow = 1, @lastRow = 50
