export default function valueFromWindowWidth({
    windowW,
    minw,
    w425,
    w1024,
}: {
    windowW: number, 
    minw: number, 
    w425: number, 
    w1024: number
}) {
    if (windowW >= 1024) return w1024;
    if (windowW >= 425) return w425;
    return minw;
}
