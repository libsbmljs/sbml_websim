import { loadFromFile } from 'sbml_websim'

loadFromFile('models/layout-glycolysis.xml').then(() => {
  console.log('loaded file')
}).catch((error) => {
  console.log('error:',error)
})
