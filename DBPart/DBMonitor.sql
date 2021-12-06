use CELL_PROVIDER

-- Last Executions On Database
go
alter procedure LastExecs 
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

go
alter procedure ProcExecsCount
as
begin
	SELECT obj.name, q.query_id, qt.query_text_id, qt.query_sql_text,
		SUM(rs.count_executions) AS total_execution_count
	FROM sys.query_store_query_text AS qt
		JOIN sys.query_store_query AS q
			ON qt.query_text_id = q.query_text_id
		JOIN sys.objects AS obj
			ON q.object_id = obj.object_id
		JOIN sys.query_store_plan AS p
			ON q.query_id = p.query_id
		JOIN sys.query_store_runtime_stats AS rs
			ON p.plan_id = rs.plan_id
		GROUP BY q.query_id, qt.query_text_id, qt.query_sql_text, obj.name
		ORDER BY total_execution_count DESC;
end;
go

exec ProcExecsCount


go
alter procedure LongestAVGexecTime --наибольшее среднее время выполнения
as
begin
	SELECT obj.name,SUM(rs.avg_duration) as sumAvg FROM sys.query_store_query_text AS qt
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

exec  DBObjCount

exec LongestAVGexecTime


ALTER DATABASE CELL_PROVIDER SET QUERY_STORE = ON;

ALTER DATABASE CELL_PROVIDER
SET QUERY_STORE CLEAR;
GO

ALTER DATABASE CELL_PROVIDER
SET QUERY_STORE (OPERATION_MODE = READ_WRITE);
GO

select * from sys.query_store_query_text;
select * from sys.query_store_query;
select * from sys.objects;
select * from sys.query_store_plan;
select * from sys.query_store_runtime_stats;

select * from sys.objects

select * from SYS.objects where type = 'U' or type ='P';

