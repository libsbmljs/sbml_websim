import { range } from 'lodash'

export class ODE {
  constructor(evaluator, model) {
    this.evaluator = evaluator
    this.reaction_ids = model.reactions.map((reaction) => reaction.isSetIdAttribute() ? reaction.getId() : '')
    // https://stackoverflow.com/questions/4852017/how-to-initialize-an-arrays-length-in-javascript
    this.reaction_rates = Array(this.reaction_ids.length).fill(0)
  }

  calcReactionRates() {
    // https://stackoverflow.com/questions/5349425/whats-the-fastest-way-to-loop-through-an-array-in-javascript
    for(var k=0, N=this.reaction_ids.length; k<N; k++) {
      this.reaction_rates[k] = this.evaluator.evaluate(this.reaction_ids[k], false, true)
      console.log('reaction rate', this.reaction_ids[k], this.reaction_rates[k])
    }
  }
}
