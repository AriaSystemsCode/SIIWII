//using System;
//using System.Threading.Tasks;
//using Abp;
//using Abp.AspNetCore.SignalR.Hubs;
//using Abp.Auditing;
//using Abp.Localization;
//using Abp.RealTime;
//using Abp.Runtime.Session;
//using Abp.UI;
//using Castle.Core.Logging;
//using Castle.Windsor;
//using Microsoft.AspNetCore.SignalR;
//using onetouch.Chat;

//namespace onetouch.Web.Chat.SignalR
//{
//    //public class MaintainanceHub : OnlineClientHubBase
//    //{
//    //    private readonly IChatMessageManager _chatMessageManager;
//    //    private readonly ILocalizationManager _localizationManager;
//    //    private readonly IWindsorContainer _windsorContainer;
//    //    private bool _isCallByRelease;
//    //    private IAbpSession ChatAbpSession { get; }
//    //    private readonly IOnlineClientInfoProvider _onlineClientInfoProvider;

//    //    /// <summary>
//    //    /// Initializes a new instance of the <see cref="NewsHub"/> class.
//    //    /// </summary>
//    //    public MaintainanceHub(
//    //       IChatMessageManager chatMessageManager,
//    //       ILocalizationManager localizationManager,
//    //       IWindsorContainer windsorContainer,
//    //       IOnlineClientManager<ChatChannel> onlineClientManager,
//    //       IClientInfoProvider clientInfoProvider,
//    //       IOnlineClientInfoProvider onlineClientInfoProvider) : base(onlineClientManager, onlineClientInfoProvider)
//    //    {
//    //        _chatMessageManager = chatMessageManager;
//    //        _localizationManager = localizationManager;
//    //        _windsorContainer = windsorContainer;

//    //        Logger = NullLogger.Instance;
//    //        ChatAbpSession = NullAbpSession.Instance;
//    //        _onlineClientInfoProvider = onlineClientInfoProvider;
//    //    }
//    //    public async Task SendMessageAll(string user, string message)
//    //    { await Clients.All.SendAsync("ReceiveMessage", user, message); }

//    //    public async Task<string> SendMessage(SendChatMessageInput input)
//    //    {
//    //        var sender = Context.ToUserIdentifier();
//    //        var receiver = new UserIdentifier(input.TenantId, input.UserId);

//    //        try
//    //        {
//    //            using (ChatAbpSession.Use(Context.GetTenantId(), Context.GetUserId()))
//    //            {
//    //                await _chatMessageManager.SendMessageAsync(sender, receiver, input.Message, input.TenancyName, input.UserName, input.ProfilePictureId);
//    //                return string.Empty;
//    //            }
//    //        }
//    //        catch (UserFriendlyException ex)
//    //        {
//    //            Logger.Warn("Could not send chat message to user: " + receiver);
//    //            Logger.Warn(ex.ToString(), ex);
//    //            return ex.Message;
//    //        }
//    //        catch (Exception ex)
//    //        {
//    //            Logger.Warn("Could not send chat message to user: " + receiver);
//    //            Logger.Warn(ex.ToString(), ex);
//    //            return _localizationManager.GetSource("AbpWeb").GetString("InternalServerError");
//    //        }
//    //    }

//    //    public void Register()
//    //    {
//    //        Logger.Debug("A client is registered: " + Context.ConnectionId);
//    //    }

//    //    protected override void Dispose(bool disposing)
//    //    {
//    //        if (_isCallByRelease)
//    //        {
//    //            return;
//    //        }
//    //        base.Dispose(disposing);
//    //        if (disposing)
//    //        {
//    //            _isCallByRelease = true;
//    //            _windsorContainer.Release(this);
//    //        }
//    //    }
//    //}
//}