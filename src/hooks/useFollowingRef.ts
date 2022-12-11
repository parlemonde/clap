import React from 'react';

export const useFollowingRef = <T>(value: T) => {
    const ref = React.useRef(value);
    React.useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref;
};
