import minimist from 'minimist'
import logger from './logger'
import { AddTest } from './maintainTest'
import { RunComparisonConfig, RunCompareTests } from './runComparison'
import RunReport from './runReport'
// import { RunTests, RunSetOfTests } from './runTests'
import { RunTests } from './runTests'

const argv = minimist(process.argv.slice(2))

const test = argv.test || argv.tests || argv.t
const loop = argv.loop || argv.l || '1'
const filter = argv.filter || argv.f
const url = argv.url || argv.u
const urlName = argv.name || argv.n
const comparison = argv.comparison || argv.compare || argv.c

console.log('argv:', argv)
// console.log('argv._:', argv._)
console.log('params:', { test, comparison, url, urlName, loop, filter })

switch (argv.action) {
  case 'add-test':
    if (!test || !url) {
      logger.error(`[${argv.action}] action requires params: test, url.`)
    } else {
      AddTest({ test, url, urlName })
    }
    break

  case 'run-test':
    const tests = test.split(',')
    RunTests({ tests, loop, filter })
    break

  case 'compare-tests':
    if (comparison) {
      RunComparisonConfig(comparison)
    } else {
      const tests = test.split(',')
      RunCompareTests(tests)
    }
    break

  case 'report':
    RunReport(test)
    break

  default:
    logger.error(`Unknown action: ${argv.action}`)
    break
}
