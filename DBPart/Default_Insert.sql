use CELL_PROVIDER;

insert into USER_TYPE(User_Type) values ('Admin'),('User');

insert into TARIFFS(Description,Call_Cost_perm)
values
('Tarif tupa ogon',1),
('Tarif nu prosta bomba',2),
('Pushka a ne tarif',3);




declare @number int, @iter int, @Id int, @TafId int, @date date;
set @iter = 1;
set @number = 100000;
set @Id = 1;
set @TafId = 1;
set @date = '2021-02-02';
while @iter < 10
	begin
		if(@Id = 10)
			set @Id = 1;
		if(@TafId = 6)
			set @TafId = 1;

		insert into NUMBERS(Number,User_Id,Tariff_Id,Date_Open)
		values (@number,@Id,@TafId,@date)
		set @number = @number +1;
		set @iter = @iter +1;
		set @Id = @Id +1;
		set @TafId = @TafId+1;
	end;






