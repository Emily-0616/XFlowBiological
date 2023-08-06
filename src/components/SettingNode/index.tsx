import { CloseCircleOutlined } from '@ant-design/icons';
import { Graph, Node } from '@antv/x6';
import { css } from '@emotion/react';
import { Checkbox, Col, DatePicker, Input, Radio, Row, Select, Space } from 'antd';
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
type DataTypes = {
  Gender: 'Male' | 'Female' | 'Unknown';
  FirstName?: string;
  LastName?: string;
  LastNameAtBirth?: string;
  ExternalID?: string;
  Ethnicities?: string;
  DateOfBirth: Dayjs | null;
  DateOfDeath: Dayjs | null;
  IndividualIs?: IndividualTypes;
  heredityValue?: HeredityTypes;
  heredityText?: string;
  AdoptedIn: boolean;
  GestationAge?: string;
};
const SettingNode = ({ node, graph }: { node: Node<Node.Properties>; graph: Graph }) => {
  const [data, setData] = useState<DataTypes>({
    Gender: 'Unknown',
    DateOfBirth: null,
    DateOfDeath: null,
    AdoptedIn: false,
    GestationAge: '-',
    IndividualIs: 'Alive',
  });

  const onChangeData = ({ key, value }: { key: string; value: string | Dayjs | null }) => {
    const newData = { ...data, [key]: value };
    setData(newData);
    graph.trigger('settingNode:change', node, newData);
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
              <Radio.Group
                onChange={(event) => onChangeData({ key: 'Gender', value: event.target.value })}
                value={data.Gender}
                options={[
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Unknown', value: 'Unknown' },
                ]}
              ></Radio.Group>
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
              <Input value={data.FirstName} onChange={(event) => onChangeData({ key: 'FirstName', value: event.target.value })} />
            </Col>
            <Col span={12}>
              <Input value={data.LastName} onChange={(event) => onChangeData({ key: 'LastName', value: event.target.value })} />
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
              <Input value={data.LastNameAtBirth} onChange={(event) => onChangeData({ key: 'LastName', value: event.target.value })} />
            </Col>
            <Col span={12}>
              <Input value={data.ExternalID} onChange={(event) => onChangeData({ key: 'ExternalID', value: event.target.value })} />
            </Col>
          </Row>
          <Row gutter={[12, 8]}>
            <Col span={24}>
              <div>种族</div>
            </Col>
            <Col span={24}>
              <Input value={data.Ethnicities} onChange={(event) => onChangeData({ key: 'Ethnicities', value: event.target.value })} />
            </Col>
          </Row>
          {(data.IndividualIs === 'Alive' || data.IndividualIs === 'Deceased') && (
            <Row gutter={[12, 8]}>
              <Col span={12}>
                <div>出生日期</div>
              </Col>
              <Col span={12}>
                <div>死亡日期</div>
              </Col>
              <Col span={12}>
                <DatePicker
                  value={data.DateOfBirth}
                  css={css`
                    width: 100%;
                  `}
                  onChange={(event) => onChangeData({ key: 'Ethnicities', value: event })}
                />
              </Col>
              <Col span={12}>
                <DatePicker
                  value={data.DateOfDeath}
                  css={css`
                    width: 100%;
                  `}
                  onChange={(event) => onChangeData({ key: 'DateOfDeath', value: event })}
                />
              </Col>
            </Row>
          )}
          {data.IndividualIs !== 'Alive' && data.IndividualIs !== 'Deceased' && (
            <Row gutter={[12, 8]}>
              <Col span={24}>
                <div>孕龄</div>
              </Col>
              <Col span={12}>
                <Select
                  value={data.GestationAge}
                  options={gestationAgeOptions()}
                  css={css`
                    width: 100%;
                  `}
                  onChange={(event) => onChangeData({ key: 'GestationAge', value: event })}
                ></Select>
              </Col>
            </Row>
          )}
          <Row gutter={[12, 8]}>
            <Col span={24}>
              <div>个人是</div>
            </Col>
            <Col span={24}>
              <Radio.Group
                options={individualRadio}
                value={data.IndividualIs}
                onChange={(event) => {
                  if (event.target.value === 'Deceased' || event.target.value === 'Alive') {
                    data.GestationAge = '-';
                  }
                  onChangeData({ key: 'IndividualIs', value: event.target.value });
                }}
              />
            </Col>
          </Row>

          {(data.IndividualIs === 'Alive' || data.IndividualIs === 'Deceased') && (
            <Row gutter={[12, 8]}>
              <Col span={24}>
                <div>Heredity options</div>
              </Col>
              <Col span={12}>
                <Select
                  options={heredityOptions}
                  onChange={(event) => onChangeData({ key: 'heredityValue', value: event })}
                  value={data.heredityValue}
                  css={css`
                    width: 100%;
                  `}
                ></Select>
              </Col>
              <Col span={12}>
                <Input value={data.heredityText} onChange={(event) => onChangeData({ key: 'heredityText', value: event.target.value })} />
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
