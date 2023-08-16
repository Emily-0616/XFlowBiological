import { SaveOutlined } from '@ant-design/icons';
import { Cell, EventArgs, Graph, Node } from '@antv/x6';
import { Export } from '@antv/x6-plugin-export';
import { History } from '@antv/x6-plugin-history';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { register } from '@antv/x6-react-shape';
import { css } from '@emotion/react';
import { Button, Dropdown, Space, Tooltip, Upload } from 'antd';
import fs from 'file-saver';
import { useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import CustomDeleteLabel from '../components/CustomDeleteLabel';
import MainNode from '../components/MainNode';
import SettingNode from '../components/SettingNode';
import { ports } from '../data/default';
import { isMobile } from '../utils/isMobile';

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
}

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
});

// 点击连接桩生成的 MainNode 尺寸
const CREATE_NODE_SIZE = {
  width: 60,
  height: 60,
};

const Index = () => {
  const graphRef = useRef<Graph | undefined>(undefined);
  const settingNodeRef = useRef<Cell | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | undefined>(undefined);
  const selectNodeRef = useRef<Cell | undefined>(undefined);
  const nodeRecordRef = useRef<NodeRecord[]>([]);

  const clearNode = () => {
    selectNodeRef.current = undefined;
    settingNodeRef.current = undefined;
  };

  const deleteNode = (id: string) => {
    const findDeleteItem = nodeRecordRef.current.find((item) => item.id === id);

    // 删除记录上的节点和线
    findDeleteItem?.nodeList.forEach((node) => {
      graphRef.current?.removeNode(node);
    });
    findDeleteItem?.edgeList.forEach((edge) => {
      graphRef.current?.removeEdge(edge);
    });

    const copied = nodeRecordRef.current.filter((item) => item.id !== id);
    nodeRecordRef.current = [...copied];
  };

  const pushNodeRecord = (addItem: NodeRecord) => {
    const copied = nodeRecordRef.current;
    copied.push(addItem);
    nodeRecordRef.current = [...copied];
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
          validateConnection({ targetMagnet }) {
            return !!targetMagnet;
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
            content.style.width = '80px';
            content.style.height = '40px';
            content.style.padding = '10px';
            content.style.outline = 'none';
            content.style.transform =
              label.data === 'CustomDeleteLabel' ? 'translate(-32px,-22px)' : 'translate(-40px, -50px)';
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

      graphRef.current.addNode({
        shape: 'MainNode',
        x: node.clientWidth / 2,
        y: node.clientHeight / 2,
        size: {
          width: 60,
          height: 60,
        },
        data: {
          Gender: 'Unknown',
        },
        ports: { ...ports },
      });

      const createNode = (x: number, y: number, gender: string): Node<Node.Properties> => {
        return graphRef.current!.addNode({
          shape: 'MainNode',
          x,
          y,
          size: CREATE_NODE_SIZE,
          data: { Gender: gender },
          ports: { ...ports },
        });
      };

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

      // 点击连接桩生成节点
      const createParentNode = (child: EventArgs['node:port:click']) => {
        const { x, y } = child.cell.position();
        const currentPorts = child.cell.ports.items.find((item) => item.id === child.port);
        // 点击上方连接桩
        if (currentPorts?.group === 'top') {
          const maleNode = createNode(x - 100, y - 150, 'Male');
          const femaleNode = createNode(x + 100, y - 150, 'Female');
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
            });
        }
        // 点击右侧连接桩
        if (currentPorts?.group === 'right') {
          const brotherNode = createNode(x + 200, y, AddNodeGenderMap[child.node.data?.Gender as AddNodeGenderMap]);
          const childNode = createNode(x + 100, y + 150, 'Unknown');
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
            });
        }
        // 点击左侧连接桩
        if (currentPorts?.group === 'left') {
          const brotherNode = createNode(x - 200, y, AddNodeGenderMap[child.node.data?.Gender as AddNodeGenderMap]);
          const childNode = createNode(x - 100, y + 150, 'Unknown');
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
            });
        }
        // 点击下方连接桩
        if (currentPorts?.group === 'bottom') {
          const childNode = createNode(x, y + 150, 'Unknown');
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
      graphRef.current.on('node:mouseenter', () => {
        showPorts(graphRef.current?.getNodes(), true);
      });
      graphRef.current.on('node:mouseleave', () => {
        showPorts(graphRef.current?.getNodes(), false);
      });

      graphRef.current.on('node:click', (event) => {
        if (event.e.target.nodeName === 'circle') return;
        // 如果当前不存在settingNode 的情况下跟据当前点击的node 坐标生成id
        if (!settingNodeRef.current) {
          settingNodeRef.current = graphRef.current?.addNode({
            x: event.x + 60,
            y: event.y - 20,
            shape: 'SettingNode',
            data: {
              enableMove: false,
            },
          });
          // 生成了settingNode 以后记录选中的node
          selectNodeRef.current = event.cell;
        }
        // 如果settingNode 存在并且被点击的情况下，框选父节点
        if (selectNodeRef.current && event.cell.shape === 'SettingNode') {
          graphRef.current?.select(selectNodeRef.current.id);
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
      graphRef.current.on('settingNode:change', (_: Node<Node.Properties>, data) => {
        selectNodeRef.current?.setData({
          ...data,
        });
      });
      graphRef.current.on('node:port:click', (node: EventArgs['node:port:click']) => {
        createParentNode(node);
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
                },
                {
                  label: '英文',
                  key: 'en',
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
