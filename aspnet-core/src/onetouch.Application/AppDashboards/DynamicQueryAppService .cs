using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using DocumentFormat.OpenXml.InkML;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage;
using Newtonsoft.Json.Linq;
using onetouch.AppDashboards.Dtos;
using onetouch.EntityFrameworkCore;

namespace onetouch.AppDashboards
{
    public class DynamicQueryAppService : ApplicationService
    {
        private readonly onetouchDbContext _dbContext;

        public DynamicQueryAppService(
            onetouchDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<onetouch.AppDashboards.Dtos.DynamicQueryResult> Query(
            onetouch.AppDashboards.Dtos.DynamicQueryInput input)
        {
            // 1. Validate table
            if (input == null ||
                string.IsNullOrWhiteSpace(input.TableName) )
                //||
                //!AllowedTables.TryGetValue(
                  //  input.TableName, out var allowedColumns))
            {
                throw new UserFriendlyException(
                    "Invalid or unauthorized table.");
            }

            // 2. Validate selected fields
            if (input.Fields == null ||
                input.Fields.Count == 0)
            {
                throw new UserFriendlyException(
                    "At least one field is required.");
            }

            if (input.Fields.Any(
                f => string.IsNullOrWhiteSpace(f)))
                //||
                  //   !allowedColumns.Contains(f)))
            {
                throw new UserFriendlyException(
                    "One or more fields are not allowed.");
            }

            // Use server-side table and column names from the allowlist.
            var tableName = input.TableName;
            var selectedFields = input.Fields
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var parameters = new List<DbParameter>();
            var where = new List<string>();

            // 3. Tenant isolation.
            // This example assumes the configured tables are tenant-specific.
            //if (!allowedColumns.Contains("TenantId") ||
            //    !AbpSession.TenantId.HasValue)
            //{
            //    throw new UserFriendlyException(
            //        "A valid tenant context is required.");
            //}

            // confirm that table has tenantId
            bool tableHasTenantId = TableHasField(_dbContext, tableName, "TenantId");
            if (tableHasTenantId == true)
            {
                where.Add("[TenantId] = @tenantId");

                parameters.Add(CreateParameter(
                     "@tenantId", input.TenantId));
            }
            else {
                bool tableHasEntityId = TableHasField(_dbContext, tableName, "EntityId");
                if (tableHasEntityId == true)
                {
                    tableName = tableName + " a Inner Join AppEntities b on b.Id = a.EntityId ";
                    where.Add("[TenantId] = @tenantId");

                    parameters.Add(CreateParameter(
                         "@tenantId", input.TenantId));
                }
                else {
                    bool tableHasAppEntityId = TableHasField(_dbContext, tableName, "AppEntityId");
                    if (tableHasAppEntityId == true)
                    {
                        tableName = tableName + " a Inner Join AppEntities b on b.Id = a.AppEntityId ";
                        where.Add("[TenantId] = @tenantId");

                        parameters.Add(CreateParameter(
                             "@tenantId", input.TenantId));
                    }
                    else {
                        tableName = tableName + " a Inner Join AppEntities b on b.Id = a.Id ";
                        where.Add("[TenantId] = @tenantId");

                        parameters.Add(CreateParameter(
                             "@tenantId", input.TenantId));
                    }
                }

            }
            // 4. Build parameterized conditions
            //    var index = 0;

            //foreach (var condition in
            //         input.Conditions ?? new List<onetouch.AppDashboards.Dtos.DynamicCondition>())
            //{
            //    if (condition == null ||
            //        string.IsNullOrWhiteSpace(condition.Field)) //||
            //        //!allowedColumns.Contains(condition.Field))
            //    {
            //        throw new UserFriendlyException(
            //            "Invalid filter field.");
            //    }

            //    var field = $"[{condition.Field}]";
            //    var op = condition.Operator?.ToLowerInvariant();

            //    if (op == "isnull")
            //    {
            //        where.Add($"{field} IS NULL");
            //        continue;
            //    }

            //    if (op == "isnotnull")
            //    {
            //        where.Add($"{field} IS NOT NULL");
            //        continue;
            //    }

            //    if (condition.Value == null)
            //    {
            //        throw new UserFriendlyException(
            //            "Filter value is required.");
            //    }
            //    object valueJson = condition.Value;
            //    var value = valueJson is JValue jValue
            //        ? jValue.ToObject<object>()
            //        : valueJson;

            //    object valueJson2 = condition.Value2;
            //    var value2 = valueJson2 is JValue jValue2
            //        ? jValue2.ToObject<object>()
            //        : valueJson2;


            //    var parameterName = $"@p{index++}";
            //    string expression;

            //    switch (op)
            //    {             
            //        case "eq":
            //            expression = $"{field} = {parameterName}";
            //            break;
            //        case "neq":
            //            expression = $"{field} <> {parameterName}";
            //            break;
            //        case "gt":
            //            expression = $"{field} > {parameterName}";
            //            break;
            //        case "gte":
            //            expression = $"{field} >= {parameterName}";
            //            break;
            //        case "lt":
            //            expression = $"{field} < {parameterName}";
            //            break;
            //        case "lte":
            //            expression = $"{field} <= {parameterName}";
            //            break;
            //        case "startwith":
            //            expression = $"{field} LIKE {parameterName}";
            //            value = "" + value + "%";
            //            break;
            //        case "contains":
            //            expression = $"{field} LIKE {parameterName}";
            //            value = "%" + value + "%";
            //            break;
            //        case "doesnotcontain":
            //            expression = $"{field} Not LIKE {parameterName}";
            //            value = "%" + value + "%";
            //            break;
            //        case "between":

            //            var parameterName2 = $"@p{index++}";
            //            expression = $"{field} Between {parameterName} AND {parameterName2}";
            //            value = "" + value +"";
            //            value2 = "" + value2 + "";
            //            parameters.Add(CreateParameter(parameterName2, value2));
            //            break;
            //        default:
            //            throw new UserFriendlyException(
            //                "Unsupported filter operator.");
            //    }

            //    where.Add(expression);
            //    parameters.Add(CreateParameter(parameterName, value));


            //}
            long oind = 0;
            var returnCond = GenerateConditionList(input.Conditions,"AND", ref oind);
            foreach (var conditionRet in returnCond) 
            {
                if (conditionRet == null || conditionRet.ExpressionList==null || conditionRet.ExpressionList.Count==0)
                    continue;
                
                var whereExp = ""; 
                if (conditionRet.ExpressionList.Count > 1)
                {
                     whereExp = " ( " + string.Join
                     ((conditionRet.ApplyAnyOfThisCondition ? " OR " : " AND "),
                     conditionRet.ExpressionList) + " ) ";
                }
                else
                {
                    whereExp = (conditionRet.ApplyAnyOfThisCondition ?
                        " false " : " true ") + (conditionRet.ApplyAnyOfThisCondition ?
                        " OR " : " AND ")+ conditionRet.ExpressionList[0];
                }
                where.Add(whereExp);
                parameters.AddRange(conditionRet.ParameterList);
            }
            // Always AND user filters with the tenant condition.
            var whereSql = ""; 
            if (input.ApplyAnyOfConditions == true)
            {
                whereSql = " WHERE (" + string.Join(" OR ", where.Where(z=>z!= "[TenantId] = @tenantId").ToList())+")"
                    + (where.Where(z => z == "[TenantId] = @tenantId").FirstOrDefault()!=null ?
                    " AND [TenantId] = @tenantId"  :"") ;
            }
            else
            {
                whereSql = " WHERE " + string.Join(" AND ", where);
            }
            var lastUpdateDate = input.LastUpdateDate;
            if (input.LastUpdateDate != null)
            {
                
                whereSql += string.Format(" AND "+
                    " ([CreationTime] >= '{0}' OR " +
                " [LastModificationTime] >= '{0}') ",lastUpdateDate);
            }
            // 5. Count matching records
            if (!tableName.ToUpper().Contains("Inner Join".ToUpper()))
                tableName += " a";
            
             var countSql =
                $"SELECT COUNT_BIG(*) FROM {tableName} {whereSql}";

            var totalCount = await ExecuteCountAsync(
                countSql, parameters);

            // 6. Validate sorting
            var sortField = selectedFields[0];
            var direction = "ASC";

            if (!string.IsNullOrWhiteSpace(input.Sorting))
            {
                var parts = input.Sorting.Split(
                    new[] { ' ' },
                    StringSplitOptions.RemoveEmptyEntries);

                if (parts.Length > 2 )//||
                   // !allowedColumns.Contains(parts[0]))
                {
                    throw new UserFriendlyException(
                        "Invalid sorting field.");
                }

                sortField = parts[0];

                if (parts.Length == 2)
                {
                    if (parts[1].Equals(
                        "DESC", StringComparison.OrdinalIgnoreCase))
                    {
                        direction = "DESC";
                    }
                    else if (!parts[1].Equals(
                        "ASC", StringComparison.OrdinalIgnoreCase))
                    {
                        throw new UserFriendlyException(
                            "Invalid sorting direction.");
                    }
                }
            }

            // 7. Apply paging
            var skip = Math.Max(0, input.SkipCount);
            var take = input.MaxResultCount <= 0
                ? 50
                : Math.Min(input.MaxResultCount, 500);
            if (selectedFields.FirstOrDefault(z=>z.ToUpper().StartsWith("ID"))
                ==null)
            {
                selectedFields.Add("Id");
            }
            var selectSql = string.Join(
                ", ", selectedFields.Select(f => $"a.[{f}]"));

            var sql =
                $"SELECT {selectSql} FROM {tableName}" +
                $"{whereSql} ORDER BY [{sortField}] {direction}" +
                " OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY";

            var queryParameters = new List<DbParameter>(parameters)
        {
            CreateParameter("@skip", skip),
            CreateParameter("@take", take)
        };

            var items = await ExecuteQueryAsync(
                sql, queryParameters);

            return new onetouch.AppDashboards.Dtos.DynamicQueryResult
            {
                TotalCount = (int)Math.Min(
                    totalCount, int.MaxValue),
                Items = items
            };
        }
        //string.Join(" OR "
        private List<ConditionExp> GenerateConditionList(
            List<onetouch.AppDashboards.Dtos.DynamicCondition> input, 
            string andOrOr,ref long index)

        {
            bool whereAdded = false;
            List<ConditionExp> returnExp = new List<ConditionExp>();
            
            var parameters = new List<DbParameter>();
            var where = new List<string>();
            //var index = 0;
            foreach (var condition in
                     input ?? new List<onetouch.AppDashboards.Dtos.DynamicCondition>())
            {
                if (condition == null ||
                    string.IsNullOrWhiteSpace(condition.Field)) //||
                                                                //!allowedColumns.Contains(condition.Field))
                {
                    throw new UserFriendlyException(
                        "Invalid filter field.");
                }

                var field = $"[{condition.Field}]";
                var op = condition.Operator?.ToLowerInvariant();

                if (op == "isnull")
                {
                    where.Add($"{field} IS NULL");
                    continue;
                }

                if (op == "isnotnull")
                {
                    where.Add($"{field} IS NOT NULL");
                    continue;
                }

                if (condition.Value == null)
                {
                    throw new UserFriendlyException(
                        "Filter value is required.");
                }
                object valueJson = condition.Value;
                var value = valueJson is JValue jValue
                    ? jValue.ToObject<object>()
                    : valueJson;

                object valueJson2 = condition.Value2;
                var value2 = valueJson2 is JValue jValue2
                    ? jValue2.ToObject<object>()
                    : valueJson2;


                var parameterName = $"@p{index++}";
                string expression="";

                switch (op)
                {
                    case "eq":
                        expression = $"{field} = {parameterName}";
                        break;
                    case "neq":
                        expression = $"{field} <> {parameterName}";
                        break;
                    case "gt":
                        expression = $"{field} > {parameterName}";
                        break;
                    case "gte":
                        expression = $"{field} >= {parameterName}";
                        break;
                    case "lt":
                        expression = $"{field} < {parameterName}";
                        break;
                    case "lte":
                        expression = $"{field} <= {parameterName}";
                        break;
                    case "startwith":
                        expression = $"{field} LIKE {parameterName}";
                        value = "" + value + "%";
                        break;
                    case "contains":
                        expression = $"{field} LIKE {parameterName}";
                        value = "%" + value + "%";
                        break;
                    case "doesnotcontain":
                        expression = $"{field} Not LIKE {parameterName}";
                        value = "%" + value + "%";
                        break;
                    case "between":

                        var parameterName2 = $"@p{index++}";
                        expression = $"{field} Between {parameterName} AND {parameterName2}";
                        value = "" + value + "";
                        value2 = "" + value2 + "";
                        parameters.Add(CreateParameter(parameterName2, value2));
                        break;
                    default:
                        throw new UserFriendlyException(
                            "Unsupported filter operator.");
                }
                whereAdded = false;
                
                parameters.Add(CreateParameter(parameterName, value));
                if (condition.AndWithList != null && condition.AndWithList.Count() > 0)
                {
                    //if (!whereAdded)
                    //{
                    //    ConditionExp condExpr = new ConditionExp();
                    //    condExpr.ParameterList = parameters;
                    //    condExpr.ExpressionList = where;
                    //    condExpr.ApplyAnyOfThisCondition = (andOrOr == "OR");
                    //    returnExp.Add(condExpr);
                    //    whereAdded = true;
                    //}
                    var returnSubExp = GenerateConditionList(condition.AndWithList,"AND", ref index);
                    if (returnSubExp != null)
                    {
                        expression += " AND (";
                        foreach (var ex in returnSubExp)
                        {
                            bool llfirst = true;
                            
                            foreach (var expst in ex.ExpressionList)
                            {
                                expression += (llfirst == true ? "" : " AND ") + expst;
                                llfirst = false;
                            }
                            
                            parameters.AddRange(ex.ParameterList);
                        }
                        expression += " )";


                        //returnExp.AddRange
                        //    (returnSubExp);
                    }
                }
                if (condition.OrWithList != null && condition.OrWithList.Count() > 0)
                {
                    //if (!whereAdded)
                    //{
                    //    ConditionExp condExpr = new ConditionExp();
                    //    condExpr.ParameterList = parameters;
                    //    condExpr.ExpressionList = where;
                    //    condExpr.ApplyAnyOfThisCondition = (andOrOr == "OR");
                    //    whereAdded = true;
                    //    returnExp.Add(condExpr);
                    //}
                    var returnSubExp = GenerateConditionList(condition.OrWithList, "OR", ref index);
                    if (returnSubExp != null)
                    {
                        expression += " OR (";
                        //returnExp.AddRange(returnSubExp);
                        foreach (var ex in returnSubExp)
                        {
                            bool llfirst = true;
                            
                            foreach (var expst in ex.ExpressionList)
                            {
                                expression += (llfirst == true ? "" : " OR ") + expst;
                                llfirst = false;
                            }
                            
                            parameters.AddRange(ex.ParameterList);
                            
                        }
                        expression += " )";
                    }
                }
                //expression += ")";
                where.Add("( "+expression+" )");
            }
            
            //if (!whereAdded)
            {
                ConditionExp condExp = new ConditionExp();
                condExp.ParameterList = parameters;
                condExp.ExpressionList = where;
                condExp.ApplyAnyOfThisCondition = (andOrOr == "OR");
                whereAdded = true;
                returnExp.Add(condExp);
            }
            return returnExp;
        }
        private DbParameter CreateParameter(
            string name, object value)
        {
            var parameter = _dbContext.Database
                .GetDbConnection()
                .CreateCommand()
                .CreateParameter();

            parameter.ParameterName = name;
            parameter.Value = value ?? DBNull.Value;

            return parameter;
        }

        private async Task<long> ExecuteCountAsync(
            string sql, List<DbParameter> parameters)
        {
            var connection = _dbContext.Database.GetDbConnection();

            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            command.Transaction = _dbContext.Database.CurrentTransaction.GetDbTransaction();
            foreach (var p in parameters)
            {
                var parameter = command.CreateParameter();
                parameter.ParameterName = p.ParameterName;
                parameter.Value = p.Value;
                command.Parameters.Add(parameter);
            }

            var openedHere = connection.State != ConnectionState.Open;

            if (openedHere)
                await connection.OpenAsync();

            try
            {
                return Convert.ToInt64(
                    await command.ExecuteScalarAsync());
            }
            finally
            {
                if (openedHere)
                    await connection.CloseAsync();
            }
        }

        private async Task<List<Dictionary<string, object>>>
            ExecuteQueryAsync(
                string sql, List<DbParameter> parameters)
        {
            var items = new List<Dictionary<string, object>>();
            var connection = _dbContext.Database.GetDbConnection();

            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            command.Transaction = _dbContext.Database.CurrentTransaction.GetDbTransaction();
            foreach (var p in parameters)
            {
                var parameter = command.CreateParameter();
                parameter.ParameterName = p.ParameterName;
                parameter.Value = p.Value;
                command.Parameters.Add(parameter);
            }

            var openedHere = connection.State != ConnectionState.Open;

            if (openedHere)
                await connection.OpenAsync();

            try
            {
                await using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object>(
                        StringComparer.OrdinalIgnoreCase);

                    for (var i = 0; i < reader.FieldCount; i++)
                    {
                        row[reader.GetName(i)] =
                            await reader.IsDBNullAsync(i)
                                ? null
                                : reader.GetValue(i);
                    }

                    items.Add(row);
                }
            }
            finally
            {
                if (openedHere)
                    await connection.CloseAsync();
            }

            return items;
        }
        public bool TableHasField(
    DbContext dbContext,
    string tableName,
    string fieldName)
        {
            var entityType = dbContext.Model.GetEntityTypes()
                .FirstOrDefault(e =>
                    e.GetTableName() == tableName);

            if (entityType == null)
                return false;

            var tableIdentifier = StoreObjectIdentifier.Table(
                entityType.GetTableName(),
                entityType.GetSchema());

            return entityType.GetProperties()
                .Any(p =>
                    p.GetColumnName(tableIdentifier) == fieldName);
        }
    }
}
