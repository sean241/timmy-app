import React, { ReactNode } from 'react';

interface TooltipProps {
    children: ReactNode;
    content: string;
    side?: 'top' | 'right';
}

export default function Tooltip({ children, content, side = 'top' }: TooltipProps) {
    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2"
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-900 border-x-transparent border-b-transparent border-4",
        right: "right-full top-1/2 -translate-y-1/2 -mr-1 border-r-gray-900 border-y-transparent border-l-transparent border-4"
    };

    return (
        <div className="relative flex items-center group/tooltip">
            {children}
            <div
                className={`absolute ${positionClasses[side]} px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100]`}
            >
                {content}
                {/* Small Arrow */}
                <div className={`absolute ${arrowClasses[side]}`}></div>
            </div>
        </div>
    );
}
