import React, { useState, useEffect } from 'react';
import { navigateTo, Text, View, Image } from '@ray-js/ray';
import { NavBar, Divider, BottomSheet, Popup, Cell, Button, Icon } from '@ray-js/smart-ui';
import { useActions, useProps, useDevice } from '@ray-js/panel-sdk';
import { Slider } from '@ray-js/smart-ui';
import styles from './index.module.less';
import Strings from '@/i18n';

import Res from "../../res/index";
import RayCircleProgress from '../../components/CircleProgress/index';

export function Home() {
  const actions = useActions();
  const devInfo = useDevice(device => device.devInfo);
  const switchDP = useProps(props => props.switch);
  // 目标温度: 18-65
  const tempSetDP = useProps(props => props.temp_set);
  const tempMaxDP = useProps(props => props.upper_temp);
  const tempMinDP = useProps(props => props.lower_temp);
  const lightDP = useProps(props => props.light);
  const tempUnitConvertDP = useProps(props => props.temp_unit_convert);
  const tempCurrentDP = useProps(props => props.temp_current);
  const tempCurrentfDP = useProps(props => props.temp_current_f);
  const rgbSwitchDP = useProps(props => props.rgb_switch);
  const rgbValueDP = useProps(props => props.rgb_value);
  // 目标时间：0-90
  const timerSetDP = useProps(props => props.timer_set);
  // console.log('devInfo---->', devInfo);

  const timeList = [45, 60, 90];
  const minTemp = tempMinDP || 18;
  const maxTemp = tempMaxDP || 65;

  const [bgColor, setBgColor] = useState('');
  const [show, setShow] = React.useState(false);
  const [unit, setUnit] = React.useState(tempUnitConvertDP);
  const [isExp, setExp] = useState(false);

  const unitList = [
    { val: '℃', key: 'c' },
    { val: '℉', key: 'f' }
  ]

  const setTimeVal = (val) => {
    const ringVal = ((val - minTemp) / (maxTemp - minTemp)) * 100;
    return Math.floor(ringVal);
  }

  // F = C*1.8+32 
  const formatToF = (temp: number) => {
    console.log('当前温度: ', temp);
    return Math.floor(temp * 1.8 + 32);
  };

  const handleEnd = (v: number) => {
    // console.warn('handleEnd', v);
    const num = Math.floor(minTemp + (v / 100) * (maxTemp - minTemp));
    console.log('num-----', num);
    actions.temp_set.set(num);
  };

  const setTime = (time) => {
    if(!switchDP){
      return;
    }
    if(time < 1 || time > 90){
      return;
    }
    actions.timer_set.set(time)
  }

  const setTemp = (num) => {
    if(!switchDP){
      return;
    }
    console.log(111111);
    if(num < minTemp || num > maxTemp){
      return;
    }
    actions.temp_set.set(num);
  }

  const setLight = () => {
    // if(!switchDP){
    //   return;
    // }
    actions.light.set(!lightDP)
  }

  const setRgb = () => {
    // if(!switchDP){
    //   return;
    // }
    actions.rgb_switch.set(!rgbSwitchDP)
  }

  const goTo = () => {
    // if(!switchDP){
    //   return;
    // }
    navigateTo({url: '/pages/rgb/index'})
  }

  const setUnitDp = () => {
    actions.temp_unit_convert.set(unit);
    onClose();
  }
  
  const showPopup = () => {
    // if(!switchDP){
    //   return;
    // }
    setShow(true);
  }
  const onClose = () => {
    setShow(false);
  };

  useEffect(() => {
    // 设置失效时间
    const today = Date.now();
    const targetDay = new Date('2026-11-21');
    console.log('组件挂载时执行',today > targetDay);
      if(today > targetDay){
        setExp(true)
      }else[
         setExp(false)
      ]
  }, []);

  return (
    <View className={styles.mainContent}>
      <NavBar
        title={devInfo.name}
        placeholder
        border={false}
      />
     
      { !isExp && <scroll-view scroll-y="{{true}}"
        style={{flex:1}} className={styles.content}>
        <View className={styles.top}>
          <View className={styles.tempText}>
            <Image className={styles.img} src={Res.tempIcon}/>
            <View className={styles.text}>
              {tempUnitConvertDP == 'c' ? tempCurrentDP : tempCurrentfDP}
              <Text className={styles.unit}>{tempUnitConvertDP == 'c' ? '℃' : '℉'}</Text>
            </View>
            
          </View>
          <View className={styles.tempBtn}>
            <View style={{textAlign: 'center'}}>
              <View>
                <View className={styles.text}>{tempUnitConvertDP == 'c' ? minTemp : formatToF(minTemp)}<Text className={styles.unit}>{tempUnitConvertDP == 'c' ? '℃' : '℉'}</Text></View>
                <View className={styles.tip}>MIN</View>
              </View>
              <Image className={styles.img} src={Res.reduceIcon} onClick={() => setTemp(tempSetDP-1)} />
            </View>
            <View style={{textAlign: 'center'}}>
              <View>
                <View className={styles.text}>{tempUnitConvertDP == 'c' ? maxTemp : formatToF(maxTemp)}<Text className={styles.unit}>{tempUnitConvertDP == 'c' ? '℃' : '℉'}</Text></View>
                <View className={styles.tip}>MAX</View>
              </View>
              <Image className={styles.img} src={Res.addIcon} onClick={() => setTemp(tempSetDP+1)} />
            </View>
          </View>
          <Image className={styles.select} src={Res.setIcon} onClick={() => showPopup()} />
          <RayCircleProgress
            className={styles.circle}
            value={setTimeVal(tempSetDP)}
            ringRadius={110}
            innerRingRadius={93}
            trackColor="#4197c0"
            colorList={[
              { offset: 0, color: '#95e1f8' },
              // { offset: 0.5, color: '#6A53D1' },
              { offset: 1, color: '#95e1f8' },
            ]}
            startDegree={123}
            offsetDegree={295}
            disable={!switchDP}
            renderInnerCircle={() => (
              <View className={styles.temp}>{tempUnitConvertDP == 'c' ? tempSetDP : formatToF(tempSetDP)}<Text className={styles.unit}>{tempUnitConvertDP == 'c' ? '℃' : '℉'}</Text>
              </View>
            )}
            // touchCircleStrokeStyle="rgba(0, 0, 0, 0.4)"
            // thumbBorderWidth={4}
            onTouchEnd={handleEnd}
          />
          <Divider
          contentPosition="center"
          customStyle={{
            color: '#FFEF9E',
            borderColor: '#FFEF9E ',
            margin: 0,
            padding: '0 60px',
            fontSize: '19px',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
          }}
        >
          {Strings.getLang('timeText')}:{timerSetDP}min
        </Divider>
        </View>
        {/* className={`${styles.box} ${type != 3 ? styles.hide : ''}`} */}
        <View className={styles.timers}>
            <Image className={styles.img} src={Res.reduceIcon} onClick={() => setTime(timerSetDP-1)} />
            <Slider
              style={{
                border: '1px solid #0FAAFE', 
                borderRadius: '10px',
                width: '520rpx'
                // height: '10px'
              }}
              minTrackRadius="10px"
              minTrackHeight="10px"
              maxTrackRadius="10px"
              maxTrackHeight="10px"
              value={timerSetDP}
              thumbWidth={25}
              thumbHeight={25}
              // parcel
              parcelMargin={2}
              min={0}
              max={90}
              minTrackColor="#FFEF9E"
              maxTrackColor="transparent"
              disabled={!switchDP}
              thumbStyle={{
                width: '50rpx',
                height: '50rpx',
                backgroundImage: `url(${Res.circleIcon})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
              onAfterChange={value => setTime(value)}
            />
            <Image className={styles.img} src={Res.addIcon} onClick={() => setTime(timerSetDP+1)} />
        </View>
        <View className={styles.timeList}>
          { timeList.map((time, index) => (
            <View className={`${styles.item} ${timerSetDP == time ? styles.active : null}`} key={index} onClick={() => setTime(time)}>
              <Image className={styles.img} src={Res.clockIcon} />
              <View className={styles.text}>{time}</View>
              <View className={styles.unit}>min</View>
            </View>
          ))}
        </View>
        <View className={styles.btns}>
          <View className={styles.item}>
            <Image className={styles.img} src={switchDP ? Res.onIcon : Res.offIcon} onClick={() => actions.switch.set(!switchDP)} />
            <View className={styles.text}>{Strings.getLang('switchText')}</View>
          </View>
          <View className={styles.item}>
            <Image className={styles.img} src={lightDP ? Res.lightIcon : Res.lightOffIcon} onClick={() => setLight()} />
            <View className={styles.text}>{Strings.getLang('lightText')}</View>
          </View>
          <View className={styles.item}>
            <Image className={styles.img} src={rgbSwitchDP ? Res.rgbIcon : Res.rgbOffIcon} 
              onClick={() => setRgb()} 
              bind:longpress={() => goTo()}
              />
            <View className={styles.text}>{Strings.getLang('rgbText')}</View>
          </View>
        </View>
      </scroll-view> }
      <BottomSheet show={show} title={Strings.getLang('unitText')} onClose={onClose}>
        <View className={styles.popContent}>
          <View className={styles.list}>
            { unitList.map((item, index) => (
              <View key={index} onClick={() => setUnit(item.key)}>
                <View className={`${styles.item} ${unit == item.key ? styles.active : null}`} >{item.val}</View>
                <Divider></Divider>
              </View>
            ))}
          </View>
          <View className={styles.footer}>
            <Button type="info" block onClick={() => setUnitDp()}>{Strings.getLang('confirmText')}</Button>
          </View>
        </View>
        
      </BottomSheet>
    </View>
  )
}

export default Home;
