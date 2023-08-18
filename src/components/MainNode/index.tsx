import { Graph, Node } from '@antv/x6';
import { css } from '@emotion/react';
import { Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DataTypes } from '../../pages';
import { isExceedingMonth, isExceedingYear, isFuture, isWithinMonth } from '../../utils/dateDiff';

const ShapeRender = ({ Gender }: { Gender: string }) => {
  if (Gender === 'Female') {
    return (
      <div
        css={css`
          width: 60px;
          height: 60px;
          border: 2px solid #5c5c66;
          /* border-radius: 8px; */
          border-radius: 50%;
        `}></div>
    );
  }
  if (Gender === 'Male') {
    return (
      <div
        css={css`
          width: 60px;
          height: 60px;
          border: 2px solid #5c5c66;
          /* border-radius: 50%; */
          border-radius: 8px;
        `}></div>
    );
  }
  if (Gender === 'Unknown') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 100 100">
        <polygon points="50,0 100,50 50,100 0,50" stroke="#5c5c66" fillOpacity="0" strokeWidth="3" />
      </svg>
    );
  }
  return <></>;
};
const DateRender = ({ DateOfBirth, DateOfDeath }: { DateOfBirth: Dayjs | null; DateOfDeath: Dayjs | null }) => {
  const { t } = useTranslation();
  // 如果有死亡时间优先显示
  if (DateOfDeath) {
    // 如果有出生日期则配搭显示，否则默认显示死亡时间
    if (DateOfBirth) {
      const d = DateOfDeath.diff(DateOfBirth, 'd');
      const m = DateOfDeath.diff(DateOfBirth, 'months');
      return (
        <div
          css={css`
            white-space: nowrap;
          `}>
          d. {dayjs(DateOfDeath).format('YYYY')}
          {isWithinMonth(DateOfBirth, DateOfDeath) && ` (${d}${t('Common.date.days')})`}
          {isExceedingMonth(DateOfBirth, DateOfDeath) && ` (${m}${t('Common.date.months')})`}
        </div>
      );
    } else {
      return <>d. {dayjs(DateOfDeath).format('YYYY')}</>;
    }
  }
  // 如果只有出生时间
  if (DateOfBirth) {
    // 如果是一年前或未来，则显示  b.某年
    if (isFuture(DateOfBirth, dayjs()) || isExceedingYear(DateOfBirth, dayjs())) {
      return <div>b. {DateOfBirth.format('YYYY')}</div>;
    }
    // 如果是一个月前，则显示 b.某年(已出生几个月)
    if (isExceedingMonth(DateOfBirth, dayjs())) {
      const m = dayjs().diff(DateOfBirth, 'months');
      return (
        <div
          css={css`
            white-space: nowrap;
          `}>
          b. {DateOfBirth.format('YYYY')} ({m} {t('Common.date.months')})
        </div>
      );
    }
    // 如果是一个月内，则显示 多少天前
    if (isWithinMonth(DateOfBirth, dayjs())) {
      const d = dayjs().diff(DateOfBirth, 'days');
      return (
        <div>
          {d} {t('Common.date.days')}
        </div>
      );
    }
  }
  return <></>;
};
const MainNode = ({ node }: { node: Node<Node.Properties>; graph: Graph }) => {
  const data: DataTypes = node.data;
  const { t } = useTranslation();
  return (
    <>
      <ShapeRender Gender={data.Gender} />
      <Space
        direction="vertical"
        size="small"
        css={css`
          text-align: center;
          display: flex;
        `}>
        {data.Name}
        <DateRender DateOfBirth={data.DateOfBirth} DateOfDeath={data.DateOfDeath} />
        {data.IndividualIs === 'Stillborn' && 'SB'}
        {data.GestationAge !== '-' && ` ${data.GestationAge} ${t('Common.date.week')}`}
      </Space>
    </>
  );
};
export default MainNode;
