function layout(element) {
  if (!element.computedStyle) {
    return;
  }
  let elementStyle = getStyle(element);
  if (elementStyle.display !== 'flex') {
    return;
  }
  let items = element.children.filter((e) => {
    return e.type === 'element' && getStyle(e);
  });
  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0);
  });
  let style = elementStyle;
  initBaseStyle(style);
  let { mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase } =
    getInitialParams(style);
  let isAutoMainSize = false;
  // auto sizeing
  if (!style[mainSize]) {
    style[mainSize] = 0;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = item.style;
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== 'auto') {
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
      }
      isAutoMainSize = true;
    }
  }

  // 计算每行元素个数
  let flexLine = [];
  let flexLines = [flexLine];
  let mainSpace = elementStyle[mainSize];
  let crossSpace = 0;

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let itemStyle = item.style;
    itemStyle[mainSize] = itemStyle[mainSize] || 0;
    if (itemStyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize];
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      flexLine.push(item);
    } else {
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        flexLine = [item];
        flexLines.push(flexLine);
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      mainSpace -= itemStyle[mainSize];
    }
  }
  flexLine.mainSpace = mainSpace;
  console.log(items);

  // 计算最后一个flexLIne的crosspace
  if (style.flexWrap === 'nowrap' && isAutoMainSize) {
    flexLine.crossSpace = style[crossSize] !== undefined ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  // 计算主轴
  if (mainSpace < 0) {
    // 小于0说明都在一行上
    let scale = style[mainSize] / (style[mainSize] - mainSpace);
    let currentMain = mainBase;
    for (let i = 0; i < items.length; i++) {
      let item = item[i];
      let itemStyle = items.style;
      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }
      itemStyle[mainSize] = itemStyle[mainSize] * scale;
      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] = itemStyle[mainSize] + mainSign * itemStyle[mainSize];
      currentMain = itemStyle[mainEnd];
    }
  } else {
    flexLines.forEach((items) => {
      let mainSpace = items.mainSpace;
      let flexTotal = 0;
      for (let i = 0; i < items.length; i++) {
        let item = item[i];
        let itemStyle = items.style;
        if (itemStyle.flex) {
          flexTotal += itemStyle.flex;
        }
      }
      if (flexTotal > 0) {
        // 有flex元素，处理元素宽度。因为会填满，所以用不上justifyContent
        let currentMain = mainBase;
        for (let i = 0; i < items.length; i++) {
          let item = item[i];
          let itemStyle = items.style;
          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainSize] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
      } else {
        let step, currentMain;
        // 没有flex元素时的场景
        if (style.justifyContent === 'flex-start') {
          currentMain = mainBase;
          step = 0;
        }
        if (style.justifyContent === 'flex-end') {
          currentMain = mainSpace * mainSign + mainBase;
          step = 0;
        }
        if (style.justifyContent === 'center') {
          currentMain = (mainSpace / 2) * mainSign + mainBase;
          step = 0;
        }
        if (style.justifyContent === 'space-between') {
          step = (mainSpace / (items.length - 1)) * mainSign;
          currentMain = mainBase;
        }
        if (style.justifyContent === 'space-around') {
          step = (mainSpace / items.length) * mainSign;
          currentMain = step / 2 + mainBase;
        }
        for (let i = 0; i < items.length; i++) {
          let item = item[i];
          let itemStyle = items.style;
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainSize] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    });
  }

  crossSpace = 0;
  if (!style[crossSize]) {
    crossSpace = 0;
    elementStyle[crossSize] = 0;
    for (let i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLine.crossSize;
    }
  } else {
    crossSpace = style[crossSize];
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace;
    }
  }
  if (style.flexWrap === 'wrap-reverse') {
    crossBase = style[crossSize];
  } else {
    crossBase = 0;
  }
  let step;
  if (style.alignContent === 'flex-start') {
    crossBase += 0;
    step = 0;
  }
  if (style.alignContent === 'flex-end') {
    crossBase += crossSign * crossSpace;
    step = 0;
  }
  if (style.alignContent === 'center') {
    crossBase += (crossSign * crossSpace) / 2;
    step = 0;
  }
  if (style.alignContent === 'space-between') {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }
  if (style.alignContent === 'space-around') {
    step = crossSpace / flexLines.length;
    crossBase += (crossSign * step) / 2;
  }
  if (style.alignContent === 'stretch') {
    crossBase += 0;
    step = 0;
  }
  flexLines.forEach((items) => {
    let lineCrossSize =
      style.alignContent === 'stretch' ? items.crossSpace + crossSpace / flexLines.length : items.crossSpace;
    for (let i = 0; i < items.length; i++) {
      let item = item[i];
      let itemStyle = items.style;
      let align = itemStyle.alignSelf || style.alignItems;
      if (itemStyle[crossSize] === null) {
        itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0;
      }
      if (align === 'flex-start') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if (align === 'flex-end') {
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
        itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }
      if (align === 'center') {
        itemStyle[crossStart] = crossBase + (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if (align === 'stretch') {
        itemStyle[crossStart] = crossBase;
        // todo   这块没搞懂
        itemStyle[crossEnd] =
          itemStyle[crossStart] + crossSign * (itemStyle[crossSize] ? itemStyle[crossSize] : lineCrossSize);
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
      }
    }
    crossBase += crossSign * (lineCrossSize + step);
  });
  console.log(flexLines);
}

/**
 * @description 根据flex的direction /wrap 初始化主轴、交叉轴参数
 * @param {*} style
 * @returns
 */
function getInitialParams(style) {
  let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase;
  if (style.flexDirection === 'row') {
    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainBase = 0;
    mainSign = +1;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }
  if (style.flexDirection === 'row-reverse') {
    mainSize = 'width';
    mainStart = 'right';
    mainEnd = 'left';
    mainBase = style.width;
    mainSign = -1;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (style.flexDirection === 'column') {
    mainSize = 'height';
    mainStart = 'top';
    mainEnd = 'bottom';
    mainBase = 0;
    mainSign = +1;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if (style.flexDirection === 'column-reverse') {
    mainSize = 'height';
    mainStart = 'bottom';
    mainEnd = 'top';
    mainBase = style.height;
    mainSign = -1;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }
  if (style.flexWrap === 'wrap-reverse') {
    let tmp = crossStart;
    crossStart = crossEnd;
    crossEnd = tmp;
    crossSign = -1;
  } else {
    crossSign = 1;
    crossBase = 0;
  }
  return { mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase };
}
/**
 * @description 设置style的初始化值
 * @param {*} style
 */
function initBaseStyle(style) {
  ['width', 'height'].forEach((size) => {
    if (style[size] === 'auto' || style[size] === '') {
      style[size] = null;
    }
  });
  if (!style.flexDirection || style.flexDirection === 'auto') {
    style.flexDirection = 'row';
  }
  if (!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch';
  }
  if (!style.flexWrap || !style.flexWrap === 'auto') {
    style.flexWrap = 'nowrap';
  }
  if (!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'flex-start';
  }
  if (!style.alignContent || !style.alignContent === 'auto') {
    style.alignContent = 'stretch';
  }
}

/**
 * @description 将ele的style做预处理，将px等属性变为纯数字
 * @param {*} element
 */
function getStyle(element) {
  element.style = element.style || {};
  for (let prop in element.computedStyle) {
    element.style[prop] = element.computedStyle[prop].value;
    if (element.style[prop].toString().match(/px$/) || element.style[prop].toString().match(/^[0-9.]+$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
  }
  return element.style;
}

module.exports = layout;
