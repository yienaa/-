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
