    let rootNodes = [{ name: '', children: [] }]; // 初始一个根节点

    function createInputRow(node, parentArray, depth = 0) {
      const div = document.createElement('div');
      div.className = 'node-input';
      div.style.marginLeft = (depth * 20) + 'px';

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Input Content';
      input.value = node.name;

      input.oninput = () => {
        node.name = input.value.trim();
        updateTreeOutput();
      };

      const btnAdd = document.createElement('button');
      btnAdd.textContent = '+';
      btnAdd.onclick = () => {
        const newNode = { name: '', children: [] };
        node.children.push(newNode);

        // 找出当前层级已有的所有子项行（下一层级）
        const siblings = [];
        let next = div.nextSibling;
        while (next) {
          if (next.classList?.contains('node-input')) {
            const currentDepth = parseInt(next.style.marginLeft || '0') / 20;
            if (currentDepth === depth + 1) {
              siblings.push(next);
            } else if (currentDepth <= depth) {
              break;
            }
          }
          next = next.nextSibling;
        }

        // 创建新行并插入到最后一个子项后面
        const newDiv = createInputRow(newNode, node.children, depth + 1);
        if (siblings.length > 0) {
          const lastChildRow = siblings[siblings.length - 1];
          lastChildRow.parentNode.insertBefore(newDiv, lastChildRow.nextSibling);
        } else {
          div.parentNode.insertBefore(newDiv, div.nextSibling);
        }

        updateTreeOutput();
      };

      const btnRemove = document.createElement('button');
      btnRemove.textContent = '-';
      btnRemove.style.marginLeft = '5px';
      btnRemove.onclick = () => {
        // 如果是根节点中的第一个节点，则不允许删除
        if (parentArray === rootNodes && parentArray.indexOf(node) === 0) {
          return;
        }

        const index = parentArray.indexOf(node);
        if (index > -1) {
          parentArray.splice(index, 1);
        }

        removeSubRows(div);
        updateTreeOutput();
      };

      div.appendChild(input);
      div.appendChild(btnAdd);
      div.appendChild(btnRemove);

      return div;
    }

    function removeSubRows(startRow) {
      let next = startRow.nextSibling;
      while (next && next.classList?.contains('node-input')) {
        const currentDepth = parseInt(next.style.marginLeft || '0') / 20;
        const thisDepth = parseInt(startRow.style.marginLeft || '0') / 20;
        if (currentDepth <= thisDepth) break;
        const temp = next;
        next = next.nextSibling;
        temp.remove();
      }
      startRow.remove();
    }

    function updateTreeOutput() {
      const output = document.getElementById('treeOutput');
      output.textContent = generateTreeTextFromStructure(rootNodes);
    }

    function generateTreeTextFromStructure(nodes) {
      const lines = [];

      function buildLines(children, prefix = '', isLastParent = false, depth = 0) {
        for (let i = 0; i < children.length; i++) {
          const node = children[i];
          const isLast = i === children.length - 1;

          // 根节点无前缀
          if (depth === 0) {
            lines.push(node.name); // 只显示名称
            if (node.children && node.children.length > 0) {
              buildLines(node.children, '', false, depth + 1);
            }
          } else {
            const linePrefix = isLast ? '└── ' : '├── ';
            lines.push(prefix + linePrefix + node.name);

            const childPrefix = isLast
              ? prefix + '    '
              : prefix + '│   ';

            if (node.children && node.children.length > 0) {
              buildLines(node.children, childPrefix, isLast, depth + 1);
            }
          }
        }
      }

      buildLines(nodes, '', false, 0);
      return lines.join('\n');
    }

    function copyToClipboard() {
      const text = document.getElementById('treeOutput').textContent;
      navigator.clipboard.writeText(text).then();
    }

    function reset() {
      rootNodes = [{ name: '', children: [] }];
      const container = document.getElementById('treeBuilder');
      container.innerHTML = '';
      const firstRow = createInputRow(rootNodes[0], rootNodes, 0);
      container.appendChild(firstRow);
      updateTreeOutput();
    }

    function rebuildUIFromTree() {
      const container = document.getElementById('treeBuilder');
      container.innerHTML = '';

      function buildNode(node, depth) {
        const div = createInputRow(node, rootNodes, depth);
        container.appendChild(div);
        for (const child of node.children) {
          buildNode(child, depth + 1);
        }
        return div;
      }

      for (const node of rootNodes) {
        buildNode(node, 0);
      }
    }

    // 初始化
    reset();