import * as fs from 'fs'
import RunTests from './runTests'
import RunReport from './runReport'
import RunComparison from './runComparison'
import { GetTestPath } from './utils'

const argv = require('minimist')(process.argv.slice(2))
// console.dir(argv)

if (argv.action === 'comp') {
  const comparisonName = argv._[0]
  RunComparison(comparisonName)
} else {
  const groupName = argv._[0]
  const groupPath = GetTestPath(groupName)

  if (!fs.existsSync(groupPath)) {
    console.error(`Requested folder not found: ${groupPath}`)
  } else {
    switch (argv.action) {
      case 'test':
        const filter = argv._ && argv._.length > 1 ? argv._[1] : ''
        RunTests(groupName, filter)
        break

      case 'report':
        RunReport(groupName)
        break

      default:
        console.log(`Unknown action: ${argv.action}`)
        break
    }
  }
}
