import { Graph, Node } from '@antv/x6';
import { css } from '@emotion/react';

const GenderRender = ({ value }: { value: string }) => {
  if (value === 'Female') {
    return (
      <div
        css={css`
          width: 60px;
          height: 60px;
          border: 2px solid #5c5c66;
          /* border-radius: 8px; */
          border-radius: 50%;
        `}
      ></div>
    );
  }
  if (value === 'Male') {
    return (
      <div
        css={css`
          width: 60px;
          height: 60px;
          border: 2px solid #5c5c66;
          /* border-radius: 50%; */
          border-radius: 8px;
        `}
      ></div>
    );
  }
  if (value === 'Unknown') {
    return (
      <div
        css={css`
          width: 45px;
          height: 45px;
          border: 2px solid #5c5c66;
          transform: translate(8px, 6px) rotate(45deg);
        `}
      ></div>
    );
  }
  return <></>;
};

const MainNode = ({ node, graph }: { node: Node<Node.Properties>; graph: Graph }) => {
  const data = node.data;
  // console.log(data);
  return (
    <>
      <GenderRender value={data.Gender} />
    </>
  );
};
export default MainNode;
