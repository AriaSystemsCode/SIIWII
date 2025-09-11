using Abp.Dependency;
using GraphQL;
using GraphQL.Types;
using onetouch.Queries.Container;

namespace onetouch.Schemas
{
    public class MainSchema : Schema, ITransientDependency
    {
        public MainSchema(IDependencyResolver resolver) :
            base(resolver)
        {
            Query = resolver.Resolve<QueryContainer>();
        }
    }
}