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
	set @sqlStr = 'USE CELL_PROVIDER; SELECT TOP 100 * from '+@Table +' FOR XML PATH('''+@Table+'''), ROOT('''+@Table+'_ROOT'')'
	set @sqlCmd = 'bcp.exe "' + @sqlStr + '" queryout ' + @fileName + ' -w -T -r'
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

 exec @execresult = ExportToXML 'CALLS';
 set @result += @execresult;

 return @result

end;
go

exec ImportFromXml
select * from CALLS
use CELL_PROVIDER
go
alter Procedure ImportFromXml
AS
Begin TRY

	delete from CALLS

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
drop procedure DeleteAll
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




