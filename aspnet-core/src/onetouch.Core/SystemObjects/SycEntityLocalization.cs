using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.SystemObjects
{
    [Table("SycEntityLocalization")]
    //[Audited]
    public class SycEntityLocalization //: FullAuditedEntity<long>
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { set; get; }
        public string Key { set; get; }
        public string String { set; get; }
        public long ObjectId { set; get; }
        public string Language { set; get; }
        public long ObjectTypeId { set; get; }

        [ForeignKey("ObjectTypeId")]
        public SydObject SyObjectId { set; get; }

    }
}
