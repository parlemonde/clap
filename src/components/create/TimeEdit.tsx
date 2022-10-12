import React from 'react';

interface TimeEditProps {
    totalTime: number;
    updateTime?(time: number): void;
}

export const TimeEdit: React.FunctionComponent<TimeEditProps> = ({ totalTime, updateTime = () => {} }: TimeEditProps) => {
    const minuteRef = React.useRef(null);
    const secondRef = React.useRef(null);
    const deciRef = React.useRef(null);

    const getTime = (type: number) => {
        const minutes = Math.floor(totalTime / 60000);
        const seconds = (totalTime - minutes * 60000) / 1000;
        const centi = Math.floor(totalTime / 10);
        switch (type) {
            case 0:
                return ('0' + minutes).slice(-2);
            case 1:
                return ('0' + Math.floor(seconds)).slice(-2);
            case 2:
                return ('0' + centi).slice(-2);
            default:
                return '00';
        }
    };

    const handleInputchange = (e: React.ChangeEvent<HTMLInputElement>, type: number) => {
        if (minuteRef.current == null || secondRef.current == null || deciRef.current == null) return;
        const minute = parseInt((minuteRef.current as HTMLInputElement).value);
        const second = parseInt((secondRef.current as HTMLInputElement).value);
        const deci = parseInt((deciRef.current as HTMLInputElement).value);

        if (isNaN(minute) || isNaN(second) || isNaN(deci) || minute < 0 || second < 0 || deci < 0) return;

        switch (type) {
            case 0:
                (minuteRef.current as HTMLInputElement).value = ('0' + minute).slice(-2);
                break;
            case 1:
                (secondRef.current as HTMLInputElement).value = ('0' + second).slice(-2);
                break;
            case 2:
                (deciRef.current as HTMLInputElement).value = ('0' + deci).slice(-2);
                break;
            default:
                break;
        }

        const time = minute * 60000 + second * 1000 + deci * 10;
        const diff = time - totalTime;
        updateTime(diff);
    };

    return (
        <div className="diaporama-total-duration">
            <input defaultValue={getTime(0)} ref={minuteRef} onBlur={(e) => handleInputchange(e, 0)} />:
            <input defaultValue={getTime(1)} ref={secondRef} onBlur={(e) => handleInputchange(e, 1)} />:
            <input defaultValue={getTime(2)} ref={deciRef} onBlur={(e) => handleInputchange(e, 2)} />
        </div>
    );
};
