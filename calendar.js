'use strict'
const {argv} =process;
let yearA = argv[2];
let monthA = argv[3];
const chalk = require('./node_modules/chalk');
const weeknd = chalk.hex('#f00');
const weekndOt=chalk.hex('#f99');
const otherM = chalk.hex('#666');

function zfill(x) {
    x = '' + x;
    if (x.length === 1) {
        return '0' + x;
    }
    return x;
}

function isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 1;
}

function getCalendar(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    let curDate = firstDay;
    while (curDate.getDay() !== 1) {
        curDate.setDate(curDate.getDate() - 1);
    }
    let otherMonth = true;
    for(let i = 0; i < 42; i++) {
        curDate.setDate(curDate.getDate() + 1);
        if (curDate.getDate() === 1) {
            otherMonth = !otherMonth;
        }
            if (i > 0 && i % 7 === 0) {
                if (otherMonth) {
                    break;
                }
                process.stdout.write('\n');
            }

        if (otherMonth) {
            if (isWeekend(curDate)) {
                process.stdout.write(weekndOt(weeknd(zfill(curDate.getDate()) + ' ')));
            } else {
                process.stdout.write(zfill(curDate.getDate()) + ' ');
            }
        } else {
            if (isWeekend(curDate)) {
                process.stdout.write(weeknd(zfill(curDate.getDate()) + ' '));
            } else {
                process.stdout.write(otherM(zfill(curDate.getDate()) + ' '));
            }
        }
    }
}

getCalendar(yearA,monthA);