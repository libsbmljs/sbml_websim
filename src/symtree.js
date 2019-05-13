import libsbml from libsbmljs_stable

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

  get() {
    return this.value
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
