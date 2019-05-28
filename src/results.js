import { Websim, WebsimStoch } from './simulator.js'
import { range } from 'lodash'

export function makePlotlyGrid() {
  const results = sim.evaluator.getIndepValIds().map((id) => ({
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    name: id,
  }))
  range(num_timepoints).map((k) => {
    const t = time_start + k*(time_stop-time_start)
    sim.simulateTo(t)
    sim.evaluator.getIndepValIds().map((id) => {
      results.x.push(t)
      results.y.push(sim.evaluator.evaluate(id))
    })
  })
  return results
}
