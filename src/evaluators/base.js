export class EvaluatorBase {
  constructor() {
  }
}

export class ComponentEvaluator extends EvaluatorBase {
  constructor(id) {
    super()
    this.id = id
    this.name = null
  }

  getName() {
    if (this.name !== null)
      return this.name
    else
      return this.id
  }
}
