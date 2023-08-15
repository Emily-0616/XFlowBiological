import { css } from '@emotion/react'

const CustomDeleteLabel = () => {
  const CustomDeleteLabelStyled = css`
    width: 50px;
    height: 12px;
    line-height: 12px;
    background-color: red;
    border-radius: 5px;
    font-size: 10px;
    text-align: center;
  `

  return <div css={CustomDeleteLabelStyled} >remove</div>
}

export default CustomDeleteLabel
