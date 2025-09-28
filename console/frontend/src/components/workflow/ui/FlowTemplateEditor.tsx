import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  memo,
} from 'react';
import { cloneDeep, debounce } from 'lodash';
import { v4 as uuid } from 'uuid';
import useFlowsManager from '@/components/workflow/store/useFlowsManager';
import FlowTree from './FlowTree';

const FlowTemplateEditor = (props: unknown): React.ReactElement => {
  const {
    data,
    value,
    placeholder = '',
    onBlur = (): void => {},
    onChange = (value): void => {},
    minHeight = '100px',
  } = props;

  const updateNodeInputData = useFlowsManager(
    state => state.updateNodeInputData
  );
  const getCurrentStore = useFlowsManager(state => state.getCurrentStore);
  const currentStore = getCurrentStore();
  const isComposingRef = useRef(false);
  const beforeUpdateNodeInputData = useRef(false);
  const replaceSpanRef = useRef(false);
  const zoom = currentStore(state => state.zoom);
  const editorRef = useRef<null | HTMLDivElement>(null);
  const parentRef = useRef(null);
  const currentSelection = useRef(null);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const willInertInfo = useRef({
    cursorPosition: 0,
    offset: {
      offsetLeft: 0,
      offsetRight: 0,
    },
  });
  const [treeData, setTreeData] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [matchingInformation, setMatchingInformation] = useState({
    keyWord: '',
    matchingKeyWord: '',
  });
  const [templateValue, setTemplateValue] = useState('');
  const isPastingRef = useRef(false);

  // 键盘事件的状态管理
  const [focusedKey, setFocusedKey] = useState(null);
  const [keyboardNavigationActive, setKeyboardNavigationActive] =
    useState(false);
  const [isArrowDownPressed, setIsArrowDownPressed] = useState(false);
  //用于记录是否是首次打开下拉菜单
  const [isFirstOpen, setIsFirstOpen] = useState(true);

  useEffect(() => {
    if (showDropdown) {
      // 每次打开下拉菜单时重置focusedKey
      setFocusedKey(null);
      setKeyboardNavigationActive(false);

      // 如果不是首次打开，重置选择状态
      if (!isFirstOpen) {
        setIsFirstOpen(true); // 为下次打开做准备
      }
    } else {
      // 隐藏下拉菜单时重置首次打开标记
      setIsFirstOpen(false);
    }
  }, [showDropdown]);

  useEffect(() => {
    if (beforeUpdateNodeInputData.current !== updateNodeInputData) {
      setTemplateValue(value);
      setEditorContent(value || '');
      beforeUpdateNodeInputData.current = updateNodeInputData;
    }
  }, [updateNodeInputData, value]);

  useEffect(() => {
    setTemplateValue(value);
  }, []);

  const setEditorContent = useCallback(content => {
    if (editorRef.current) {
      // 清空现有内容
      editorRef.current.innerHTML = '';

      // 将字符串按行分割
      const lines = content.split('\n');

      // 处理每一行的内容，将 {{xxx}} 包裹上 <span>
      lines.forEach((line, index) => {
        const lineContainer = document.createElement('div');

        // 使用正则表达式查找并分割 {{xxx}} 包裹的内容
        const parts = line.split(/(\{\{.*?\}\})/g);

        parts.forEach(part => {
          if (part.startsWith('{{') && part.endsWith('}}')) {
            // 如果是 {{xxx}} 的部分，用 <span> 包裹
            const span = document.createElement('span');
            span.textContent = part;
            span.style.color = 'blue'; // 可根据需求设置样式
            lineContainer.appendChild(span);
          } else {
            // 其他文本直接添加为文本节点
            const textNode = document.createTextNode(part);
            lineContainer.appendChild(textNode);
          }
        });

        // 检查 lineContainer 是否为空
        if (!lineContainer.textContent.trim()) {
          // 如果为空，添加 <br /> 标签
          const br = document.createElement('br');
          lineContainer.appendChild(br);
        }

        // 将处理好的行添加到编辑器中
        editorRef.current.appendChild(lineContainer);
      });
    }
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      setEditorContent(value || '');
    }
  }, []);

  useEffect(() => {
    setIsEmpty(!templateValue);
  }, [templateValue]);

  useEffect(() => {
    if (editorRef?.current) {
      const handleKeyDown = (event): void => {
        if (event.ctrlKey && (event.key === 'c' || event.key === 'v')) {
          event.stopPropagation();
          if (event.key === 'v') {
            isPastingRef.current = true;
          }
        }
      };

      editorRef.current.addEventListener('keydown', handleKeyDown);
      return (): void => {
        editorRef?.current?.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  useEffect((): void | (() => void) => {
    if (editorRef?.current) {
      const handleWheel = (e: WheelEvent): void => {
        e.stopPropagation();
      };

      editorRef?.current.addEventListener('wheel', handleWheel);

      return (): void => {
        editorRef?.current?.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  const findNodeByValue = useCallback((value, nodes): unknown | null => {
    for (const node of nodes) {
      // 检查当前节点的值是否匹配
      if (node.value === value) {
        return {
          ...node,
          id: uuid(),
        };
      }

      // 如果当前节点有子节点，递归查找
      if (node.children) {
        const found = findNodeByValue(value, node.children);
        if (found) {
          return {
            ...found,
            id: uuid(),
          }; // 找到匹配的节点
        }
      }

      // 检查当前节点的引用
      if (node.references) {
        const found = findNodeByValue(value, node.references);
        if (found) {
          return {
            ...found,
            id: uuid(),
          }; // 找到匹配的节点
        }
      }
    }

    return null; // 如果没有找到匹配的节点
  }, []);

  useEffect((): void | (() => void) => {
    const handleClickOutside = (): void => {
      setShowDropdown(false);
    };

    window.addEventListener('click', handleClickOutside);

    return (): void => window.removeEventListener('click', handleClickOutside);
  }, []);

  const inputs = useMemo(() => {
    return data?.inputs || [];
  }, [data]);

  const references = useMemo(() => {
    return data?.references || [];
  }, [data]);

  const inputsOption = useMemo(() => {
    return (
      inputs
        ?.map(input => {
          const contentValue = input?.schema?.value?.content?.name;
          const treeContent = findNodeByValue(
            contentValue,
            cloneDeep(references)
          );
          if (input?.schema?.value?.type === 'literal' || !treeContent) {
            return {
              id: treeContent?.id || input?.id,
              label: input?.name,
            };
          } else {
            return {
              ...treeContent,
              label: input?.name,
            };
          }
        })
        ?.filter(input => input) || []
    );
  }, [inputs, references]);

  const insertOption = useCallback((content, isLeaf) => {
    const range = currentSelection.current;
    const replaceContent = content?.slice(willInertInfo?.current?.offset);

    if (range) {
      // 删除当前选区内的内容
      range.deleteContents();

      // 清理现有的文本节点
      const startContainer = range.startContainer;
      const offset = range.startOffset;
      let newRange = document.createRange();

      // 如果光标前后有文本节点，删除它们
      if (startContainer.nodeType === Node.TEXT_NODE) {
        const textBefore = startContainer.textContent.slice(
          0,
          offset - willInertInfo?.current?.offset?.offsetLeft
        );

        const textAfter = startContainer.textContent.slice(
          offset + willInertInfo?.current?.offset?.offsetRight
        );
        // 只保留一个文本节点
        startContainer.textContent = textBefore + content + textAfter;
        const contentLength =
          textBefore?.length + content?.length + textAfter?.length;
        const textNode = startContainer.childNodes[0] || startContainer;
        const cursorOffset = isLeaf ? contentLength : contentLength - 2;
        newRange.setStart(textNode, cursorOffset);
        newRange.collapse(true);
      } else {
        // 创建并插入新的文本节点
        const textNode = document.createTextNode(replaceContent);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        newRange = range;
      }
      // 恢复选区
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(newRange);

      // 隐藏下拉菜单
      setShowDropdown(false);
    }
  }, []);

  const getCursorPosition = useCallback(() => {
    const parentDiv = parentRef.current;

    // 获取光标位置
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // 获取父元素的位置信息
    const parentRect = parentDiv.getBoundingClientRect();

    // 计算光标到父元素顶部和左边的距离
    const offsetTop = rect.top - parentRect.top;
    const offsetLeft = rect.left - parentRect.left;
    const scale = zoom / 100;

    setDropdownPosition({
      top: offsetTop / scale + 20,
      left: offsetLeft / scale,
    });
  }, [zoom]);

  const filterArr = useCallback(
    (arr, value, offset, content) => {
      const splitArr = value?.split('.');
      const filterSplitArr = splitArr?.map(str => str.replace(/\[\d+\]$/, ''));
      willInertInfo.current.offset = offset;
      if (splitArr?.length === 1) {
        setMatchingInformation({
          keyWord: content?.split('.')[0],
          matchingKeyWord: value,
        });
        return arr.filter(item => item?.label?.startsWith(value));
      } else {
        const topValue = inputs?.find(item => item.name === filterSplitArr[0]);
        const endValue = splitArr.at(-1);
        const leftIndex = value?.replace(`${endValue}`, '')?.length;
        const contentValue =
          topValue?.schema?.value?.content?.name +
          value?.replace(splitArr[0], '')?.replace(`.${endValue}`, '');
        const treeContent =
          findNodeByValue(contentValue, cloneDeep(references))?.children || [];
        setMatchingInformation({
          keyWord: content?.slice(leftIndex),
          matchingKeyWord: endValue,
        });
        return treeContent;
      }
    },
    [references, inputs]
  );

  const getCurrentLineContent = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedNode = range.startContainer;

    // 查找到包含光标的最高父元素（如 <div>）
    let currentLine = selectedNode;
    while (currentLine && currentLine.nodeType !== Node.ELEMENT_NODE) {
      currentLine = currentLine.parentNode;
    }

    if (currentLine) {
      const nodes = Array.from(currentLine.childNodes);
      let nearbyContent = '';

      nodes.forEach(node => {
        const nodeText = node.textContent || '';
        const isCursorInNode =
          range.startContainer === node || node.contains(range.startContainer);

        if (isCursorInNode) {
          // 光标在此节点内，返回此节点内容
          nearbyContent = nodeText;
        }
      });

      return nearbyContent;
    }
  }, []);

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        // 如果在 {{ 内，激活下拉菜单的键盘导航
        if (showDropdown && isInsideTemplateTag()) {
          e.preventDefault();
          // 设置初始焦点
          if (!focusedKey && treeData.length > 0) {
            setFocusedKey(treeData[0].id);
          }
          setKeyboardNavigationActive(true);
          dropdownRef.current?.focus();
          return;
        }
      }
      if (e.key !== 'Backspace' && e.key !== 'Delete') {
        replaceSpanRef.current = false;
      } else {
        replaceSpanRef.current = true;
      }
    },
    [inputsOption, zoom, references, inputs, showDropdown, focusedKey, treeData]
  );
  // 辅助函数：判断光标是否在 {{}} 内
  const isInsideTemplateTag = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    const currentLineContent = getCurrentLineContent();
    if (!currentLineContent) return false;

    const cursorPosition = range.startOffset;
    const textBeforeCursor = currentLineContent.slice(0, cursorPosition);
    const textAfterCursor = currentLineContent.slice(cursorPosition);

    return textBeforeCursor.includes('{{') && textAfterCursor.includes('}}');
  }, []);

  const handleClick = useCallback(() => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const cursorPosition = range.startOffset;
      const editorContent = getCurrentLineContent();

      const beforeCursor = editorContent.slice(0, cursorPosition);
      const afterCursor = editorContent.slice(cursorPosition);

      const matchBefore = beforeCursor.match(/{{([^{}]*)$/);
      const matchAfter = afterCursor.match(/^([^{}]*)}}/);

      if (matchBefore) {
        const matchText = matchBefore[1];
        if (matchText) {
          const newOptions = filterArr(
            inputsOption,
            matchText,
            {
              offsetLeft: matchBefore?.[1]?.length || 0,
              offsetRight: matchAfter?.[1]?.length || 0,
            },
            matchBefore[1] + matchAfter?.[1]
          );
          if (newOptions?.length) {
            willInertInfo.current.cursorPosition = cursorPosition;
            currentSelection.current = range;
            setShowDropdown(true);
            setTreeData(newOptions);
          } else if (matchText?.endsWith('.')) {
            setShowDropdown(true);
            setTreeData(newOptions);
          } else {
            setShowDropdown(false);
          }
        } else {
          const { x, y } = range.getBoundingClientRect();
          setDropdownPosition({ top: y + 20, left: x });
          currentSelection.current = range;
          setShowDropdown(true);
          setTreeData(cloneDeep(inputsOption));
          willInertInfo.current.cursorPosition = cursorPosition;
          willInertInfo.current.offset = {
            offsetLeft: 0,
            offsetRight: matchAfter?.[1]?.length || 0,
          };
          setMatchingInformation({
            keyWord: '',
            matchingKeyWord: '',
          });
        }
      } else {
        setMatchingInformation({
          keyWord: '',
          matchingKeyWord: '',
        });
        setShowDropdown(false); // 否则隐藏下拉菜单
      }
      getCursorPosition();
    } else {
      setShowDropdown(false);
    }
    // 打开下拉菜单时重置选择状态
    setFocusedKey(null);
    setKeyboardNavigationActive(false);
    setIsFirstOpen(false);
  }, [inputsOption, zoom, references, inputs]);

  const onKeyUp = useCallback(
    e => {
      e.stopPropagation();

      const selection = window.getSelection();

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const cursorPosition = range.startOffset;
        const editorContent = getCurrentLineContent();

        const beforeCursor = editorContent.slice(0, cursorPosition);
        const afterCursor = editorContent.slice(cursorPosition);

        const matchBefore = beforeCursor.match(/{{([^{}]*)$/);
        const matchAfter = afterCursor.match(/^([^{}]*)}}/);

        if (matchBefore) {
          const matchText = matchBefore[1];
          if (matchText) {
            const newOptions = filterArr(
              inputsOption,
              matchText,
              {
                offsetLeft: matchBefore?.[1]?.length || 0,
                offsetRight: matchAfter?.[1]?.length || 0,
              },
              matchBefore[1] + matchAfter?.[1]
            );
            if (newOptions?.length) {
              willInertInfo.current.cursorPosition = cursorPosition;
              currentSelection.current = range;
              setShowDropdown(true);
              setTreeData(newOptions);
            } else if (matchText?.endsWith('.')) {
              setShowDropdown(true);
              setTreeData(newOptions);
            } else {
              setShowDropdown(false);
            }
          } else {
            const { x, y } = range.getBoundingClientRect();
            setDropdownPosition({ top: y + 20, left: x });
            currentSelection.current = range;
            setShowDropdown(true);
            setTreeData(cloneDeep(inputsOption));
            willInertInfo.current.cursorPosition = cursorPosition;
            willInertInfo.current.offset = {
              offsetLeft: 0,
              offsetRight: matchAfter?.[1]?.length || 0,
            };
            setMatchingInformation({
              keyWord: '',
              matchingKeyWord: '',
            });
          }
        } else {
          setMatchingInformation({
            keyWord: '',
            matchingKeyWord: '',
          });
          setShowDropdown(false); // 否则隐藏下拉菜单
        }
        getCursorPosition();
      } else {
        setShowDropdown(false);
      }
      // 打开下拉菜单时重置选择状态
      setFocusedKey(null);
      setKeyboardNavigationActive(false);
      setIsFirstOpen(false);
    },
    [inputsOption, zoom, references, inputs]
  );

  const findPathToNode = useCallback((tree, key, path = []) => {
    for (const node of tree) {
      const label =
        node?.type === 'array-object' ? node?.label + '[0]' : node?.label;
      const newPath = [...path, label];
      if (node.id === key) {
        return newPath;
      }
      if (node.children) {
        const result = findPathToNode(node.children, key, newPath);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }, []);

  const findNodeByKey = useCallback((data, key) => {
    for (const node of data) {
      if (node.id === key) {
        return node;
      }
      if (node.children) {
        const found = findNodeByKey(node.children, key);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }, []);

  const handleTreeSelect = useCallback(
    selectedKeys => {
      if (selectedKeys.length > 0) {
        const selectedKey = selectedKeys[0];
        const pathTitles = findPathToNode(treeData, selectedKey);
        const pathString = pathTitles ? pathTitles.join('.') : '';
        const selectedNode = findNodeByKey(treeData, selectedKey);
        const isLeaf = selectedNode && !selectedNode.children;
        insertOption(pathString, isLeaf);
        handleInput();
      }
    },
    [treeData]
  );

  const handleReplaceInput = useCallback(
    e => {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const currentLineContent = getCurrentLineContent();
      const cursorPosition = range.startOffset;
      const textBeforeCursor = currentLineContent?.slice(0, cursorPosition);

      // 检查是否输入了 "{"
      if (textBeforeCursor?.endsWith('{') && !replaceSpanRef.current) {
        replaceSpanRef.current = true;
        e.preventDefault(); // 阻止默认输入事件

        // 创建包含 "{{}}" 的 <span> 元素
        const span = document.createElement('span');
        span.textContent = '{{}}';
        span.style.color = 'blue'; // 可根据需求自定义样式

        // 获取光标所在的文本节点和偏移量
        const startContainer = range.startContainer;
        const offset = range.startOffset;

        if (startContainer.nodeType === Node.TEXT_NODE) {
          // 在当前文本节点中替换内容
          const textBefore = startContainer.textContent.slice(0, offset - 1); // 去掉最后一个 "{"
          const textAfter = startContainer.textContent.slice(offset);

          // 更新当前文本节点内容，去掉最后输入的 "{"
          startContainer.textContent = textBefore + textAfter;

          // 在当前光标位置插入 <span>
          range.setStart(startContainer, textBefore.length);
          range.insertNode(span);
        } else {
          // 若非 TextNode，直接插入 <span> 包裹的内容
          range.insertNode(span);
        }

        // const textNode = document.createTextNode('x')
        // span?.parentNode?.insertBefore(textNode, span?.nextSibling);

        // 设置光标在 "{{}}" 中间的 `{` 后
        range.setStart(span.firstChild, 2); // 光标位于 "{{}}" 中的 `{` 后
        range.collapse(true);

        // 清除现有的选区并设置新的 Range
        selection.removeAllRanges();
        selection.addRange(range);
        setTimeout(() => {
          replaceSpanRef.current = false;
        }, 100);
      }
    },
    [] // 添加依赖项
  );

  const handleChangeDebounce = useCallback(
    debounce(text => {
      onChange(text);
    }, 500),
    []
  );

  const handleInput = useCallback(
    (e?) => {
      const editor = editorRef.current;
      let text = '';
      if (text === '\n') text = '';
      // 重置粘贴状态
      if (isPastingRef.current) {
        isPastingRef.current = false;
        text = editor?.innerText;
        setEditorContent(text || '');
      } else {
        text = editor?.innerText?.replaceAll('\n\n', '\n');
      }
      handleChangeDebounce(text || '');
      setTemplateValue(text || '');
      if (!replaceSpanRef.current) {
        handleReplaceInput(e);
        handleReplaceSpan();
      }
    },
    [onChange, setIsEmpty]
  );

  const noProperties = useMemo(() => {
    return treeData?.every(
      item => !item?.children || item?.children?.length === 0
    );
  }, [treeData]);

  const hasData = useMemo(() => {
    return treeData?.length > 0;
  }, [treeData]);

  const titleRender = useCallback(
    value => {
      const isFocused = value.id === focusedKey && keyboardNavigationActive;
      const content = value?.label || '';
      const { keyWord, matchingKeyWord } = matchingInformation;
      // 先匹配 keyWord，将其包裹为蓝色
      const escapedKeyWord = keyWord.replace(
        /[-[\]{}()*+?.,\\^$|#\s]/g,
        '\\$&'
      );
      const blueWrappedContent = content
        .split(new RegExp(`(${escapedKeyWord})`, 'g'))
        .map((part, index) => {
          if (part === keyWord) {
            // 在匹配到 keyWord 的部分，进一步处理 matchingKeyWord 的嵌套包裹
            return (
              <span key={`blue-${index}`} style={{ color: '#4d53e8' }}>
                {part
                  .split(new RegExp(`(${matchingKeyWord})`, 'g'))
                  .map((subPart, subIndex) => {
                    if (subPart === matchingKeyWord) {
                      return (
                        <span
                          key={`yellow-${index}-${subIndex}`}
                          style={{ color: '#ff9600' }}
                        >
                          {subPart}
                        </span>
                      );
                    }
                    return subPart;
                  })}
              </span>
            );
          }
          return part;
        });

      return (
        <div
          className={isFocused ? 'bg-gray-100 rounded px-1' : ''}
          onClick={() => {
            // handleTreeSelect([focusedKey]);
          }}
        >
          {blueWrappedContent}
        </div>
      );
    },
    [matchingInformation, focusedKey, keyboardNavigationActive]
  );

  const handleReplaceSpan = useCallback(() => {
    if (isComposingRef.current) return;
    // 获取光标位置的范围
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // 获取当前光标的父元素
    const parentNode = range.startContainer.parentNode;

    // 判断是否在 `{{input}}` 的 `span` 标签之后
    if (parentNode.tagName === 'SPAN' && parentNode.style.color === 'blue') {
      // 确保光标位置在 `</span>` 后
      const span = parentNode;
      if (range.startOffset === span.textContent.length) {
        // 在 `span` 外部插入文字
        const str = span.textContent;
        const regex = /\}\}(.)/;
        const match = str.match(regex);
        const index = match?.index + 2;
        if (match) {
          const newTextNode = document.createTextNode(
            range.startContainer.nodeValue.slice(index)
          );
          span.textContent = span.textContent?.slice(0, index);
          span.parentNode.insertBefore(newTextNode, span.nextSibling);

          // 修正光标位置到新插入的文字节点
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.setStart(newTextNode, newTextNode.length);
          selection.addRange(newRange);

          // 删除光标多余内容（防止重复输入）
          range.startContainer.nodeValue = span.textContent;
        }
      } else if (range.startOffset === 1) {
        // 在 span 开始位置插入文本节点
        const index = 1;
        const newTextNode = document.createTextNode(
          range.startContainer.nodeValue.slice(0, index)
        );
        span.textContent = span.textContent?.slice(index);
        span.parentNode.insertBefore(newTextNode, span);

        // 修正光标位置到新插入的文字节点
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStart(newTextNode, 1);
        selection.addRange(newRange);
      }
    }
  }, []);

  // 处理下拉菜单内的键盘事件
  const handleDropdownKeyDown = useCallback(
    e => {
      if (!treeData.length) return;

      const key = e.key;
      const isArrowKey = key === 'ArrowUp' || key === 'ArrowDown';
      const isEnterKey = key === 'Enter';

      if (isArrowKey) {
        e.preventDefault();
        setKeyboardNavigationActive(true);

        let currentIndex = treeData.findIndex(node => node.id === focusedKey);
        if (focusedKey === null) {
          currentIndex = -1;
        }

        if (currentIndex === -1 && treeData.length > 0) {
          currentIndex = 0; // 首次导航时设为第一个节点
          setFocusedKey(treeData[currentIndex].id);
          ensureNodeVisible(treeData[currentIndex].id);
          return;
        }

        const direction = key === 'ArrowUp' ? -1 : 1;
        const newIndex =
          (currentIndex + direction + treeData.length) % treeData.length;

        const newFocusedNode = treeData[newIndex];
        setFocusedKey(newFocusedNode.id);

        ensureNodeVisible(newFocusedNode.id);
      } else if (isEnterKey && focusedKey) {
        e.preventDefault();
        handleTreeSelect([focusedKey]);
      }
    },
    [treeData, focusedKey, handleTreeSelect]
  );

  // 确保选中节点可见（处理滚动）
  const ensureNodeVisible = useCallback(nodeId => {
    const nodeElement = dropdownRef.current?.querySelector(
      `[data-key="${nodeId}"]`
    );
    if (nodeElement) {
      nodeElement.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  // 焦点管理逻辑,只有按下箭头键时才聚焦
  useEffect(() => {
    if (showDropdown && isArrowDownPressed) {
      dropdownRef.current?.focus();
      setIsArrowDownPressed(false); // 重置状态
    }
  }, [showDropdown, isArrowDownPressed]);

  useEffect(() => {
    if (showDropdown && treeData.length > 0) {
      // 仅在通过键盘导航且未设置焦点时初始化聚焦
      if (keyboardNavigationActive && focusedKey === null) {
        setFocusedKey(treeData[0].id);
      }
    }
  }, [showDropdown, treeData, focusedKey, keyboardNavigationActive]);

  // 键盘事件监听
  useEffect((): void | (() => void) => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowDown') {
        setIsArrowDownPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowDown') {
        setIsArrowDownPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return (): void => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div
      ref={parentRef}
      style={{ position: 'relative' }}
      className="nodrag"
      onKeyDown={e => e.stopPropagation()}
    >
      <div
        ref={editorRef}
        contentEditable
        onKeyDown={handleKeyDown}
        onKeyUp={onKeyUp}
        onClick={e => {
          e.stopPropagation();
          handleClick();
        }}
        className="flow-template-editor nodrag"
        style={{
          padding: '10px',
          minHeight,
        }}
        onBlur={onBlur}
        onInput={e => handleInput(e)}
        onCompositionStart={() => (isComposingRef.current = true)}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          handleReplaceSpan();
        }}
      />
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="nodrag px-2 py-1 min-w-[150px]"
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            borderRadius: '6px',
            backgroundColor: '#fff',
            zIndex: 1000,
            boxShadow: '0 0 1px 0 rgba(0,0,0,.3),0 4px 14px 0 rgba(0,0,0,.1)',
            outline: 'none',
          }}
          onClick={e => e.stopPropagation()}
          onKeyDown={handleDropdownKeyDown} // 添加键盘事件监听
          tabIndex={0} // 使其可以获取焦点
        >
          {hasData ? (
            <FlowTree
              className={noProperties ? 'no-ant-tree-switcher' : ''}
              fieldNames={{
                title: 'label',
                key: 'id',
              }}
              titleRender={titleRender}
              showLine={false}
              treeData={treeData}
              onSelect={handleTreeSelect}
              selectedKeys={keyboardNavigationActive ? [focusedKey] : []}
            />
          ) : (
            <p className="text-desc cursor-text">该变量无子变量</p>
          )}
        </div>
      )}
      {isEmpty && (
        <div
          className="px-2.5 py-1 text-[#9ca3af] break-all"
          style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            pointerEvents: 'none',
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default memo(FlowTemplateEditor);
