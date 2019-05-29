import { Websim, WebsimStoch } from './simulator.js'
import { range } from 'lodash'

export function makePlotlyGrid(sim, time_start, time_stop, num_timepoints, is_stochastic, num_replicates, enable_mean_trace) {
  const results = sim.evaluator.getIndepValIds().map((id) => ({
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    name: id,
  }))
  range(num_timepoints).map((k) => {
    const t = time_start + ((k+1)/num_timepoints)*(time_stop-time_start)
    sim.simulateTo(t)
    Array.from(sim.evaluator.getIndepValIds().entries()).map(([l,id]) => {
      results[l].x.push(t)
      results[l].y.push(sim.evaluator.evaluate(id))
    })
  })
  return results
}
