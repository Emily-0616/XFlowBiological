import { Graph } from '@antv/x6';
import { Export } from '@antv/x6-plugin-export';
import { History } from '@antv/x6-plugin-history';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Stencil } from '@antv/x6-plugin-stencil';

import { Portal } from '@antv/x6-react-shape';
import { css } from '@emotion/react';
import { useCallback, useRef } from 'react';
import { useWindowSize } from 'usehooks-ts';

const data = {
  nodes: [
    {
      id: 'node1',
      shape: 'rect',
      x: 40,
      y: 40,
      width: 100,
      height: 40,
      label: 'hello',
      attrs: {
        body: {
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          rx: 6,
          ry: 6,
        },
      },
    },
    {
      id: 'node2',
      shape: 'rect',
      x: 160,
      y: 180,
      width: 100,
      height: 40,
      label: 'world',
      attrs: {
        body: {
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          rx: 6,
          ry: 6,
        },
      },
    },
  ],
  edges: [
    {
      shape: 'edge',
      source: 'node1',
      target: 'node2',
      label: 'x6',
      attrs: {
        line: {
          stroke: '#8f8f8f',
          strokeWidth: 1,
        },
      },
    },
  ],
};

// 这个调用需要在组件外进行。
const X6ReactPortalProvider = Portal.getProvider();
const Index = () => {
  const { width, height } = useWindowSize();
  const containerRef = useRef<HTMLDivElement | undefined>(undefined);
  const containerRefCallback = useCallback(
    (node: any) => {
      if (node) {
        containerRef.current = node;
        const graph = new Graph({
          container: node,
          width,
          height,
          panning: true,
          mousewheel: {
            enabled: true,
            modifiers: 'Ctrl',
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
        graph.use(
          new Snapline({
            enabled: true,
          }),
          new History({
            enabled: true,
          }),
          new Selection({
            enabled: true,
          }),
          new Stencil({
            target: graph,
            groups: [
              {
                name: 'group1',
              },
              {
                name: 'group2',
              },
            ],
          }),
          new Export()
        );
        graph.fromJSON(data); // 渲染元素
        graph.centerContent(); // 居中显示
      }
    },
    [width, height]
  );

  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
      `}
    >
      <X6ReactPortalProvider />
      <div ref={containerRefCallback} />
    </div>
  );
};

export default Index;
