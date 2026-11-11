import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Text, View, createSelectorQuery } from '@ray-js/ray';
import styles from './index.module.less';

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

export type ArcSliderProps = {
  min?: number;
  max?: number;
  initialValue?: number;
  size?: number;
  knobImage?: string;
  unit?: string;
  caption?: string;
  onChange?: (value: number) => void;
};

const START_ANGLE = 150;
const END_ANGLE = 390;
const ANGLE_RANGE = END_ANGLE - START_ANGLE;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const safeNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getTouchPoint = (event: any): Point | null => {
  const touch = event?.touches?.[0] || event?.changedTouches?.[0] || event?.detail;
  if (!touch) return null;

  const x = safeNumber(touch.clientX ?? touch.pageX ?? touch.x);
  const y = safeNumber(touch.clientY ?? touch.pageY ?? touch.y);

  if (x === null || y === null) return null;
  return { x, y };
};

const valueToAngle = (value: number, min: number, max: number) => {
  const progress = (value - min) / Math.max(max - min, 1);
  return START_ANGLE + progress * ANGLE_RANGE;
};

const angleToValue = (angle: number, min: number, max: number) => {
  const progress = (angle - START_ANGLE) / ANGLE_RANGE;
  return min + progress * (max - min);
};

const pointToTrackAngle = (point: Point, rect: Rect) => {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = point.x - centerX;
  const dy = point.y - centerY;

  let degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (degrees < 0) degrees += 360;
  if (degrees < START_ANGLE) degrees += 360;

  return clamp(degrees, START_ANGLE, END_ANGLE);
};

export function ArcSlider({
  min = 0,
  max = 100,
  initialValue = 20,
  size = 244,
  knobImage,
  unit = '%',
  caption = 'Color temperature',
  onChange,
}: ArcSliderProps) {
  const normalizedInitialValue = clamp(initialValue, min, max);
  const [value, setValue] = useState(normalizedInitialValue);
  const [dragging, setDragging] = useState(false);
  const rectRef = useRef<Rect | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingValueRef = useRef<number | null>(null);
  const rootId = useMemo(() => `arc-slider-${Math.random().toString(36).slice(2, 10)}`, []);

  const trackWidth = size * 0.12;
  const ringInset = trackWidth;
  const knobSize = trackWidth * 0.78;
  const knobBorder = Math.max(2, knobSize * 0.08);
  const centerSize = size * 0.46;
  const bottomGapWidth = size * 0.26;
  const bottomGapHeight = size * 0.28;
  const knobRadius = size / 2 - trackWidth / 2;

  const displayValue = Math.round(value);
  const progress = (value - min) / Math.max(max - min, 1);
  const angle = valueToAngle(value, min, max);
  const knobRadians = (angle * Math.PI) / 180;
  const knobX = size / 2 + knobRadius * Math.cos(knobRadians);
  const knobY = size / 2 + knobRadius * Math.sin(knobRadians);

  const flushPendingValue = () => {
    if (pendingValueRef.current === null) return;
    const nextValue = clamp(pendingValueRef.current, min, max);
    pendingValueRef.current = null;
    setValue(nextValue);
    onChange?.(Math.round(nextValue));
  };

  const scheduleValueUpdate = (nextValue: number) => {
    pendingValueRef.current = nextValue;
    if (frameRef.current !== null) return;

    frameRef.current = setTimeout(() => {
      frameRef.current = null;
      flushPendingValue();
    }, 16) as unknown as number;
  };

  const updateRect = () => {
    createSelectorQuery()
      .select(`#${rootId}`)
      .boundingClientRect((rect: Rect) => {
        if (rect?.width && rect?.height) {
          rectRef.current = rect;
        }
      })
      .exec();
  };

  useEffect(() => {
    const timer = setTimeout(updateRect, 80);
    onChange?.(Math.round(normalizedInitialValue));
    return () => {
      clearTimeout(timer);
      if (frameRef.current !== null) {
        clearTimeout(frameRef.current);
      }
    };
  }, [normalizedInitialValue, onChange]);

  const updateValueFromTouch = (event: any) => {
    const point = getTouchPoint(event);
    const rect = rectRef.current;
    if (!point || !rect) return;

    const trackAngle = pointToTrackAngle(point, rect);
    const nextValue = angleToValue(trackAngle, min, max);
    scheduleValueUpdate(nextValue);
  };

  const handleTouchStart = (event: any) => {
    if (!rectRef.current) updateRect();
    setDragging(true);
    updateValueFromTouch(event);
  };

  const handleTouchMove = (event: any) => {
    updateValueFromTouch(event);
  };

  const handleTouchEnd = () => {
    setDragging(false);
    flushPendingValue();
  };

  return (
    <View
      id={rootId}
      className={styles.wrap}
      style={{ width: `${size}px`, height: `${size}px` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <View className={styles.ring} />
      <View
        className={styles.innerCutout}
        style={{
          left: `${ringInset}px`,
          top: `${ringInset}px`,
          right: `${ringInset}px`,
          bottom: `${ringInset}px`,
        }}
      />
      <View
        className={styles.bottomMask}
        style={{
          width: `${bottomGapWidth}px`,
          height: `${bottomGapHeight}px`,
        }}
      />

      <View
        className={`${styles.knob} ${dragging ? styles.knobDragging : ''}`}
        style={{
          left: `${knobX}px`,
          top: `${knobY}px`,
          width: `${knobSize}px`,
          height: `${knobSize}px`,
          borderWidth: `${knobBorder}px`,
        }}
      >
        {knobImage ? (
          <Image className={styles.knobImage} src={knobImage} mode="aspectFill" />
        ) : (
          <View className={styles.knobDefault} />
        )}
      </View>

      <View
        className={styles.centerPanel}
        style={{
          width: `${centerSize}px`,
          height: `${centerSize}px`,
        }}
      >
        <Text className={styles.valueText}>{`${displayValue}${unit}`}</Text>
        <Text className={styles.captionText}>{caption}</Text>
      </View>

    </View>
  );
}

export default ArcSlider;
