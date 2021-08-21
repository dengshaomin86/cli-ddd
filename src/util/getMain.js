const fs = require('fs')
const path = require('path')

function getMainContent (projectPath) {
  const mainPath = path.join(projectPath, 'main.js')

  let mainContent
  try {
    mainContent = fs.readFileSync(mainPath, 'utf-8')
  } catch (err) {
    throw new Error(`The package.json file at '${mainPath}' does not exist`)
  }

//   try {
//     mainContent = JSON.parse(mainContent)
//   } catch (err) {
//     throw new Error('The package.json is malformed')
//   }

  return mainContent
}

module.exports = function getMain (context) {
  const main = getMainContent(context)
  if (main.vuePlugins && main.vuePlugins.resolveFrom) {
    return getMainContent(path.resolve(context, main.vuePlugins.resolveFrom))
  }
  return main
}
