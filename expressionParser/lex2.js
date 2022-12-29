
const stateTypeMap = {
  initState: initHandle, // 初始化状态
  numericalState: numericalHandle, // 数值处理
  floatState: floatHandle, // 浮点数处理
  operatorState: operatorHandle, // 处理运算符
  keywordState: keywordHandle // 指标关键词处理 
}

class Lex {
  static tokens // 存放token的数组
  static state // 当前的状态
  constructor() {
   this.init()
  }
  init() {
    this.tokens = []
    this.state = 'initState' // 设置当前状态为“initState”
  }
  parse(expression = "") {
    if (typeof expression !== 'string') throw new Error('noExpression：Arguments to the "parse" method are not of character types')

    for (let charIndex in expression) {
      const char = expression[charIndex]
      stateTypeMap[this.state](char)
    }
  }
}

/**
 * 初始化状态处理
 * @param {string} char
 */
function initHandle(char) {
  console.log('initHandle -> :', char)
}


/**
 * 处理数值类型字符串
 * @param {string} char 
 */
function numericalHandle(char) {

}

/**
 * 处理浮点数
 * @param {string} char 
 */
function floatHandle(char) {

}

/**
 * 处理运算符
 * @param {string} char 
 */
function operatorHandle(char) {

}

/**
 * 指标名称处理
 * @param {string} char 
 */
function keywordHandle(char) {

}
