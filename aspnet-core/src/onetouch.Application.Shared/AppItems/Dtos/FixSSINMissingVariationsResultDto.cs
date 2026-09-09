namespace onetouch.AppItems.Dtos
{
    public class FixSSINMissingVariationsResultDto
    {
        public int TargetTenantCount { get; set; }
        public int AffectedParentCount { get; set; }
        public int MissingVariationCount { get; set; }
        public int EnqueuedJobCount { get; set; }
    }
}
