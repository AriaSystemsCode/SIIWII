using Abp;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Uow;
using AutoMapper;
using Castle.Core.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using NPOI.HPSF;
using NPOI.OpenXmlFormats.Dml;
using NPOI.SS.Formula.Functions;
using NUglify.Helpers;
using onetouch.AppEntities;
using onetouch.AppItemsLists;
using onetouch.AppMarketplaceItemLists;
using onetouch.AppMarketplaceItems;
using onetouch.Configuration;
using onetouch.EntityFrameworkCore;
using onetouch.SycCounters;
using onetouch.SycSegmentIdentifierDefinitions;
using onetouch.SystemObjects;
using PayPalCheckoutSdk.Orders;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.DirectoryServices.AccountManagement;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using Z.EntityFramework.Plus;

namespace onetouch.AppItems
{
    public class AppUpdateItemSSINAppService : AbpServiceBase, IAppUpdateItemSSINAppService
    {
        private readonly IConfigurationRoot _appConfiguration;
       // private readonly IDbContextFactory<onetouchDbContext> _contextFactory;
        public AppUpdateItemSSINAppService(IAppConfigurationAccessor appConfigurationAccessor)
        {
            _appConfiguration = appConfigurationAccessor.Configuration;
            // _contextFactory = contextFactory;, IDbContextFactory<onetouchDbContext> contextFactory
        }
        private void MoveFileToMarketplace(string fileName, int? sourceTenantId, int? distinationTenantId)
        {

            //  IAppConfigurationAccessor appConfigurationAccessor = new Configuration.AppConfigurations ();
            Configuration.DefaultAppConfigurationAccessor config = new DefaultAppConfigurationAccessor();
            var _appConfiguration = config.Configuration;
            if (sourceTenantId == null) sourceTenantId = -1;
            if (distinationTenantId == null) distinationTenantId = -1;

            var tmpPath = _appConfiguration[$"Attachment:PathTemp"] + @"\" + sourceTenantId + @"\" + fileName;
            var pathSource = _appConfiguration[$"Attachment:Path"] + @"\" + sourceTenantId + @"\" + fileName;
            var path = _appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId + @"\" + fileName;

            if (!System.IO.Directory.Exists(_appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId))
            {
                System.IO.Directory.CreateDirectory(_appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId);
            }

            try
            {
                System.IO.File.Copy(tmpPath.Replace(@"\", @"\"), path.Replace(@"\", @"\"), true);
            }
            catch (Exception ex)
            {
                try
                {
                    System.IO.File.Copy(pathSource.Replace(@"\", @"\"), path.Replace(@"\", @"\"), true);
                }
                catch (Exception ex1)
                {

                }
            }
        }
        public void UpdateSSIN()
        {

            //return;
            var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            bool changeTrak = _context.ChangeTracker.AutoDetectChangesEnabled;
            var objectRec = _context.SydObjects.AsNoTracking().FirstOrDefault(x => x.Code == "ITEM");
            _context.ChangeTracker.AutoDetectChangesEnabled = false;
            ILogger Logger;
            Logger = NullLogger.Instance;
            int count = 0;
            bool itemsFound = false;
            bool recur = true;
            _context.Database.AutoTransactionBehavior = AutoTransactionBehavior.Always;
            List<onetouch.SycSegmentIdentifierDefinitions.SycSegmentIdentifierDefinition> sycSegmentIdentifierDefinitions = null;
            if (objectRec != null)
            {
                var ssinId = objectRec.SSINIdentifierId;
                if (ssinId != null)
                {
                    sycSegmentIdentifierDefinitions =  _context.SycSegmentIdentifierDefinitions.IgnoreQueryFilters().Where(e => e.SycIdentifierDefinitionId == ssinId).OrderBy(x => x.SegmentNumber).ToList();
                }
            }
           // DatabaseFacade oldDb = new DatabaseFacade(_context);
            do
            {
                //return;
                //var appItems = _context.Database.SqlQuery<string>("Select code from AppItems where TenantId is not null and ItemType = 0 and (SSIN is null or SSIN = '')").FirstOrDefault();
                //&& !r.IsDeleted && r.ParentId == null).FirstOrDefault();
                try {
                    var tr=_context.Database.BeginTransaction();
                    _context.Database.UseTransaction(tr.GetDbTransaction());
                }
                catch { }
                var appItems = _context.AppItems.IgnoreQueryFilters().Include(z=>z.EntityFk).Include(z=>z.ParentFkList).ThenInclude(z=>z.EntityFk)
                    .Where(z => z.TenantId != null && z.ParentId == null & z.IsDeleted == false && z.ItemType == 0 && (z.SSIN == null || z.SSIN==""))
                   .Take(5).ToList();
                
                 count += 1;
                
                if (appItems == null || appItems.Count()==0)
                {
                    recur = false;
                    break;
                }

                if (appItems != null && appItems.Count > 0)
                {
                    itemsFound = true;
                    UpdateItemsSSIN(appItems, objectRec, sycSegmentIdentifierDefinitions);
                    //appItems.SSIN =  GetSSIN(long.Parse(appItems.TenantId.ToString()), objectRec, sycSegmentIdentifierDefinitions); //getssin;
                     //   _context.AppItems.IgnoreQueryFilters().Where(x => x.Id == appItems.Id).ExecuteUpdate(z => z.SetProperty(a => a.SSIN, a => "0000001012-00000001551"));
                      //  transaction.Commit();
                       
                   
                }
            } while (recur);

            if (!itemsFound)
            {
              //  ShareItemsHasListing();
               
              //  UpdateItemList(objectRec, sycSegmentIdentifierDefinitions);
            //    UpdateMFGCode();
             //   RemoveListingFromAppItem();

            }
            _context.ChangeTracker.AutoDetectChangesEnabled = changeTrak;
        }
        private void UpdateItemsSSIN(List<AppItem> appItems, SydObject objectRec, List<onetouch.SycSegmentIdentifierDefinitions.SycSegmentIdentifierDefinition> sycSegmentIdentifierDefinitions)
        {

            var main = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            

            string timeRun = DateTime.Now.ToLongTimeString();
            var connectionstring = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null).Database.GetConnectionString();

            var optionsBuilder = new DbContextOptionsBuilder<onetouchDbContext>();
            optionsBuilder.UseSqlServer(connectionstring);



            //var _context = new onetouchDbContext(new DbContextOptions<onetouchDbContext>() { });
            //_context.CurrentUnitOfWorkProvider = main.CurrentUnitOfWorkProvider;  //
            //_context.Database.OpenConnection();
            var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            //using (var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null))//new onetouchDbContext(optionsBuilder.Options))
            {
                // _context.Initialize(new Abp.EntityFramework.AbpEfDbContextInitializationContext((IUnitOfWork)main.CurrentUnitOfWorkProvider));
                // var _context = new onetouchDbContext(new DbContextOptions<onetouchDbContext>());
                //_context.CurrentUnitOfWorkProvider = _context.CurrentUnitOfWorkProvider;

                // _context.Initialize(new Abp.EntityFramework.AbpEfDbContextInitializationContext((IUnitOfWork)unitOfWork));
                // _context.CurrentUnitOfWorkProvider.Current.Begin();
                //UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
                //_context.Database.CurrentTransaction.Dispose();
                try
                {
                    _context.Database.CommitTransaction();
                }
                catch { }

                using (var scope = _context.Database.BeginTransaction())
                {
                    _context.Database.UseTransaction(scope.GetDbTransaction());
                    //var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
                    for (int a = 0; a < appItems.Count; a++)
                    {
                        var item = appItems[a];// appItems;
                        string path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + "SSINFixLog.txt";
                        using (StreamWriter writer = new StreamWriter(path, true))
                        {
                            writer.WriteLine(timeRun + ": " + "Item No.:" + a.ToString().TrimEnd() + "  Item Code: " + item.Code);
                            writer.Close();
                        }

                        string returnString = GetSSIN(long.Parse(item.TenantId.ToString()), objectRec, sycSegmentIdentifierDefinitions); //getssin;
                        var tenantIdentifier = _context.SycEntityObjectTypes.IgnoreQueryFilters().Where(r => r.TenantId == item.TenantId
                        && r.Id == item.EntityFk.EntityObjectTypeId).FirstOrDefault();
                        if (tenantIdentifier != null && tenantIdentifier.SycIdentifierDefinitionId != null)
                            item.SycIdentifierId = tenantIdentifier.SycIdentifierDefinitionId;
                        else
                        {
                            var tenantIdentifierShared = _context.SycEntityObjectTypes.IgnoreQueryFilters().Where(r => r.TenantId == null
                        && r.Id == item.EntityFk.EntityObjectTypeId).FirstOrDefault();
                            if (tenantIdentifierShared != null && tenantIdentifierShared.SycIdentifierDefinitionId != null)
                                item.SycIdentifierId = tenantIdentifierShared.SycIdentifierDefinitionId;
                            else
                            {
                                //var identifierShared = _context.SydObjects.IgnoreQueryFilters().Where(r => r.Code == "ITEM").FirstOrDefault();
                                if (objectRec != null && objectRec.SycDefaultIdentifierId != null)
                                    item.SycIdentifierId = objectRec.SycDefaultIdentifierId;
                            }
                        }
                        item.SSIN = returnString;
                        item.TenantOwner = int.Parse(item.TenantId.ToString());
                        item.TimeStamp = item.LastModificationTime == null ? DateTime.Parse(item.CreationTime.ToString()) : DateTime.Parse(item.LastModificationTime.ToString());
                        item.EntityFk.SSIN = item.SSIN;
                        item.EntityFk.TenantOwner = item.TenantOwner;
                         _context.AppItems.IgnoreQueryFilters().Where(b => b.Id == item.Id)
                             .ExecuteUpdate(z => z.SetProperty(a => a.SSIN, a => item.SSIN)
                             .SetProperty(a => a.TenantOwner, a => item.TenantOwner)
                             .SetProperty(a => a.TimeStamp, a => item.TimeStamp)
                             .SetProperty(a => a.SycIdentifierId, a => item.SycIdentifierId));
                        //_context.AppItems.Where(b => b.Id == item.Id).ExecuteUpdate<AppItem>(z => z.SetProperty(a => a.SSIN, a => item.SSIN)
                        //           .SetProperty(a => a.TenantOwner, a => item.TenantOwner)
                        //          // .SetProperty(a => a.EntityFk.SSIN, a => item.EntityFk.SSIN)
                        //           //.SetProperty(a => a.EntityFk.TenantOwner, a => item.EntityFk.TenantOwner)
                        //         .SetProperty(a => a.TimeStamp, a => item.TimeStamp)
                        //         .SetProperty(a => a.SycIdentifierId, a => item.SycIdentifierId));
                        /*  _context.AppEntities.Where(z => z.Id == item.EntityId).ExecuteUpdate<AppEntity>(z => z.SetProperty(a => a.SSIN, a => item.SSIN)
                          .SetProperty(a => a.TenantOwner, a => item.TenantOwner));*/
                        //await _context.AppEntities.UpdateRange.UpdateAsync<AppEntity>(item.EntityFk);
                        //_context.AppItems.Update(item);
                        // _context.AppItems.Entry(item).State= EntityState.Modified;
                        _context.AppEntities.Entry(item.EntityFk).State = EntityState.Modified;
                        // await _context.SaveChangesAsync();
                        if (item.ParentFkList != null && item.ParentFkList.Count > 0)
                        {
                            foreach (var chld in item.ParentFkList)
                            {
                                chld.SSIN = GetSSIN(long.Parse(item.TenantId.ToString()), objectRec, sycSegmentIdentifierDefinitions);
                                chld.TenantOwner = int.Parse(item.TenantId.ToString());
                                chld.TimeStamp = item.TimeStamp;
                                chld.SycIdentifierId = item.SycIdentifierId;
                                chld.EntityFk.SSIN = chld.SSIN;
                                chld.EntityFk.TenantOwner = chld.TenantOwner;


                                 _context.AppItems.IgnoreQueryFilters().Where(b => b.Id== chld.Id).ExecuteUpdate(z=> z.SetProperty(a => a.SSIN, a => chld.SSIN)
                                     .SetProperty (a=>a.TenantOwner,a=>chld.TenantOwner).SetProperty(a => a.TimeStamp, a => chld.TimeStamp)
                                    .SetProperty(a => a.SycIdentifierId, a => chld.SycIdentifierId));

                                ////   // .SetProperty(a => a.EntityFk.SSIN, a => chld.EntityFk.SSIN)
                                ////  //  .SetProperty(a => a.EntityFk.TenantOwner, a => chld.EntityFk.TenantOwner)
                                //    .SetProperty(a => a.TimeStamp, a => chld.TimeStamp)
                                //    .SetProperty(a => a.SycIdentifierId, a => chld.SycIdentifierId));
                                // _context.AppItems.Update(chld);
                                // _context.AppItems.Entry(chld).State = EntityState.Modified;
                                 _context.AppEntities.Entry(chld.EntityFk).State = EntityState.Modified;
                                //await _context.AppEntities.UpdateAsync<AppEntity>(chld.EntityFk);
                                /* await _context.AppEntities.Where(z => z.Id == item.EntityId).ExecuteUpdateAsync(z => z.SetProperty(a => a.SSIN, a => item.SSIN)
                                 .SetProperty(a => a.TenantOwner, a => item.TenantOwner));*/
                            }
                            // await _context.SaveChangesAsync();
                        }


                        //var listing = await _context.AppItems.IgnoreQueryFilters().Where(r => r.ItemType == 1
                        //&& !r.IsDeleted && r.ListingItemId == item.Id).FirstOrDefaultAsync();
                        //if (listing != null)
                        //    await ShareItemData(item);

                    }

                   // _context.AppItems.UpdateRange(appItems);
                    _context.SaveChanges();
                    //_context.CurrentUnitOfWorkProvider.Current.Complete();
                    //unitOfWork.Complete();
                    scope.Commit();
                    //var tran = _context.Database.BeginTransaction();
                    //_context.Database.UseTransaction(tran.GetDbTransaction());
                    //_context.Database.BeginTransaction();
                    //_context.Initialize(new Abp.EntityFramework.AbpEfDbContextInitializationContext());

                }
            }
            
            //var options = _context.CurrentUnitOfWorkProvider.Current.Options;
            // _context.CurrentUnitOfWorkProvider.Current.Complete();

            //_context.CurrentUnitOfWorkProvider.Current.Begin(options);
        }
        public void ShareItemsHasListing()
        {
            bool recall = true;
            var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
           // do
            {
                //try
                //{
                //    _context.Database.CommitTransaction();
                //    var tr = _context.Database.BeginTransaction();
                //    _context.Database.UseTransaction(tr.GetDbTransaction());
                //}
                //catch { }
                string path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + "SSINFixLog.txt";
                var listing = _context.AppItems.IgnoreQueryFilters().Include(r => r.ListingItemFk)
                    //.ThenInclude(x => x.EntityFk)
                     //        .Include(r => r.ListingItemFk).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                        //     .Include(r => r.ListingItemFk).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                         //    .Include(r => r.ListingItemFk).ThenInclude(x => x.EntityFk)
                           //  .ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk).AsNoTracking()
                          //   .Include(r => r.ListingItemFk).ThenInclude(x => x.ParentFkList)//.AsNoTracking()
                         //    .Include(r => r.ListingItemFk).ThenInclude(r => r.ListingItemFk).ThenInclude(x => x.ParentFkList).ThenInclude(x => x.EntityFk)
                         //    .Include(r => r.ListingItemFk).ThenInclude(r => r.ListingItemFk).ThenInclude(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                         //    .Include(r => r.ListingItemFk).ThenInclude(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                    .Where(r => r.ItemType == 1
                   && !r.IsDeleted && r.ParentId==null ).ToList();
                // && r.ListingItemId == item.Id
                if (listing != null && listing.Count > 0)
                {
                    foreach (var item in listing)
                    {
                        string timeRun = DateTime.Now.ToLongTimeString();
                        using (StreamWriter writer = new StreamWriter(path, true))
                        {
                            writer.WriteLine(timeRun + ": " +  "  Item Code: " + item.Code);
                            writer.Close();
                        }

                        ShareItemData(item.ListingItemFk);

                    }
                }
               // else { recall = false; break; }
            }// while (recall);
        }
        public void UpdateItemList()//SydObject objectRec, List<onetouch.SycSegmentIdentifierDefinitions.SycSegmentIdentifierDefinition> sycSegmentIdentifierDefinitions)
        {
            
            var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            var objectRec = _context.SydObjects.AsNoTracking().FirstOrDefault(x => x.Code == "ITEM");
            List<onetouch.SycSegmentIdentifierDefinitions.SycSegmentIdentifierDefinition> sycSegmentIdentifierDefinitions = null;
            if (objectRec != null)
            {
                var ssinId = objectRec.SSINIdentifierId;
                if (ssinId != null)
                {
                    sycSegmentIdentifierDefinitions = _context.SycSegmentIdentifierDefinitions.IgnoreQueryFilters().Where(e => e.SycIdentifierDefinitionId == ssinId).OrderBy(x => x.SegmentNumber).ToList();
                }
            }
            string path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + "SSINFixLog.txt";
            //Product List Fixing
            try
            {
                _context.Database.CommitTransaction();
            }
            catch { }
            using (var trans = _context.Database.BeginTransaction())
            {
                // && (z.SSIN == null || z.SSIN == "") 
                _context.Database.UseTransaction(trans.GetDbTransaction());
                var productLists =  _context.AppItemsLists.IgnoreQueryFilters().Include(x => x.EntityFk).Include(z => z.AppItemsListDetails)
                    .Where(z => z.TenantId != null  && z.IsDeleted == false).ToList();
             
                if (productLists != null && productLists.Count() > 0)
                {
                    foreach (var list in productLists)
                    {
                        string timeRun = DateTime.Now.ToLongTimeString();
                        using (StreamWriter writer = new StreamWriter(path, true))
                        {
                            writer.WriteLine(timeRun + ": " + "  Item list Code: " + list.Code);
                            writer.Close();
                        }
                        list.TimeStamp = list.LastModificationTime == null ? DateTime.Parse(list.CreationTime.ToString()) : DateTime.Parse(list.LastModificationTime.ToString());
                        
                        if (string.IsNullOrEmpty(list.SSIN))
                        {
                          list.SSIN = GetSSIN(long.Parse(list.TenantId.ToString()), objectRec, sycSegmentIdentifierDefinitions);
                        }

                        list.EntityFk.SSIN = list.SSIN;
                        list.EntityFk.TenantOwner = int.Parse(list.TenantId.ToString());
                        foreach (var item in list.AppItemsListDetails)
                        {
                            var itemListObj =  _context.AppItems.IgnoreQueryFilters().AsNoTracking().FirstOrDefault(z => z.Code  == item.ItemCode && z.TenantId== list.TenantId && z.ItemType==0);
                            if (itemListObj != null)
                            {
                                if (itemListObj.ItemType == 0)
                                    item.ItemSSIN = itemListObj.SSIN;
                                else {
                                            var itemListObjOrg = _context.AppItems.IgnoreQueryFilters().AsNoTracking().FirstOrDefault(z => z.Id == itemListObj.ListingItemId);
                                            if (itemListObjOrg != null)
                                                item.ItemSSIN = itemListObjOrg.SSIN;
                                        }
                            }
                        }
                        _context.AppItemsLists.Update(list);
                        try
                        {
                            _context.SaveChanges();
                        }
                        catch { }
                        var sharedList =  _context.AppEntitiesRelationships.IgnoreQueryFilters().FirstOrDefault(z => z.EntityId == list.EntityId ||  z.RelatedEntityId == list.EntityId);
                        if (sharedList != null)
                             ShareItemListData(list);
                    }

                }
                trans.Commit();
            }
            //End
        }
        public void UpdateMFGCode()
        {
            string path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + "SSINFixLog.txt";
            var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            var marketplaceItems =  _context.AppMarketplaceItems.IgnoreQueryFilters().Where(x => (x.ManufacturerCode == null || x.ManufacturerCode == "")).ToList();
            if (marketplaceItems != null && marketplaceItems.Count() > 0)
            {
                foreach (var market in marketplaceItems)
                {
                    string timeRun = DateTime.Now.ToLongTimeString();
                    using (StreamWriter writer = new StreamWriter(path, true))
                    {
                        writer.WriteLine(timeRun + ": " + "  marketplace item Code: " + market.Code);
                        writer.Close();
                    }
                    var item =  _context.AppItems.IgnoreQueryFilters().FirstOrDefault(z => z.ItemType == 0 && z.SSIN == market.SSIN && z.TenantId == z.TenantOwner);
                    if (item != null)
                    {
                        market.ManufacturerCode = item.Code;
                        _context.AppMarketplaceItems.Update(market);
                    }
                }
                 _context.SaveChanges();
            }
        }
        public void RemoveListingFromAppItem()
        {
            string path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + "SSINFixLog.txt";
            var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            var listings = _context.AppItems.Include(x => x.EntityFk).Include(x=>x.ParentFkList).IgnoreQueryFilters().Where(r => r.ItemType != 0
                        && !r.IsDeleted).ToList();
            if (listings != null)
            {
                foreach (var listObj in listings)
                {
                    string timeRun = DateTime.Now.ToLongTimeString();
                    using (StreamWriter writer = new StreamWriter(path, true))
                    {
                        writer.WriteLine(timeRun + ": " + "  Remove item listing Code: " + listObj.Code);
                        writer.Close();
                    }
                    if (listObj.ParentFkList!=null && listObj.ParentFkList.Count()>0)
                    {
                        foreach (var ch in listObj.ParentFkList)
                        {
                            var varItemExist = _context.AppItems.IgnoreQueryFilters().Where(z=>z.EntityId== ch.EntityId && z.ItemType==0 && z.IsDeleted==false).FirstOrDefault();
                            if (varItemExist == null)
                            {
                                _context.AppEntityExtraData.IgnoreQueryFilters().Where(z => z.EntityId == ch.EntityId).ExecuteDelete();
                                _context.AppEntityCategories.IgnoreQueryFilters().Where(z => z.EntityId == ch.EntityId).ExecuteDelete();
                                _context.AppEntityClassifications.IgnoreQueryFilters().Where(z => z.EntityId == ch.EntityId).ExecuteDelete();
                                _context.AppEntityAttachments.IgnoreQueryFilters().Where(z => z.EntityId == ch.EntityId).ExecuteDelete();
                                // _context.AppEntities.DeleteByKey(ch.EntityFk);
                                //  _context.AppItems.IgnoreQueryFilters().Where(z => z.Id == ch.Id).ExecuteDelete();
                                if (ch.EntityFk != null)
                                {
                                    ch.EntityFk.IsDeleted = true;
                                    _context.Update<AppEntity>(ch.EntityFk);
                                }
                                //_context.AppItems.IgnoreQueryFilters().Where(z => z.Id == listObj.Id).ExecuteDelete();
                                ch.IsDeleted = true;
                                _context.Update<AppItem>(ch);
                            }
                        }
                    }
                    var itemExist = _context.AppItems.IgnoreQueryFilters().Where(z => z.EntityId == listObj.EntityId && z.ItemType == 0 && z.IsDeleted == false).FirstOrDefault();
                    if (itemExist == null)
                    {
                        _context.AppEntityExtraData.IgnoreQueryFilters().Where(z => z.EntityId == listObj.EntityId).ExecuteDelete();
                        _context.AppEntityCategories.IgnoreQueryFilters().Where(z => z.EntityId == listObj.EntityId).ExecuteDelete();
                        _context.AppEntityClassifications.IgnoreQueryFilters().Where(z => z.EntityId == listObj.EntityId).ExecuteDelete();
                        _context.AppEntityAttachments.IgnoreQueryFilters().Where(z => z.EntityId == listObj.EntityId).ExecuteDelete();
                        //_context.AppEntities.IgnoreQueryFilters().Where(z => z.Id == listObj.EntityId).ExecuteDelete(); 
                        // _context.AppEntities.DeleteByKey(listObj.EntityFk);
                        listObj.EntityFk.IsDeleted = true;
                        _context.Update<AppEntity>(listObj.EntityFk);
                        //_context.AppItems.IgnoreQueryFilters().Where(z => z.Id == listObj.Id).ExecuteDelete();
                        listObj.IsDeleted = true;
                        _context.Update<AppItem>(listObj);
                    }
                }
                _context.SaveChanges();
            }
        }
        public void ShareItemListData(AppItemsList itemsList)
        {
            var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            MapperConfigurationExpression exp = new MapperConfigurationExpression();
            /* exp.CreateMap<AppItem, AppMarketplaceItems.AppMarketplaceItems>().ForMember(a => a.Code, b => b.MapFrom(ent => ent.SSIN))
                 .ForMember(T-SII-20231024.0005-Wrong in the currency sign locationf:a => a.EntitiesRelationships, b => b.MapFrom(ent => ent.EntityFk.EntitiesRelationships))
                 .ForMember(a => a.EntityAttachments, b => b.MapFrom(ent => ent.EntityFk.EntityAttachments))
                 .ForMember(a => a.EntityCategories, b => b.MapFrom(ent => ent.EntityFk.EntityCategories))
                 .ForMember(a => a.EntityClassifications, b => b.MapFrom(ent => ent.EntityFk.EntityClassifications))
                 .ForMember(a => a.EntityExtraData, b => b.MapFrom(ent => ent.EntityFk.EntityExtraData))
                 .ForMember(a => a.EntityAddresses, b => b.MapFrom(ent => ent.EntityFk.EntityAddresses))
                 .ForMember(a => a.EntityObjectStatusCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusCode))
                 // .ForMember(a => a.EntityObjectStatusFk, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusFk))
                 .ForMember(a => a.EntityObjectStatusCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusCode))
                 .ForMember(a => a.EntityObjectStatusId, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusId))
                 .ForMember(a => a.EntityObjectTypeCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeCode))
                 //.ForMember(a => a.EntityObjectTypeFk, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeFk))
                 .ForMember(a => a.EntityObjectTypeId, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeId))
                 .ForMember(a => a.ItemPricesFkList, b => b.MapFrom(ent => ent.ItemPricesFkList))
                 .ForMember(a => a.ItemSizeScaleHeadersFkList, b => b.MapFrom(ent => ent.ItemSizeScaleHeadersFkList))
                 .ForMember(a => a.ItemPricesFkList, b => b.MapFrom(ent => ent.ItemPricesFkList))
                 .ForMember(a => a.ParentFkList, b => b.MapFrom(ent => (ent.ParentId == null & ent.ParentFk != null) ? ent.ParentFk : null));//.ReverseMap();*/
            exp.CreateMap<AppItemsList, onetouch.AppMarketplaceItemLists.AppMarketplaceItemLists>().ForMember(a => a.EntitiesRelationships, b => b.MapFrom(ent => ent.EntityFk.EntitiesRelationships))
                .ForMember(a => a.EntityAttachments, b => b.MapFrom(ent => ent.EntityFk.EntityAttachments))
                .ForMember(a => a.EntityCategories, b => b.MapFrom(ent => ent.EntityFk.EntityCategories))
                .ForMember(a => a.EntityClassifications, b => b.MapFrom(ent => ent.EntityFk.EntityClassifications))
                .ForMember(a => a.EntityExtraData, b => b.MapFrom(ent => ent.EntityFk.EntityExtraData))
                .ForMember(a => a.EntityAddresses, b => b.MapFrom(ent => ent.EntityFk.EntityAddresses))
                .ForMember(a => a.EntityObjectStatusCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusCode))
                .ForMember(a => a.EntityObjectStatusCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusCode))
                .ForMember(a => a.EntityObjectStatusId, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusId))
                .ForMember(a => a.EntityObjectTypeCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeCode))
                .ForMember(a => a.ObjectId, b => b.MapFrom(ent => ent.EntityFk.ObjectId))
                .ForMember(a => a.EntityObjectTypeId, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeId));
            exp.CreateMap<AppMarketplaceItems.AppMarketplaceItems, AppMarketplaceItemsListDetails>().ReverseMap();
            exp.CreateMap<AppItemsListDetail, AppMarketplaceItemsListDetails>().ReverseMap();
            exp.CreateMap<onetouch.AppItems.AppItem, onetouch.AppMarketplaceItems.AppMarketplaceItems>().ReverseMap();
            //exp.CreateMap<AppItemSizeScalesDetails, AppMarketplaceItemSizeScaleDetails>().ReverseMap();

            MapperConfiguration configuration = new MapperConfiguration(exp);

            configuration.CreateMapper();
            AutoMapper.Mapper mapper = new AutoMapper.Mapper(configuration);
            // public async Task ShareItemList(ShareItemListOptions input)
            {
                //  using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    //await SaveSharingOptions(input);

                    // var itemsList = await _appItemsListRepository.GetAll().Include(x => x.EntityFk).Include(x => x.AppItemsListDetails)
                    // .AsNoTracking().FirstOrDefaultAsync(x => x.Id == input.ItemListId);

                    //get entityRelation
                    AppEntitiesRelationship entitiesRelationship =  _context.AppEntitiesRelationships.IgnoreQueryFilters().AsNoTracking()
                        .FirstOrDefault(x => x.EntityId == itemsList.EntityId);

                    //get publishedItemsList
                    AppMarketplaceItemLists.AppMarketplaceItemLists publishItemsList = new AppMarketplaceItemLists.AppMarketplaceItemLists();
                    if (entitiesRelationship != null)
                        publishItemsList =  _context.AppMarketplaceItemLists.IgnoreQueryFilters().FirstOrDefault(x => x.Id == entitiesRelationship.RelatedEntityId);

                    if (publishItemsList == null || publishItemsList.Id == 0)
                    {
                        publishItemsList = mapper.Map<onetouch.AppMarketplaceItemLists.AppMarketplaceItemLists>(itemsList);
                        publishItemsList.Id = 0;
                        publishItemsList.TenantId = null;
                        //var itemObjectId = await _helper.SystemTables.GetObjectItemId();
                        publishItemsList.SSIN = itemsList.SSIN; // await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                        publishItemsList.Code = itemsList.SSIN;
                        publishItemsList.TenantOwner = int.Parse(itemsList.TenantId.ToString());
                    }
                    else
                    {
                        var publishEntityId = publishItemsList.Id;
                        mapper.Map(itemsList, publishItemsList);
                        publishItemsList.AppItemsListDetails = null;
                        publishItemsList.Id = publishEntityId;
                        publishItemsList.TenantId = null;
                        publishItemsList.TenantOwner = int.Parse(itemsList.TenantId.ToString());
                    }
                    publishItemsList.Code = itemsList.SSIN;
                    //if (!input.SyncProductList)
                    publishItemsList.SharingLevel = 1;

                    //if (publishItemsList.Id != 0)
                    //{

                    //    await _appMarketplaceItemSharing.DeleteAsync(x => x.AppMarketplaceItemListId == publishItemsList.Id);
                    //    await CurrentUnitOfWork.SaveChangesAsync();
                    //}
                    //if (!input.SyncProductList)
                    //{
                    //    publishItemsList.ItemSharingFkList = new List<AppMarketplaceItemSharings>();
                    //    foreach (var sharingDto in input.ItemSharing)
                    //    {
                    //        AppMarketplaceItemSharings sharing;
                    //        if (sharingDto.Id == 0)
                    //        {
                    //            sharing = ObjectMapper.Map<AppMarketplaceItemSharings>(sharingDto);
                    //        }
                    //        else
                    //        {
                    //            sharing = await _appMarketplaceItemSharing.FirstOrDefaultAsync((long)sharingDto.Id);
                    //            ObjectMapper.Map(sharingDto, sharing);
                    //        }
                    //        publishItemsList.ItemSharingFkList.Add(sharing);

                    //    }
                    //}

                    //var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                    //publishItemsList.EntityId = savedEntity;
                    if (publishItemsList.Id == 0)
                    {
                        publishItemsList.AppItemsListDetails = null;
                        _context.AppMarketplaceItemLists.Add(publishItemsList);
                         _context.SaveChanges();
                        if (entitiesRelationship == null)
                        {
                            entitiesRelationship = new AppEntitiesRelationship { EntityId = publishItemsList.Id, EntityTable = "AppItemsLists", RelatedEntityId = itemsList.EntityId, TenantId = null };
                            _context.AppEntitiesRelationships.Add(entitiesRelationship);
                        }
                         _context.SaveChanges();


                    }

                    //Delete removed child items
                    var publishedDetails =  _context.AppMarketplaceItemsListDetails.IgnoreQueryFilters().AsNoTracking().Where(x => x.AppMarketplaceItemsListId == publishItemsList.Id).ToList();
                    var existedIds = publishedDetails.Select(x => x.Id).ToArray();

                    var itemIds = itemsList.AppItemsListDetails.Select(x => x.ItemId).ToArray();

                    var toBeDeletedIds =  _context.AppMarketplaceItemsListDetails.IgnoreQueryFilters().Where(x => existedIds.Contains(x.Id) && (!itemIds.Contains((long)x.AppMarketplaceItemId))).Select(x => x.Id).ToArray();
                    foreach (var id in toBeDeletedIds)
                    {
                        var det =  _context.AppMarketplaceItemsListDetails.IgnoreQueryFilters().FirstOrDefault(z => z.Id == id);
                        _context.AppMarketplaceItemsListDetails.DeleteByKey(det);
                    }
                    //

                    //Save details
                    publishItemsList.AppItemsListDetails = new List<AppMarketplaceItemsListDetails>();
                    foreach (var child in itemsList.AppItemsListDetails)
                    {
                        AppMarketplaceItemsListDetails publishChild = new AppMarketplaceItemsListDetails();
                        //if (publishItemsList != null && publishItemsList.AppItemsListDetails != null)
                        publishChild = publishedDetails.FirstOrDefault(x => x.AppMarketplaceItemId == child.ItemId);

                        if (publishChild == null)
                        {
                            if (!string.IsNullOrEmpty(child.ItemSSIN))
                            {
                                var marketplaceItem = _context.AppMarketplaceItems.IgnoreQueryFilters().AsNoTracking().FirstOrDefault(x => x.Code == child.ItemSSIN);
                                if (marketplaceItem != null)
                                {
                                    publishChild = new AppMarketplaceItemsListDetails();
                                    mapper.Map(child, publishChild);
                                    publishChild.Id = 0;
                                    publishChild.AppMarketplaceItemsListId = publishItemsList.Id;
                                    if (marketplaceItem != null)
                                    {
                                        publishChild.AppMarketplaceItemSSIN = marketplaceItem.SSIN;
                                        publishChild.ItemCode = marketplaceItem.Code;
                                    }
                                    publishChild.ItemsListFK = null;
                                    publishChild.AppMarketplaceItemsListId = publishItemsList.Id;
                                    publishChild.AppMarketplaceItemId = marketplaceItem.Id;
                                    if (publishChild.Id == 0)
                                    {
                                        //publishItemsList.AppItemsListDetails.Add(publishChild);
                                        _context.ChangeTracker.Clear();
                                        _context.AppMarketplaceItemsListDetails.Add(publishChild);
                                         _context.SaveChanges();
                                    }
                                    else
                                    {
                                        _context.ChangeTracker.Clear();
                                        _context.AppMarketplaceItemsListDetails.Update(publishChild);
                                        _context.SaveChanges();
                                    }
                                }
                            }
                        }
                    }
                    // _context.AppMarketplaceItemLists.Update(publishItemsList);
                  //  try
                  //  {
                  //      _context.SaveChanges();
                 //   }
                  //  catch { }
                }


                //send notification to the users
                //await _appNotifier.SharedProduct(tenant);

            }
        }
        private void ShareItemData(AppItem appItemPara)
        {
            var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            try
            {
                _context.Database.CommitTransaction();
            }
            catch { }
            using (var trans = _context.Database.BeginTransaction())
            {
                _context.Database.UseTransaction(trans.GetDbTransaction());
                AppMarketplaceItems.AppMarketplaceItems marketplaceItem = null;
            marketplaceItem = _context.AppMarketplaceItems.Include(z=>z.EntityExtraData).Where(x => x.Code == appItemPara.SSIN).FirstOrDefault();//.Include(x => x.ParentFkList).ThenInclude(x => x.ItemPricesFkList)
                if (marketplaceItem != null) //&& marketplaceItem.EntityExtraData.Count != 0)
                {
                    trans.Commit();
                    return;
                }
            MapperConfigurationExpression exp = new MapperConfigurationExpression();
            exp.CreateMap<AppItem, AppMarketplaceItems.AppMarketplaceItems>().ForMember(a => a.Code, b => b.MapFrom(ent => ent.SSIN))
                .ForMember(a => a.EntitiesRelationships, b => b.MapFrom(ent => ent.EntityFk.EntitiesRelationships))
                .ForMember(a => a.EntityAttachments, b => b.MapFrom(ent => ent.EntityFk.EntityAttachments))
                .ForMember(a => a.EntityCategories, b => b.MapFrom(ent => ent.EntityFk.EntityCategories))
                .ForMember(a => a.EntityClassifications, b => b.MapFrom(ent => ent.EntityFk.EntityClassifications))
                .ForMember(a => a.EntityExtraData, b => b.MapFrom(ent => ent.EntityFk.EntityExtraData))
                .ForMember(a => a.EntityAddresses, b => b.MapFrom(ent => ent.EntityFk.EntityAddresses))
                .ForMember(a => a.EntityObjectStatusCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusCode))
                // .ForMember(a => a.EntityObjectStatusFk, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusFk))
                .ForMember(a => a.EntityObjectStatusCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusCode))
                .ForMember(a => a.EntityObjectStatusId, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusId))
                .ForMember(a => a.EntityObjectTypeCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeCode))
                //.ForMember(a => a.EntityObjectTypeFk, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeFk))
                .ForMember(a => a.EntityObjectTypeId, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeId))
                .ForMember(a => a.ItemPricesFkList, b => b.MapFrom(ent => ent.ItemPricesFkList))
                .ForMember(a => a.ItemSizeScaleHeadersFkList, b => b.MapFrom(ent => ent.ItemSizeScaleHeadersFkList))
                .ForMember(a => a.ItemPricesFkList, b => b.MapFrom(ent => ent.ItemPricesFkList))
                .ForMember(a => a.ParentFkList, b => b.MapFrom(ent => (ent.ParentId == null & ent.ParentFk != null) ? ent.ParentFk : null));//.ReverseMap();
            exp.CreateMap<AppItemSizeScalesHeader, AppMarketplaceItemSizeScaleHeaders>().ReverseMap();
            exp.CreateMap<AppItemPrices, AppMarketplaceItemPrices>().ReverseMap();
            exp.CreateMap<AppItemSizeScalesDetails, AppMarketplaceItemSizeScaleDetails>().ReverseMap();

            MapperConfiguration configuration = new MapperConfiguration(exp);

            configuration.CreateMapper();
            AutoMapper.Mapper mapper = new AutoMapper.Mapper(configuration);
            var objectListRec =  _context.SydObjects.AsNoTracking().FirstOrDefault(x => x.Code == "LISTING");
            AppMarketplaceItems.AppMarketplaceItems marketplaceItemObject = null;
            long publishedEntityId = 0;
            byte sharingLevel = 0;
            var appItem = _context.AppItems.IgnoreQueryFilters().Include(x => x.EntityFk)
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                              .Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                              .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                              .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk).AsNoTracking()
                    .Where(r => r.Id == appItemPara.Id && r.ItemType == 0
                  && !r.IsDeleted && r.ParentId == null).FirstOrDefault();
                if (appItem == null)
                {
                    trans.Commit();
                    return;
                }
            appItem.ParentFkList = _context.AppItems.IgnoreQueryFilters().Include(x => x.EntityFk)
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                                         .Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                                         .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                                         .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk).AsNoTracking()
                                         .Include(x => x.ParentFkList)//.AsNoTracking()
                                         .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk)
                                         .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                         .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                              .Where(r => r.ParentId == appItemPara.Id && r.ItemType == 0
                             && !r.IsDeleted).ToList();
           appItem.ItemSizeScaleHeadersFkList =  _context.AppItemSizeScalesHeaders.IgnoreQueryFilters()
                         .Include(a => a.AppItemSizeScalesDetails).AsNoTracking().Where(a => a.AppItemId == appItem.Id).ToList();

            appItem.ItemPricesFkList =  _context.AppItemPrices.IgnoreQueryFilters().AsNoTracking().Where(a => a.AppItemId == appItem.Id).ToList();

            var itemObjectId =  _context.SydObjects.AsNoTracking().FirstOrDefault(x => x.Code == "LISTING");
            List<AppMarketplaceItems.AppMarketplaceItems> children = new List<AppMarketplaceItems.AppMarketplaceItems>();
            //XX
           
           
            
            //.Include(a => a.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails)

            /*_context.AppMarketplaceItems.Include(x => x.ParentFkList).ThenInclude(x => x.ItemPricesFkList)
        .Include(a => a.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails)
        .Where(x => x.Code == appItem.SSIN).FirstOrDefault();*/
            
                
                if (marketplaceItem == null || marketplaceItem.Id == 0)
                {

                    marketplaceItem = mapper.Map<onetouch.AppMarketplaceItems.AppMarketplaceItems>(appItem);
                    marketplaceItem.Id = 0;
                    marketplaceItem.ObjectId = objectListRec.Id;
                    marketplaceItem.ManufacturerCode = appItem.Code;
                    //mmt
                    //XX
                    if (marketplaceItem.Variations != null)
                        //XX
                        marketplaceItem.Variations.Replace($"/{marketplaceItem.TenantId.ToString()}/", "/-1/");
                    marketplaceItem.TenantId = null;
                    marketplaceItem.SSIN = appItem.SSIN;  //await _helper.SystemTables.GenerateSSIN(itemObjectId, null);

                    // x.ChangeTracker.Clear();
                    marketplaceItem.TenantOwner = int.Parse(appItem.TenantId.ToString());
                    //Mmt
                    //XX
                    marketplaceItem.ItemPricesFkList = mapper.Map<List<AppMarketplaceItemPrices>>(appItem.ItemPricesFkList);

                    marketplaceItem.ItemPricesFkList.ForEach(a => a.Id = 0);
                    marketplaceItem.ItemPricesFkList.ForEach(a => a.AppMarketplaceItemId = marketplaceItem.Id);
                    //XX
                    //foreach (var pr in marketplaceItem.ItemPricesFkList)
                    //{
                    //    _context.AppMarketplaceItemPrices.Add(pr);
                    //}
                    //yy
                    if (marketplaceItem.ItemPricesFkList==null || marketplaceItem.ItemPricesFkList.Count==0)
                    {
                        var account = _context.AppContacts.IgnoreQueryFilters().Include(z=>z.EntityFk)
                            .Where(x => x.TenantId == appItem.TenantId && x.IsProfileData && x.ParentId == null && x.PartnerId == null).FirstOrDefault();
                        AppMarketplaceItemPrices pr = new AppMarketplaceItemPrices();
                        pr.AppMarketplaceItemId = marketplaceItem.Id;
                        pr.Id = 0;
                        pr.Price = marketplaceItem.Price;
                        pr.Code = "MSRP";
                        pr.IsDefault = true;
                        pr.CurrencyId = account!=null &&  account.CurrencyId !=null ? account.CurrencyId : 438;
                        pr.CurrencyCode = account != null && account.CurrencyCode  != null ? account.CurrencyCode : "USD";
                        marketplaceItem.ItemPricesFkList.Add(pr);
                    }
                    marketplaceItem.ItemSizeScaleHeadersFkList = new List<AppMarketplaceItemSizeScaleHeaders>(); //listingItem.ItemSizeScaleHeadersFkList;
                    var sizeScale = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId == null);
                    if (sizeScale != null)
                    {
                        AppMarketplaceItemSizeScaleHeaders sizeScaleMarketplace = mapper.Map<AppMarketplaceItemSizeScaleHeaders>(sizeScale);
                        sizeScaleMarketplace.Id = 0;
                        sizeScaleMarketplace.AppMarketplaceItemId = 0;

                        sizeScaleMarketplace.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);

                        sizeScaleMarketplace.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                        marketplaceItem.ItemSizeScaleHeadersFkList.Add(sizeScaleMarketplace);

                    }
                }
                else
                {
                    if (marketplaceItem != null && marketplaceItem.ParentFkList != null && marketplaceItem.ParentFkList.Count > 0)
                    {
                        foreach (var item in marketplaceItem.ParentFkList)
                        {
                            children.Add(item);
                        }
                    }
                    marketplaceItemObject =  _context.AppMarketplaceItems.IgnoreQueryFilters().Include(x => x.ParentFkList).Include(x => x.EntityCategories)
                        .Include(x => x.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails)
                .Include(x => x.EntityClassifications)
                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                //Mariam
                .Include(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                //Mariam
                .Include(x => x.ParentFkList).Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                        .Where(x => x.Code == appItem.SSIN).FirstOrDefault();
                    if (marketplaceItem != null && marketplaceItem.Id != 0 && marketplaceItemObject != null)
                    {

                        if (marketplaceItemObject.EntityExtraData != null)
                        {
                            foreach (var parentExtrData in marketplaceItemObject.EntityExtraData)
                            {
                                _context.AppEntityExtraData.DeleteByKey(parentExtrData);
                            }
                        }
                        if (marketplaceItemObject.EntityAttachments != null)
                        {
                            foreach (var parentAttach in marketplaceItemObject.EntityAttachments)
                            {
                                _context.AppAttachments.DeleteByKey(parentAttach.AttachmentFk);
                                _context.AppEntityAttachments.DeleteByKey(parentAttach);
                            }
                        }

                        if (marketplaceItemObject.EntityCategories != null)
                        {
                            foreach (var catg in marketplaceItemObject.EntityCategories)

                            {
                                _context.AppEntityCategories.DeleteByKey(catg);

                            }
                        }
                        if (marketplaceItemObject.EntityClassifications != null)
                        {
                            foreach (var clas in marketplaceItemObject.EntityClassifications)
                            {
                                _context.AppEntityClassifications.DeleteByKey(clas);
                            }
                        }

                         _context.SaveChanges();
                    }
                    publishedEntityId = marketplaceItem.Id;
                    sharingLevel = marketplaceItem.SharingLevel;
                    var ssin = marketplaceItem.SSIN;
                    var code = marketplaceItem.Code;
                    var pricesList =  _context.AppMarketplaceItemPrices.IgnoreQueryFilters().Where(x => x.AppMarketplaceItemId == marketplaceItem.Id).ToList();
                    if (pricesList != null && pricesList.Count() > 0)
                    {
                        foreach (var pr in pricesList)
                        {
                            _context.AppMarketplaceItemPrices.DeleteByKey(pr);
                        }
                    }
                    //SS
                    if (marketplaceItem.ItemSizeScaleHeadersFkList!= null && marketplaceItem.ItemSizeScaleHeadersFkList.Count > 0)
                    {
                        foreach (var sizeScale in marketplaceItem.ItemSizeScaleHeadersFkList.OrderBy(a => a.ParentId))
                        {

                            var scalesDetail =  _context.AppMarketplaceItemSizeScalesDetails.IgnoreQueryFilters().Where(a => a.SizeScaleId == sizeScale.Id).ToList();
                            if (scalesDetail != null && scalesDetail.Count() > 0)
                            {
                                foreach (var det in scalesDetail)
                                {
                                    _context.AppMarketplaceItemSizeScalesDetails.DeleteByKey(det);
                                }
                            }
                            _context.AppItemSizeScalesHeaders.DeleteByKey(sizeScale);
                        }
                    }
                    marketplaceItem.ItemSizeScaleHeadersFkList = null;
                     _context.SaveChanges();
                    //SS
                    mapper.Map(appItem, marketplaceItem);
                    marketplaceItem.ManufacturerCode = appItem.Code;
                    marketplaceItem.ItemSizeScaleHeadersFkList = null;
                    marketplaceItem.ParentFkList = null;
                    marketplaceItem.Code = code;
                    marketplaceItem.Name = appItem.Name;
                    marketplaceItem.SSIN = ssin;
                    marketplaceItem.TenantId = null;
                    marketplaceItem.Notes = appItem.EntityFk.Notes;
                    marketplaceItem.Id = publishedEntityId;
                    marketplaceItem.ItemPricesFkList = mapper.Map<List<AppMarketplaceItemPrices>>(appItem.ItemPricesFkList);
                    marketplaceItem.ItemPricesFkList.ForEach(a => a.Id = 0);
                    marketplaceItem.ItemPricesFkList.ForEach(a => a.AppMarketplaceItemId = marketplaceItem.Id);
                    marketplaceItem.ItemPricesFkList.ForEach(a => a.AppItemFk = null);
                    //foreach (var pr in marketplaceItem.ItemPricesFkList)
                    //{
                    //    _context.AppMarketplaceItemPrices.Add(pr);
                    //}

                }


            marketplaceItem.SharingLevel = 1;
            marketplaceItem.EntityExtraData = null;
            if (marketplaceItem.EntityExtraData != null)
            {
                foreach (var parentExtrData in marketplaceItem.EntityExtraData)
                {
                    parentExtrData.Id = 0;
                    parentExtrData.EntityCode = marketplaceItem.Code;
                    parentExtrData.EntityId = 0;
                    parentExtrData.EntityFk = null;
                }
            }
            marketplaceItem.EntityAttachments = null;
            //if (marketplaceItem.EntityAttachments != null)
            //{
            //    foreach (var parentAttach in marketplaceItem.EntityAttachments)
            //    {
            //        parentAttach.Id = 0;

            //                    var attch = new Attachments.AppAttachment() { TenantId = null,
            //                        Attachment = parentAttach.AttachmentFk.Attachment ,
            //                        Code = parentAttach.AttachmentFk.Code , Id=0 ,
            //                        Attributes= parentAttach.AttachmentFk.Attributes
            //                    };

            //                    _context.AppAttachments.Add(attch);
            //                    _context.SaveChanges();
            //                    parentAttach.AttachmentFk = attch;//.Id = null;
            //                    parentAttach.EntityId = 0;
            //                    parentAttach.AttachmentId = attch.Id;
            //                    parentAttach.EntityFk = null;
            //        //parentAttach.AttachmentFk.TenantId = null;
            //        MoveFileToMarketplace(parentAttach.AttachmentFk.Attachment, appItem.TenantId, -1);
            //    }
            //}
            //if (marketplaceItem.EntityAddresses != null)
            //{
            //    foreach (var address in marketplaceItem.EntityAddresses)
            //    {
            //        address.Id = 0;
            //    }
            //}
            //if (marketplaceItem.EntityCategories != null)
            //{
            //    foreach (var catg in marketplaceItem.EntityCategories)
            //    {
            //        catg.Id = 0;
            //        catg.EntityCode = marketplaceItem.Code;
            //                    catg.EntityId = 0;
            //                    catg.EntityFk=null;
            //    }
            //}
            marketplaceItem.EntityClassifications = null;
            marketplaceItem.EntityCategories = null;
                //if (marketplaceItem.EntityClassifications != null)
                //{
                //    foreach (var clas in marketplaceItem.EntityClassifications)
                //    {
                //        clas.EntityCode = marketplaceItem.Code;
                //        clas.Id = 0;
                //                    clas.EntityFk = null;
                //                    clas.EntityId = 0;
                //                }
                //}
                //if (marketplaceItem.EntitiesRelationships != null)
                //{
                //    foreach (var rela in marketplaceItem.EntitiesRelationships)
                //    {
                //        rela.Id = 0;
                //    }
                //}


                //if (marketplaceItem != null && publishedEntityId != 0)
                //{
                //    marketplaceItem.Id = publishedEntityId;
                //                _context.AppMarketplaceItemSharing.Where()
                //    await _appMarketplaceItemSharing.DeleteAsync(x => x.AppMarketplaceItemId == publishedEntityId);
                //    await CurrentUnitOfWork.SaveChangesAsync();
                //}
                //if (!input.SyncProduct)
                //{
                //    marketplaceItem.ItemSharingFkList = new List<AppMarketplaceItemSharings>();
                //    foreach (var sharingDto in input.ItemSharing)
                //    {
                //        AppMarketplaceItemSharings sharing;
                //        if (sharingDto.Id == 0)
                //        {
                //            sharing = ObjectMapper.Map<AppMarketplaceItemSharings>(sharingDto);
                //        }
                //        else
                //        {
                //            sharing = await _appMarketplaceItemSharing.FirstOrDefaultAsync((long)sharingDto.Id);
                //            ObjectMapper.Map(sharingDto, sharing);
                //        }
                //        marketplaceItem.ItemSharingFkList.Add(sharing);
                //        //sharing.AppMarketplaceItemId = input.AppItemId;
                //        //await _appMarketplaceItemSharing.InsertAsync(sharing);
                //        //updated = true;
                //    }
                //}
                //var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                //publishItem.EntityId = savedEntity;
                if (marketplaceItem.Id == 0)
                {
                    //marketplaceItem.ItemSizeScaleHeadersFkList = null;
                    //var entityObjType = await _sycEntityObjectTypeRepository.GetAll().AsNoTracking().Where(z => z.Id == marketplaceItem.EntityObjectTypeId)
                    //       .AsNoTracking().FirstOrDefaultAsync();
                    //// x.SycEntityObjectTypes.Attach(entityObjType);
                    //x.Entry<SycEntityObjectType>(entityObjType).State = EntityState.Unchanged;
                    //x.ChangeTracker.Clear();
                    _context.ChangeTracker.Clear();
                    _context.AppMarketplaceItems.Add(marketplaceItem);

                    _context.SaveChanges();

                    //xx
                    if (appItem.EntityFk.EntityExtraData != null)
                    {
                        marketplaceItem.EntityExtraData = new List<AppEntityExtraData>();
                        foreach (var chEx in appItem.EntityFk.EntityExtraData)
                        {
                            chEx.Id = 0;
                            chEx.EntityCode = marketplaceItem.Code;
                            chEx.EntityId = marketplaceItem.Id;
                            chEx.EntityFk = null;
                            marketplaceItem.EntityExtraData.Add(chEx);
                        }
                        _context.AppEntityExtraData.AddRange(marketplaceItem.EntityExtraData);
                    }
                    if (appItem.EntityFk.EntityAttachments != null)
                    {
                        marketplaceItem.EntityAttachments = new List<AppEntityAttachment>();
                        foreach (var parentAttach in appItem.EntityFk.EntityAttachments)
                        {
                            parentAttach.Id = 0;

                            var attch = new Attachments.AppAttachment()
                            {
                                TenantId = null,
                                Attachment = parentAttach.AttachmentFk.Attachment,
                                Code = parentAttach.AttachmentFk.Code,
                                Id = 0,
                                Name = parentAttach.AttachmentFk.Name,
                                Attributes = parentAttach.AttachmentFk.Attributes
                            };
                            _context.AppAttachments.Add(attch);
                            //_context.AppAttachments.Add(attch);
                            // _context.SaveChanges();
                            parentAttach.AttachmentFk = attch;//.Id = null;
                            parentAttach.EntityId = marketplaceItem.Id;
                            parentAttach.AttachmentId = attch.Id;
                            parentAttach.EntityFk = null;
                            //parentAttach.AttachmentFk.TenantId = null;
                            MoveFileToMarketplace(parentAttach.AttachmentFk.Attachment, appItem.TenantId, -1);

                            marketplaceItem.EntityAttachments.Add(parentAttach);
                        }
                        _context.AppEntityAttachments.AddRange(marketplaceItem.EntityAttachments);
                    }
                    //if (marketplaceItem.EntityAddresses != null)
                    //{
                    //    foreach (var address in marketplaceItem.EntityAddresses)
                    //    {
                    //        address.Id = 0;
                    //    }
                    //}
                    if (appItem.EntityFk.EntityCategories != null)
                    {
                        marketplaceItem.EntityCategories = new List<AppEntityCategory>();
                        foreach (var catg in appItem.EntityFk.EntityCategories)
                        {
                            catg.Id = 0;
                            catg.EntityFk = null;
                            catg.EntityCode = marketplaceItem.Code;
                            catg.EntityId = marketplaceItem.Id;
                            marketplaceItem.EntityCategories.Add(catg);
                        }
                        _context.AppEntityCategories.AddRange(marketplaceItem.EntityCategories);
                    }

                    if (appItem.EntityFk.EntityClassifications != null)
                    {
                        marketplaceItem.EntityClassifications = new List<AppEntityClassification>();
                        foreach (var clas in appItem.EntityFk.EntityClassifications)
                        {
                            //clas.EntityCode = marketplaceItem.Code;
                            clas.Id = 0;
                            clas.EntityFk = null;
                            clas.EntityCode = marketplaceItem.Code;
                            clas.EntityId = marketplaceItem.Id;
                            marketplaceItem.EntityClassifications.Add(clas);
                        }
                        _context.AppEntityClassifications.AddRange(marketplaceItem.EntityClassifications);
                    }
                    

                    //xx
                    // return;
                    //yy
                    if (appItem.ItemSizeScaleHeadersFkList.Count > 0)
                    {
                        marketplaceItem.ItemSizeScaleHeadersFkList = null;
                        //if (marketplaceItem.ItemSizeScaleHeadersFkList.Count > 0)
                        {
                            var itemSizeScale = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId == null);
                            var marketplaceScale = mapper.Map<AppMarketplaceItemSizeScaleHeaders>(itemSizeScale);
                            marketplaceScale.Id = 0;
                            marketplaceScale.AppMarketplaceItemId = marketplaceItem.Id;
                            marketplaceScale.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                            marketplaceItem.ItemSizeScaleHeadersFkList = new List<AppMarketplaceItemSizeScaleHeaders>();
                            marketplaceItem.ItemSizeScaleHeadersFkList.Add(marketplaceScale);
                            _context.AppMarketplaceItems.Update(marketplaceItem);
                             _context.SaveChanges();
                            if (itemSizeScale != null)
                            {
                                var ItemsizeRatio = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId != null);
                                if (ItemsizeRatio != null)
                                {
                                    var sizeRatio = mapper.Map<AppMarketplaceItemSizeScaleHeaders>(ItemsizeRatio);
                                    sizeRatio.Id = 0;
                                    sizeRatio.ParentId = marketplaceScale.Id;
                                    sizeRatio.AppMarketplaceItemId = marketplaceItem.Id;
                                    //sizeRatio.TenantId = null;
                                    sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                    //sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                                    sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                                    marketplaceItem.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                                }
                            }
                        }
                    }
                    _context.AppMarketplaceItems.Update(marketplaceItem);
                     _context.SaveChanges();
                    //yy
                }
                else
                {

                    if (appItem.EntityFk.EntityExtraData != null)
                    {
                        marketplaceItem.EntityExtraData = new List<AppEntityExtraData>();
                        foreach (var chEx in appItem.EntityFk.EntityExtraData)
                        {
                            chEx.Id = 0;
                            chEx.EntityCode = marketplaceItem.Code;
                            chEx.EntityId = marketplaceItem.Id;
                            chEx.EntityFk = marketplaceItem;
                            marketplaceItem.EntityExtraData.Add(chEx);
                        }
                        _context.AppEntityExtraData.AddRange(marketplaceItem.EntityExtraData);
                    }
                    if (appItem.EntityFk.EntityAttachments != null)
                    {
                        marketplaceItem.EntityAttachments = new List<AppEntityAttachment>();
                        foreach (var parentAttach in appItem.EntityFk.EntityAttachments)
                        {
                            parentAttach.Id = 0;

                            var attch = new Attachments.AppAttachment()
                            {
                                TenantId = null,
                                Attachment = parentAttach.AttachmentFk.Attachment,
                                Code = parentAttach.AttachmentFk.Code,
                                Id = 0,
                                Name = parentAttach.AttachmentFk.Name,
                                Attributes = parentAttach.AttachmentFk.Attributes
                            };
                            _context.AppAttachments.Add(attch);
                            //_context.AppAttachments.Add(attch);
                            // _context.SaveChanges();
                            parentAttach.AttachmentFk = attch;//.Id = null;
                            parentAttach.EntityId = marketplaceItem.Id;
                            parentAttach.AttachmentId = attch.Id;
                            parentAttach.EntityFk = marketplaceItem;
                            //parentAttach.AttachmentFk.TenantId = null;
                            MoveFileToMarketplace(parentAttach.AttachmentFk.Attachment, appItem.TenantId, -1);

                            marketplaceItem.EntityAttachments.Add(parentAttach);
                        }
                        _context.AppEntityAttachments.AddRange(marketplaceItem.EntityAttachments);
                    }
                  
                    if (appItem.EntityFk.EntityCategories != null)
                    {
                        marketplaceItem.EntityCategories = new List<AppEntityCategory>();
                        foreach (var catg in appItem.EntityFk.EntityCategories)
                        {
                            catg.Id = 0;
                            catg.EntityFk = marketplaceItem;
                            catg.EntityCode = marketplaceItem.Code;
                            catg.EntityId = marketplaceItem.Id;
                            marketplaceItem.EntityCategories.Add(catg);
                        }
                        _context.AppEntityCategories.AddRange(marketplaceItem.EntityCategories);
                    }

                    if (appItem.EntityFk.EntityClassifications != null)
                    {
                        marketplaceItem.EntityClassifications = new List<AppEntityClassification>();
                        foreach (var clas in appItem.EntityFk.EntityClassifications)
                        {
                            //clas.EntityCode = marketplaceItem.Code;
                            clas.Id = 0;
                            clas.EntityFk = marketplaceItem;
                            clas.EntityCode = marketplaceItem.Code;
                            clas.EntityId = marketplaceItem.Id;
                            marketplaceItem.EntityClassifications.Add(clas);
                        }
                        _context.AppEntityClassifications.AddRange(marketplaceItem.EntityClassifications);
                    }

                    _context.AppMarketplaceItems.Update(marketplaceItem);
                     _context.SaveChanges();
                    // x.ChangeTracker.Clear();
                    //if (appItem.EntityFk.EntityExtraData != null)
                    //{
                    //    marketplaceItem.EntityExtraData = new List<AppEntityExtraData>();
                    //    foreach (var chEx in appItem.EntityFk.EntityExtraData)
                    //    {
                    //        chEx.Id = 0;
                    //        chEx.EntityCode = marketplaceItem.Code;
                    //        chEx.EntityId = marketplaceItem.Id;
                    //        marketplaceItem.EntityExtraData.Add(chEx);
                    //    }
                    //    _context.AppMarketplaceItems.Update(marketplaceItem);
                    //     _context.SaveChanges();
                    //}
                    if (appItem.ItemSizeScaleHeadersFkList.Count > 1)
                    {

                        if (appItem.ItemSizeScaleHeadersFkList.Count > 0)
                        {
                            marketplaceItem.ItemSizeScaleHeadersFkList = null;
                            //if (marketplaceItem.ItemSizeScaleHeadersFkList.Count > 0)
                            {
                                var itemSizeScale = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId == null);
                                var marketplaceScale = mapper.Map<AppMarketplaceItemSizeScaleHeaders>(itemSizeScale);
                                marketplaceScale.Id = 0;
                                marketplaceScale.AppMarketplaceItemId = marketplaceItem.Id;
                                marketplaceScale.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                marketplaceItem.ItemSizeScaleHeadersFkList = new List<AppMarketplaceItemSizeScaleHeaders>();
                                marketplaceItem.ItemSizeScaleHeadersFkList.Add(marketplaceScale);
                                _context.AppMarketplaceItems.Update(marketplaceItem);
                                 _context.SaveChanges();
                                if (itemSizeScale != null)
                                {
                                    var ItemsizeRatio = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId != null);
                                    if (ItemsizeRatio != null)
                                    {
                                        var sizeRatio = mapper.Map<AppMarketplaceItemSizeScaleHeaders>(ItemsizeRatio);
                                        sizeRatio.Id = 0;
                                        sizeRatio.ParentId = marketplaceScale.Id;
                                        sizeRatio.AppMarketplaceItemId = marketplaceItem.Id;
                                        //sizeRatio.TenantId = null;
                                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                        //sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                                        marketplaceItem.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                                    }
                                }
                            }
                        }
                        _context.AppMarketplaceItems.Update(marketplaceItem);
                        _context.SaveChanges();
                    }
                    //List<AppMarketplaceItem> modifyList = new List<AppMarketplaceItem>();
                    //modifyList.Add(marketplaceItem);
                    //x.AppMarketplaceItems.UpdateRange(modifyList);
                    //await x.SaveChangesAsync();
                   
                }
            

            //Delete removed child items
            //if (marketplaceItem != null && publishedEntityId != 0 && children != null && children.Count > 0)  //&& marketplaceItem.ParentFkList != null
            //{

            //    var itemIds = appItem.ParentFkList.Select(x => x.SSIN).ToArray();

            //    var existedIds = children.Select(z => z.Code).ToArray();
            //    //var existedIds = await _appMarketplaceItem.GetAll().Where(z => z.ParentId == publishedEntityId && z.TenantId == null).ToListAsync();
            //    //.Select(x => x.Code).ToListAsync();
            //    //  }
            //    var toBeDeletedIds = _context.AppMarketplaceItems.Where(x => existedIds.Contains(x.Code) && !itemIds.Contains(x.Code)).Select(x => x.Id).ToArray();
            //    var toBeEntitiesDeletedIds = _appItemRepository.GetAll().Where(x => toBeDeletedIds.Contains(x.Id)).Select(x => x.EntityId).ToArray();

            //    await _appMarketplaceItem.DeleteAsync(x => toBeDeletedIds.Contains(x.Id));
            //    //await _appEntityRepository.DeleteAsync(x => toBeEntitiesDeletedIds.Contains(x.Id));
            //    //XX

            //    await _appMarketplaceItemPricesRepository.DeleteAsync(x => toBeDeletedIds.Contains(x.AppMarketplaceItemId));

            //    await x.SaveChangesAsync();
            //    //XX
            //}

            //Save child items
            ////List<long> entities = new List<long>();
            ////var entityObj = appItem.ParentFkList.Select(x => x.EntityFk.EntityExtraData.Where(z => z.EntityObjectTypeId != null).Select(z=>z.EntityObjectTypeId).ToList()).Distinct().ToList();
            ////if (entityObj != null)
            ////{
            ////    foreach (var ent in entityObj)
            ////    {
            ////        foreach (var en in ent)
            ////        {
            ////            //if (entities.FirstOrDefault(a => a == en) == null)
            ////            {
            ////                entities.AddIfNotContains<long>(long.Parse(en.ToString()));
            ////            }
            ////        }
            ////       // var xx = ent.
            ////    }
            ////}
            ////foreach (var xx in entities)
            ////{
            ////    var entityObjType = await _sycEntityObjectTypeRepository.GetAll().AsNoTracking().Where(z => z.Id == xx)
            ////                                             .AsNoTracking().FirstOrDefaultAsync();
            ////    if (entityObjType != null)
            ////    {
            ////       // x.ChangeTracker.Clear();
            ////        // x.SycEntityObjectTypes.Attach(entityObjType);
            ////        // x.Entry<SycEntityObjectType>(entityObjType)
            ////        x.SycEntityObjectTypes.Attach(entityObjType);
            ////        x.Entry<SycEntityObjectType>(entityObjType).State = EntityState.Unchanged;

            //    }
            //}
            foreach (var child in appItem.ParentFkList)
            {

                child.ItemPricesFkList =  _context.AppItemPrices.AsNoTracking().Where(a => a.AppItemId == child.Id).ToList();
                AppMarketplaceItems.AppMarketplaceItems publishChild = new AppMarketplaceItems.AppMarketplaceItems(); 
               // if (publishedEntityId != 0)
                    publishChild =  _context.AppMarketplaceItems.Include(x => x.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                        .Include(z => z.EntityExtraData)
                        .Where(x => x.Code == child.SSIN).FirstOrDefault();

                long publishId = 0;
                if (publishChild == null)
                    publishChild = new AppMarketplaceItems.AppMarketplaceItems();
                else
                {
                    publishId = publishChild.Id;

                }

                string newSSIN = "";
                    if (publishId == 0)
                    {

                        newSSIN = child.SSIN;
                    }
                    else
                    {
                        newSSIN = publishChild.SSIN;
                    }
                //    //SS
                //    if (publishChild.EntityExtraData != null)
                //    {
                //        foreach (var parentExtrData in publishChild.EntityExtraData)
                //        {
                //             _context.AppEntityExtraData.DeleteByKey(parentExtrData);
                //        }
                //    }
                //    if (publishChild.EntityAttachments != null)
                //    {
                //        foreach (var parentAttach in publishChild.EntityAttachments)
                //        {
                //            await _appAttachmentRepository.DeleteAsync(parentAttach.AttachmentFk);
                //            await _appEntityAttachmentRepository.DeleteAsync(parentAttach);
                //        }
                //    }
                //    await x.SaveChangesAsync();
                //    //SS
                //}
                mapper.Map(child, publishChild);
                publishChild.ManufacturerCode = child.Code;
                if (publishChild.EntityExtraData != null)
                {
                    publishChild.EntityExtraData = null;
                    if (publishChild.EntityExtraData != null)
                    {
                        foreach (var extrData in publishChild.EntityExtraData)
                        {
                            extrData.Id = 0;

                            extrData.EntityId = 0;
                            //T-SII-20230818.0003,1 MMT 08/23/2023 Display the Product Solid color or image in the Marketplace product detail page[Start]
                            if (extrData.AttributeId == 202 && !string.IsNullOrEmpty(extrData.AttributeValue))
                                MoveFileToMarketplace(extrData.AttributeValue, appItem.TenantId, -1);
                            //T-SII-20230818.0003,1 MMT 08/23/2023 Display the Product Solid color or image in the Marketplace product detail page[End]
                            //if (extrData.EntityObjectTypeId != null && extrData.EntityObjectTypeId != 0)
                            //{

                            //    var entityObjTypeEx = await _sycEntityObjectTypeRepository.GetAll().AsNoTracking().Where(z => z.Id == extrData.EntityObjectTypeId)
                            //    .AsNoTracking().FirstOrDefaultAsync();
                            //    x.SycEntityObjectTypes.Attach(entityObjTypeEx);
                            //    x.Entry<SycEntityObjectType>(entityObjTypeEx).State = EntityState.Unchanged;
                            //   x.ChangeTracker.Clear();
                            //    await x.SaveChangesAsync();

                            //}
                        }
                    }
                }
                //if (publishChild.EntityAttachments != null)
                //{
                //    foreach (var parentAttach in publishChild.EntityAttachments)
                //    {
                //        parentAttach.Id = 0;
                //        parentAttach.AttachmentId = 0;
                //        parentAttach.AttachmentFk.Id = 0;
                //        parentAttach.AttachmentFk.TenantId = null;
                //        MoveFileToMarketplace(parentAttach.AttachmentFk.Attachment, appItem.TenantId, -1);
                //    }
                //}
                publishChild.EntityAttachments = null;
                if (publishChild.EntityAddresses != null)
                {
                    foreach (var address in publishChild.EntityAddresses)
                    {
                        address.Id = 0;
                    }
                }
                if (publishChild.EntityCategories != null)
                {
                    foreach (var catg in publishChild.EntityCategories)
                    {
                        catg.Id = 0;
                    }
                }
                if (publishChild.EntityClassifications != null)
                {
                    foreach (var clas in publishChild.EntityClassifications)
                    {
                        clas.Id = 0;
                    }
                }
                if (publishChild.EntitiesRelationships != null)
                {
                    foreach (var rela in publishChild.EntitiesRelationships)
                    {
                        rela.Id = 0;
                    }
                }
                //Mariam
                //AppItem newitemChild = new AppItem();


                publishChild.Id = publishId;
                publishChild.ObjectId = objectListRec.Id;
                publishChild.ParentId = marketplaceItem.Id;
                publishChild.Notes = child.EntityFk.Notes;
                publishChild.Name = child.Name;
                //publishChild.ParentEntityId = publishItem.EntityId;
                //if (!input.SyncProduct)
                publishChild.SharingLevel = 1;

                //publishChild.ListingItemId = null;
                //publishChild.PublishedListingItemId = child.Id;
                // publishChild.ItemType = 2;
                publishChild.TenantId = null;
                publishChild.SSIN = newSSIN; // await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                publishChild.Code = newSSIN;
                publishChild.TenantOwner = int.Parse(child.TenantId.ToString());
                //publishChild.Id = 0;
                //xxx
                publishChild.ItemPricesFkList = mapper.Map<List<AppMarketplaceItemPrices>>(child.ItemPricesFkList);
                //publishChild.ItemPricesFkList.ForEach(a => a.TenantId = null);
                publishChild.ItemPricesFkList.ForEach(a => a.Id = 0);
                publishChild.ItemPricesFkList.ForEach(a => a.AppMarketplaceItemId = publishChild.Id);
                    //foreach (var pr in publishChild.ItemPricesFkList)
                    //{
                    //    _context.AppMarketplaceItemPrices.Add(pr);
                    //}
                    publishChild.ParentFk = null;

                    //var savedEntityChild = await _appEntitiesAppService.SaveEntity(entityChildDto);
                    // publishChild.EntityId = savedEntityChild;

                    if (publishChild.Id == 0)
                    {

                        _context.AppMarketplaceItems.Add(publishChild);
                        _context.SaveChanges();
                        if (child.EntityFk.EntityAttachments != null)
                        {
                            publishChild.EntityAttachments = new List<AppEntityAttachment>();
                            foreach (var parentAttach in child.EntityFk.EntityAttachments)
                            {
                                var attch = new Attachments.AppAttachment()
                                {
                                    TenantId = null,
                                    Attachment = parentAttach.AttachmentFk.Attachment,
                                    Code = parentAttach.AttachmentFk.Code,
                                    Id = 0,
                                    Name = parentAttach.AttachmentFk.Name,
                                    Attributes = parentAttach.AttachmentFk.Attributes
                                };
                                _context.AppAttachments.Add(attch);
                                parentAttach.Id = 0;
                                parentAttach.AttachmentId = 0;
                                parentAttach.AttachmentFk = attch;
                                parentAttach.EntityFk = publishChild;
                                parentAttach.EntityId = publishChild.Id;
                                //parentAttach.AttachmentFk.TenantId = null;
                                MoveFileToMarketplace(parentAttach.AttachmentFk.Attachment, appItem.TenantId, -1);
                                publishChild.EntityAttachments.Add(parentAttach);
                            }
                            _context.AppEntityAttachments.AddRange(publishChild.EntityAttachments);
                        }
                        if (child.EntityFk.EntityExtraData != null)
                        {
                            publishChild.EntityExtraData = new List<AppEntityExtraData>();
                            //x.ChangeTracker.Clear();
                            foreach (var chEx in child.EntityFk.EntityExtraData.OrderBy(z=>z.EntityObjectTypeCode))
                            {
                                chEx.Id = 0;
                                chEx.EntityFk = null;
                                chEx.EntityCode = publishChild.Code;
                                chEx.EntityId = publishChild.Id;
                                chEx.EntityObjectTypeFk = null;
                                publishChild.EntityExtraData.Add(chEx);


                            }
                            _context.AppEntityExtraData.AddRange(publishChild.EntityExtraData);
                            //   _context.AppEntities.Update(publishChild);
                            //_context.Update<AppEntity>(publishChild);
                            //x.ChangeTracker.Clear();
                            //publishChild = await _appMarketplaceItem.InsertAsync(publishChild);
                            //await x.SaveChangesAsync();
                            // x.ChangeTracker.Clear();

                            // x.ChangeTracker.Clear();
                        }
                        _context.AppMarketplaceItems.Update(publishChild);
                        _context.SaveChanges();
                    }
                    else
                    {
                        if (child.EntityFk.EntityAttachments != null)
                        {
                            publishChild.EntityAttachments = new List<AppEntityAttachment>();
                            foreach (var parentAttach in child.EntityFk.EntityAttachments)
                            {
                                var attch = new Attachments.AppAttachment()
                                {
                                    TenantId = null,
                                    Attachment = parentAttach.AttachmentFk.Attachment,
                                    Code = parentAttach.AttachmentFk.Code,
                                    Id = 0,
                                    Name = parentAttach.AttachmentFk.Name,
                                    Attributes = parentAttach.AttachmentFk.Attributes
                                };
                                _context.AppAttachments.Add(attch);
                                parentAttach.Id = 0;
                                parentAttach.AttachmentId = 0;
                                parentAttach.AttachmentFk = attch;
                                parentAttach.EntityFk = publishChild;
                                //parentAttach.AttachmentFk.TenantId = null;
                                MoveFileToMarketplace(parentAttach.AttachmentFk.Attachment, appItem.TenantId, -1);
                                publishChild.EntityAttachments.Add(parentAttach);
                            }
                            _context.AppEntityAttachments.AddRange(publishChild.EntityAttachments);
                        }
                        if (child.EntityFk.EntityExtraData != null)
                        {
                            publishChild.EntityExtraData = new List<AppEntityExtraData>();
                            //x.ChangeTracker.Clear();
                            foreach (var chEx in child.EntityFk.EntityExtraData)
                            {
                                chEx.Id = 0;
                                chEx.EntityFk = publishChild;
                                chEx.EntityCode = publishChild.Code;
                                chEx.EntityId = publishChild.Id;
                                chEx.EntityObjectTypeFk = null;
                                publishChild.EntityExtraData.Add(chEx);


                            }
                            _context.AppEntityExtraData.AddRange(publishChild.EntityExtraData);
                            
                        }
                        _context.AppMarketplaceItems.Update(publishChild);
                        _context.SaveChanges();
                    }

               

            }

                trans.Commit();
                //try
                //{
                //    // _context.Database.CommitTransaction();
                //    var tr = _context.Database.BeginTransaction();
                //    _context.Database.UseTransaction(tr.GetDbTransaction());
                //}
                //catch { }
            }

        }


        private string GetSSIN(long TenantId, SydObject objectRec, List<onetouch.SycSegmentIdentifierDefinitions.SycSegmentIdentifierDefinition> sycSegmentIdentifierDefinitions)
        {
            var _context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            // List<onetouch.SycSegmentIdentifierDefinitions.SycSegmentIdentifierDefinition> sycSegmentIdentifierDefinitions = null;
            string returnString = "";
            long? ssinId = null;
            // var objectRec  =  _context.SydObjects.AsNoTracking().FirstOrDefault(x => x.Code == "ITEM");
            if (objectRec != null)
            {
                ssinId = objectRec.SSINIdentifierId;
                //    if (ssinId != null)
                //    {
                //        sycSegmentIdentifierDefinitions =await _context.SycSegmentIdentifierDefinitions.IgnoreQueryFilters().Where(e => e.SycIdentifierDefinitionId == ssinId).OrderBy(x => x.SegmentNumber).ToListAsync();
                //    }
            }
            _context.ChangeTracker.AutoDetectChangesEnabled = false;
            // long? tenantId = null;
            //for (int a = 0; a < appItems.Count; a++)
            //   foreach (var item in appItems)
            {
                //  returnString = "";
                //  var item = appItems[a];
                //XX
                // using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
             //   using (var scope = new TransactionScope(TransactionScopeOption.Required,
   //new TransactionOptions { IsolationLevel = (System.Transactions.IsolationLevel)System.Data.IsolationLevel.ReadCommitted }))
                {

                    //var itemEntityObjectType = _context.SycEntityObjectTypes.FirstOrDefault(a => a.Code == "ITEM");

                    // if (objectRec != null)
                    {
                        // var ssinId = objectRec.SSINIdentifierId;
                        if (ssinId != null)
                        {
                            // var sycSegmentIdentifierDefinitions = _context.SycSegmentIdentifierDefinitions.IgnoreQueryFilters().Where(e => e.SycIdentifierDefinitionId == ssinId).OrderBy(x => x.SegmentNumber).ToList();
                            if (sycSegmentIdentifierDefinitions != null && sycSegmentIdentifierDefinitions.Count > 0)
                            {
                                foreach (var segment in sycSegmentIdentifierDefinitions)
                                {
                                    if (segment.IsAutoGenerated && segment.SegmentType == "Sequence")
                                    {
                                        var sycCounter =  _context.SycCounters.IgnoreQueryFilters().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == TenantId).FirstOrDefault();
                                        if (sycCounter == null)
                                        {
                                            sycCounter = new SycCounter();
                                            sycCounter.SycSegmentIdentifierDefinitionId = segment.Id;
                                            sycCounter.Counter = segment.CodeStartingValue + 1;
                                            if (TenantId != null)
                                            {
                                                sycCounter.TenantId = (int?)TenantId;
                                            }
                                            _context.SycCounters.Add(sycCounter);
                                             _context.SaveChanges();
                                            returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";
                                            if (segment.SegmentLength > 0)
                                            { returnString += segment.CodeStartingValue.ToString().Trim().PadLeft(segment.SegmentLength, '0'); }
                                        }
                                        else
                                        {
                                            returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";
                                            if (segment.SegmentLength > 0)
                                            { returnString += sycCounter.Counter.ToString().Trim().PadLeft(segment.SegmentLength, '0'); }

                                            sycCounter.Counter += 1;
                                            _context.SycCounters.Update(sycCounter);
                                             _context.SaveChanges();
                                       //     scope.Complete();
                                        }
                                    }
                                    else
                                    {
                                        if (segment.SegmentType == "Field")
                                        {
                                            if (segment.LookOrFieldName.ToUpper() == "TENANTID")
                                            {
                                                returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";

                                                string _segmentValue = TenantId.ToString();
                                                if (segment.SegmentLength > 0)
                                                { _segmentValue = _segmentValue.PadLeft(segment.SegmentLength, '0'); }
                                                returnString += _segmentValue;

                                            }
                                            //else
                                            //{
                                            //    if (appEntity != null)
                                            //    {
                                            //        var prop = appEntity.GetType().GetProperty(segment.LookOrFieldName);
                                            //        if (prop != null)
                                            //        {
                                            //            returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";
                                            //            string _segmentFieldValue = prop.GetValue(appEntity).ToString();
                                            //            if (segment.SegmentLength > 0)
                                            //            { _segmentFieldValue = _segmentFieldValue.PadLeft(segment.SegmentLength, '0'); }
                                            //            returnString += _segmentFieldValue;

                                            //        }
                                            //    }
                                            //}
                                        }
                                    }
                                }
                            }
                        }
                    }
                    //var tenantIdentifier = _context.SycEntityObjectTypes.IgnoreQueryFilters().Where(r => r.TenantId == item.TenantId
                    //&& r.Id == item.EntityFk.EntityObjectTypeId).FirstOrDefault();
                    //if (tenantIdentifier != null && tenantIdentifier.SycIdentifierDefinitionId != null)
                    //    item.SycIdentifierId = tenantIdentifier.SycIdentifierDefinitionId;
                    //else
                    //{
                    //    var tenantIdentifierShared = _context.SycEntityObjectTypes.IgnoreQueryFilters().Where(r => r.TenantId == null
                    //&& r.Id == item.EntityFk.EntityObjectTypeId).FirstOrDefault();
                    //    if (tenantIdentifierShared != null && tenantIdentifierShared.SycIdentifierDefinitionId != null)
                    //        item.SycIdentifierId = tenantIdentifierShared.SycIdentifierDefinitionId;
                    //    else
                    //    {
                    //        //var identifierShared = _context.SydObjects.IgnoreQueryFilters().Where(r => r.Code == "ITEM").FirstOrDefault();
                    //        if (objectRec != null && objectRec.SycDefaultIdentifierId != null)
                    //            item.SycIdentifierId = objectRec.SycDefaultIdentifierId;
                    //    }
                    //}


                }

            }
            return returnString;
        }

    }
}
