using Abp.Data;
using Abp.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using onetouch.AppItems;
using onetouch.AppItems.Dtos;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.EntityFrameworkCore.Repositories
{
    public class AppItemRepository //: onetouchRepositoryBase<AppItem, long>, IAppItemRepository
    {
    //    private readonly IActiveTransactionProvider _transactionProvider;

    //    public AppItemRepository(IDbContextProvider<onetouchDbContext> dbContextProvider, IActiveTransactionProvider transactionProvider)
    //        : base(dbContextProvider)
    //    {
    //        _transactionProvider = transactionProvider;
    //    }

    //    public async Task<List<long>> GetItemPageIds(GetAllAppItemsInput input
    //        )
    //    {
    //        await EnsureConnectionOpenAsync();

    //        using (var command = CreateCommand("GetItemsPage", CommandType.StoredProcedure
    //            , new SqlParameter("@tenantId", input.TenantId)
    //            , new SqlParameter("@filter", input.Filter == null ? "" : input.Filter)
    //            , new SqlParameter("@entityObjectTypeId", input.EntityObjectTypeId)
    //            , new SqlParameter("@order", input.Sorting)
    //            , new SqlParameter("@lastKey", input.LastKey == null ? "" : input.LastKey)
    //            , new SqlParameter("@pageSize", input.MaxResultCount)
    //            , new SqlParameter("@extraAttr", input.ArrtibuteFilters == null ? "" : string.Join(",", input.ArrtibuteFilters.Select(x => x.ArrtibuteValueId)))
    //            , new SqlParameter("@classes", input.ClassificationFilters == null ? "" : string.Join(",", input.ClassificationFilters))
    //            , new SqlParameter("@categories", input.CategoryFilters == null ? "" : string.Join(",", input.CategoryFilters))
    //            , new SqlParameter("@itemtype", input.ItemType)
    //            , new SqlParameter("@publishstatus", input.PublishStatus)
    //            , new SqlParameter("@listingstatus", input.ListingStatus)
    //            , new SqlParameter("@visibilityStatus", input.VisibilityStatus)
    //            ))
    //        {
    //            using (var dataReader = await command.ExecuteReaderAsync())
    //            {
    //                var result = new List<long>();

    //                while (dataReader.Read())
    //                {
    //                    result.Add(long.Parse(dataReader["IdFinal"].ToString()));
    //                }


    //                return result;
    //            }
    //        }
    //    }

    //    private DbCommand CreateCommand(string commandText, CommandType commandType, params SqlParameter[] parameters)
    //    {
    //        var command = Context.Database.GetDbConnection().CreateCommand();

    //        command.CommandText = commandText;
    //        command.CommandType = commandType;
    //        command.Transaction = GetActiveTransaction();

    //        foreach (var parameter in parameters)
    //        {
    //            command.Parameters.Add(parameter);
    //        }

    //        return command;
    //    }

    //    private async Task EnsureConnectionOpenAsync()
    //    {
    //        var connection = Context.Database.GetDbConnection();
    //        if (connection.State != ConnectionState.Open)
    //        {
    //            await connection.OpenAsync();
    //        }
    //    }

    //    private DbTransaction GetActiveTransaction()
    //    {
    //        return (DbTransaction)_transactionProvider.GetActiveTransaction(new ActiveTransactionProviderArgs
    //{
    //    {"ContextType", typeof(onetouchDbContext) },
    //    {"MultiTenancySide", MultiTenancySide }
    //});
    //    }
    }
}
