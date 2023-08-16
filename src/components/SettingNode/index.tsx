import { CloseCircleOutlined } from '@ant-design/icons';
import { Graph, Node } from '@antv/x6';
import { css } from '@emotion/react';
import { Checkbox, Col, DatePicker, Input, Radio, Row, Select, Space, Tabs } from 'antd';
import { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const HeaderCss = css`
  text-align: right;
`;
const MainCss = css`
  background-color: #fff;
  border-radius: 4px;
  padding: 12px;
  width: 100%;
`;

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
  const { t } = useTranslation();

  const [tabActiveKey, setTabActiveKey] = useState<'Personal' | 'Clinical'>('Personal');

  const tabOptiosn = [
    {
      label: t('settingNode.tabOptiosn.Personal'),
      key: 'Personal',
    },
    {
      label: t('settingNode.tabOptiosn.Clinical'),
      key: 'Clinical',
    },
  ];
  const individualRadio = [
    {
      label: t('settingNode.PersonalOptions.IndividualIs.Alive'),
      value: 'Alive',
    },
    {
      label: t('settingNode.PersonalOptions.IndividualIs.Deceased'),
      value: 'Deceased',
    },
    {
      label: t('settingNode.PersonalOptions.IndividualIs.Unborn'),
      value: 'Unborn',
    },
    {
      label: t('settingNode.PersonalOptions.IndividualIs.Stillborn'),
      value: 'Stillborn',
    },
    {
      label: t('settingNode.PersonalOptions.IndividualIs.Miscarriage'),
      value: 'Miscarriage',
    },
    {
      label: t('settingNode.PersonalOptions.IndividualIs.Aborted'),
      value: 'Aborted',
    },
  ];

  const heredityOptions = [
    {
      label: 'None',
      value: t('settingNode.PersonalOptions.HeredityOptions.None'),
    },
    {
      label: 'Childless',
      value: t('settingNode.PersonalOptions.HeredityOptions.Childless'),
    },
    {
      label: 'Infertile',
      value: t('settingNode.PersonalOptions.HeredityOptions.Infertile'),
    },
  ];

  const [data, setData] = useState<DataTypes>({
    Gender: 'Unknown',
    DateOfBirth: null,
    DateOfDeath: null,
    AdoptedIn: false,
    GestationAge: '-',
    IndividualIs: 'Alive',
  });

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
          label: `${index} ${t('settingNode.PersonalOptions.GestationAge.week')}`,
          value: index,
        });
      }
    }
    return data;
  };

  const onChangeData = ({ key, value }: { key: string; value: string | Dayjs | null }) => {
    const newData = { ...data, [key]: value };
    setData(newData);
    graph.trigger('settingNode:change', node, newData);
  };

  return (
    <div css={MainCss}>
      <Tabs
        activeKey={tabActiveKey}
        type="card"
        size="small"
        onChange={(activeKey) => setTabActiveKey(activeKey as 'Personal' | 'Clinical')}
        items={tabOptiosn}
      />
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
      <div>
        <Space
          direction="vertical"
          css={css`
            display: flex;
          `}
        >
          {tabActiveKey === 'Personal' && (
            <>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <div>{t('settingNode.PersonalOptions.Gender.Title')}</div>
                </Col>
                <Col>
                  <Radio.Group
                    onChange={(event) => onChangeData({ key: 'Gender', value: event.target.value })}
                    value={data.Gender}
                    options={[
                      { label: t('settingNode.PersonalOptions.Gender.Male'), value: 'Male' },
                      { label: t('settingNode.PersonalOptions.Gender.Female'), value: 'Female' },
                      { label: t('settingNode.PersonalOptions.Gender.Unknown'), value: 'Unknown' },
                    ]}
                  />
                </Col>
              </Row>
              {/* name */}
              <Row gutter={[12, 8]}>
                <Col span={12}>
                  <div>{t('settingNode.PersonalOptions.FirstName')}</div>
                </Col>
                <Col span={12}>
                  <div>{t('settingNode.PersonalOptions.LastName')}</div>
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
                  <div>{t('settingNode.PersonalOptions.LastNameAtBirth')}</div>
                </Col>
                <Col span={12}>
                  <div>{t('settingNode.PersonalOptions.ExternalID')}</div>
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
                  <div>{t('settingNode.PersonalOptions.Ethnicities')}</div>
                </Col>
                <Col span={24}>
                  <Input value={data.Ethnicities} onChange={(event) => onChangeData({ key: 'Ethnicities', value: event.target.value })} />
                </Col>
              </Row>
              {(data.IndividualIs === 'Alive' || data.IndividualIs === 'Deceased') && (
                <Row gutter={[12, 8]}>
                  <Col span={12}>
                    <div>{t('settingNode.PersonalOptions.DateOfBirth')}</div>
                  </Col>
                  <Col span={12}>
                    <div>{t('settingNode.PersonalOptions.DateOfDeath')}</div>
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
                    <div>{t('settingNode.PersonalOptions.GestationAge.Title')}</div>
                  </Col>
                  <Col span={12}>
                    <Select
                      value={data.GestationAge}
                      options={gestationAgeOptions()}
                      css={css`
                        width: 100%;
                      `}
                      onChange={(event) => onChangeData({ key: 'GestationAge', value: event })}
                    />
                  </Col>
                </Row>
              )}
              <Row gutter={[12, 8]}>
                <Col span={24}>
                  <div>{t('settingNode.PersonalOptions.IndividualIs.Title')}</div>
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
                    <div>{t('settingNode.PersonalOptions.HeredityOptions.Title')}</div>
                  </Col>
                  <Col span={12}>
                    <Select
                      options={heredityOptions}
                      onChange={(event) => onChangeData({ key: 'heredityValue', value: event })}
                      value={data.heredityValue}
                      css={css`
                        width: 100%;
                      `}
                    />
                  </Col>
                  <Col span={12}>
                    <Input value={data.heredityText} onChange={(event) => onChangeData({ key: 'heredityText', value: event.target.value })} />
                  </Col>
                  <Col>
                    <Checkbox>{t('settingNode.PersonalOptions.AdoptedIn')}</Checkbox>
                  </Col>
                </Row>
              )}
            </>
          )}
          {tabActiveKey === 'Clinical' && (
            <>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <div>运营商状态</div>
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
                  />
                </Col>
              </Row>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <div>Carrier status</div>
                </Col>
                <Col>
                  <Radio.Group
                    onChange={(event) => onChangeData({ key: 'Gender', value: event.target.value })}
                    value={data.Gender}
                    options={[
                      { label: 'Not affected', value: 'Not affected' },
                      { label: 'Affected', value: 'Affected' },
                      { label: 'Carrier', value: 'Carrier' },
                      { label: 'Pre-symptomatic', value: 'Pre-symptomatic' },
                    ]}
                  />
                </Col>
                <Col>
                  <Checkbox>Documented evaluation</Checkbox>
                </Col>
              </Row>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <b>Known disorders of this individual</b>
                </Col>
                <Col span={24}>
                  <Input />
                </Col>
              </Row>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <b>Clinical symptoms: observed phenotypes</b>
                </Col>
                <Col span={24}>
                  <Input />
                </Col>
              </Row>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <b>Genotype information: candidate genes</b>
                </Col>
                <Col span={24}>
                  <Input />
                </Col>
              </Row>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <b>Comments</b>
                </Col>
                <Col span={24}>
                  <Input.TextArea />
                </Col>
              </Row>
            </>
          )}
        </Space>
      </div>
    </div>
  );
};

export default SettingNode;
