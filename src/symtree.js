import { getLibsbml } from './libsbml.js'

 // base class
export class SymTree {
  constructor() {
  }
}

export class Constant extends SymTree {
  constructor(value) {
    super()
    this.value = value
  }

  evaluate(evaluator, initial=false, conc=true) {
    return this.value
  }
}

export class Symbol extends SymTree {
  constructor(symbol) {
    super()
    // the sbml elt id
    this.symbol = symbol
  }

  evaluate(evaluator, initial=false, conc=true) {
    return evaluator.evaluate(this.symbol, initial, conc)
  }
}

export class Time extends SymTree {
  constructor() {
    super()
  }

  evaluate(evaluator, initial=false, conc=true) {
    return evaluator.getCurrentTime()
  }
}

// unary ops
export class UnaryOperator extends SymTree {
 constructor(operand) {
   this.operand = operand
 }
}

export class Negation extends UnaryOperator {
 constructor(operand) {
   super(operand)
 }

 evaluate(evaluator, initial=false, conc=true) {
   return -this.operand.evaluate(evaluator, initial, conc)
 }
}

// binary ops
export class BinaryOperator extends SymTree {
 constructor(lhs, rhs) {
   super()
   this.lhs = lhs
   this.rhs = rhs
 }
}

export class Product extends BinaryOperator {
 constructor(lhs, rhs) {
   super(lhs, rhs)
 }

 evaluate(evaluator, initial=false, conc=true) {
   return this.lhs.evaluate(evaluator, initial, conc) *
          this.rhs.evaluate(evaluator, initial, conc)
 }
}

export class Quotient extends BinaryOperator {
 constructor(lhs, rhs) {
   super(lhs, rhs)
 }

 evaluate(evaluator, initial=false, conc=true) {
   return this.lhs.evaluate(evaluator, initial, conc) /
          this.rhs.evaluate(evaluator, initial, conc)
 }
}

export class Sum extends BinaryOperator {
 constructor(lhs, rhs) {
   super(lhs, rhs)
 }

 evaluate(evaluator, initial=false, conc=true) {
   return this.lhs.evaluate(evaluator, initial, conc) +
          this.rhs.evaluate(evaluator, initial, conc)
 }
}

export class Difference extends BinaryOperator {
 constructor(lhs, rhs) {
   super(lhs, rhs)
 }

 evaluate(evaluator, initial=false, conc=true) {
   return this.lhs.evaluate(evaluator, initial, conc) -
          this.rhs.evaluate(evaluator, initial, conc)
 }
}

export class Exponentiation extends BinaryOperator {
 constructor(lhs, rhs) {
   super(lhs, rhs)
 }

 evaluate(evaluator, initial=false, conc=true) {
   return Math.pow(
          this.lhs.evaluate(evaluator, initial, conc),
          this.rhs.evaluate(evaluator, initial, conc))
 }
}

// function printAST(ast, depth=0) {
//   let indent = ''
//   let name = ''
//   for (var k=0; k<depth; k++)
//     indent += ' '
//   if (ast.getType() === libsbml.AST_NAME)
//     name = ast.getName()
//   console.log(indent, ast.getType(), name)
//   if (ast.getType() === libsbml.AST_TIMES) {
//     for (var k=0; k<ast.getNumChildren(); k++) {
//       printAST(ast.getChild(k), depth+1)
//     }
//   }
// }

function getChild(ast, k) {
  if (k >= 0 && k < ast.getNumChildren())
    return ast.getChild(k)
  else
    throw new Error('Child node overflow')
}

export function FromSBMLMath(ast, k=0) {
  if (ast.getNumChildren() > 0 && k+1 > ast.getNumChildren())
    throw new Error('Leaf node overflow')

  const libsbml = getLibsbml()
  // console.log('ast.getType()', ast.getType(), 'libsbml.AST_DIVIDE', libsbml.AST_DIVIDE, 'k', k, 'nchildren', ast.getNumChildren())

  // printAST(ast)

  switch(ast.getType()) {
    case libsbml.AST_PLUS:
      if (k+2 === ast.getNumChildren())
        return new Sum(FromSBMLMath(getChild(ast, k)), FromSBMLMath(getChild(ast, k+1)))
      else
        return new Sum(FromSBMLMath(getChild(ast, k)), FromSBMLMath(ast, k+1))
    case libsbml.AST_MINUS:
      if (k+2 === ast.getNumChildren())
        return new Difference(FromSBMLMath(getChild(ast, k)), FromSBMLMath(getChild(ast, k+1)))
      else
        return new Difference(FromSBMLMath(getChild(ast, k)), FromSBMLMath(ast, k+1))
    case libsbml.AST_TIMES:
      if (k+2 === ast.getNumChildren())
        return new Product(FromSBMLMath(getChild(ast, k)), FromSBMLMath(getChild(ast, k+1)))
      else
        return new Product(FromSBMLMath(getChild(ast, k)), FromSBMLMath(ast, k+1))
    case libsbml.AST_DIVIDE:
      if (k+2 === ast.getNumChildren())
        return new Quotient(FromSBMLMath(getChild(ast, k)), FromSBMLMath(getChild(ast, k+1)))
      else
        return new Quotient(FromSBMLMath(getChild(ast, k)), FromSBMLMath(ast, k+1))
    case libsbml.AST_POWER:
    case libsbml.AST_FUNCTION_POWER:
      if (k+2 === ast.getNumChildren())
        return new Exponentiation(FromSBMLMath(getChild(ast, k)), FromSBMLMath(getChild(ast, k+1)))
      else
        return new Exponentiation(FromSBMLMath(getChild(ast, k)), FromSBMLMath(ast, k+1))
    case libsbml.AST_INTEGER:
    case libsbml.AST_REAL:
    case libsbml.AST_REAL_E:
    case libsbml.AST_RATIONAL:
      return new Constant(ast.getValue())
    case libsbml.AST_NAME:
      console.log('AST name', ast.getName())
      return new Symbol(ast.getName())
    // case libsbml.AST_NAME_AVOGADRO:
    case libsbml.AST_NAME_TIME:
      return new Time()
    case libsbml.AST_CONSTANT_E:
      return new Constant(2.7182818284)
    case libsbml.AST_CONSTANT_FALSE:
      return new Constant(0)
    case libsbml.AST_CONSTANT_PI:
      return new Constant(3.14159265359)
    case libsbml.AST_CONSTANT_TRUE:
      return new Constant(1)
    default:
      throw new Error('Unrecognized AST node type'+ast.getType())
  }
}
