import { unixFormat } from './date';

type TTitleLocaleCase = 'normal' | 'upper' | 'lower';
type TVisible = 'date' | 'title';
type TOrientation = 'horizontal' | 'vertical';
type TType = 'info' | 'warn' | 'error';

export interface IOptions {
    title?: string;
    titleLocaleCase?: TTitleLocaleCase;
    titleColor?: EColor;
    visible?: Array<TVisible>;
    dateFormat?: string;
    suffix?: string;
    orientation?: TOrientation;
    type?: TType;
}

export enum EColor {
    Reset = '\x1b[0m',
    Bright = '\x1b[1m',
    Dim = '\x1b[2m',
    Underscore = '\x1b[4m',
    Blink = '\x1b[5m',
    Reverse = '\x1b[7m',
    Hidden = '\x1b[8m',
    FgBlack = '\x1b[30m',
    FgRed = '\x1b[31m',
    FgGreen = '\x1b[32m',
    FgYellow = '\x1b[33m',
    FgBlue = '\x1b[34m',
    FgMagenta = '\x1b[35m',
    FgCyan = '\x1b[36m',
    FgWhite = '\x1b[37m',
    FgGray = '\x1b[90m',
    BgBlack = '\x1b[40m',
    BgRed = '\x1b[41m',
    BgGreen = '\x1b[42m',
    BgYellow = '\x1b[43m',
    BgBlue = '\x1b[44m',
    BgMagenta = '\x1b[45m',
    BgCyan = '\x1b[46m',
    BgWhite = '\x1b[47m',
    BgGray = '\x1b[100m'
}

class Log {
    options: IOptions;
    defaultOptions: IOptions;

    constructor() {
        this.defaultOptions = {
            title: 'Info',
            titleLocaleCase: 'upper',
            titleColor: EColor.FgCyan,
            visible: ['date', 'title'],
            dateFormat: 'dd.MM.YYYY hh:mm:ss',
            suffix: '-',
            orientation: 'horizontal',
            type: 'info'
        }

        this.setOptions(this.defaultOptions);
    }

    setOptions(options: IOptions) {
        this.options = {
            ...this.defaultOptions,
            ...options
        };

        if (this.options.type === 'warn') {
            this.options.title = 'Warning';
            this.options.titleColor = EColor.FgYellow;
        };
        if (this.options.type === 'error') {
            this.options.title = 'Error';
            this.options.titleColor = EColor.FgRed;
        }

        return this;
    }

    private getKeyOptionIndex(key: TVisible) {
        return this.options.visible.findIndex(k => k === key);
    }

    log(...message: any) {
        let options = [],
            colorLine = this.options.type === 'error' ? EColor.FgRed : (this.options.type === 'warn' ? EColor.FgYellow : EColor.FgWhite),
            line = `${colorLine}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${EColor.Reset}`,
            isVertical = this.options.orientation === 'vertical',
            dateIndex = this.getKeyOptionIndex('date'),
            titleIndex = this.getKeyOptionIndex('title');

        if (dateIndex > -1) {
            options[dateIndex] = `${EColor.FgGray}[${EColor.FgMagenta}${unixFormat(Date.now(), this.options.dateFormat)}${EColor.FgGray}]${EColor.Reset}`;
        }

        if (titleIndex > -1) {
            let title = this.options.title;

            if (this.options.titleLocaleCase === 'lower') title = title.toLocaleLowerCase();
            if (this.options.titleLocaleCase === 'upper') title = title.toLocaleUpperCase();
            

            options[titleIndex] = `\x1b[90m[${this.options.titleColor || EColor.FgCyan}${title}\x1b[90m]${EColor.Reset}`;
        }

        options = [isVertical ? `${colorLine}┃${EColor.Reset}` : '', ...options || [], isVertical ? `\n${colorLine}┗${EColor.Reset}${line}\n` : this.options.suffix];

        console.log(...options, ...message, isVertical ? `\n${line}${colorLine}━${EColor.Reset}` : '');
        
        return this;
    }
}

export const $log = new Log();