using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AutoTaskTickets.Exporting;
using onetouch.AutoTaskTickets.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.AutoTaskAttachmentInfo;
using Microsoft.Extensions.Configuration;
using onetouch.Configuration;
using onetouch.AutoTaskTicketNotes.Dtos;
using onetouch.AutotaskQueues;

namespace onetouch.AutoTaskTickets
{
    [AbpAuthorize(AppPermissions.Pages_Administration_Tickets)]
    public class TicketsAppService : onetouchAppServiceBase, ITicketsAppService
    {
        private readonly IRepository<Ticket, long> _ticketRepository;
        private readonly IRepository<AutotaskQueue, long> _queueRepository;
        private readonly ITicketsExcelExporter _ticketsExcelExporter;
        private readonly IRepository<AttachmentInfo, long> _attachmentInfoRepository;
        private readonly IConfigurationRoot _appConfiguration;


        public TicketsAppService(IRepository<Ticket, long> ticketRepository, ITicketsExcelExporter ticketsExcelExporter, IRepository<AttachmentInfo, long> attachmentInfoRepository, IAppConfigurationAccessor appConfigurationAccessor, IRepository<AutotaskQueue, long> queueRepository)
        {
            _ticketRepository = ticketRepository;
            _ticketsExcelExporter = ticketsExcelExporter;
            _attachmentInfoRepository = attachmentInfoRepository;
            _queueRepository = queueRepository;
            _appConfiguration = appConfigurationAccessor.Configuration;

        }

        public async Task<PagedResultDto<GetTicketForViewDto>> GetAll(GetAllTicketsInput input)
        {

            var filteredTickets = _ticketRepository.GetAll()
                        .Include(e => e.EntityAttachments)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Title.Contains(input.Filter) || e.TicketNumber.Contains(input.Filter) || e.RMMAlertID.Contains(input.Filter) || e.Resolution.Contains(input.Filter) || e.AEMAlertID.Contains(input.Filter) || e.ChangeInfoField1.Contains(input.Filter) || e.ChangeInfoField2.Contains(input.Filter) || e.ChangeInfoField3.Contains(input.Filter) || e.ChangeInfoField4.Contains(input.Filter) || e.ChangeInfoField5.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.ExternalID.Contains(input.Filter) || e.PurchaseOrderNumber.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TitleFilter), e => e.Title == input.TitleFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TicketNumberFilter), e => e.TicketNumber == input.TicketNumberFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter);

            var pagedAndFilteredTickets = filteredTickets
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var tickets = from o in pagedAndFilteredTickets
                          join o1 in _queueRepository.GetAll() on o.QueueID equals o1.RefQueueID into j1
                          from s1 in j1.DefaultIfEmpty()

                          select new GetTicketForViewDto()
                          {
                              Ticket = new TicketDto
                              {
                                  Title = o.Title,
                                  TicketNumber = o.TicketNumber,
                                  Description = o.Description,
                                  QueueId = o.QueueID,
                                  QueueName = s1.Name,
                                  Id = o.Id
                              },
                              Attachments = o.EntityAttachments.Where(r => r.TicketNoteId == null).Select(r => ObjectMapper.Map<AttachmentInfoDto>(r)).ToList()
                          };
            var ticketList = await tickets.ToListAsync();
            foreach (GetTicketForViewDto ticket in ticketList)
            {
                foreach (AttachmentInfoDto attachmentInfoDto in ticket.Attachments)
                {
                    attachmentInfoDto.FullPath = attachmentInfoDto.FullPath.Replace(_appConfiguration[$"Attachment:Omitt"], "").Replace("\\", @"/");
                }
                 

            }
            var totalCount = await filteredTickets.CountAsync();

            return new PagedResultDto<GetTicketForViewDto>(
                totalCount,
                ticketList
            );
        }

        public Task<GetTicketForViewDto> GetTicketForView(int id)
        {
            var ticket = _ticketRepository.GetAll().Include(e => e.EntityAttachments).Where(r => r.Id == id).FirstOrDefault();

            var output = new GetTicketForViewDto
            {
                Ticket = ObjectMapper.Map<TicketDto>(ticket),
                Attachments = ticket.EntityAttachments.Select(r => ObjectMapper.Map<AttachmentInfoDto>(r)).ToList()
            };
            foreach (AttachmentInfoDto attachmentInfoDto in output.Attachments)
            {
                attachmentInfoDto.FullPath = attachmentInfoDto.FullPath.Replace(_appConfiguration[$"Attachment:Omitt"], "").Replace("\\", @"/");
            }
             
            try { 
            if (output.Ticket.QueueId != null)
                output.Ticket.QueueName = _queueRepository.GetAll().Where(r => r.RefQueueID == output.Ticket.QueueId).ToList()[0].Name;
        }catch (Exception ex) { }
            return Task.FromResult(output);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Tickets_Edit)]
        public Task<GetTicketForEditOutput> GetTicketForEdit(EntityDto input)
        {
            var ticket = _ticketRepository.GetAll().Include(e => e.EntityAttachments).Where(r => r.Id == input.Id).FirstOrDefault();

            var output = new GetTicketForEditOutput
            {
                Ticket = ObjectMapper.Map<CreateOrEditTicketDto>(ticket),
                Attachments = ticket.EntityAttachments.Select(r => ObjectMapper.Map<AttachmentInfoDto>(r)).ToList()

            };
            foreach (AttachmentInfoDto attachmentInfoDto in output.Attachments)
            {
                attachmentInfoDto.FullPath = attachmentInfoDto.FullPath.Replace(_appConfiguration[$"Attachment:Omitt"], "").Replace("\\", @"/");
            }
            foreach (AttachmentInfoDto attachmentInfoDto in output.Ticket.EntityAttachments)
            {
                attachmentInfoDto.FullPath = attachmentInfoDto.FullPath.Replace(_appConfiguration[$"Attachment:Omitt"], "").Replace("\\", @"/");
            }
            try
            {
                if (output.Ticket.QueueId != null)
                    output.Ticket.QueueName = _queueRepository.GetAll().Where(r => r.RefQueueID == output.Ticket.QueueId).ToList()[0].Name;
            }
            catch (Exception ex) { }
            return Task.FromResult(output);
        }

        public async Task CreateOrEdit(CreateOrEditTicketDto input)
        {
            if (input.Id == null)
            {
                await Create(input);
            }
            else
            {
                await Update(input);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Tickets_Create)]
        protected virtual async Task Create(CreateOrEditTicketDto input)
        {
            var ticket = ObjectMapper.Map<Ticket>(input);

            if (AbpSession.TenantId != null)
            {
                ticket.TenantId = (int?)AbpSession.TenantId;
            }
            await AddAttachmentInfo(ticket, input);
            await _ticketRepository.InsertAsync(ticket);
            await RemoveAttachmentInfo(ticket, input);
        }

        private async Task AddAttachmentInfo(Ticket ticket, CreateOrEditTicketDto input)
        {
            #region add new attachments
            if (input.EntityAttachments != null)
            {
                for (int iNumber = 0; iNumber < input.EntityAttachments.Count; iNumber++)
                {
                    var item = input.EntityAttachments[iNumber];
                    var ticketItem = ticket.EntityAttachments[iNumber];
                    if (!string.IsNullOrEmpty(item.FileName))
                    {
                        ticketItem.Type = "FILE_ATTACHMENT";
                        ticketItem.Title = item.Description;
                        ticketItem.AttachDate = ticket.CreationTime;
                        ticketItem.FullPath = _appConfiguration[$"AutotaskAttachment:Path"] + @"\" + item.FileName;
                        ticketItem.TicketId = input.Id;
                        ticketItem.ContentType = item.FileName.Split(".")[item.FileName.Split(".").Length - 1];

                        if (item.ID == 0)
                        {
                            MoveFile(item.FileName, item.guid);
                        }

                    }

                }

            }
            #endregion add new attachments
        }

        private async Task RemoveAttachmentInfo(Ticket ticket, CreateOrEditTicketDto input)
        {
            try
            {
                //delete missing attachments
                var currentTicket = _ticketRepository.GetAll().Include(e => e.EntityAttachments).Where(r => r.Id == input.Id).FirstOrDefault();
                if (currentTicket!=null && currentTicket.EntityAttachments != null)
                {
                    foreach (var item in currentTicket.EntityAttachments)
                    {
                        if (item.Id > 0 && input.EntityAttachments != null && input.EntityAttachments.Count(x => x.ID == item.Id) == 0)
                        {
                            await _attachmentInfoRepository.DeleteAsync(item);

                            if (!string.IsNullOrEmpty(item.FullPath) && System.IO.File.Exists(item.FullPath.Replace(@"\", @"\")))
                            { System.IO.File.Delete(item.FullPath.Replace(@"\", @"\")); }

                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }


        }


        private void MoveFile(string fileName, string guid)
        {
            if (!string.IsNullOrEmpty(guid))
            {
                var tmpPath = _appConfiguration[$"Attachment:PathTemp"] + @"\" + guid + System.IO.Path.GetExtension(fileName);

                var path = _appConfiguration[$"AutotaskAttachment:Path"] + @"\" + fileName;

                if (!System.IO.Directory.Exists(_appConfiguration[$"AutotaskAttachment:Path"]))
                {
                    System.IO.Directory.CreateDirectory(_appConfiguration[$"AutotaskAttachment:Path"]);
                }

                try
                {
                    System.IO.File.Copy(tmpPath.Replace(@"\", @"\"), path.Replace(@"\", @"\"));
                    System.IO.File.Delete(tmpPath.Replace(@"\", @"\"));

                }
                catch (Exception ex)
                {

                }
            }
        }


        [AbpAuthorize(AppPermissions.Pages_Administration_Tickets_Edit)]
        protected virtual async Task Update(CreateOrEditTicketDto input)
        {
            var ticket = await _ticketRepository.FirstOrDefaultAsync((int)input.Id);
            if (input.QueueId == null && ticket.QueueID != null)
            {
                input.QueueId = ticket.QueueID;
            }

            if (ticket.QueueID != input.QueueId)
            { ticket.PurchaseOrderNumber = "QUEUE"; }
            ObjectMapper.Map(input, ticket);

            await AddAttachmentInfo(ticket, input);
            await _ticketRepository.UpdateAsync(ticket);
            await RemoveAttachmentInfo(ticket, input);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Tickets_Delete)]
        public async Task Delete(EntityDto input)
        {
            var ticket = await _ticketRepository.FirstOrDefaultAsync((int)input.Id);
            foreach (var item in ticket.EntityAttachments)
            {
                await _attachmentInfoRepository.DeleteAsync(item);
                try
                {
                    if (!string.IsNullOrEmpty(item.FullPath) && System.IO.File.Exists(item.FullPath.Replace(@"\", @"\")))
                    { System.IO.File.Delete(item.FullPath.Replace(@"\", @"\")); }
                }
                catch (Exception ex)
                {

                }
            }

            await _ticketRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetTicketsToExcel(GetAllTicketsForExcelInput input)
        {

            var filteredTickets = _ticketRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Title.Contains(input.Filter) || e.TicketNumber.Contains(input.Filter) || e.RMMAlertID.Contains(input.Filter) || e.Resolution.Contains(input.Filter) || e.AEMAlertID.Contains(input.Filter) || e.ChangeInfoField1.Contains(input.Filter) || e.ChangeInfoField2.Contains(input.Filter) || e.ChangeInfoField3.Contains(input.Filter) || e.ChangeInfoField4.Contains(input.Filter) || e.ChangeInfoField5.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.ExternalID.Contains(input.Filter) || e.PurchaseOrderNumber.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TitleFilter), e => e.Title == input.TitleFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TicketNumberFilter), e => e.TicketNumber == input.TicketNumberFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter);

            var query = (from o in filteredTickets
                         select new GetTicketForViewDto()
                         {
                             Ticket = new TicketDto
                             {
                                 Title = o.Title,
                                 TicketNumber = o.TicketNumber,
                                 Description = o.Description,
                                 Id = o.Id
                             }
                         });

            var ticketListDtos = await query.ToListAsync();

            return _ticketsExcelExporter.ExportToFile(ticketListDtos);
        }

    }
}