import dayjs, { Dayjs } from "dayjs";
/**
 *
 * @param date Dayjs
 * @returns boolean
 * 给定时间一年后
 */
export const isExceedingYear = (targetDate: Dayjs, sourceDate: Dayjs) => dayjs(targetDate).isSameOrBefore(dayjs(sourceDate).subtract(1, 'year'), 'days');
/**
 *
 * @param date Dayjs
 * @returns boolean
 * 给定时间一个月内
 */
export const isExceedingMonth = (targetDate: Dayjs, sourceDate: Dayjs) => dayjs(targetDate).isBefore(dayjs(sourceDate).subtract(1, 'month'), 'days');
/**
 *
 * @param date Dayjs
 * @returns boolean
 * 给定时间一个月后
 */
export const isWithinMonth = (targetDate: Dayjs, sourceDate: Dayjs) => dayjs(targetDate).isSameOrAfter(dayjs(sourceDate).subtract(1, 'month'), 'days');
/**
 *
 * @param date Dayjs
 * @returns boolean
 * 给定时间是否未来
 */
export const isFuture = (targetDate: Dayjs, sourceDate: Dayjs) => dayjs(targetDate).isSameOrAfter(dayjs(sourceDate), 'days');