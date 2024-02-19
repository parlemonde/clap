import React from 'react';

interface GroupColorPillProps {
    color: string;
}

export const GroupColorPill: React.FunctionComponent<GroupColorPillProps> = ({ color }: GroupColorPillProps) => {
    return (
        <div
            style={{
                height: '20px',
                width: '20px',
                backgroundColor: color,
                display: 'inline-block',
                borderRadius: '100%',
                marginLeft: '10px',
            }}
        ></div>
    );
};
