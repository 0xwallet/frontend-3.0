import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useI18n } from '/@/hooks/web/useI18n';
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const DATE_FORMAT = 'YYYY-MM-DD ';
const { t } = useI18n();
export function formatToDateTime(date: dayjs.ConfigType, format = DATE_TIME_FORMAT): string {
  return dayjs(date).format(format);
}

export function formatToDate(date: dayjs.ConfigType, format = DATE_FORMAT): string {
  return dayjs(date).format(format);
}

export function formatAgo(str: string | number) {
  if (!str) return '';
  const date = new Date(Number(str));
  const time = new Date().getTime() - date.getTime(); // 现在的时间-传入的时间 = 相差的时间（单位 = 毫秒）
  if (time < 0) {
    return '';
  } else if (time / 1000 < 30) {
    return '刚刚';
  } else if (time / 1000 < 60) {
    return parseInt(String(time / 1000)) + '秒前';
  } else if (time / 60000 < 60) {
    return parseInt(String(time / 60000)) + '分钟前';
  } else if (time / 3600000 < 24) {
    return parseInt(String(time / 3600000)) + '小时前';
  } else if (time / 86400000 < 31) {
    return parseInt(String(time / 86400000)) + '天前';
  } else if (time / 2592000000 < 12) {
    return parseInt(String(time / 2592000000)) + '月前';
  } else {
    return parseInt(String(time / 31536000000)) + '年前';
  }
}

export function getExpired(time: string): string {
  if (dateUtil().isAfter(time) || time == null) {
    return t('expired');
  }
  //@ts-ignore
  const du = dateUtil.duration(dateUtil(time) - dateUtil(), 'ms');
  return du.humanize(true);
}

export const dateUtil = dayjs;
