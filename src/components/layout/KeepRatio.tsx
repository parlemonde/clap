import React from 'react';

type KeepRatioProps = {
    ratio: number;
    minHeight?: string | number;
    className?: string;
    style?: React.CSSProperties;
};
export const KeepRatio = ({ minHeight = 0, ratio, className, style = {}, children }: React.PropsWithChildren<KeepRatioProps>) => {
    return (
        <div style={{ width: '100%', paddingBottom: `${ratio * 100}%`, minHeight, position: 'relative' }}>
            <div className={className} style={{ ...style, position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}>
                {children}
            </div>
        </div>
    );
};
