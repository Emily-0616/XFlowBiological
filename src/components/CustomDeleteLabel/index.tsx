import { FC } from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';

interface Props {
  id: string;
  onDelete: (id: string) => void;
}

const CustomDeleteLabel: FC<Props> = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <CloseCircleOutlined
        onClick={() => {
          typeof props.onDelete === 'function' && props.onDelete(props.id);
        }}
      />
    </div>
  );
};

export default CustomDeleteLabel;
