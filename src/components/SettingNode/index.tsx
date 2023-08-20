import { CloseCircleOutlined } from '@ant-design/icons';
import { Graph, Node } from '@antv/x6';
import { css } from '@emotion/react';
import { Checkbox, Col, DatePicker, Input, Radio, Row, Select, Space, Tabs } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTypes } from '../../pages';
const HeaderCss = css`
  text-align: right;
`;
const MainCss = css`
  background-color: #fff;
  border-radius: 4px;
  padding: 12px;
  width: 100%;
`;

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
      label: t('settingNode.PersonalOptions.HeredityOptions.None'),
      value: 'None',
    },
    {
      label: t('settingNode.PersonalOptions.HeredityOptions.Childless'),
      value: 'Childless',
    },
    {
      label: t('settingNode.PersonalOptions.HeredityOptions.Infertile'),
      value: 'Infertile',
    },
  ];

  const data: DataTypes = node.getData();
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
          label: `${index} ${t('Common.date.week')}`,
          value: index,
        });
      }
    }
    return data;
  };

  const onChangeData = ({ key, value }: { key: string; value: string | dayjs.Dayjs | null | boolean }) => {
    const newData = { ...data, [key]: value };
    graph.trigger('settingNode:change', node, newData);
  };

  const DateOfBirthDisabledDate = (currentDate: Dayjs) => {
    if (data.DateOfDeath) {
      return currentDate.isAfter(dayjs(data.DateOfDeath), 'days');
    } else {
      return false;
    }
  };
  const DateOfDeathDisabledDate = (currentDate: Dayjs) => {
    if (data.DateOfBirth) {
      return currentDate.isBefore(dayjs(data.DateOfBirth), 'days');
    } else {
      return false;
    }
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
      <Tabs
        activeKey={tabActiveKey}
        type="card"
        size="small"
        onChange={(activeKey) => setTabActiveKey(activeKey as 'Personal' | 'Clinical')}
        items={tabOptiosn}
      />

      <div>
        <Space
          direction="vertical"
          css={css`
            display: flex;
          `}>
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
                <Col span={24}>
                  <div>{t('settingNode.PersonalOptions.Name')}</div>
                </Col>
                <Col span={24}>
                  <Input
                    value={data.Name}
                    onChange={(event) => onChangeData({ key: 'Name', value: event.target.value })}
                  />
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
                      disabledDate={DateOfBirthDisabledDate}
                      placeholder={t('settingNode.PersonalOptions.DatePlaceholder')}
                      value={data.DateOfBirth}
                      css={css`
                        width: 100%;
                      `}
                      onChange={(event) => onChangeData({ key: 'DateOfBirth', value: event })}
                    />
                  </Col>
                  <Col span={12}>
                    <DatePicker
                      disabledDate={DateOfDeathDisabledDate}
                      placeholder={t('settingNode.PersonalOptions.DatePlaceholder')}
                      value={data.DateOfDeath}
                      css={css`
                        width: 100%;
                      `}
                      onChange={(event) => {
                        graph.trigger('settingNode:change', node, {
                          ...data,
                          DateOfDeath: event,
                          IndividualIs: 'Deceased',
                        });
                      }}
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
                    <Input
                      disabled={data.heredityValue === 'None'}
                      value={data.heredityText}
                      onChange={(event) => onChangeData({ key: 'heredityText', value: event.target.value })}
                    />
                  </Col>
                  <Col>
                    <Checkbox
                      checked={data.AdoptedIn}
                      onChange={(event) => onChangeData({ key: 'AdoptedIn', value: event.target.checked })}>
                      {t('settingNode.PersonalOptions.AdoptedIn')}
                    </Checkbox>
                  </Col>
                </Row>
              )}
            </>
          )}
          {tabActiveKey === 'Clinical' && (
            <>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <div>{t('settingNode.ClinicalOptions.CarrierStatus.Title')}</div>
                </Col>
                <Col>
                  <Radio.Group
                    onChange={(event) => onChangeData({ key: 'CarrierStatus', value: event.target.value })}
                    value={data.CarrierStatus}
                    options={[
                      { label: t('settingNode.ClinicalOptions.CarrierStatus.NotAffected'), value: 'NotAffected' },
                      { label: t('settingNode.ClinicalOptions.CarrierStatus.Affected'), value: 'Affected' },
                      { label: t('settingNode.ClinicalOptions.CarrierStatus.Carrier'), value: 'Carrier' },
                      {
                        label: t('settingNode.ClinicalOptions.CarrierStatus.PreSymptomatic'),
                        value: 'PreSymptomatic',
                        disabled: data.IndividualIs === 'Miscarriage' || data.IndividualIs === 'Aborted',
                      },
                    ]}
                  />
                </Col>
                <Col>
                  <Checkbox
                    checked={data.DocumentedEvaluation}
                    onChange={(event) => onChangeData({ key: 'DocumentedEvaluation', value: event.target.checked })}>
                    {t('settingNode.ClinicalOptions.DocumentedEvaluation')}
                  </Checkbox>
                </Col>
              </Row>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <b>{t('settingNode.ClinicalOptions.KnownDisordersOfThisIndividual')}</b>
                </Col>
                <Col span={24}>
                  <Input
                    value={data.KnownDisordersOfThisIndividual}
                    onChange={(event) =>
                      onChangeData({ key: 'KnownDisordersOfThisIndividual', value: event.target.value })
                    }
                  />
                </Col>
              </Row>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <b>{t('settingNode.ClinicalOptions.ClinicalSymptomsObservedPhenotypes')}</b>
                </Col>
                <Col span={24}>
                  <Input
                    value={data.ClinicalSymptomsObservedPhenotypes}
                    onChange={(event) =>
                      onChangeData({ key: 'ClinicalSymptomsObservedPhenotypes', value: event.target.value })
                    }
                  />
                </Col>
              </Row>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <b>{t('settingNode.ClinicalOptions.GenotypeInformationCandidateGenes')}</b>
                </Col>
                <Col span={24}>
                  <Input
                    value={data.GenotypeInformationCandidateGenes}
                    onChange={(event) =>
                      onChangeData({ key: 'GenotypeInformationCandidateGenes', value: event.target.value })
                    }
                  />
                </Col>
              </Row>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <b>{t('settingNode.ClinicalOptions.Comments')}</b>
                </Col>
                <Col span={24}>
                  <Input.TextArea
                    value={data.Comments}
                    onChange={(event) => onChangeData({ key: 'Comments', value: event.target.value })}
                  />
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
