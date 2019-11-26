import fs from 'fs'
import minimist from 'minimist'
import RunComparison from './runComparison'
import RunReport from './runReport'
import RunTests from './runTests'
import { GetTestPath } from './utils'

const argv = minimist(process.argv.slice(2))
// console.dir(argv)

if (argv.action === 'compare') {
  const comparisonName = argv._[0]
  RunComparison(comparisonName)
} else {
  const sessionName = argv._[0]
  const sessionPath = GetTestPath(sessionName)

  if (!fs.existsSync(sessionPath)) {
    console.error(`Requested folder not found: ${sessionPath}`)
  } else {
    switch (argv.action) {
      case 'test':
        const filter = argv._ && argv._.length > 1 ? argv._[1] : ''
        RunTests(sessionName, filter)
        break

      case 'report':
        RunReport(sessionName)
        break

      default:
        console.log(`Unknown action: ${argv.action}`)
        break
    }
  }
}
