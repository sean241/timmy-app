import React, { ReactNode } from 'react';

interface TooltipProps {
    children: ReactNode;
    content: string;
}

export default function Tooltip({ children, content }: TooltipProps) {
    return (
        <div className="relative flex items-center group/tooltip">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100]">
                {content}
                {/* Small Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
        </div>
    );
}
