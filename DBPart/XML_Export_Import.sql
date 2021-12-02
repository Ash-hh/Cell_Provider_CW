use CELL_PROVIDER

alter procedure ExportToXML
(
	@Table varchar(30)	
)
as
begin

	EXEC master.dbo.sp_configure 'show advanced options', 1
		reconfigure with override
	EXEC master .dbo.sp_configure 'xp_cmdshell', 1
		reconfigure with override;

	declare @fileName nvarchar(100)
	declare @sqlStr varchar(1000)
	declare @sqlCmd varchar(1000)
	
	set @fileName = N'F:\3_course\DB\Course_Project\XML\'+@Table+'.xml';
	set @sqlStr = 'USE CELL_PROVIDER; SELECT * from '+@Table +' FOR XML PATH('''+@Table+'''), ROOT('''+@Table+'_ROOT'') '
	set @sqlCmd = 'bcp.exe "' + @sqlStr + '" queryout ' + @fileName + ' -w -T'
	--print (@fileName);
	--print (@sqlStr)
	declare @result int;
	EXEC @result=xp_cmdshell @sqlCmd;
	return @result;
end
go

exec ExportAllToXML

go
alter procedure ExportAllToXML
as
begin	
 declare @result int=0;
 declare @execresult int;

 exec @execresult = ExportToXML 'USER_TYPE';
 set @result += @execresult;

 exec @execresult = ExportToXML 'USERS'
 set @result += @execresult;

 exec @execresult = ExportToXML 'TARIFFS'
 set @result += @execresult;

 exec @execresult = ExportToXML 'NUMBERS';
 set @result += @execresult;

 exec @execresult = ExportToXML 'CALLS';
 set @result += @execresult;
 
 
 return @result

end;
go

use CELL_PROVIDER
go
alter Procedure ImportFromXml
AS
Begin TRY

	exec DeleteAll


	set IDENTITY_INSERT USER_TYPE ON
	INSERT INTO USER_TYPE (Id,User_Type)
	SELECT 
		MY_XML.USER_TYPE.query('Id').value('.', 'INT'),
		MY_XML.USER_TYPE.query('User_Type').value('.', 'NVARCHAR(20)')
	FROM (SELECT CAST(MY_XML AS xml)
		  FROM OPENROWSET(BULK N'F:\3_course\DB\Course_Project\XML\USER_TYPE.xml', SINGLE_BLOB) AS T(MY_XML)) AS T(MY_XML)
		  CROSS APPLY MY_XML.nodes('USER_TYPE_ROOT/USER_TYPE') AS MY_XML (USER_TYPE);
	set IDENTITY_INSERT USER_TYPE OFF


	set IDENTITY_INSERT USERS ON
	INSERT INTO USERS (User_Id,User_MidName,User_Name,User_Surname,User_Type,Login,Password,Date_Birth,IsActive,Ballance)
	SELECT 
		MY_XML.USERS.query('User_Id').value('.', 'INT'),
		MY_XML.USERS.query('User_MidName').value('.', 'NVARCHAR(50)'),
		MY_XML.USERS.query('User_Name').value('.', 'NVARCHAR(50)'),
		MY_XML.USERS.query('User_Surname').value('.', 'NVARCHAR(50)'),
		MY_XML.USERS.query('User_Type').value('.', 'INT'),
		MY_XML.USERS.query('Login').value('.', 'NVARCHAR(50)'),
		MY_XML.USERS.query('Password').value('.', 'NVARCHAR(50)'),
		MY_XML.USERS.query('Date_Birth').value('.', 'DATE'),
		MY_XML.USERS.query('IsActive').value('.', 'BIT'),
		MY_XML.USERS.query('Ballance').value('.', 'MONEY')
	FROM (SELECT CAST(MY_XML AS xml)
		  FROM OPENROWSET(BULK N'F:\3_course\DB\Course_Project\XML\USERS.xml', SINGLE_BLOB) AS T(MY_XML)) AS T(MY_XML)
		  CROSS APPLY MY_XML.nodes('USERS_ROOT/USERS') AS MY_XML (USERS);
	set IDENTITY_INSERT USERS OFF

	set IDENTITY_INSERT TARIFFS ON
	INSERT INTO TARIFFS(Tariff_Id,Description,Call_Cost_perm)
	SELECT
	   MY_XML.TARIFFS.query('Tariff_Id').value('.', 'INT'),
	   MY_XML.TARIFFS.query('Description').value('.', 'varchar(max)'),
	   MY_XML.TARIFFS.query('Call_Cost_perm').value('.', 'MONEY')
	FROM (SELECT CAST(MY_XML AS xml)
		  FROM OPENROWSET(BULK N'F:\3_course\DB\Course_Project\XML\TARIFFS.xml', SINGLE_BLOB) AS T(MY_XML)) AS T(MY_XML)
		  CROSS APPLY MY_XML.nodes('TARIFFS_ROOT/TARIFFS') AS MY_XML (TARIFFS);
	set IDENTITY_INSERT TARIFFS OFF

	set IDENTITY_INSERT NUMBERS ON
	INSERT INTO NUMBERS(Number_Id,Number,User_Id,Tariff_Id,Date_Open)
	SELECT
	   MY_XML.NUMBERS.query('Number_Id').value('.', 'INT'),
	   MY_XML.NUMBERS.query('Number').value('.', 'INT'),
	   MY_XML.NUMBERS.query('User_Id').value('.', 'INT'),
	   MY_XML.NUMBERS.query('Tariff_Id').value('.', 'INT'),
	   MY_XML.NUMBERS.query('Date_Open').value('.', 'DATE')
	 
	FROM (SELECT CAST(MY_XML AS xml)
		  FROM OPENROWSET(BULK N'F:\3_course\DB\Course_Project\XML\NUMBERS.xml', SINGLE_BLOB) AS T(MY_XML)) AS T(MY_XML)
		  CROSS APPLY MY_XML.nodes('NUMBERS_ROOT/NUMBERS') AS MY_XML (NUMBERS);
	set IDENTITY_INSERT NUMBERS OFF

	set IDENTITY_INSERT CALLS ON
	INSERT INTO CALLS (Call_Id,User_Sender_Id,User_Sender_Number,User_Receiver_Id,User_Receiver_Number, Call_Time,Call_Cost)
	SELECT
	   MY_XML.CALLS.query('Call_Id').value('.', 'INT'),
	   MY_XML.CALLS.query('User_Sender_Id').value('.', 'INT'),
	   MY_XML.CALLS.query('User_Sender_Number').value('.', 'INT'),
	   MY_XML.CALLS.query('User_Receiver_Id').value('.', 'INT'),
	   MY_XML.CALLS.query('User_Receiver_Number').value('.', 'INT'),
	   MY_XML.CALLS.query('Call_Time').value('.', 'INT'),
	   MY_XML.CALLS.query('Call_Cost').value('.', 'MONEY')
	FROM (SELECT CAST(MY_XML AS xml)
		  FROM OPENROWSET(BULK N'F:\3_course\DB\Course_Project\XML\CALLS.xml', SINGLE_BLOB) AS T(MY_XML)) AS T(MY_XML)
		  CROSS APPLY MY_XML.nodes('CALLS_ROOT/CALLS') AS MY_XML (CALLS);
	set IDENTITY_INSERT CALLS OFF

	return 0
End TRY
BEGIN catch
	
	return -1;
END catch
go
exec ExportAllToXML
exec ImportFromXml




create procedure DeleteAll
as
begin
	
	delete from CALLS
	delete FROM NUMBERS
	delete from TARIFFS
	delete from USERS
	delete from USER_TYPE
end;
go

exec DeleteAll

use CELL_PROVIDER

select *  from CALLS
select * FROM USER_TYPE
select * from USERS
select * from TARIFFS
select * from NUMBERS

