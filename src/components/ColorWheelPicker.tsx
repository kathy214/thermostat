import React, { useRef, useState, useEffect } from 'react';
import { View } from '@ray-js/ray';
import { createCanvasContext } from '@ray-js/api';

interface ColorWheelPickerProps {
  onChange: (rgb: { r: number; g: number; b: number; hex: string }) => void;
  rgb?: { r: number; g: number; b: number }; // 👉 新增：外部传入RGB
}

const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({ onChange, rgb  }) => {
  const canvasId = 'colorWheel';
  const size = 300; // 画布尺寸
  const center = size / 2;
  const rings = 6; // 饱和度环数
  const sectors = 12; // 色相数量
  const sectorStep = 360 / sectors; // 单扇区30°
  const centerBlankRadius = 20; // 中心空白圆半径


   // 选中状态：ring = 环号，sector = 扇区，isCenter = 是否白色中心
  const [selected, setSelected] = useState<{
    ring: number;
    sector: number;
    isCenter: boolean;
  }>({ ring: -1, sector: -1, isCenter: false });

  const [isClick, setClick] = useState(false)

  // 安全 HSL → RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.round(Math.max(0, Math.min(255, (r + m) * 255))),
      g: Math.round(Math.max(0, Math.min(255, (g + m) * 255))),
      b: Math.round(Math.max(0, Math.min(255, (b + m) * 255))),
    };
  };

  // 安全 RGB → Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const num = Math.round(Math.max(0, Math.min(255, n)));
      const hex = num.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };
  // RGB → HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
    }
    return { h: h * 60, s: s * 100, l: l * 100 };
  };

  // 绘制色轮(饱和度下限75，亮度52，不强制绘制纯色)
  const drawWheel = () => {
    console.log('deaw-----')
    const ctx = createCanvasContext(canvasId);

    const totalRingWidth = center - centerBlankRadius;

    // 清空画布
    ctx.clearRect(0, 0, size, size);

    // 从外到内绘制 6 层饱和度环
    for (let ring = 0; ring < rings; ring++) {
      const outerRadius = center - ring * (totalRingWidth / rings);
      const innerRadius = center - (ring + 1) * (totalRingWidth / rings);
      // 饱和度100~75渐变，杜绝发灰, 外高内低
      const saturation = 100 - (ring / rings) * 100;
      // const saturation = 100 - (ring / rings) * (100 - 75);

      // 每个环画 36 个色相扇形
      for (let i = 0; i < sectors; i++) {
        const hue = (i / sectors) * 360;
        // 统一HSL计算，不强制绘制纯色
        const color = hslToRgb(hue, saturation, 50);
        const r = color.r;
        const g = color.g;
        const b = color.b;
        const startAngle = (i / sectors) * 2 * Math.PI;
        const endAngle = ((i + 1) / sectors) * 2 * Math.PI;

        // 绘制环形扇形（正向绘制，无反向路径）
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, outerRadius, startAngle, endAngle);
        ctx.arc(center, center, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.setFillStyle(`rgb(${r},${g},${b})`);
        ctx.fill();

         // 👉 选中：画白色边框
        if (selected.ring === ring && selected.sector === i) {
          ctx.setStrokeStyle('#000000');
          ctx.setLineWidth(2);
          ctx.stroke();
        }

        // 最内层分割线
        // ctx.setStrokeStyle('pink');
        // ctx.setLineWidth(1);
        // ctx.stroke();
      }
    }

    // 中间白色圆
    ctx.beginPath();
    ctx.arc(center, center, centerBlankRadius, 0, 2 * Math.PI);
    ctx.setFillStyle('#FFFFFF');
    ctx.fill();

    // 中心选中：画白边
    if (selected.isCenter) {
      ctx.setStrokeStyle('#000000');
      ctx.setLineWidth(2);
      ctx.stroke();
    }

    

    ctx.draw();
  };

  useEffect(() => {
    const timer = setTimeout(() => drawWheel(), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    drawWheel();
  }, [selected]);

  // 👉 外部传入 RGB → 自动选中
  useEffect(() => {
    // console.log('rgb---11111-',isClick, selected)
    if (rgb && !isClick) selectByRgb(rgb.r, rgb.g, rgb.b);
  }, [rgb]);

  // 根据RGB选中
  const selectByRgb = (r: number, g: number, b: number) => {
    if (r >= 254 && g >= 254 && b >= 254) {
      setSelected({ ring: -1, sector: -1, isCenter: true });
      return;
    }

    const { h, s } = rgbToHsl(r, g, b);
    const sector = Math.round(h / (360 / sectors)) % sectors;
    const ring = Math.round((100 - s) / (100 / rings));
    setSelected({ ring: Math.max(0, Math.min(rings - 1, ring)), sector, isCenter: false });
    const timer = setTimeout(() => {
      drawWheel();
    }, 150);
    return () => clearTimeout(timer);
  };

  // 点击取色
  const handleClick = (e: any) => {
    setClick(true);
    const { x, y } = e.changedTouches?.[0] || e;
    const dx = x - center;
    const dy = y - center;
    // const distance = Math.sqrt(dx * dx + dy * dy);
    const distance = Math.hypot(dx, dy);
    const totalRingWidth = center - centerBlankRadius;
    // ✅ 新增：如果点击中心区域，直接返回白色
    if (distance < centerBlankRadius) {
      setSelected({ ring: -1, sector: -1, isCenter: true });
      const r = 255, g = 255, b = 255;
      const hex = '#FFFFFF';
      onChange?.({ r, g, b, hex });
      return;
    }

    // 只响应圆内点击，且排除中间空白
    if (distance > center) return;

    // 计算点击环、扇区
    const ringIdx = Math.floor((center - distance) / (totalRingWidth / rings));
    // 计算色相（0-360°）
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;

    const sectorIdx = Math.floor(angle / sectorStep);
    setSelected({ ring: ringIdx, sector: sectorIdx, isCenter: false });

    let r: number, g: number, b: number;
    // 规则：仅最外层 ringIdx===0 的0/4/8扇区返回标准正色
    if (ringIdx === 0 && sectorIdx === 0) {
      r = 255; g = 0; b = 0;
    } else if (ringIdx === 0 && sectorIdx === 4) {
      r = 0; g = 255; b = 0;
    } else if (ringIdx === 0 && sectorIdx === 8) {
      r = 0; g = 0; b = 255;
    } else {
      // 内层三色/其余色块，按当前环饱和度正常计算
      // const sat = 100 - ((ringIdx / rings) * (100 - 75));
      const sat = 100 - ((ringIdx / rings) * 100);
      const midHue = sectorIdx * sectorStep + sectorStep / 2;
      const color = hslToRgb(midHue, sat, 50);
      r = color.r; g = color.g; b = color.b;
    }

    const hex = rgbToHex(r, g, b);

    onChange?.({ r, g, b, hex });
  };

  return (
    <View
      style={{
        // width: size,
        // height: size,
        // position:'relative'
        // borderRadius: '50%',
        // overflow: 'hidden',
        // backgroundColor: '#FFFFFF',
      }}
    >
      <canvas
        id={canvasId}
        canvas-id={canvasId}
        width={size}
        height={size}
        style={{ width: size + 'px', height: size + 'px', margin: '0 auto' }}
        onClick={handleClick}
      />
    </View>
  );
};

export default ColorWheelPicker;