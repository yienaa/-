import { useEffect, useRef, useState } from "react";

export interface TreeViewItem<T> {
  id: string;
  opened?: boolean;
  data: T;
  children?: TreeViewItem<T>[];
}

export interface InternalTreeViewItem<T> {
  id: string;
  top: number;
  height: number;
  data: T;
  depth: number;
}

export interface TreeViewRootProps<T> {
  itemSize: number;
  items: TreeViewItem<T>[];
  children: (item: InternalTreeViewItem<T>) => React.ReactNode;
}

export const TreeViewRoot = <T,>(props: TreeViewRootProps<T>) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    setHeight(ref.current.clientHeight);
    const resizeObserver = new ResizeObserver(() => {
      setHeight(ref.current!.clientHeight);
    });
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);

  const onScroll = () => {
    if (!ref.current) {
      return;
    }
    setScrollTop(ref.current.scrollTop);
  }

  function flatten(
    items: TreeViewItem<T>[],
    result: InternalTreeViewItem<T>[] = [],
    depth = 0,
  ) {
    for (const item of items) {
      const itemTop = result.length * props.itemSize;
      const itemHeight = props.itemSize;

      result.push({
        id: item.id,
        top: itemTop,
        height: itemHeight,
        data: item.data,
        depth: depth,
      });

      if (item.opened && item.children) {
        flatten(item.children, result, depth + 1);
      }
    }
    return result;
  }

  const flat = flatten(props.items);
  const flatHeight = flat.length * props.itemSize;
  const renderable = flat.filter(
    item => item.top < scrollTop + height && item.top + item.height > scrollTop
  );

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className="h-full overflow-x-auto"
    >
      <div className="relative" style={{ height: flatHeight }}>
        {renderable.map(item => (
          <div
            className="absolute w-full"
            key={item.id}
            style={{ top: item.top, height: item.height }}
          >
            {props.children(item)}
          </div>
        ))}
      </div>
    </div>
  );
};
