import { range } from 'lodash'

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

// ** unary ops **
export class UnaryOperator extends SymTree {
 constructor(operand) {
   super()
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

export class Logarithm extends UnaryOperator {
 constructor(operand) {
   super(operand)
 }

 evaluate(evaluator, initial=false, conc=true) {
   return Math.log(this.operand.evaluate(evaluator, initial, conc))
 }
}


// ** binary ops **
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



export class FunctionCall extends SymTree {
 constructor(symbol, args) {
   super()
   this.symbol = symbol
   this.args = args
 }

 evaluate(evaluator, initial=false, conc=true) {
   return evaluator.evaluateFunction(
     this.symbol,
     this.args.map((a) => a.evaluate(evaluator, initial, conc)),
     initial,
     conc)
 }
}

function astNameToString(t) {
  switch(t) {
    case libsbml.AST_PLUS:
      return 'AST_PLUS'
    case libsbml.AST_MINUS:
      return 'AST_MINUS'
    case libsbml.AST_TIMES:
      return 'AST_TIMES'
    case libsbml.AST_DIVIDE:
      return 'AST_DIVIDE'
    case libsbml.AST_POWER:
      return 'AST_POWER'
    case libsbml.AST_FUNCTION_POWER:
      return 'AST_FUNCTION_POWER'
    case libsbml.AST_INTEGER:
      return 'AST_INTEGER'
    case libsbml.AST_REAL:
      return 'AST_REAL'
    case libsbml.AST_REAL_E:
      return 'AST_REAL_E'
    case libsbml.AST_RATIONAL:
      return 'AST_RATIONAL'
    case libsbml.AST_NAME:
      return 'AST_NAME'
    case libsbml.AST_NAME_AVOGADRO:
      return 'AST_NAME_AVOGADRO'
    case libsbml.AST_NAME_TIME:
      return 'AST_NAME_TIME'
    case libsbml.AST_CONSTANT_E:
      return 'AST_CONSTANT_E'
    case libsbml.AST_CONSTANT_FALSE:
      return 'AST_CONSTANT_FALSE'
    case libsbml.AST_CONSTANT_PI:
      return 'AST_CONSTANT_PI'
    case libsbml.AST_CONSTANT_TRUE:
      return 'AST_CONSTANT_TRUE'

    case libsbml.AST_FUNCTION_LN:
      return 'AST_FUNCTION_LN'

    case libsbml.AST_FUNCTION:
      return 'AST_FUNCTION'
    case libsbml.AST_CSYMBOL_FUNCTION:
      return 'AST_CSYMBOL_FUNCTION'
    default:
      return '?'
  }
}

export function printAST(ast, depth=0) {
  let indent = ''
  let name = ''
  for (var k=0; k<depth; k++)
    indent += ' '
  if (ast.getType() === libsbml.AST_NAME)
    name = ast.getName()
  console.log(indent, astNameToString(ast.getType()), name, ast.getValue())
  if (ast.getNumChildren() > 0) {
    for (var k=0; k<ast.getNumChildren(); k++) {
      printAST(ast.getChild(k), depth+1)
    }
  }
}

function getChild(ast, k) {
  if (k >= 0 && k < ast.getNumChildren())
    return ast.getChild(k)
  else
    throw new Error('Child node overflow')
}

export function FromSBMLMath(ast, k=0, bvars = null) {
  if (ast.getNumChildren() > 0 && k+1 > ast.getNumChildren())
    throw new Error('Leaf node overflow')

  const libsbml = getLibsbml()
  // console.log('ast.getType()', ast.getType(), 'libsbml.AST_FUNCTION_FLOOR', libsbml.AST_FUNCTION_FLOOR, 'k', k, 'nchildren', ast.getNumChildren())

  // printAST(ast)

  switch(ast.getType()) {
    case libsbml.AST_PLUS:
      if (k+2 === ast.getNumChildren())
        return new Sum(FromSBMLMath(getChild(ast, k), 0, bvars), FromSBMLMath(getChild(ast, k+1), 0, bvars))
      else
        return new Sum(FromSBMLMath(getChild(ast, k), 0, bvars), FromSBMLMath(ast, k+1, bvars))
    case libsbml.AST_MINUS:
      if (k+2 === ast.getNumChildren())
        return new Difference(FromSBMLMath(getChild(ast, k), 0, bvars), FromSBMLMath(getChild(ast, k+1), 0, bvars))
      else
        return new Difference(FromSBMLMath(getChild(ast, k), 0, bvars), FromSBMLMath(ast, k+1, bvars))
    case libsbml.AST_TIMES:
      if (k+2 === ast.getNumChildren())
        return new Product(FromSBMLMath(getChild(ast, k), 0, bvars), FromSBMLMath(getChild(ast, k+1), 0, bvars))
      else
        return new Product(FromSBMLMath(getChild(ast, k), 0, bvars), FromSBMLMath(ast, k+1, bvars))
    case libsbml.AST_DIVIDE:
      if (k+2 === ast.getNumChildren())
        return new Quotient(FromSBMLMath(getChild(ast, k), 0, bvars), FromSBMLMath(getChild(ast, k+1), 0, bvars))
      else
        return new Quotient(FromSBMLMath(getChild(ast, k), 0, bvars), FromSBMLMath(ast, k+1, bvars))
    case libsbml.AST_POWER:
    case libsbml.AST_FUNCTION_POWER:
      if (k+2 === ast.getNumChildren())
        return new Exponentiation(FromSBMLMath(getChild(ast, k), 0, bvars), FromSBMLMath(getChild(ast, k+1), 0, bvars))
      else
        return new Exponentiation(FromSBMLMath(getChild(ast, k), 0, bvars), FromSBMLMath(ast, k+1, bvars))
    case libsbml.AST_INTEGER:
    case libsbml.AST_REAL:
    case libsbml.AST_REAL_E:
    case libsbml.AST_RATIONAL:
      return new Constant(ast.getValue())
    case libsbml.AST_NAME:
      const name = ast.getName()
      if (bvars !== null && bvars.has(name))
        return bvars.get(name)
      else
        return new Symbol(name)
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

    case libsbml.AST_FUNCTION_LN:
      return new Logarithm(FromSBMLMath(getChild(ast,0), 0, bvars))

    case libsbml.AST_FUNCTION:
    case libsbml.AST_CSYMBOL_FUNCTION:
      const fname = ast.getName()
      console.log('function name', fname)
      const args = range(ast.getNumChildren()).map((k) => FromSBMLMath(getChild(ast, k), 0, bvars))
      return new FunctionCall(fname, args)
    default:
      throw new Error('Unrecognized AST node type'+ast.getType())
  }
}
