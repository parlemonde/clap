export const getFormatedTime = (t: number) => {
    const minutes = Math.floor(t / 60000);
    const seconds = (t - minutes * 60000) / 1000;
    const centi = Math.floor(t / 10);
    return `${('0' + minutes).slice(-2)}:${('0' + Math.floor(seconds)).slice(-2)}:${('0' + centi).slice(-2)}`;
};
