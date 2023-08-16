import { FC } from 'react';
import { Button } from 'antd';

interface Props {
  id: string;
  onDelete: (id: string) => void;
}

const CustomDeleteLabel: FC<Props> = (props) => {
  return (
    <Button
      size="small"
      onClick={() => {
        typeof props.onDelete === 'function' && props.onDelete(props.id);
      }}>
      remove
    </Button>
  );
};

export default CustomDeleteLabel;
