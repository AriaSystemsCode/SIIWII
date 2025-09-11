using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.Common
{
    public class TreeviewItem
    {
        public IReadOnlyList<TreeviewItem> Children { get; set; }
        public string Text { get; set; }
        public long Value { get; set; }

        public bool Checked { get; set; }
    }
}
