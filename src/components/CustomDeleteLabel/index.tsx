import { css } from '@emotion/react'
import { FC } from 'react'

interface Props {
  id: string
  onDelete: (id: string) => void
}

const CustomDeleteLabel: FC<Props> = props => {
  const CustomDeleteLabelStyled = css`
    width: 50px;
    height: 12px;
    line-height: 12px;
    background-color: red;
    border-radius: 5px;
    font-size: 10px;
    text-align: center;
  `

  return (
    <div
      css={CustomDeleteLabelStyled}
      onClick={() => {
        typeof props.onDelete === 'function' && props.onDelete(props.id)
      }}
    >
      remove
    </div>
  )
}

export default CustomDeleteLabel
