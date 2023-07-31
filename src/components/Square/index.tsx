import { css } from '@emotion/react';

const Square = () => {
  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        border: 1px solid #000;
      `}
    ></div>
  );
};
export default Square;
