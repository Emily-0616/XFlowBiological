import { ExclamationCircleFilled, SaveOutlined } from '@ant-design/icons';
import { EventArgs, Graph, Node } from '@antv/x6';
import { Export } from '@antv/x6-plugin-export';
import { History } from '@antv/x6-plugin-history';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { register } from '@antv/x6-react-shape';
import { css } from '@emotion/react';
import { Button, Dropdown, Modal, Space, Tooltip, Upload } from 'antd';
import { Dayjs } from 'dayjs';
import fs from 'file-saver';
import i18next from 'i18next';
import { useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import CustomDeleteLabel from '../components/CustomDeleteLabel';
import MainNode from '../components/MainNode';
import SettingNode from '../components/SettingNode';
import { ports } from '../data/default';
import { updateSearchParams } from '../utils/updateSearchParams';

/** @description 新增兄弟节点时判断输出什么属性 */
enum AddNodeGenderMap {
  'Unknown' = 'Unknown',
  'Male' = 'Female',
  'Female' = 'Male',
}

type labelKey = 'CustomDeleteLabel' | 'CustomDeleteLabel_bottom';

interface NodeRecord {
  id: string; // 传到渲染 label 组件那条边的 id ，作为 key 去查找
  nodeList: string[];
  edgeList: string[];
  parentNodeID?: string;
}

type HeredityTypes = 'None' | 'Childless' | 'Infertile';
type IndividualTypes = 'Alive' | 'Deceased' | 'Unborn' | 'Stillborn' | 'Miscarriage' | 'Aborted';
type CarrierStatusTypes = 'NotAffected' | 'Affected' | 'Carrier' | 'PreSymptomatic';
export type DataTypes = {
  Gender: 'Male' | 'Female' | 'Unknown';
  Name?: string;
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
  CarrierStatus?: CarrierStatusTypes;
  DocumentedEvaluation: boolean;
  Proband?: boolean;
  Comments?: string;
  KnownDisordersOfThisIndividual?: string;
  ClinicalSymptomsObservedPhenotypes?: string;
  GenotypeInformationCandidateGenes?: string;
};

// 这个调用需要在组件外进行。
register({
  shape: 'MainNode',
  width: 40,
  height: 40,
  component: MainNode,
});

register({
  shape: 'SettingNode',
  width: 400,
  component: SettingNode,
  attrs: {
    node: {
      event: 'node:delete',
    },
  },
  effect: ['data'],
});

// 点击连接桩生成的 MainNode 尺寸
const CREATE_NODE_SIZE = {
  width: 60,
  height: 60,
};

const SETTING_INIT_DATA: DataTypes = {
  Gender: 'Unknown',
  DateOfBirth: null,
  DateOfDeath: null,
  AdoptedIn: false,
  GestationAge: '-',
  IndividualIs: 'Alive',
  Name: '',
  CarrierStatus: 'NotAffected',
  DocumentedEvaluation: false,
};

const Index = () => {
  const graphRef = useRef<Graph | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | undefined>(undefined);
  const settingNodeRef = useRef<Node | undefined>(undefined);
  const selectNodeRef = useRef<Node | undefined>(undefined);
  const nodeRecordRef = useRef<NodeRecord[]>([]);
  const deleteRecordRef = useRef<NodeRecord[]>([]);
  // 第一个创建的节点
  const baseNodeRef = useRef<Node | undefined>(undefined);

  const clearNode = () => {
    settingNodeRef.current = undefined;
    selectNodeRef.current = undefined;
  };

  // 从记录里查找哪个项的 patentID 和传入的 id 对应
  const recursionRecord = (parentID: string) => {
    const deleteArray = deleteRecordRef.current;
    const items = nodeRecordRef.current.filter((item) => item.parentNodeID === parentID);
    if (!!items?.length) {
      deleteRecordRef.current = [...deleteArray.concat(items)];
      // 从记录中移除
      items.forEach((item) => {
        const copied = nodeRecordRef.current.filter((node) => node.id !== item.id);
        nodeRecordRef.current = [...copied];
      });
    } else {
      return;
    }

    items.forEach((item) => {
      item.nodeList.forEach((node) => {
        recursionRecord(node);
      });
    });
  };

  const deleteNode = (id: string) => {
    const findDeleteItem = nodeRecordRef.current.find((item) => item.id === id);
    if (settingNodeRef.current) {
      graphRef.current?.removeNode(settingNodeRef.current.id);
      clearNode();
    }
    Modal.confirm({
      title: `确认删除该连接线${!!findDeleteItem?.nodeList?.length ? '与对应的节点' : ''}吗？`,
      icon: <ExclamationCircleFilled />,
      onOk() {
        try {
          deleteRecordRef.current = [findDeleteItem!];
          // 查找子孙记录
          findDeleteItem?.nodeList.forEach((node) => {
            recursionRecord(node);
          });
          // 删除直接记录中的线
          findDeleteItem?.edgeList.forEach((edge) => {
            graphRef.current?.removeEdge(edge);
          });
          // 删除关联记录中的节点
          deleteRecordRef.current.forEach((item) => {
            item.nodeList.forEach((node) => {
              graphRef.current?.removeNode(node);
            });
          });
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  const pushNodeRecord = (addItem: NodeRecord) => {
    const copied = nodeRecordRef.current;
    copied.push(addItem);
    nodeRecordRef.current = [...copied];
  };

  // 点击连接桩生成节点，动态修改gender 默认值
  const createNode = (x: number, y: number, gender: string, graph: Graph): Node<Node.Properties> => {
    return graph.addNode({
      shape: 'MainNode',
      x,
      y,
      size: CREATE_NODE_SIZE,
      data: { ...SETTING_INIT_DATA, Gender: gender, heredityValue: 'None' },
      ports: { ...ports },
    });
  };
  const containerRefCallback = useCallback((node: any) => {
    if (node) {
      containerRef.current = node;
      graphRef.current = new Graph({
        container: node,
        connecting: {
          router: 'manhattan',
          connector: {
            name: 'rounded',
            args: {
              radius: 8,
            },
          },
          anchor: 'center',
          connectionPoint: 'anchor',
          allowBlank: false,
          allowNode: false,
          snap: {
            radius: 20,
          },
          // createEdge() {
          //   return new Shape.Edge({
          //     attrs: {
          //       line: {
          //         stroke: '#A2B1C3',
          //         strokeWidth: 2,
          //         targetMarker: {
          //           name: 'block',
          //           width: 12,
          //           height: 8,
          //         },
          //       },
          //     },
          //     zIndex: 0,
          //   });
          // },
          validateConnection({ sourceCell, targetCell }) {
            if (sourceCell?.id === targetCell?.id) {
              return false;
            }
            return true;
          },
        },
        highlighting: {
          magnetAdsorbed: {
            name: 'stroke',
            args: {
              attrs: {
                fill: '#5F95FF',
                stroke: '#5F95FF',
              },
            },
          },
        },
        panning: {
          enabled: true,
          modifiers: 'Ctrl',
        },
        mousewheel: {
          modifiers: 'Ctrl',
          enabled: true,
          maxScale: 4,
          minScale: 0.2,
        },
        autoResize: true,
        background: {
          color: '#F2F7FA',
        },
        grid: {
          visible: true,
          type: 'doubleMesh',
          args: [
            {
              color: '#eee', // 主网格线颜色
              thickness: 1, // 主网格线宽度
            },
            {
              color: '#ddd', // 次网格线颜色
              thickness: 1, // 次网格线宽度
              factor: 4, // 主次网格线间隔
            },
          ],
        },
        interacting: () => ({
          edgeLabelMovable: false,
          nodeMovable: (event) => {
            return event.cell.shape === 'SettingNode' ? false : true;
          },
        }),
        onEdgeLabelRendered: (args) => {
          // 通过 foreignObject 插入 react 节点 生成自定义 label
          // 避免被遮挡 需要控制生成 label 的线条渲染顺序排最后
          const { selectors, label, edge } = args;
          const content = selectors.foContent as HTMLDivElement;
          if (content && (label.data === 'CustomDeleteLabel' || label.data === 'CustomDeleteLabel_bottom')) {
            content.style.display = 'flex';
            content.style.alignItems = 'center';
            content.style.justifyContent = 'center';
            content.style.width = '20px';
            content.style.height = '20px';
            content.style.outline = 'none';
            content.style.padding = '2px';
            content.style.background = '#f2f7fa';
            content.style.transform =
              label.data === 'CustomDeleteLabel' ? 'translate(0px,-10px)' : 'translate(-10px, -40px)';
            ReactDOM.createRoot(content).render(<CustomDeleteLabel id={edge.id} onDelete={deleteNode} />);
          }
        },
      });

      graphRef.current
        .use(new Export())
        .use(
          new Snapline({
            enabled: true,
          })
        )
        .use(
          new History({
            enabled: true,
          })
        )
        .use(
          new Selection({
            enabled: true,
            showNodeSelectionBox: true,
            filter(cell) {
              return cell.shape !== 'SettingNode';
            },
          })
        )
        .use(
          new Keyboard({
            enabled: true,
            global: true,
          })
        );
      // 初始化节点
      baseNodeRef.current = graphRef.current.addNode({
        shape: 'MainNode',
        x: node.clientWidth / 2,
        y: node.clientHeight / 2,
        size: {
          width: 60,
          height: 60,
        },
        ports: { ...ports },
        data: { ...SETTING_INIT_DATA, Proband: true, heredityValue: 'None' },
      });

      const addEdge = (
        sourceCell: string,
        sourcePortId: string | undefined,
        targetCell: string,
        targetPortId: string | undefined,
        labelOption?: { position: number; data: labelKey }
      ) => {
        const edge = graphRef.current?.addEdge({
          source: { cell: sourceCell, port: sourcePortId },
          target: { cell: targetCell, port: targetPortId },
          vertices: [],
          connector: 'normal',
        });
        labelOption &&
          edge?.appendLabel({
            markup: [{ tagName: 'foreignObject', selector: 'foContent' }],
            data: labelOption.data,
            position: labelOption.position,
          });
        return edge;
      };

      // 增加节点追踪的线
      const traceEdge = (
        sourceCell: string,
        sourcePortId: string | undefined,
        targetCell: string,
        targetPortId: string | undefined
      ) => {
        graphRef.current?.addEdge({
          source: { cell: sourceCell, port: sourcePortId },
          target: { cell: targetCell, port: targetPortId },
          attrs: {
            line: {
              sourceMarker: '',
              targetMarker: '',
              stroke: '#f2f7fa',
              strokeWidth: 0,
            },
          },
        });
      };

      // 点击连接桩生成节点
      const createParentNode = (child: EventArgs['node:port:click']) => {
        const { id: parentNodeID } = child.node;
        const { x, y } = child.cell.position();
        const currentPorts = child.cell.ports.items.find((item) => item.id === child.port);
        // 点击上方连接桩
        if (currentPorts?.group === 'top') {
          const maleNode = createNode(x - 100, y - 150, 'Male', graphRef.current!);
          const femaleNode = createNode(x + 100, y - 150, 'Female', graphRef.current!);
          traceEdge(
            maleNode.id,
            maleNode.ports.items.find((item) => item.group === 'right')?.id,
            femaleNode.id,
            femaleNode.ports.items.find((item) => item.group === 'left')?.id
          );
          const edge2 = addEdge(
            femaleNode.id,
            femaleNode.ports.items.find((item) => item.group === 'left')?.id,
            child.cell.id,
            child.port
          );
          const edge1 = addEdge(
            maleNode.id,
            maleNode.ports.items.find((item) => item.group === 'right')?.id,
            child.cell.id,
            child.port,
            {
              position: 60,
              data: 'CustomDeleteLabel',
            }
          );

          edge1?.id &&
            edge2?.id &&
            pushNodeRecord({
              id: edge1.id,
              nodeList: [maleNode.id, femaleNode.id],
              edgeList: [edge1.id, edge2.id],
              parentNodeID,
            });
        }
        // 点击右侧连接桩
        if (currentPorts?.group === 'right') {
          const brotherNode = createNode(
            x + 200,
            y,
            AddNodeGenderMap[child.node.data?.Gender as AddNodeGenderMap],
            graphRef.current!
          );
          const childNode = createNode(x + 100, y + 150, 'Unknown', graphRef.current!);
          traceEdge(
            child.cell.id,
            child.port,
            brotherNode.id,
            brotherNode.ports.items.find((item) => item.group === 'left')?.id
          );
          const edge2 = addEdge(
            brotherNode.id,
            brotherNode.ports.items.find((item) => item.group === 'left')?.id,
            childNode.id,
            childNode.ports.items.find((item) => item.group === 'top')?.id
          );
          const edge1 = addEdge(
            child.cell.id,
            child.port,
            childNode.id,
            childNode.ports.items.find((item) => item.group === 'top')?.id,
            {
              position: 60,
              data: 'CustomDeleteLabel',
            }
          );

          edge1?.id &&
            edge2?.id &&
            pushNodeRecord({
              id: edge1.id,
              nodeList: [brotherNode.id, childNode.id],
              edgeList: [edge1.id, edge2.id],
              parentNodeID,
            });
        }
        // 点击左侧连接桩
        if (currentPorts?.group === 'left') {
          const brotherNode = createNode(
            x - 200,
            y,
            AddNodeGenderMap[child.node.data?.Gender as AddNodeGenderMap],
            graphRef.current!
          );
          const childNode = createNode(x - 100, y + 150, 'Unknown', graphRef.current!);
          traceEdge(
            child.cell.id,
            child.port,
            brotherNode.id,
            brotherNode.ports.items.find((item) => item.group === 'right')?.id
          );
          const edge1 = addEdge(
            child.cell.id,
            child.port,
            childNode.id,
            childNode.ports.items.find((item) => item.group === 'top')?.id
          );
          const edge2 = addEdge(
            brotherNode.id,
            brotherNode.ports.items.find((item) => item.group === 'right')?.id,
            childNode.id,
            childNode.ports.items.find((item) => item.group === 'top')?.id,
            {
              position: 60,
              data: 'CustomDeleteLabel',
            }
          );

          edge1?.id &&
            edge2?.id &&
            pushNodeRecord({
              id: edge2.id,
              nodeList: [brotherNode.id, childNode.id],
              edgeList: [edge1.id, edge2.id],
              parentNodeID,
            });
        }
        // 点击下方连接桩
        if (currentPorts?.group === 'bottom') {
          const childNode = createNode(x, y + 150, 'Unknown', graphRef.current!);
          const edge = addEdge(
            child.cell.id,
            child.port,
            childNode.id,
            childNode.ports.items.find((item) => item.group === 'top')?.id,
            {
              position: 60,
              data: 'CustomDeleteLabel_bottom',
            }
          );

          edge?.id &&
            pushNodeRecord({
              id: edge.id,
              nodeList: [childNode.id],
              edgeList: [edge.id],
              parentNodeID,
            });
        }
      };

      // graphRef.current.fromJSON(data); // 渲染元素
      graphRef.current.centerContent(); // 居中显示
      // 控制连接桩显示/隐藏
      const showPorts = (allNodes: any, show: boolean) => {
        for (let i = 0, len = allNodes.length; i < len; i += 1) {
          for (let index = 0; index < allNodes[i].getPorts().length; index++) {
            const items = allNodes[i].getPorts()[index];
            allNodes[i].portProp(items.id, 'attrs/circle', {
              style: {
                visibility: show ? 'visible' : 'hidden',
              },
            });
          }
        }
      };
      graphRef.current.on('node:mouseenter', (event) => {
        if (event.cell.shape === 'MainNode') {
          showPorts(graphRef.current?.getNodes(), true);
        } else {
          showPorts(graphRef.current?.getNodes(), false);
        }
      });
      graphRef.current.on('node:mouseleave', () => {
        showPorts(graphRef.current?.getNodes(), false);
      });
      graphRef.current.on('node:selected', (event) => {
        selectNodeRef.current = event.node;
        // 判断是否存在seetingNode 存在则修改定位跟data。否则则生成节点
        if (settingNodeRef.current) {
          settingNodeRef.current.setPosition({ x: event.node.position().x + 80, y: event.node.position().y });
          settingNodeRef.current.setData(event.cell.data);
        } else {
          settingNodeRef.current = graphRef.current?.addNode({
            x: event.node.getPosition().x + 80,
            y: event.node.position().y,
            shape: 'SettingNode',
            data: {
              ...event.cell.data,
            },
          });
        }
      });
      graphRef.current.on('blank:click', () => {
        graphRef.current?.cleanSelection();
        if (settingNodeRef.current) {
          graphRef.current?.removeNode(settingNodeRef.current.id);
          clearNode();
        }
      });
      graphRef.current.on('settingNode:delete', (node: Node<Node.Properties>) => {
        graphRef.current?.cleanSelection();
        node.remove();
        clearNode();
      });
      // 两个节点都需要动态赋值
      graphRef.current.on('settingNode:change', (_: Node<Node.Properties>, data) => {
        settingNodeRef.current?.setData(data);
        selectNodeRef.current?.setData(data);
      });
      graphRef.current.on('node:port:click', (node: EventArgs['node:port:click']) => {
        createParentNode(node);
      });
      graphRef.current.on('edge:connected', ({ isNew, edge }) => {
        if (isNew) {
          // 对新创建的边进行插入数据库等持久化操作
          edge?.appendLabel({
            markup: [{ tagName: 'foreignObject', selector: 'foContent' }],
            data: 'CustomDeleteLabel_bottom',
            position: 40,
          });
          // 插入到存储列表中 用于删除查找
          pushNodeRecord({
            id: edge.id,
            nodeList: [],
            edgeList: [edge.id],
          });
        }
      });
    }
  }, []);

  const handleSave = () => {
    graphRef.current?.exportPNG('chart', {
      padding: 20,
    });
  };
  const handleImport = (event: any) => {
    console.log(event);
    const filereader = new FileReader();
    filereader.readAsText(event.file);
    filereader.onload = (e) => {
      if (e.target) {
        graphRef.current?.fromJSON(JSON.parse(e.target.result as string));
      }
    };
  };
  const handleSaveJson = () => {
    const data = graphRef.current?.toJSON();
    const fileName = 'person.json';
    const fileToSave = new Blob([JSON.stringify(data, null, 4)], {
      type: 'application/json',
    });
    fs.saveAs(fileToSave, fileName);
  };

  return (
    <div
      css={css`
        display: flex;
        height: 100%;
        flex-direction: column;
      `}>
      <div
        css={css`
          height: 40px;
          padding: 0 20px;
          display: flex;
          align-items: center;
        `}>
        <Space wrap>
          <Tooltip title="保存">
            <Button type="text" icon={<SaveOutlined />} onClick={handleSave} />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  label: '简中',
                  key: 'zh-cn',
                  onClick: () => {
                    i18next.changeLanguage('zh');
                    updateSearchParams({ local: 'zh' });
                  },
                },
                {
                  label: '英文',
                  key: 'en',
                  onClick: () => {
                    i18next.changeLanguage('en');
                    updateSearchParams({ local: 'en' });
                  },
                },
              ],
            }}>
            <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path
                d="M547.797333 638.208l-104.405333-103.168 1.237333-1.28a720.170667 720.170667 0 0 0 152.490667-268.373333h120.448V183.082667h-287.744V100.906667H347.605333v82.218666H59.818667V265.386667h459.178666a648.234667 648.234667 0 0 1-130.304 219.946666 643.242667 643.242667 0 0 1-94.976-137.728H211.541333a722.048 722.048 0 0 0 122.453334 187.434667l-209.194667 206.378667 58.368 58.368 205.525333-205.525334 127.872 127.829334 31.232-83.84m231.424-208.426667h-82.218666l-184.96 493.312h82.218666l46.037334-123.306667h195.242666l46.464 123.306667h82.218667l-185.002667-493.312m-107.690666 287.744l66.56-178.005333 66.602666 178.005333z"
                fill="#5c5c66"
                p-id="2362"></path>
            </svg>
          </Dropdown>
          <Button onClick={handleSave}>导出图片</Button>
          <Upload onChange={handleImport} maxCount={1} showUploadList={false} beforeUpload={() => false}>
            <Button>导入json</Button>
          </Upload>
          <Button onClick={handleSaveJson}>保存json</Button>
        </Space>
      </div>
      <div
        css={css`
          flex: 1;
          height: 100%;
          display: flex;
        `}>
        <div
          css={css`
            flex: 1;
          `}
          ref={containerRefCallback}></div>
      </div>
    </div>
  );
};

export default Index;
