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
                var index = 0;

            foreach (var condition in
                     input.Conditions ?? new List<onetouch.AppDashboards.Dtos.DynamicCondition>())
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

                var value = condition.Value is JValue jValue
                    ? jValue.ToObject<object>()
                    : condition.Value;

                var parameterName = $"@p{index++}";
                string expression;

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
                    case "contains":
                        expression = $"{field} LIKE {parameterName}";
                        value = "%" + value + "%";
                        break;
                    default:
                        throw new UserFriendlyException(
                            "Unsupported filter operator.");
                }

                where.Add(expression);
                parameters.Add(CreateParameter(parameterName, value));
            }


            // Always AND user filters with the tenant condition.
            var whereSql = " WHERE " + string.Join(" AND ", where);
            var lastUpdateDate = input.LastUpdateDate;
            if (input.LastUpdateDate != null)
            {
                
                whereSql += string.Format(" AND "+
                    " (CreationTime >= '{0}' OR " +
                " LastModificationTime >= '{0}') ",lastUpdateDate);
            }
            // 5. Count matching records
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

            var selectSql = string.Join(
                ", ", selectedFields.Select(f => $"[{f}]"));

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
