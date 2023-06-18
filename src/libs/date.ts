export let monthsName: string[] = ['january', 'february', 'martha', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
export let miniMonthsName: string[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function getString(input: number): string {
    return input < 10 ? `0${input}` : input.toString();
}

export function uts(UT: number, one: string, two: string, five: string): string {
    if (`${UT}`.split('').reverse()[1] === '1') return `${UT}${five}`;
    if (`${UT}`.split('').reverse()[0] === '1') return `${UT}${one}`;
    if (+(`${UT}`.split('').reverse()[0]) >= 2 && +(`${UT}`.split('').reverse()[0]) <= 4) return `${UT}${two}`;
    return `${UT}${five}`;
}

export function unix(unix: number | string = Date.now()) {
    let date = new Date(unix),
        year = date.getFullYear(),
        day = getString(date.getDate()),
        month = getString(date.getMonth() + 1),
        hours = getString(date.getHours()),
        minutes = getString(date.getMinutes()),
        seconds = getString(date.getSeconds());

    return {
        year,
        day,
        month,
        month_name: monthsName[Number(month) - 1],
        hours,
        minutes,
        seconds
    }
}

export function unixFormat(time: number | string = Date.now(), format: string = 'dd MMM YYYY'): string {
    let { year, day, month, hours, minutes, seconds } = unix(time),
        miniMonth = miniMonthsName[Number(month)],
        fullMonth = monthsName[Number(month)],
        types = {
        // * Year
        YYYY: year,
        YY: year.toString().slice(2),
        // * Month
        MMMM: fullMonth[0].toLocaleUpperCase() + fullMonth.slice(1),
        MMM: miniMonth[0].toLocaleUpperCase() + miniMonth.slice(1),
        MM: month,
        // * Day
        dd: day,
        d: Number(day),
        // * Hour
        hh: hours,
        h: Number(hours),
        // * Minute
        mm: minutes,
        m: Number(minutes),
        // * Second
        ss: seconds,
        s: Number(seconds),
    };

    // @ts-ignore
    return format.replace(new RegExp(`${Object.keys(types).join('|')}`, 'g'), (s: string) => types[s]);
}

export function timeago(time: number = Date.now()) {
    let msPerMinute = 60 * 1000,
        msPerHour = msPerMinute * 60,
        msPerDay = msPerHour * 24,
        elapsed = Date.now() - (new Date(time) as any);
    
    if (elapsed / 1000 < 3) return 'just now';
    
    if (elapsed < msPerMinute) return `${uts(Math.round(elapsed / 1000), ' second', ' seconds', ' seconds')} ago`;
    else if (elapsed < msPerHour) return `${uts(Math.round(elapsed / msPerMinute), ' minute', ' minutes', ' minutes')} ago`;
    else if (elapsed < msPerDay) return `${uts(Math.round(elapsed / msPerHour), ' hour', ' hours', ' hours')} ago`;
    else {
        let { day, month_name, year } = unix(time);
        return `${day} ${month_name} ${year}`;
    }
}