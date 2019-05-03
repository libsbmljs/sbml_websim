import libsbml_module  from 'libsbmljs_stable'
let libsbml = null
export const libsbml_promise = new Promise((resolve, reject) => {
  libsbml_module().then((module) => {
    console.log('loaded libsbmljs')
    libsbml = module
    resolve('abc')
  })
})

libsbml_promise.then((libsbml) => {
  console.log('1 then')
})

export function getLibsbml() {
  return libsbml
}

export function getLibsbmlReader() {
  return new libsbml.SBMLReader()
}
