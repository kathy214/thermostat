import React, { useState, useEffect } from 'react';
import { navigateBack, Text, View, Image } from '@ray-js/ray';
import { NavBar, Button, Cell, Switch, Icon, Loading } from '@ray-js/smart-ui';
import { useActions, useProps, useDevice } from '@ray-js/panel-sdk';
import styles from './index.module.less';
import Strings from '@/i18n';

import ColorWheelPicker from '../../components/ColorWheelPicker';

export default (props) => {
  const actions = useActions();
  const devInfo = useDevice(device => device.devInfo);
  const rgbValueDP = useProps(props => props.rgb_value);
  const rgbSwitchDP = useProps(props => props.rgb_switch);
  const rgbAutoDP = useProps(props => props.auto_mode);

  const [bgColor, setBgColor] = useState('');
  const [rgbColor, setRgbColor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleColorChange = ({ r, g, b, hex }) => {
    console.log('选中颜色：', { r, g, b, hex });
    setBgColor(hex)
    setRgbColor(`${r},${g},${b}`)
    // 这里可以把 RGB 值传给设备 DP
  }

  const setColor = () => {
    setLoading(true);
    actions.rgb_value.set(rgbColor);
    setTimeout(()=>{
      setLoading(false);
    },300)

  }

  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const num = Math.round(Math.max(0, Math.min(255, n)));
      const hex = num.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  const formatColor = () => {
    const rgbArr = rgbValueDP.split(",");
    const obj = { r: rgbArr[0], g: rgbArr[1], b: rgbArr[2] }
    return obj;
  }

  useEffect(() => {
    console.log('组件挂载时执行');
    if(rgbValueDP){
      setRgbColor(rgbValueDP);
      const rgbArr = rgbValueDP.split(",");
      const color = rgbToHex(rgbArr[0],rgbArr[1],rgbArr[2]);
      setBgColor(color);
    }
  }, []);

  return (
    <View className={styles.mainContent}>
      <NavBar title={devInfo.name} border={true} leftArrow onClickLeft={() => navigateBack()}/>
      <View className={styles.content}>
        <ColorWheelPicker onChange={handleColorChange} rgb={formatColor()}/>
        <View className={styles.show}>
          <View>{Strings.getLang('slectText')}：{rgbColor}</View>
          <View className={styles.color} style={{background: bgColor,border: '1px solid #000' }}></View>
        </View>
        <View className={styles.btn}>
           <Button type="info" size="large" loading={loading} onClick={() => setColor()}>{Strings.getLang('saveText')}</Button>
        </View>
        <Cell title={Strings.getLang('autoText')}>
          <Switch
            checked={rgbAutoDP}
            onChange={event => actions.auto_mode.set(!rgbAutoDP)}
          />
        </Cell>
        {/* <View className={styles.btn} onClick={() => setColor()}>保存</View> */}
      </View>
    </View>
  )
}