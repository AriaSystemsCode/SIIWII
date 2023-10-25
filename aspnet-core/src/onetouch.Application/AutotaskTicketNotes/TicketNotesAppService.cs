using onetouch.AutoTaskTickets;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AutoTaskTicketNotes.Exporting;
using onetouch.AutoTaskTicketNotes.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.Authorization.Users;
using onetouch.AutoTaskAttachmentInfo;
using Microsoft.Extensions.Configuration;
using onetouch.Configuration;

namespace onetouch.AutoTaskTicketNotes
{
    [AbpAuthorize(AppPermissions.Pages_Administration_TicketNotes)]
    public class TicketNotesAppService : onetouchAppServiceBase, ITicketNotesAppService
    {
        private readonly IRepository<TicketNote, long> _ticketNoteRepository;
        private readonly ITicketNotesExcelExporter _ticketNotesExcelExporter;
        private readonly IRepository<Ticket, long> _lookup_ticketRepository;

        private readonly IRepository<User, long> _lookup_userRepository;
        private readonly IRepository<AttachmentInfo, long> _attachmentInfoRepository;
        private readonly IConfigurationRoot _appConfiguration;

        public TicketNotesAppService(IRepository<TicketNote, long> ticketNoteRepository, ITicketNotesExcelExporter ticketNotesExcelExporter, IRepository<Ticket, long> lookup_ticketRepository, IRepository<User, long> lookup_userRepository, IRepository<AttachmentInfo, long> attachmentInfoRepository, IAppConfigurationAccessor appConfigurationAccessor)
        {
            _ticketNoteRepository = ticketNoteRepository;
            _ticketNotesExcelExporter = ticketNotesExcelExporter;
            _lookup_ticketRepository = lookup_ticketRepository;

            _lookup_userRepository = lookup_userRepository;
            _attachmentInfoRepository = attachmentInfoRepository;
            _appConfiguration = appConfigurationAccessor.Configuration;

        }

        public async Task<PagedResultDto<GetTicketNoteForViewDto>> GetAll(GetAllTicketNotesInput input)
        {

            var filteredTicketNotes = _ticketNoteRepository.GetAll()
                        .Include(e => e.TicketFk)
                        .Include(e => e.EntityAttachments)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Title.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.TicketFk.TicketNumber.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TitleFilter), e => e.Title == input.TitleFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TicketTicketNumberFilter), e => e.TicketFk != null && e.TicketFk.TicketNumber == input.TicketTicketNumberFilter);

            var pagedAndFilteredTicketNotes = filteredTicketNotes
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var ticketNotes = from o in pagedAndFilteredTicketNotes
                              join o1 in _lookup_ticketRepository.GetAll() on o.TicketId equals o1.Id into j1
                              from s1 in j1.DefaultIfEmpty()
                              join o2 in _lookup_userRepository.GetAll() on o.CreatorUserId equals o2.Id into j2
                              from s2 in j2.DefaultIfEmpty()

                              select new GetTicketNoteForViewDto()
                              {
                                  TicketNote = new TicketNoteDto
                                  {
                                      Title = o.Title,
                                      Description = o.Description,
                                      CreateDateTime = o.CreateDateTime,
                                      CreatorUserId = o.CreatorUserId,
                                      Id = o.Id
                                  },
                                  TicketTicketNumber = s1 == null || s1.TicketNumber == null ? "" : s1.TicketNumber.ToString(),
                                  CreateUserName = s2 == null || s2.Name == null ? "" : s2.Name.ToString(),
                                  Attachments = o.EntityAttachments.Select(r => ObjectMapper.Map<AttachmentInfoDto>(r)).ToList()

                              };
            
            var ticketNotesList = await ticketNotes.ToListAsync();
            
            foreach (GetTicketNoteForViewDto ticketNote in ticketNotesList)
            {
                foreach (AttachmentInfoDto attachmentInfoDto in ticketNote.Attachments)
                {
                    attachmentInfoDto.FullPath = attachmentInfoDto.FullPath.Replace(_appConfiguration[$"Attachment:Omitt"], "").Replace("\\",@"/");
                }
            }

            var totalCount = await filteredTicketNotes.CountAsync();

            return new PagedResultDto<GetTicketNoteForViewDto>(
                totalCount,
                ticketNotesList
            );
        }

        public async Task<GetTicketNoteForViewDto> GetTicketNoteForView(int id)
        {
            var ticketNote = _ticketNoteRepository.GetAll().Include(e => e.EntityAttachments).Where(r => r.Id == id).FirstOrDefault();

            var output = new GetTicketNoteForViewDto
            {
                TicketNote = ObjectMapper.Map<TicketNoteDto>(ticketNote),
                Attachments = ticketNote.EntityAttachments.Select(r => ObjectMapper.Map<AttachmentInfoDto>(r)).ToList()
            };

            foreach (AttachmentInfoDto attachmentInfoDto in output.Attachments)
            {
                attachmentInfoDto.FullPath = attachmentInfoDto.FullPath.Replace(_appConfiguration[$"Attachment:Omitt"], "").Replace("\\", @"/");
            }

            if (output.TicketNote.TicketId != null)
            {
                var _lookupTicket = await _lookup_ticketRepository.FirstOrDefaultAsync((int)output.TicketNote.TicketId);
                output.TicketTicketNumber = _lookupTicket?.TicketNumber?.ToString();
                var _lookupUser = await _lookup_userRepository.FirstOrDefaultAsync((int)output.TicketNote.CreatorUserId);
                output.CreateUserName = _lookupUser?.Name.ToString();
            }

            return output;

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_TicketNotes_Edit)]
        public async Task<GetTicketNoteForEditOutput> GetTicketNoteForEdit(EntityDto input)
        {
            var ticketNote = _ticketNoteRepository.GetAll().Include(e => e.EntityAttachments).Where(r => r.Id == input.Id).FirstOrDefault();

            var output = new GetTicketNoteForEditOutput
            {
                TicketNote = ObjectMapper.Map<CreateOrEditTicketNoteDto>(ticketNote)
            };

            if (output.TicketNote.TicketId != null)
            {
                var _lookupTicket = await _lookup_ticketRepository.FirstOrDefaultAsync((int)output.TicketNote.TicketId);
                output.TicketTicketNumber = _lookupTicket?.TicketNumber?.ToString();
                var _lookupUser = await _lookup_userRepository.FirstOrDefaultAsync((int)output.TicketNote.CreatorUserId);
                output.CreateUserName = _lookupUser?.Name.ToString();
                output.TicketNote.EntityAttachments = ticketNote.EntityAttachments.Select(r => ObjectMapper.Map<AttachmentInfoDto>(r)).ToList();
                foreach (AttachmentInfoDto attachmentInfoDto in output.TicketNote.EntityAttachments)
                {
                    attachmentInfoDto.FullPath = attachmentInfoDto.FullPath.Replace(_appConfiguration[$"Attachment:Omitt"], "").Replace("\\", @"/");
                }
            }

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditTicketNoteDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_TicketNotes_Create)]
        protected virtual async Task Create(CreateOrEditTicketNoteDto input)
        {
            var ticketNote = ObjectMapper.Map<TicketNote>(input);
            ticketNote = SetInternalFlags(ticketNote);
            if (AbpSession.TenantId != null)
            {
                ticketNote.TenantId = (int?)AbpSession.TenantId;
            }
            var _lookupTicket = await _lookup_ticketRepository.FirstOrDefaultAsync((int)input.TicketId);
            ticketNote.CreatorResourceID = _lookupTicket?.CreatorResourceID;

            ticketNote.CreateDateTime = ticketNote.CreationTime;
            await AddAttachmentInfo(ticketNote, input);
            await _ticketNoteRepository.InsertAsync(ticketNote);
            await RemoveAttachmentInfo(ticketNote, input);


        }
        private async Task AddAttachmentInfo(TicketNote ticketNote, CreateOrEditTicketNoteDto input)
        {
            //if (ticketNote.EntityAttachments == null)
            //ticketNote.EntityAttachments = new List<AttachmentInfo>();
            #region add new attachments
            if (input.EntityAttachments != null)
            {
                for (int iNumber = 0; iNumber < input.EntityAttachments.Count; iNumber++)
                {
                    var item = input.EntityAttachments[iNumber];
                    var ticketNoteItem = ticketNote.EntityAttachments[iNumber];
                    if (!string.IsNullOrEmpty(item.FileName))
                    {
                        ticketNoteItem.Type = "FILE_ATTACHMENT";
                        ticketNoteItem.Title = item.Description;
                        ticketNoteItem.AttachDate = ticketNote.CreationTime;
                        ticketNoteItem.FullPath = _appConfiguration[$"AutotaskAttachment:Path"] + @"\" + item.FileName;
                        ticketNoteItem.TicketNoteId = ticketNote.Id;
                        ticketNoteItem.ContentType = item.FileName.Split(".")[item.FileName.Split(".").Length - 1];


                        if (item.ID == 0)
                        {
                            MoveFile(item.FileName, item.guid);
                        }

                    }

                }
                
            }
            #endregion add new attachments
        }

        private async Task RemoveAttachmentInfo(TicketNote ticketNote, CreateOrEditTicketNoteDto input)
        {
            try
            {
                //delete missing attachments
                var currentTicketNote = _ticketNoteRepository.GetAll().Include(e => e.EntityAttachments).Where(r => r.Id == input.Id).FirstOrDefault();
            if (currentTicketNote!=null && currentTicketNote.EntityAttachments != null)
            {
                foreach (var item in currentTicketNote.EntityAttachments)
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
                    System.IO.File.Delete(tmpPath.Replace(@"\", @"\"));
                }

                try
                {
                    System.IO.File.Copy(tmpPath.Replace(@"\", @"\"), path.Replace(@"\", @"\"));
                }
                catch (Exception ex)
                {

                }
            }
        }


        [AbpAuthorize(AppPermissions.Pages_Administration_TicketNotes_Edit)]
        protected virtual async Task Update(CreateOrEditTicketNoteDto input)
        {
            var ticketNote = await _ticketNoteRepository.FirstOrDefaultAsync((int)input.Id);
            ticketNote = SetInternalFlags(ticketNote);
            ObjectMapper.Map(input, ticketNote);
            await AddAttachmentInfo(ticketNote, input);
            await _ticketNoteRepository.UpdateAsync(ticketNote);
            await RemoveAttachmentInfo(ticketNote, input); 

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_TicketNotes_Delete)]
        public async Task Delete(EntityDto input)
        {
            var ticketNote = await _ticketNoteRepository.FirstOrDefaultAsync((int)input.Id);

            foreach (var item in ticketNote.EntityAttachments)
            {
                await _attachmentInfoRepository.DeleteAsync(item);
                try
                {
                    System.IO.File.Delete(item.FullPath.Replace(@"\", @"\"));

                }
                catch (Exception ex)
                {

                }

            }

            await _ticketNoteRepository.DeleteAsync(input.Id);

        }

        public async Task<FileDto> GetTicketNotesToExcel(GetAllTicketNotesForExcelInput input)
        {

            var filteredTicketNotes = _ticketNoteRepository.GetAll()
                        .Include(e => e.TicketFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Title.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.TicketFk.TicketNumber.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TitleFilter), e => e.Title == input.TitleFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TicketTicketNumberFilter), e => e.TicketFk != null && e.TicketFk.TicketNumber == input.TicketTicketNumberFilter);

            var query = (from o in filteredTicketNotes
                         join o1 in _lookup_ticketRepository.GetAll() on o.TicketId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()
                         join o2 in _lookup_userRepository.GetAll() on o.CreatorUserId equals o2.Id into j2
                         from s2 in j2.DefaultIfEmpty()

                         select new GetTicketNoteForViewDto()
                         {
                             TicketNote = new TicketNoteDto
                             {
                                 Title = o.Title,
                                 Description = o.Description,
                                 CreateDateTime = o.CreateDateTime,
                                 CreatorUserId = o.CreatorUserId,
                                 Id = o.Id
                             },
                             TicketTicketNumber = s1 == null || s1.TicketNumber == null ? "" : s1.TicketNumber.ToString(),
                             CreateUserName = s2 == null || s2.Name == null ? "" : s2.Name.ToString()
                         });

            var ticketNoteListDtos = await query.ToListAsync();

            return _ticketNotesExcelExporter.ExportToFile(ticketNoteListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_TicketNotes)]
        public async Task<PagedResultDto<TicketNoteTicketLookupTableDto>> GetAllTicketForLookupTable(GetAllForLookupTableInput input)
        {
            var query = _lookup_ticketRepository.GetAll().WhereIf(
                   !string.IsNullOrWhiteSpace(input.Filter),
                  e => e.TicketNumber != null && e.TicketNumber.Contains(input.Filter)
               );

            var totalCount = await query.CountAsync();

            var ticketList = await query
                .PageBy(input)
                .ToListAsync();

            var lookupTableDtoList = new List<TicketNoteTicketLookupTableDto>();
            foreach (var ticket in ticketList)
            {
                lookupTableDtoList.Add(new TicketNoteTicketLookupTableDto
                {
                    Id = ticket.Id,
                    DisplayName = ticket.TicketNumber?.ToString()
                });
            }

            return new PagedResultDto<TicketNoteTicketLookupTableDto>(
                totalCount,
                lookupTableDtoList
            );
        }

        //look set internal flags  private
        private TicketNote SetInternalFlags(TicketNote ticketNote)
        {
            ticketNote.Publish = 2;
            ticketNote.NoteType = 3;

            return ticketNote;
        }

    }
}