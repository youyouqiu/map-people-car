import { CheckOutlined } from '@ant-design/icons';
import React, { memo, useState, useEffect, useCallback } from 'react';
import { Tooltip } from 'antd';
import styles from './index.module.less';

interface IProps {
  color: Array<any>;
  value?: string | null | undefined;
  onPress?: Function;
};

const ThemeColor: React.FC<IProps> = memo(({
  color = [],
  onPress,
  value: defaultColor
}) => {
  const [value, setValue] = useState<string | null | undefined>();

  useEffect(() => {
    if (defaultColor && value !== defaultColor) {
      setValue(defaultColor);
    }
  }, [defaultColor]);

  const onClick = useCallback((c) => {
    setValue(c);
    if (typeof onPress === 'function') {
      onPress(c);
    }
  }, []);

  return (
    <div className={styles['theme-color']}>
      <div className={styles['theme-color-content']}>
        {
          color.map((item) => {
            return (
              <Tooltip title={item.title}>
                <div
                  className={styles['theme-color-block']}
                  style={{ backgroundColor: item.value }}
                  onClick={() => onClick(item.value)}
                >
                  {
                    value === item.value && (
                      <CheckOutlined />
                    )
                  }
                </div>
              </Tooltip>

            );
          })
        }
      </div>
    </div>
  );
});

export default ThemeColor;
