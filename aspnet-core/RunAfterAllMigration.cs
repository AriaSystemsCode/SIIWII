using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("RunAfterAllMigration")]
    class RunAfterAllMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.KeepAliveCustomMigration(migrationBuilder.GetMigrationId(typeof(RunAfterAllMigration)));

            Console.WriteLine($"CreateOtherScripts Running Up in {migrationBuilder.GetMigrationId(typeof(RunAfterAllMigration))}");
           // migrationBuilder.CreateOtherScripts();

            Console.WriteLine($"DropSPCreateTriggerUpdateForeignKeysCodesForAllTables -  Running Up in {migrationBuilder.GetMigrationId(typeof(RunAfterAllMigration))}");
            migrationBuilder.DropSPCreateTriggerUpdateForeignKeysCodesForAllTables();

            Console.WriteLine($"CreateSPCreateTriggerUpdateForeignKeysCodesForAllTables -  Running Up in {migrationBuilder.GetMigrationId(typeof(RunAfterAllMigration))}");
            migrationBuilder.CreateSPCreateTriggerUpdateForeignKeysCodesForAllTables();

            migrationBuilder.DropSPUpdateForeignKeysCodes();
            migrationBuilder.CreateSPUpdateForeignKeysCodes();

            Console.WriteLine($"RunCreateSPCreateTriggerUpdateForeignKeysCodesForAllTables -  Running Up in {migrationBuilder.GetMigrationId(typeof(RunAfterAllMigration))}");
            migrationBuilder.RunCreateTriggerUpdateForeignKeysCodesForAllTables();
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }

    public static class CustomMigrationsController
    {
        public static void KeepAliveCustomMigration(this MigrationBuilder migrationBuilder, string customMigrationName)
        {
            migrationBuilder.Sql($@"
                    BEGIN TRY
                     DROP TRIGGER [dbo].[__EFMigrationsHistory_{customMigrationName}]
                    END TRY

                    BEGIN CATCH
                    END CATCH        
            ");
            migrationBuilder.Sql($@"
                    CREATE TRIGGER [dbo].[__EFMigrationsHistory_{customMigrationName}] ON  [dbo].[__EFMigrationsHistory]
                    AFTER INSERT
                    AS 
                    BEGIN
                        if (select count(*) from inserted where MigrationId='{customMigrationName}') >=1
                        BEGIN
	                        delete from [dbo].[__EFMigrationsHistory] where MigrationId='{customMigrationName}'
                        END
                    END        
               ");
        }

        public static string GetMigrationId(this MigrationBuilder migrationBuilder, Type t)
        {
            MigrationAttribute MyAttribute =
                (MigrationAttribute)Attribute.GetCustomAttribute(t, typeof(MigrationAttribute));
            return MyAttribute.Id;
        }

        public static void DropSPCreateTriggerUpdateForeignKeysCodesForAllTables(this MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql($@"
                IF EXISTS (SELECT * FROM sys.objects WHERE [name] = 'CreateTriggerUpdateForeignKeysCodesForAllTables')
                BEGIN
                      DROP proc CreateTriggerUpdateForeignKeysCodesForAllTables;
                END;
            ");

        }

        public static void CreateSPCreateTriggerUpdateForeignKeysCodesForAllTables(this MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql($@"
                CREATE proc [dbo].[CreateTriggerUpdateForeignKeysCodesForAllTables]
                as
                DECLARE @sql nvarchar(max), @TABLE_NAME sysname
                SET NOCOUNT ON

                SELECT @TABLE_NAME = MIN(TABLE_NAME) FROM INFORMATION_SCHEMA.Tables where TABLE_NAME not in ('__EFMigrationsHistory', 'sysdiagrams', 'AppBinaryObjects', 'AppItemVariationAttributes') and TABLE_NAME not like 'Abp%'

                WHILE @TABLE_NAME IS NOT NULL
                  BEGIN
                 SELECT @sql = N'
                IF EXISTS (SELECT * FROM sys.objects WHERE [name] = '''+@TABLE_NAME+'UpdateCodes'''+' AND [type] = ''TR'')
                BEGIN
                      DROP TRIGGER [dbo].['+@TABLE_NAME+'UpdateCodes'+'];
                END;'
                 EXEC(@sql)

                  SELECT @sql = N'
                create TRIGGER '+@TABLE_NAME+'UpdateCodes'+'
                ON '+@TABLE_NAME+'
                AFTER INSERT, UPDATE
                AS

                SET NOCOUNT ON

                declare @triggerTableName as nvarchar(250)
                select @triggerTableName = OBJECT_NAME(parent_object_id) 
                             FROM sys.objects 
                             WHERE sys.objects.name = OBJECT_NAME(@@PROCID)

                declare @sql as nvarchar(max)
                SELECT @sql = ''exec UpdateForeignKeysCodes '''''' + @triggerTableName + '''''','' + cast(inserted.Id as nvarchar(250)) FROM inserted

	                EXECUTE sp_executesql   @sql
	                --print  @sql

                SET NOCOUNT OFF'
                 SELECT @sql
                 EXEC(@sql)
                 --print @sql
                 SELECT @TABLE_NAME = MIN(TABLE_NAME) FROM INFORMATION_SCHEMA.Tables WHERE TABLE_NAME > @TABLE_NAME and TABLE_NAME not in ('__EFMigrationsHistory', 'sysdiagrams', 'AppBinaryObjects', 'AppItemVariationAttributes') and TABLE_NAME not like 'Abp%'
                  END
                SET NOCOUNT OFF
            ");

        }

        public static void RunCreateTriggerUpdateForeignKeysCodesForAllTables(this MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql($@"
                exec [CreateTriggerUpdateForeignKeysCodesForAllTables]
            ");
        }

        public static void DropSPUpdateForeignKeysCodes(this MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql($@"
                IF EXISTS (SELECT * FROM sys.objects WHERE [name] = 'UpdateForeignKeysCodes')
                BEGIN
                      DROP proc UpdateForeignKeysCodes;
                END;
            ");

        }

        public static void CreateSPUpdateForeignKeysCodes(this MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql($@"
                --exec UpdateForeignKeysCodes  'SysObjectTypes' , 12                                                                                                                                                                  
                Create proc [dbo].[UpdateForeignKeysCodes] (@tableName as nvarchar(250),@recordId as bigint)
                as
                declare @sql as nvarchar(Max)
                Select @sql=

                ( 
                select distinct
	                --schema_name(pk_tab.schema_id) + '.' + pk_tab.name as primary_table,
	                --substring(column_names, 1, len(column_names)-1) as [fk_columnId],
	                --substring(column_names, 1, len(column_names)-1)+'Code' as [fk_columnCode]
	                'update ' + @tableName + ' set ' + substring(column_names, 1, len(column_names)-3)+'Code' + ' = (select top 1 code from ' + schema_name(pk_tab.schema_id) + '.' + pk_tab.name + ' t2 where ' + @tableName + '.' + substring(column_names, 1, len(column_names)-1) + '=t2.Id) where ' + @tableName + '.Id=' + cast(@recordId as nvarchar(50)) + ' and ' + @tableName + '.' + substring(column_names, 1, len(column_names)-1) + ' is not null ;'
                from sys.foreign_keys fk
                    inner join sys.tables fk_tab on fk_tab.object_id = fk.parent_object_id
                    inner join sys.tables pk_tab on pk_tab.object_id = fk.referenced_object_id
                    cross apply (select col.[name] + ', '
                                    from sys.foreign_key_columns fk_c
                                        inner join sys.columns col
                                            on fk_c.parent_object_id = col.object_id
                                            and fk_c.parent_column_id = col.column_id
                                    where fk_c.parent_object_id = fk_tab.object_id
                                      and fk_c.constraint_object_id = fk.object_id
                                            --order by col.column_id
                                            for xml path ('') ) D (column_names)
	                --
	
	                inner join INFORMATION_SCHEMA.COLUMNS cols on cols.COLUMN_NAME = substring(column_names, 1, len(column_names)-3)+'Code' and cols.TABLE_NAME = @tableName
                where fk_tab.name = @tableName
                --order by schema_name(fk_tab.schema_id) + '.' + fk_tab.name,
                --    schema_name(pk_tab.schema_id) + '.' + pk_tab.name
	                FOR XML PATH('')
	                )

	                EXECUTE sp_executesql  @sql
	                --select @sql
            ");
        }

        public static void CreateOtherScripts(this MigrationBuilder migrationBuilder)

        {
            migrationBuilder.Sql($@"

                DROP PROCEDURE IF EXISTS dbo.[ItemsListsReport1]
                go
                    /****** Object:  StoredProcedure [dbo].[ItemsListsReport1]    Script Date: 8/3/2022 11:57:52 AM ******/
                    SET ANSI_NULLS ON
                    GO

                    SET QUOTED_IDENTIFIER ON
                    GO

                    --[ItemsListsReport1] 3,1,10073,0,''
                    --select * from appcontacts where tenantid is not null and isprofiledata=1 and parentid is null
                    --select * from appcontacts where partnerid=13
                     CREATE proc [dbo].[ItemsListsReport1](@tenantId as bigint, @userId as bigint, @itemsListId as bigint, @preparedForContactId as bigint, @attachmentBaseUrl as nvarchar(250))
                    as
					declare @attachmentBaseUrl1 as nvarchar(250)  = 'http://10.0.1.22/attachments/'
                    declare @attachmentCategoryLogo as bigint = (select top 1 id from sycattachmentcategories where code = 'LOGO')

                    declare @currTenantOriginalContactId as bigint = (select top 1 id from appcontacts where tenantId=@tenantId and IsProfileData=1 and parentid is null)
                    declare @currTenantPublishedEntityId as bigint = (select top 1 entityid from appcontacts where TenantId is null and IsProfileData = 0 and PartnerId =@currTenantOriginalContactId)
                    declare @currTenantLogoAttachment as nvarchar(500) = (select top 1 Attachment from appentityattachments ea
												                    inner join appattachments a on a.id = ea.attachmentid
												                    where entityid=@currTenantPublishedEntityId and AttachmentCategoryId = @attachmentCategoryLogo)
                    declare @currTenantImageUrl as nvarchar(max) = @attachmentBaseUrl1 + cast(@tenantId as nvarchar(50)) + '/'+@currTenantLogoAttachment 

                    declare @preparedForOriginalContactId as bigint = (select top 1 partnerId from appcontacts where id =@preparedForContactId)
                    declare @preparedForTenantId as bigint = (select top 1 entityid from appcontacts where id =@preparedForOriginalContactId)
                    declare @preparedForPublishedEntityId as bigint = (select top 1 entityid from appcontacts where id =@preparedForContactId)
                    declare @preparedForLogoAttachment as nvarchar(500) = (select top 1 Attachment from appentityattachments ea
												                    inner join appattachments a on a.id = ea.attachmentid
												                    where entityid = @preparedForPublishedEntityId and AttachmentCategoryId = @attachmentCategoryLogo
												                    )
                    declare @preparedForImageUrl as nvarchar(max) = @attachmentBaseUrl1+  cast(@preparedForTenantId as nvarchar(50)) + '/'+@preparedForLogoAttachment 

                    declare @preparedForTenantName as nvarchar(250) = (select top 1 name from appcontacts where id =@preparedForContactId)
                    declare @TenantName as nvarchar(250) = (select top 1 tenancyname from abptenants where id =@tenantId)
                    declare @userName as nvarchar(250) = (select top 1 Name from abpusers where id =@userId)


                    select top 100 
                      il.Id ItemsListId
                    , il.Code ItemsListCode
                    , il.Name ItemsListName
                    , il.Description ItemsListDescription
                    , i.Id as ItemId
                    , i.code as ItemCode
                    , i.name as ItemName
                    , e.Notes as ItemDesc
                    , isnull((select min(x.price) from appitemsListDetails d inner join appitems x on x.parentid = d.itemid where d.ItemsListId= il.Id and d.itemid = ild.itemid),i.price) as ItemPriceFrom
                    , isnull((select max(x.price) from appitemsListDetails d inner join appitems x on x.parentid = d.itemid where d.ItemsListId= il.Id and d.itemid = ild.itemid),i.price) as ItemPriceTo
                    ,(select top 1 @attachmentBaseUrl1+ cast(i.tenantid as nvarchar(50)) + '/'+Attachment from appentities e inner join appentityattachments ea on e.id = ea.EntityId
	                    inner join AppAttachments a on a.Id = ea.AttachmentId
	                    where e.id = i.EntityId order by ea.IsDefault desc
                     ) as imageURL
                     , @currTenantImageUrl as TenantLogo
                     , @preparedForImageUrl as PreparedForLogo
                     , @TenantName TenantName
                     , @preparedForTenantName PreparedForTenantName
                     , @userName PreparedByUserName
                     from appitemsLists il inner join  appitemsListDetails ild on il.Id= ild.ItemsListId
                     inner join appitems i on i.Id = ild.ItemId
                     inner join appentities e on e.Id = i.entityid

                     where il.sharinglevel=0 and  i.parentid is null and il.id = @itemslistid

                     --select * from appitemsLists
                     --select * from appitemsListdetails where itemslistid= 10062

GO







                DROP PROCEDURE IF EXISTS dbo.[GetItemsPage]
                go
                --exec GetItemsPage  3,'1122112233',0,'name' ,   ''  ,10 ,''  , '',''   ,0,0,2
                create proc [dbo].[GetItemsPage] (@tenantId as bigint,@filter as nvarchar(250),@entityObjectTypeId as bigint, @order as nvarchar(250), @lastKey as nvarchar(250), @pageSize as bigint
	                ,@extraAttr as nvarchar(250),@classes as nvarchar(250) ,@categories as nvarchar(250),@itemtype as tinyint,@publishstatus as tinyint,@listingstatus as tinyint,@visibilityStatus as tinyint)
                as

	                declare @sql as nvarchar(Max)
	                declare @firstChar as nvarchar(2) = substring(@filter,1,1)
	                declare @predictedKey as nvarchar(250)=''
	                --declare @sqlCount as nvarchar(Max)
	                declare @WordCount as int  =0

	                set @order = lower(@order)
	
	                if @filter <> ''
	                begin
		                select @WordCount = count(id) from
		                (select 
		                --top 5 id from appitems i
		                distinct top 5 isnull(i.parentId,i.id) as id,i.name from appitems i
		                where i.TenantId= @tenantId and ParentId is null and itemtype=@itemtype
		                and (i.code = @filter or freetext((i.name),@filter) or freetext((i.Description),@filter) ) 
				                ORDER BY name
		                ) as q1
		                --select @WordCount
	                end

	                if @WordCount >=5
	                begin
		                if @lastKey = '' and @filter <> '' and lower(@order) = 'code'
		                begin
			                SELECT top 1 @predictedKey = code from appitems i 
			                where i.TenantId= @tenantId and ParentId is null and itemtype=@itemtype and name like '%' + cast(@filter as nvarchar(50))  or code =@filter  or Description like '%' + cast(@filter as nvarchar(50)) + '%' 
			                ORDER BY code
		                end
		                else if @lastKey = '' and @filter <> '' and lower(@order) = 'name'
		                begin
			                SELECT top 1 @predictedKey = name from appitems i 
			                where i.TenantId= @tenantId and ParentId is null and itemtype=@itemtype and  name like '%' + cast(@filter as nvarchar(50))  or code =@filter  or Description like '%' + cast(@filter as nvarchar(50)) + '%' 
			                ORDER BY name
		                end
		                else if @lastKey = '' and @filter <> ''
		                begin
			                SELECT top 1 @predictedKey = id from appitems i 
			                where i.TenantId= @tenantId and ParentId is null and itemtype=@itemtype and  name like '%' + cast(@filter as nvarchar(50))  or code =@filter  or Description like '%' + cast(@filter as nvarchar(50)) + '%' 
			                ORDER BY id
		                end
	                end


	                --if @order = 'id'
	                --	set @order = 'isnull(i.parentId,i.id)'

	                set @sql='SELECT distinct top ' + cast(@pageSize as nvarchar(50)) + ' isnull(i.parentId,i.id) as IdFinal,i.name,i.Code'

	                set @sql= @sql + ' from appitems i 
		                inner join AppEntities e on i.EntityId = e.id
		                left outer join appitems list on isnull(i.parentId,i.id) = list.ListingItemId
		                left outer join appitems publish on isnull(i.parentId,i.id) = publish.PublishedListingItemId'
	
		                set @sql=@sql+' where i.TenantId= ' +  cast(@tenantId as nvarchar(50)) + ' and i.itemtype='+ cast(@itemtype as nvarchar(50)) 
		
		                if @itemtype = 0 and @listingstatus = 1
			                --set @sql=@sql+' and not exists (select 1 from appitems l where l.ListingItemId = i.id)'
			                set @sql=@sql+' and list.id is null'
		
		                if @itemtype = 0 and @listingstatus = 2
			                --set @sql=@sql+' and exists (select 1 from appitems l where l.ListingItemId = i.id)'
			                set @sql=@sql+' and list.id is not null'

		                if @itemtype = 1 and @publishstatus = 2
			                --set @sql=@sql+' and not exists (select 1 from appitems l where l.PublishedListingItemId = i.id)'
			                set @sql=@sql+' and publish.id is null'

		                if @itemtype = 1 and @publishstatus = 1
			                --set @sql=@sql+' and exists (select 1 from appitems l where l.PublishedListingItemId = i.id)'
			                set @sql=@sql+' and publish.id is not null'

		                if @visibilityStatus = 1
			                set @sql=@sql+' and i.SharingLevel =0'

		                if @visibilityStatus = 2
			                set @sql=@sql+' and i.SharingLevel =1'

		                if @lastKey <> '' and @order = 'id'
			                set @sql=@sql+' and  isnull(i.parentId,i.id)>'+ @lastKey
		                else if @lastKey <> ''
			                set @sql=@sql+' and  i.'+@order+'>'''+ @lastKey +''''
		                else if @lastKey = '' and @predictedKey <> ''
			                set @sql=@sql+' and  i.'+@order+'>='''+ @predictedKey +''''
		                --else if @firstChar <> '' and @lastKey = ''
		                --	set @sql=@sql+' and  i.'+@order+'>='''+ @firstChar +''''
			                print @lastKey
		                if @entityObjectTypeId <> 0
			                set @sql=@sql+' and e.entityObjectTypeId =' +  cast(@entityObjectTypeId as nvarchar(50)) 
		
		                --if @filter <> ''
		                --	set @sql=@sql+' and (i.code = ''' + @filter +  ''' or freetext((i.name),''' + @filter +  ''') or freetext((i.Description),''' + @filter +  ''') )'
		                if @filter <> ''
			                set @sql=@sql+' and (i.code = ''' + @filter +  ''' or freetext((i.name),''' + @filter +  ''') or freetext((i.Description),''' + @filter +  ''') )'

		                if @extraAttr <> ''
			                set @sql=@sql+' and exists( select 1 from AppEntityExtraData ex  where ex.entityid = i.entityid and AttributeValueId in ('+@extraAttr+') )'
		                if @classes <> ''
			                set @sql=@sql+' and exists( select 1 from AppEntityClassifications ex where ex.entityid = isnull( i.parententityid,i.entityid)  and EntityObjectClassificationId in ('+@classes+') )'
		                if @categories <> ''
			                set @sql=@sql+' and exists( select 1 from AppEntityCategories ex where ex.entityid = isnull( i.parententityid,i.entityid)  and EntityObjectCategoryId in ('+@categories+') )'
		
		                if @order = 'id'
			                set @sql=@sql+' ORDER BY isnull(i.parentId,i.id)' 
		                else
			                set @sql=@sql+' ORDER BY ' + @order
	  
	                  print @sql
	                EXECUTE sp_executesql  @sql            


            ");
        }
    }

}
