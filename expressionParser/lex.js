/**
 * 词法分析器
 * 表达式解析的第一个步骤，拆词(词法分析)将表达式拆成一个个token
 * 这里拆词我使用了有限状态机模式，避免代码中出现大量的if语句，造成后期review困难和难以维护的情况。
 * !这里只简单实现核心功能
 */


/**
 * 表达式案例：
 * [指标1] - [电脑功率] * 10 / 2 + (3 * [显卡最大功率])
 * 其中固定的运算符有： + - * / ()
 * 固定标识符：[ ]
 * 固定的计算对象：纯数值 和 标识符'[]'中间部分为一整体
 */

const expression = '[指标1 ]'

const DFA = [
  [1, 1, 3, 3, 5, 5, 7, 7, 9, 9, 'x', 12, 12, 'x'],
  [0, 2, 'x', 2, 'x', 2, 'x', 2, 'x', 'x', 2, 7, 'x', 2],
  ['x', 4, 'x', 6, 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
  [0, 'x', 2, 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
  ['x', 10, 'x', 13, 'x', 10, 'x', 13, 'x', 'x', 'x', 'x', 'x', 13],
  [8, 'x', 11, 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
  ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 9, 9, 'x', 12, 12, 'x'],
  ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 10, 'x', 'x', 13, 'x'],
  [0, 10, 2, 13, 'x', 10, 'x', 13, 'x', 'x', 10, 'x', 'x', 13]
]

let currentState = 0 // 当前状态

let prevState = 0 // 上一个状态

let errorMessage = null // 报错信息

let isStartSignSymbol = false // 正负号开头

const parenthesiStack = [] // 小括号栈

const numericRE = /[0-9]/ // 数值正则

const operatorRE = /[+\-*\/%]/ // 运算符正则

const indicatorNameRe = /[a-zA-Z\u4e00-\u9fa5_]/ // 指标名称正则

const spaceRE = /\s/



// 识别器规则
const identifierRules = [
  {
    code: 1,
    ruleType: 'reg',
    reg: numericRE
  }, {
    code: 2,
    ruleType: 'reg',
    reg: operatorRE
  }, {
    code: 3,
    ruleType: 'judgment',
    word: '.'
  }, {
    code: 4,
    ruleType: 'judgment',
    word: '('
  }, {
    code: 5,
    ruleType: 'judgment',
    word: ')'
  }, {
    code: 6,
    ruleType: 'judgment',
    word: '['
  }, {
    code: 7,
    ruleType: 'reg',
    reg: indicatorNameRe
  }, {
    code: 8,
    ruleType: 'judgment',
    word: ']'
  }, {
    code: 9,
    ruleType: 'reg',
    reg: spaceRE
  }
]


/**
 * 字符识别器
 * @param {string} key 
 * @return {number} code
 */
const identifier = (key) => {
  let code = null
  identifierRules.some(rule => {
    let res = false
    if (rule.ruleType === 'reg') {
      res = rule.reg.test(key)
    } else if (rule.ruleType === 'judgment') {
      res = key === rule.word
    }
    code = res ? rule.code : code
    return res
  })
  return code
}


// 定义错误类型
const errorTypes = {
  illegalCharError: (key) => `"${key}"再当前位置为非法字符`,
  outOfPlaceError: (key) => `"${key}"不能出现再当前位置`,
  operatorError: () => '运算符后面不能再出现运算符',
  floatError: (key) => `当前位置只能是数字，但是接收到的是“${key}”`,
  noContentError: () => '"[]"中不可为空',
  spaceError: () => '空格不可出现再此处',
  
  notAnExpression: () => '这不是一个表达式',
  incompleteExpression: () => '表达式不完整',
  incompleteFloatNumber: () => '表达式末尾浮点数不完整',
  missingParenthesis1: () => '表达式结尾位置缺少“]”',
  missingParenthesis2: (index) => `第${Number(index) + 1}字符位置的"("未闭合`,
}

const errorStateMap = {
  0: {
    2: errorTypes.illegalCharError,
    3: errorTypes.outOfPlaceError,
    7: errorTypes.illegalCharError,
    8: errorTypes.illegalCharError
  },
  1: {
    4: errorTypes.outOfPlaceError,
    6: errorTypes.outOfPlaceError,
    7: errorTypes.illegalCharError,
    8: errorTypes.illegalCharError
  },
  2: {
   2: errorTypes.operatorError,
   3: errorTypes.outOfPlaceError,
   5: errorTypes.outOfPlaceError,
   7: errorTypes.illegalCharError,
   8: errorTypes.outOfPlaceError,
  },
  4: {
   2: errorTypes.floatError,
   3: errorTypes.floatError,
   4: errorTypes.floatError,
   5: errorTypes.floatError,
   6: errorTypes.floatError,
   7: errorTypes.floatError,
   8: errorTypes.outOfPlaceError,
   9: errorTypes.illegalCharError
  },
  5: {
    3: errorTypes.outOfPlaceError,
    4: errorTypes.outOfPlaceError,
    6: errorTypes.outOfPlaceError,
    7: errorTypes.illegalCharError,
    8: errorTypes.illegalCharError
  },
  8: {
    2: errorTypes.illegalCharError,
    3: errorTypes.illegalCharError,
    4: errorTypes.illegalCharError,
    5: errorTypes.illegalCharError,
    6: errorTypes.illegalCharError,
    8: errorTypes.noContentError,
    9: errorTypes.spaceError,
  },
  9: {
    2: errorTypes.illegalCharError,
    3: errorTypes.illegalCharError,
    4: errorTypes.illegalCharError,
    5: errorTypes.illegalCharError,
    6: errorTypes.illegalCharError,
    9: errorTypes.spaceError,
  },
  10: {
    1: errorTypes.illegalCharError,
    3: errorTypes.illegalCharError,
    4: errorTypes.illegalCharError,
    6: errorTypes.illegalCharError,
    8: errorTypes.illegalCharError
  },
  13: {
    1: errorTypes.illegalCharError,
    3: errorTypes.outOfPlaceError,
    4: errorTypes.outOfPlaceError,
    5: errorTypes.outOfPlaceError,
    6: errorTypes.illegalCharError,
    7: errorTypes.illegalCharError,
    8: errorTypes.illegalCharError
  }
}

Object.assign(errorStateMap, {
  3: errorStateMap[1],
  6: errorStateMap[4],
  7: errorStateMap[5],
  11: errorStateMap[8],
  12: errorStateMap[9]
})



for (let i in expression) {
  const key = expression[i]
  const code = identifier(key)

  // 如果是“(”则推入栈中
  if (code === 4) {
    isStartSignSymbol = false
    parenthesiStack.push({
      index: i,
      char: '(',
      code
    })
  }
  
  // 如果是“)”则讲栈中弹出最近一次push的item
  if (code === 5) {parenthesiStack.pop()}

  // 如果是表达式开始位置且输入类型为2（+-*/） ，处理特殊情况开头带正负号的表达式
  if (code === 2 && currentState === 0) {

    // 判断是否为正负号
    if (['+', '-'].includes(key)) {
      // 判断有没有输入过正负号
      if (isStartSignSymbol) {
        currentState = 'x'
        errorHandling(code, i, key, errorTypes.operatorError)
        break
      } else isStartSignSymbol = true
    } else currentState = 'x'
  }
  currentState = DFA[code - 1][currentState] ?? 'x'
  if (currentState !== 'x') prevState = currentState
  else {
    errorHandling(code, i, key)
    break
  }
}

function errorHandling(code, index, key, fn) {
  console.log(prevState)
  const errorFn = fn || errorStateMap[prevState]?.[code]
  errorMessage = errorFn ? `第${Number(index) + 1}个字符位置，` + errorFn(key) : '当前表达式无效'
}

const stateValid = [3, 7, 13].includes(currentState)

const parenthesiValid = !parenthesiStack.length

const valid = stateValid && parenthesiValid

if (!stateValid) {
  switch(currentState) {
    case 0: 
      errorMessage = errorTypes.notAnExpression()
      break;
    case 1:
      errorMessage = errorTypes.notAnExpression()
      break;
    case 2:
      errorMessage = errorTypes.incompleteExpression()
      break;
    case 4:
      errorMessage = errorTypes.notAnExpression()
      break;
    case 5:
      errorMessage = errorTypes.notAnExpression()
      break;
    case 6:
      errorMessage = errorTypes.incompleteFloatNumber()
      break;
    case 8:
      errorMessage = errorTypes.notAnExpression()
      break;
    case 9:
      errorMessage = errorTypes.notAnExpression()
      break;
    case 10:
      errorMessage = errorTypes.notAnExpression()
      break;
    case 11:
      errorMessage = errorTypes.notAnExpression()
      break;
    case 12:
      errorMessage = errorTypes.missingParenthesis1()
      break;
  }
} else if (!parenthesiValid) {
  
  errorMessage = errorTypes.missingParenthesis2(parenthesiStack.pop().index)
}



console.log({ valid, error: errorMessage })
