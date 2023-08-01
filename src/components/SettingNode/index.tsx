import { CloseCircleOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import { css } from '@emotion/react';
import { Checkbox, Col, DatePicker, Input, Radio, RadioChangeEvent, Row, Select, Space } from 'antd';
import { Dayjs } from 'dayjs';
import { useState } from 'react';

const HeaderCss = css`
  text-align: right;
`;
const MainCss = css`
  background-color: #fff;
  border-radius: 4px;
  padding: 12px;
  width: 100%;
`;

const ContentCss = css``;

const individualRadio = [
  {
    label: 'Alive',
    value: 'Alive',
  },
  {
    label: 'Deceased',
    value: 'Deceased',
  },
  {
    label: 'Unborn',
    value: 'Unborn',
  },
  {
    label: 'Stillborn',
    value: 'Stillborn',
  },
  {
    label: 'Miscarriage',
    value: 'Miscarriage',
  },
  {
    label: 'Aborted',
    value: 'Aborted',
  },
];

const heredityOptions = [
  {
    label: 'None',
    value: 'None',
  },
  {
    label: 'Childless',
    value: 'Childless',
  },
  {
    label: 'Infertile',
    value: 'Infertile',
  },
];
const gestationAgeOptions = () => {
  const data = [];
  for (let index = 0; index < 51; index++) {
    if (index === 0) {
      data.push({
        label: '-',
        value: '-',
      });
    } else {
      data.push({
        label: `${index} weeks`,
        value: index,
      });
    }
  }
  return data;
};
type HeredityTypes = 'None' | 'Childless' | 'Infertile';
type IndividualTypes = 'Alive' | 'Deceased' | 'Unborn' | 'Stillborn' | 'Miscarriage' | 'Aborted';
const SettingNode = ({ node, graph }: { node: Node; graph: Graph }) => {
  const [radioValue, setRadioValue] = useState(0);
  const [individualValue, setIndividualValue] = useState<IndividualTypes>('Alive');
  const [heredityValue, setHeredityValue] = useState<HeredityTypes>('None');
  const [birthDate, setBirthDate] = useState<Dayjs | null>(null);
  const [deathDate, setDeathDate] = useState<Dayjs | null>(null);
  const radioChange = (event: RadioChangeEvent) => {
    setRadioValue(event.target.value);
  };

  const individualChange = (event: RadioChangeEvent) => {
    setIndividualValue(event.target.value);
  };
  const heredityChange = (value: HeredityTypes) => {
    setHeredityValue(value);
  };

  const birthDatePickerChange = (event: Dayjs | null) => {
    setBirthDate(event);
  };

  const deathDatePickerChange = (event: Dayjs | null) => {
    setDeathDate(event);
  };

  return (
    <div css={MainCss}>
      <div css={HeaderCss} id="close">
        <CloseCircleOutlined
          onClick={() => {
            graph.trigger('settingNode:delete', node);
          }}
          css={css`
            cursor: pointer;
          `}
        />
      </div>
      <div css={ContentCss}>
        <Space
          direction="vertical"
          css={css`
            display: flex;
          `}
        >
          <Row gutter={[0, 8]}>
            <Col span={24}>
              <div>性别</div>
            </Col>
            <Col>
              <Radio.Group onChange={radioChange} value={radioValue}>
                <Radio value={0}>男性</Radio>
                <Radio value={1}>女性</Radio>
                <Radio value={2}>未知</Radio>
              </Radio.Group>
            </Col>
          </Row>
          {/* name */}
          <Row gutter={[12, 8]}>
            <Col span={12}>
              <div>名</div>
            </Col>
            <Col span={12}>
              <div>姓</div>
            </Col>
            <Col span={12}>
              <Input />
            </Col>
            <Col span={12}>
              <Input />
            </Col>
          </Row>
          <Row gutter={[12, 8]}>
            <Col span={12}>
              <div>出生时的姓</div>
            </Col>
            <Col span={12}>
              <div>外部ID</div>
            </Col>
            <Col span={12}>
              <Input />
            </Col>
            <Col span={12}>
              <Input />
            </Col>
          </Row>
          <Row gutter={[12, 8]}>
            <Col span={24}>
              <div>种族</div>
            </Col>
            <Col span={24}>
              <Input />
            </Col>
          </Row>
          {(individualValue === 'Alive' || individualValue === 'Deceased') && (
            <Row gutter={[12, 8]}>
              <Col span={12}>
                <div>出生日期</div>
              </Col>
              <Col span={12}>
                <div>死亡日期</div>
              </Col>
              <Col span={12}>
                <DatePicker
                  onChange={birthDatePickerChange}
                  value={birthDate}
                  css={css`
                    width: 100%;
                  `}
                />
              </Col>
              <Col span={12}>
                <DatePicker
                  onChange={deathDatePickerChange}
                  value={deathDate}
                  css={css`
                    width: 100%;
                  `}
                />
              </Col>
            </Row>
          )}
          {individualValue !== 'Alive' && individualValue !== 'Deceased' && (
            <Row gutter={[12, 8]}>
              <Col span={24}>
                <div>孕龄</div>
              </Col>
              <Col span={12}>
                <Select
                  options={gestationAgeOptions()}
                  css={css`
                    width: 100%;
                  `}
                ></Select>
              </Col>
            </Row>
          )}
          <Row gutter={[12, 8]}>
            <Col span={24}>
              <div>个人是</div>
            </Col>
            <Col span={12}>
              <Radio.Group options={individualRadio} onChange={individualChange} value={individualValue} />
            </Col>
          </Row>

          {(individualValue === 'Alive' || individualValue === 'Deceased') && (
            <Row gutter={[12, 8]}>
              <Col span={24}>
                <div>Heredity options</div>
              </Col>
              <Col span={12}>
                <Select
                  options={heredityOptions}
                  onChange={heredityChange}
                  value={heredityValue}
                  css={css`
                    width: 100%;
                  `}
                ></Select>
              </Col>
              <Col span={12}>
                <Input />
              </Col>
              <Col>
                <Checkbox>Adopted in</Checkbox>
              </Col>
            </Row>
          )}
        </Space>
      </div>
    </div>
  );
};

export default SettingNode;
