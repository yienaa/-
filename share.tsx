import { useState, useCallback, useMemo, useRef, useEffect, ReactNode } from "react";

export type TreeNode = {
    id: number;
    name: string;
    depth?: number;
    children?: TreeNode[];
};

type Props = {
    treeData: TreeNode[];
    itemHeight: number;
    renderAhead?: number;
    children: (node: TreeNode, toggleNode: (id: number) => void, expanded: boolean) => ReactNode;
};

const VirtualScroll = ({ treeData, itemHeight, renderAhead = 5, children }: Props) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [parentHeight, setParentHeight] = useState(300); // 초기값

    const [scrollTop, setScrollTop] = useState(0);
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (containerRef.current) {
            setParentHeight(containerRef.current.clientHeight);
            const resizeObserver = new ResizeObserver(() => {
                if (containerRef.current) {
                    setParentHeight(containerRef.current.clientHeight);
                }
            });
            resizeObserver.observe(containerRef.current);
            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    const toggleNode = useCallback((id: number) => {
        setExpandedNodes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const flattenTree = useCallback((nodes: TreeNode[], expandedNodes: Set<number>) => {
        const flattened: TreeNode[] = [];
        const traverse = (nodeList: TreeNode[], depth = 0) => {
            nodeList.forEach((node) => {
                flattened.push({ ...node, depth: depth });
                if (expandedNodes.has(node.id) && node.children) {
                    traverse(node.children, depth + 1);
                }
            });
        };
        traverse(nodes);
        return flattened;
    }, []);

    const flattenedData = useMemo(
        () => flattenTree(treeData, expandedNodes),
        [treeData, expandedNodes, flattenTree]
    );

    const minimumVisibleItems = Math.ceil(parentHeight / itemHeight);
    const containerHeight = itemHeight * flattenedData.length;
    const startIndex = Math.max(Math.floor(scrollTop / itemHeight) - renderAhead, 0);
    const endIndex = Math.min(
        startIndex + minimumVisibleItems + renderAhead * 2,
        flattenedData.length
    );

    const visibleItems = flattenedData.slice(startIndex, endIndex);
    const translateY = startIndex * itemHeight;

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop((e.target as HTMLDivElement).scrollTop);
    };

    return (
        <div ref={containerRef} style={{ height: "100%", overflowY: "auto" }} onScroll={onScroll}>
            <div style={{ height: `${containerHeight}px`, position: "relative" }}>
                <div style={{ transform: `translateY(${translateY}px)`, position: "absolute", width: "100%" }}>
                    {visibleItems.map((node) =>
                        children(node, toggleNode, expandedNodes.has(node.id))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VirtualScroll;



import { useState } from "react";

type Props = {
    children: JSX.Element[];
    itemHeight: number;
    rowGap?: number;
    columnGap?: number;
    renderAhead?: number;
};

const VirtualScroll = ({
    children,
    itemHeight,
    columnGap = 0,
    renderAhead = 0
}: Props) => {
    const parentHeight = 700; // ref ? props로 받아오기
    const [scrollTop, setScrollTop] = useState<number>(0);
    const minimumVisibleItems = Math.ceil(parentHeight / itemHeight);
    const containerHeight = (itemHeight + columnGap) * children.length;
    const relativeY = scrollTop - parentHeight;

    const startIndex = Math.max(
        Math.floor(relativeY / (itemHeight + columnGap)) - renderAhead,
        0
    );

    const endIndex = Math.min(
        Math.ceil(parentHeight / (itemHeight + columnGap) + startIndex) + renderAhead,
        children.length
    );

    const visibleItems = children.slice(
        Math.max(startIndex, 0),
        Math.min(endIndex + minimumVisibleItems, children.length)
    );

    const translateY = Math.max((itemHeight + columnGap) * startIndex, columnGap);

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop((e.target as HTMLDivElement).scrollTop);
    };

    return (
        <div
            style={{
                height: `100%`,
                overflowY: 'scroll'
            }}
            onScroll={onScroll}
        >
            <div style={{ height: `${containerHeight}px` }}>
                <div style={{ transform: `translateY(${translateY}px)` }}>
                    {visibleItems}
                </div>
            </div>
        </div>
    );
};

export default VirtualScroll;
