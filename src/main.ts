import minimist from 'minimist'
import { CreateTest, AddTest } from './maintainTest'
import RunComparison from './runComparison'
import RunReport from './runReport'
// import { RunTests, RunSetOfTests } from './runTests'
import { RunTests } from './runTests'

const argv = minimist(process.argv.slice(2))
console.dir(argv)
console.dir(argv._)

const arg1 = argv._[0]

switch (argv.action) {
  case 'compare-tests':
    RunComparison(arg1)
    break

  case 'create-test':
    CreateTest(arg1)
    break

  case 'add-test':
    if (argv._.length > 2) {
      const testName = arg1
      const testUrl = argv._[2]
      AddTest({ testGroupName: arg1, testName, testUrl })
    } else {
      console.log(
        `[add-test] action requires params: Test Group Name, Test Name, Test Url. But only received: "${argv._.join(
          ', ',
        )}"`,
      )
    }
    break

  case 'run-test':
    RunTests({
      testGroups: argv._,
      count: argv.count || '1',
      filter: argv.filter
    })
    break

  case 'report':
    RunReport(arg1)
    break

  default:
    console.log(`Unknown action: ${argv.action}`)
    break
}
