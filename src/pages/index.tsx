import { SaveOutlined } from '@ant-design/icons';
import { Cell, EventArgs, Graph, Node } from '@antv/x6';
import { Export } from '@antv/x6-plugin-export';
import { History } from '@antv/x6-plugin-history';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { register } from '@antv/x6-react-shape';
import { css } from '@emotion/react';
import { Button, Space, Tooltip, Upload } from 'antd';
import fs from 'file-saver';
import { useCallback, useRef } from 'react';
import MainNode from '../components/MainNode';
import SettingNode from '../components/SettingNode';

/** @description 新增兄弟节点时判断输出什么属性 */
enum AddNodeGenderMap {
  'Unknown' = 'Unknown',
  'Male' = 'Female',
  'Female' = 'Male',
}

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

const ports = {
  groups: {
    top: {
      position: 'top',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
  },
  items: [
    {
      group: 'top',
    },
    {
      group: 'right',
    },
    {
      group: 'bottom',
    },
    {
      group: 'left',
    },
  ],
};

// 这个调用需要在组件外进行。
const Index = () => {
  const graphRef = useRef<Graph | undefined>(undefined);
  const settingNodeRef = useRef<Cell | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | undefined>(undefined);
  const selectNodeRef = useRef<Cell | undefined>(undefined);

  const clearNode = () => {
    selectNodeRef.current = undefined;
    settingNodeRef.current = undefined;
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
        interacting(cellView) {
          if (cellView.cell.getData() && 'enableMove' in cellView.cell.getData()) {
            return cellView.cell.getData().enableMove;
          }
          return true;
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
          size: {
            width: 60,
            height: 60,
          },
          data: { Gender: gender },
          ports: { ...ports },
        });
      };

      const addEdge = (sourceCell: string, sourcePortId: string | undefined, targetCell: string, targetPortId: string | undefined) => {
        graphRef.current?.addEdge({
          source: { cell: sourceCell, port: sourcePortId },
          target: { cell: targetCell, port: targetPortId },
          vertices: [],
          connector: 'normal',
        });
      };

      // 点击连接桩生成节点
      const createParentNode = (child: EventArgs['node:port:click']) => {
        const { x, y } = child.cell.position();
        const currentPorts = child.cell.ports.items.find((item) => item.id === child.port);
        console.log(currentPorts);
        // 点击上方连接桩
        if (currentPorts?.group === 'top') {
          const maleNode = createNode(x - 100, y - 150, 'Male');
          const femaleNode = createNode(x + 100, y - 150, 'Female');
          addEdge(maleNode.id, maleNode.ports.items.find((item) => item.group === 'right')?.id, child.cell.id, child.port);
          addEdge(femaleNode.id, femaleNode.ports.items.find((item) => item.group === 'left')?.id, child.cell.id, child.port);
        }
        // 点击右侧连接桩
        if (currentPorts?.group === 'right') {
          const brotherNode = createNode(x + 200, y, AddNodeGenderMap[child.node.data?.Gender as AddNodeGenderMap]);
          const childNode = createNode(x + 100, y + 150, 'Unknown');
          addEdge(child.cell.id, child.port, childNode.id, childNode.ports.items.find((item) => item.group === 'top')?.id);
          addEdge(
            brotherNode.id,
            brotherNode.ports.items.find((item) => item.group === 'left')?.id,
            childNode.id,
            childNode.ports.items.find((item) => item.group === 'top')?.id
          );
        }
        // 点击左侧连接桩
        if (currentPorts?.group === 'left') {
          const brotherNode = createNode(x - 200, y, AddNodeGenderMap[child.node.data?.Gender as AddNodeGenderMap]);
          const childNode = createNode(x - 100, y + 150, 'Unknown');
          addEdge(child.cell.id, child.port, childNode.id, childNode.ports.items.find((item) => item.group === 'top')?.id);
          addEdge(
            brotherNode.id,
            brotherNode.ports.items.find((item) => item.group === 'right')?.id,
            childNode.id,
            childNode.ports.items.find((item) => item.group === 'top')?.id
          );
        }
        // 点击下方连接桩
        if (currentPorts?.group === 'bottom') {
          const childNode = createNode(x, y + 150, 'Unknown');
          addEdge(child.cell.id, child.port, childNode.id, childNode.ports.items.find((item) => item.group === 'top')?.id);
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
        if (settingNodeRef.current) {
          graphRef.current?.removeNode(settingNodeRef.current.id);
          clearNode();
        }
      });
      graphRef.current.on('settingNode:delete', (node: Node<Node.Properties>) => {
        node.remove();
        clearNode();
      });
      graphRef.current.on('settingNode:change', (node: Node<Node.Properties>, data) => {
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
      `}
    >
      <div
        css={css`
          height: 40px;
          padding: 0 20px;
          display: flex;
          align-items: center;
        `}
      >
        <Space wrap>
          <Tooltip title="search">
            <Button type="text" icon={<SaveOutlined />} onClick={handleSave} />
          </Tooltip>
          <Button>Import</Button>
          <Upload onChange={handleImport} maxCount={1} showUploadList={false} beforeUpload={() => false}>
            <Button>Import</Button>
          </Upload>
          <Button onClick={handleSaveJson}>JSON</Button>
        </Space>
      </div>
      <div
        css={css`
          flex: 1;
          height: 100%;
          display: flex;
        `}
      >
        <div
          css={css`
            flex: 1;
          `}
          ref={containerRefCallback}
        ></div>
      </div>
    </div>
  );
};

export default Index;
