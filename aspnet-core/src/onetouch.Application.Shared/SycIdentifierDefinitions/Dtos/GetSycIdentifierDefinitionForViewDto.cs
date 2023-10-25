using onetouch.SycSegmentIdentifierDefinitions.Dtos;
using System.Collections.Generic;

namespace onetouch.SycIdentifierDefinitions.Dtos
{
    public class GetSycIdentifierDefinitionForViewDto
    {
        public SycIdentifierDefinitionDto SycIdentifierDefinition { get; set; }
        public List<SycSegmentIdentifierDefinitionDto> SycSegmentIdentifierDefinitions { get; set; }

    }
}