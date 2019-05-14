// import libsbml from 'libsbmljs_stable'

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

 // binary ops
export class BinaryOperator extends SymTree {
  constructor(lhs, rhs) {
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

export class FromSBMLMath extends SymTree {
  constructor(ast) {
    console.log('ast.getType()', ast.getType(), 'libsbml.AST_NAME', libsbml.AST_NAME)
    // switch(ast.getType()) {
    //
    // }
  }
}
