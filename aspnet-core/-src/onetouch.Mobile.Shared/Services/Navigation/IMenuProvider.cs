using System.Collections.Generic;
using MvvmHelpers;
using onetouch.Models.NavigationMenu;

namespace onetouch.Services.Navigation
{
    public interface IMenuProvider
    {
        ObservableRangeCollection<NavigationMenuItem> GetAuthorizedMenuItems(Dictionary<string, string> grantedPermissions);
    }
}