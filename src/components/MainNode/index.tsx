import { Graph, Node } from '@antv/x6';
import { css } from '@emotion/react';
import { Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DataTypes } from '../../pages';
import { isExceedingMonth, isExceedingYear, isFuture, isWithinMonth } from '../../utils/dateDiff';

const ShapeRender = ({ Gender, Proband }: { Gender: string; Proband: boolean }) => {
  return (
    <>
      {Gender === 'Female' && (
        <div
          css={css`
            width: 60px;
            height: 60px;
            border: ${Proband ? '4px' : '2px'} solid #5c5c66;
            /* border-radius: 8px; */
            border-radius: 50%;
          `}></div>
      )}
      {Gender === 'Male' && (
        <div
          css={css`
            width: 60px;
            height: 60px;
            border: ${Proband ? '4px' : '2px'} solid #5c5c66;
            /* border-radius: 50%; */
            border-radius: 8px;
          `}></div>
      )}
      {Gender === 'Unknown' && (
        <div
          css={css`
            width: 60px;
            height: 60px;
            background-color: transparent;
            transform: scale(0.8) rotate(45deg);
            margin: 0 auto;

            border: ${Proband ? '4px' : '2px'} solid #5c5c66;
          `}></div>
      )}
      {Proband && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 1024 1024"
          css={css`
            position: absolute;
            left: -15px;
            bottom: -10px;
          `}>
          <path
            d="M301.8 800.5c-14 14-37.3 13.5-51.9-1.1-13.6-13.6-13.9-35.9 0-49.5l402.1-402.1c13.6-13.6 35.9-13.9 49.5 0 14 14 13.5 37.3-1.1 51.9L301.8 800.5z"
            fill="#000"
          />
          <path
            d="M789.6 697.4c0 20.7-16.8 37.5-37.5 37.5-20.5 0-37.2-16.5-37.5-36.9V299.7c0-20.7 16.8-37.5 37.5-37.5 20.5 0 37.2 16.5 37.5 36.9v401.3z"
            fill="#000"
          />
          <path
            d="M352.2 333.4c-20.7 0-37.5-16.8-37.5-37.5 0-20.5 16.5-37.2 36.9-37.5h400.7c20.7 0 37.5 16.8 37.5 37.5 0 20.5-16.5 37.2-36.9 37.5H352.2z"
            fill="#000"
          />
        </svg>
      )}
    </>
  );
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
      <ShapeRender Gender={data.Gender} Proband={data.Proband} />
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
