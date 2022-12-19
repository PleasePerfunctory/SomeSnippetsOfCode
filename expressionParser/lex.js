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

const expression = '[指标1 ] + 3)'

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

for (let i in expression) {
  const code = identifier(expression[i])

  if (code === 4) {
    isStartSignSymbol = false
    parenthesiStack.push({
      index: i,
      char: '(',
      code
    })
  }
  if (code === 5) {parenthesiStack.pop()}

  if (code === 2 && currentState === 0) {
    if (expression[i] === '+' || expression[i] === '-') {
      if (isStartSignSymbol) currentState = 'x'
      else isStartSignSymbol = true
    } else currentState = 'x'
  }
  currentState = DFA[code - 1][currentState] ?? 'x'
}


console.log(([3, 7, 13].includes(currentState) && !parenthesiStack.length))
