using System;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Transactions;
using System.Threading.Tasks;
using Abp;
using Abp.Domain.Uow;
using Abp.Notifications;
using Abp.Runtime.Session;
using Abp.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using onetouch.Notifications;

namespace onetouch.Web.Startup
{
    public class ImportItemValidationNotificationFilter : IAsyncAlwaysRunResultFilter
    {
        private const string ImportPath = "/api/services/app/AppItems/ImportItem";
        private static readonly Regex RecordIndex = new Regex(@"^\[(\d+)\](?:\.|$)");
        private readonly IAbpSession _session;
        private readonly IAppNotifier _notifier;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly ILogger<ImportItemValidationNotificationFilter> _logger;

        public ImportItemValidationNotificationFilter(
            IAbpSession session,
            IAppNotifier notifier,
            IUnitOfWorkManager unitOfWorkManager,
            ILogger<ImportItemValidationNotificationFilter> logger)
        {
            _session = session;
            _notifier = notifier;
            _unitOfWorkManager = unitOfWorkManager;
            _logger = logger;
        }

        public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
        {
            var request = context.HttpContext.Request;
            if (HttpMethods.IsPost(request.Method) &&
                string.Equals(request.Path.Value?.TrimEnd('/'), ImportPath, StringComparison.OrdinalIgnoreCase) &&
                _session.UserId is long userId &&
                context.Result is ObjectResult { Value: AjaxResponse response } result &&
                (result.StatusCode ?? context.HttpContext.Response.StatusCode) == StatusCodes.Status400BadRequest &&
                response.Error?.ValidationErrors is { Length: > 0 } errors)
            {
                try
                {
                    using var unitOfWork = _unitOfWorkManager.Begin(TransactionScopeOption.RequiresNew);
                    await _notifier.SendMessageAsync(new UserIdentifier(_session.TenantId, userId),
                        BuildMessage(errors), NotificationSeverity.Warn, null);
                    await unitOfWork.CompleteAsync();
                }
                catch (Exception exception)
                {
                    // Keep the original validation response if notification delivery fails.
                    _logger.LogWarning(exception, "Could not send the item import validation notification.");
                }
            }

            await next();
        }

        private static string BuildMessage(ValidationErrorInfo[] errors)
        {
            var groups = errors
                .GroupBy(error => error.Message ?? "Check the import fields.")
                .ToList();

            var summaries = groups.Take(2).Select(group =>
            {
                var records = group.SelectMany(error => error.Members ?? Array.Empty<string>())
                    .Select(member => RecordIndex.Match(member ?? string.Empty).Groups[1].Value)
                    .Select(index => int.TryParse(index, out var number) && number < int.MaxValue ? number + 1 : 0)
                    .Where(number => number > 0)
                    .Distinct()
                    .OrderBy(number => number)
                    .ToList();

                var message = Regex.Replace(group.Key, @"\s+", " ").Trim();
                if (message.Length > 100)
                    message = message.Substring(0, 97) + "...";

                if (records.Count == 0)
                    return message;

                var recordNumbers = string.Join(", ", records.Take(4));
                var remaining = records.Count > 4 ? $" and {records.Count - 4} more" : string.Empty;
                return $"Records {recordNumbers}{remaining}: {message}";
            });

            var details = string.Join(" ", summaries);
            var more = groups.Count > 2 ? " See the import response for more errors." : string.Empty;
            return WebUtility.HtmlEncode(
                $"Item import received but rejected. {details}{more} Correct the file and retry.");
        }
    }
}
