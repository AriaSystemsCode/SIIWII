using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.Common
{
    public class TreeNode<T>
    {
        public T Data { get; set; }
        public IReadOnlyList<TreeNode<T>> Children { get; set; }
        public bool Leaf { get; set; }
        public bool Expanded { get; set; }

        public string label { get; set; }

        public long? totalChildrenCount { get; set; }
    }
}
