use CELL_PROVIDER

alter procedure ExportToXML
(
	@Table varchar(30)	
)
as
begin
	declare @fileName nvarchar(100)
	declare @sqlStr varchar(1000)
	declare @sqlCmd varchar(1000)
	
	set @fileName = N'F:\3_course\DB\Course_Project\XML\'+@Table+'.xml';
	set @sqlStr = 'USE CELL_PROVIDER; SELECT * from '+@Table +' FOR XML PATH('''+@Table+'_ROOT''), ROOT('''+@Table+''') '
	set @sqlCmd = 'bcp.exe "' + @sqlStr + '" queryout ' + @fileName + ' -w -T'
	print (@fileName);
	print (@sqlStr)
	EXEC xp_cmdshell @sqlCmd;
end
go

go
alter procedure ExportAllToXML
as
begin	
 
 exec ExportToXML 'USER_TYPE';
 exec ExportToXML 'USERS'
 exec ExportToXML 'TARIFFS'
 exec ExportToXML 'NUMBERS';
 exec ExportToXML 'CALLS';
 
end;
go

go
alter Procedure ImProdfromXml
AS
Begin
	set IDENTITY_INSERT CALLS ON

	INSERT INTO CALLS (Call_Id,User_Sender_Id,User_Receiver_Id,Call_Time)
	SELECT
	   MY_XML.CALL.query('Call_Id').value('.', 'INT'),
	   MY_XML.CALL.query('User_Sender_Id').value('.', 'INT'),
	   MY_XML.CALL.query('User_Receiver_Id').value('.', 'INT'),
	   MY_XML.CALL.query('Call_Time').value('.', 'INT')
	FROM (SELECT CAST(MY_XML AS xml)
		  FROM OPENROWSET(BULK N'F:\3_course\DB\Course_Project\XML\Calls.xml', SINGLE_BLOB) AS T(MY_XML)) AS T(MY_XML)
		  CROSS APPLY MY_XML.nodes('CALLS/CALL') AS MY_XML (CALL);

	set IDENTITY_INSERT CALLS OFF
End;

exec ImProdfromXml

select *  from CALLS
