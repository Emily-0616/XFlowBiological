import { css } from '@emotion/react';
import NodeForm from '../NodeForm';

const Square = () => {
  return (
    <>
      <div
        css={css`
          width: 100%;
          height: 100%;
          border: 1px solid #000;
        `}
      />
      <NodeForm></NodeForm>
    </>
  );
};
export default Square;
