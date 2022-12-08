/**
 * 我们平时见到的树状结构一般都是这样的，每层数组中的item都会有一个children，里面嵌套一个数组然后每个子item也还会有各自的children，就这样一直嵌套下去。
 * 而拍扁后的树状结构其实是一个对象，每个item都扁平化平铺在第一层，每一个item都有各自的parentId与childrenIds。
 */

// const treeData = [
//   {
//     title: '父节点',
//     key: '0-0',
//     children: [
//       {
//         title: '子节点1',
//         key: '0-0-0',
//         children: [
//           {
//             title: '子节点1-1',
//             key: '0-0-0-0'
//           },
//           { 
//             title: '子节点1-2',
//             key: '0-0-0-1'
//           }
//         ]
//       }
//     ]
//   }
// ]

// treeData是一个标准的树结构，扁平化之后将会得到如下map结构

// const treeItemMap = {
//   root: {
//     title: '根节点',
//     childrenIds: ['0-0-0'],
//     parentId: '',
//   },
//   '0-0-0': {
//     title: '子节点1',
//     childrenIds: ['0-0-0-0', '0-0-0-1'],
//     parentId: 'root',
//   },
//   '0-0-0-0': {
//     title: '子节点1-1',
//     childrenIds: [],
//     parentId: '0-0-0',
//   },
//   '0-0-0-1': {
//     title: '子节点1-2',
//     childrenIds: [],
//     parentId: '0-0-0',
//   }
// }


// 接下来我们将树结构扁平化

const treeData = [
  {
    title: '电脑',
    key: '0-0',
    children: [
      {
        title: 'CPU',
        key: '0-0-0',
        children: [
          {
            title: '寄存器',
            key: '0-0-0-0'
          },
          { 
            title: '逻辑运算器',
            key: '0-0-0-1'
          }
        ]
      },
      {
        title: '内存',
        key: '0-0-1',
      },
      {
        title: '显卡',
        key: '0-0-2',
        children: [
          {
            title: 'GPU',
            key: '0-0-2-0',
          },
          {
            title: '显存',
            key: '0-0-2-1',
          }
        ]
      }
    ]
  },
  {
    title: '显示器',
    key: '0-1',
    children: [
      {
        title: '背光',
        key: '0-1-0',
      },
      {
        title: '屏幕技术',
        key: '0-1-0',
      }
    ]
  }
]

/**
   * 递归处理树
   * @param {array} tree 
   * @param {string|null} prevId 
   * @param {object} flatTreeMap 
   * @returns {array}
   */
 function recTree(tree = [], prevId = '', flatTreeMap = {}) {
  for (let i = 0; i < tree.length; i++) {
    const { key, children, ...treeItem } = tree[i]
    flatTreeMap[key] = {
      ...treeItem,
      childrenIds: [],
      parentId: prevId
    }

    if (prevId) flatTreeMap[prevId].childrenIds.push(key)

    if (children && children.length) recTree(children, key, flatTreeMap)
  }
  
  return flatTreeMap
}

/**
 * 将树结构处理成扁平树结构
 * @param tree array 需要处理的树
 */
function toFlatTree(tree = []) {
  const treeMap = {}
  // 递归处理树将其扁平化
  recTree(tree, '', treeMap)
  
  return treeMap
}

const flatTree = toFlatTree(treeData)

/**
 * 添加节点
 * @param {string|null} parentId 
 * @param {*} node 
 */
function treeAddNode(parentId, node) {
  const { key, children, ...nodeItem } = node
  flatTree[key] = {
    ...nodeItem,
    childrenIds: [],
    parentId
  }

  flatTree[parentId].childrenIds.push(key)

  if (children && children.length) recTree(children, key, flatTree)
}


const addList = [
  {
    title: 'IPS',
    key: '0-1-0-0',
    children: [
      {
        title: '1080P',
        key: '0-1-0-0-0',
      }
    ]
  }, {
    title: 'AV',
    key: '0-1-0-1'
  }, {
    title: 'OLED',
    key: '0-1-0-2'
  }
]

addList.forEach(item => treeAddNode('0-1-0', item))

