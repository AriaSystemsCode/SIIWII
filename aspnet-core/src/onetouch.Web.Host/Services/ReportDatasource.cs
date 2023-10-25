using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DevExpress.DataAccess.ConnectionParameters;
using DevExpress.DataAccess.Sql;

namespace onetouch.Web.Services
{
    public class ReportDatasource
    {
        SqlDataSource DataSource { get; set; }
        void SqlDataSourceInitialization()
        {
            //1)
            var myConnectionName = "Northwind_Connection";
            SqlDataSource DataSource = new SqlDataSource(myConnectionName);
            //2)
            //MsSqlConnectionParameters connectionParameters = new MsSqlConnectionParameters(".", "NWind", null, null, MsSqlAuthorizationType.Windows);
            //SqlDataSource ds1 = new SqlDataSource(connectionParameters);
        }
        void SelectQueryCreation()
        {
            SelectQuery query = SelectQueryFluentBuilder
                                .AddTable("Categories")
                                .SelectColumn("CategoryName")
                                .GroupBy("CategoryName")
                                .Join("Products", "CategoryID")
                                .SelectColumn("ProductName", AggregationType.Count, "ProductCount")
                                .SortBy("ProductName", AggregationType.Count, System.ComponentModel.ListSortDirection.Descending)
                                .GroupFilter("[ProductCount] > 7")
                                .Build("Categories");
            DataSource.Queries.Add(query);

            QueryParameterInitialization(query);
        }
        void StoredProcedureInitialization()
        {
            StoredProcQuery spQuery = new StoredProcQuery("StoredProcedure", "stored_procedure_name");
            spQuery.Parameters.Add(new QueryParameter("@First", typeof(int), 0));
            spQuery.Parameters.Add(new QueryParameter("@Second", typeof(string), "Value"));
            spQuery.Parameters.Add(new QueryParameter("@Third", typeof(string), "Value"));

            DataSource.Queries.Add(spQuery);
        }
        void QueryParameterInitialization(SelectQuery query)
        {
            QueryParameter parameter = new QueryParameter()
            {
                Name = "catID",
                Type = typeof(DevExpress.DataAccess.Expression),
                Value = new DevExpress.DataAccess.Expression("[Parameters.catID]", typeof(System.Int32))
            };
            query.Parameters.Add(parameter);
            query.FilterString = "CategoryID = ?catID";
        }
        void CustomSqlQueryInitialization()
        {
            CustomSqlQuery query = new CustomSqlQuery();
            query.Name = "CustomQuery";
            query.Sql = "Select top 10 * from Products";

            DataSource.Queries.Add(query);
        }
        void RelationshipInitialization()
        {
            SelectQuery categories = SelectQueryFluentBuilder.AddTable("Categories").SelectAllColumns().Build("Categories");
            SelectQuery products = SelectQueryFluentBuilder.AddTable("Products").SelectAllColumns().Build("Products");

            DataSource.Queries.AddRange(new SqlQuery[] { categories, products });
            DataSource.Relations.Add(new MasterDetailInfo("Categories", "Products", "CategoryID", "CategoryID"));
        }

        public static SqlDataSource CreateSqlDataSource()
        {
            MsSqlConnectionParameters connectionParameters = new MsSqlConnectionParameters(".", "NorthWind", null, null, MsSqlAuthorizationType.Windows);
            var sqlDataSource = new SqlDataSource(connectionParameters) { Name = "Sql_Categories" };
            var categoriesQuery = SelectQueryFluentBuilder.AddTable("Categories").
                SelectAllColumnsFromTable().
                Build("Categories");
            sqlDataSource.Queries.Add(categoriesQuery);
            sqlDataSource.RebuildResultSchema();
            return sqlDataSource;
        }


    }
}
