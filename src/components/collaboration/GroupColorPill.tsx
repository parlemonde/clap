import React from 'react';

interface GroupColorPillProps {
    color: string;
    status?: string;
}

export const GroupColorPill: React.FunctionComponent<GroupColorPillProps> = ({ color, status = '' }: GroupColorPillProps) => {
    return (
        <>
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
            {status && <p style={{ color: 'black', marginLeft: '10px', fontSize: '20px' }}>{status}</p>}
        </>
    );
};
