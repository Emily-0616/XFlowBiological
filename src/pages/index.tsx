import { SaveOutlined } from '@ant-design/icons';
import { Graph, Shape } from '@antv/x6';
import { Export } from '@antv/x6-plugin-export';
import { History } from '@antv/x6-plugin-history';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Stencil } from '@antv/x6-plugin-stencil';
import { register } from '@antv/x6-react-shape';
import { css } from '@emotion/react';
import { Button, Space, Tooltip, Upload } from 'antd';
import fs from 'file-saver';
import { useCallback, useRef } from 'react';
import Square from '../components/Square';
import prots from '../utils/prots';

register({
  shape: 'Square',
  width: 40,
  height: 40,
  component: Square,
});

register;
const commonAttrs = {
  body: {
    fill: '#fff',
    stroke: '#8f8f8f',
    strokeWidth: 1,
  },
};

// 这个调用需要在组件外进行。
const Index = () => {
  const graphRef = useRef<Graph | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | undefined>(undefined);
  const stencilRef = useRef<HTMLDivElement | null>(null);
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
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  stroke: '#A2B1C3',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'block',
                    width: 12,
                    height: 8,
                  },
                },
              },
              zIndex: 0,
            });
          },
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
      });

      graphRef.current.use(
        new Export(),
        new Snapline({
          enabled: true,
        }),
        new History({
          enabled: true,
        }),
        new Selection({
          enabled: true,
        }),
        new Keyboard({
          enabled: true,
          global: true,
        })
      );

      // graphRef.current.fromJSON(data); // 渲染元素
      graphRef.current.centerContent(); // 居中显示

      const stencil = new Stencil({
        title: 'Stencil',
        target: graphRef.current,
        search(cell, keyword) {
          return cell.shape.indexOf(keyword) !== -1;
        },
        placeholder: 'Search by shape name',
        notFoundText: 'Not Found',
        collapsable: true,
        stencilGraphHeight: 0,
        groups: [
          {
            name: 'group1',
            title: 'Group(Collapsable)',
          },
          {
            name: 'group2',
            title: 'Group',
            collapsable: false,
          },
        ],
      });

      stencilRef.current!.appendChild(stencil.container);

      const n1 = graphRef.current.createNode({
        shape: 'rect',
        x: 40,
        y: 40,
        width: 80,
        height: 40,
        label: 'rect',
        attrs: commonAttrs,
      });

      const n2 = graphRef.current.createNode({
        shape: 'circle',
        x: 180,
        y: 40,
        width: 40,
        height: 40,
        label: 'circle',
        attrs: commonAttrs,
      });

      const n3 = graphRef.current.createNode({
        shape: 'ellipse',
        x: 280,
        y: 40,
        width: 80,
        height: 40,
        label: 'ellipse',
        attrs: commonAttrs,
      });

      const n4 = graphRef.current.createNode({
        shape: 'path',
        x: 420,
        y: 40,
        width: 40,
        height: 40,
        // https://www.svgrepo.com/svg/13653/like
        path: 'M24.85,10.126c2.018-4.783,6.628-8.125,11.99-8.125c7.223,0,12.425,6.179,13.079,13.543c0,0,0.353,1.828-0.424,5.119c-1.058,4.482-3.545,8.464-6.898,11.503L24.85,48L7.402,32.165c-3.353-3.038-5.84-7.021-6.898-11.503c-0.777-3.291-0.424-5.119-0.424-5.119C0.734,8.179,5.936,2,13.159,2C18.522,2,22.832,5.343,24.85,10.126z',
        attrs: commonAttrs,
        label: 'path',
        ports: {
          groups: {
            group1: {
              attrs: {
                circle: {
                  r: 6,
                  magnet: true,
                  stroke: '#8f8f8f',
                  strokeWidth: 1,
                  fill: '#fff',
                },
                text: {
                  fontSize: 12,
                  fill: '#888',
                },
              },
              position: {
                name: 'left',
              },
            },
          },
          items: [
            {
              id: 'port1',
              group: 'group1',
            },
          ],
        },
      });
      const r4 = graphRef.current.createNode({
        shape: 'Square',
        attrs: {
          body: {
            refPoints: '0,10 10,0 20,10 10,20',
          },
        },
        label: '决策',
        ports: { ...prots },
      });
      const r5 = graphRef.current.createNode({
        shape: 'Square',
        attrs: {
          body: {
            refPoints: '10,0 40,0 30,20 0,20',
          },
        },
        label: '数据',
        ports: { ...prots },
      });
      stencil.load([n1, n2, r4, r5], 'group1');
      stencil.load([n3, n4], 'group2');

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
      graphRef.current.on('cell:mouseenter', () => {
        showPorts(graphRef.current?.getNodes(), true);
      });
      graphRef.current.on('cell:mouseleave', () => {
        showPorts(graphRef.current?.getNodes(), false);
      });

      graphRef.current.on('cell:click', (event) => {
        console.log(event);
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
          display: flex;
          flex: 1;
        `}
      >
        <div
          css={css`
            width: 200px;
            position: relative;
          `}
          ref={(node) => (stencilRef.current = node)}
        />
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
