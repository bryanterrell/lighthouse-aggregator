import * as fs from 'fs'
import path from 'path'
import idx from 'idx'
import {
  GetJsonFile,
  GetTestPath,
  IsDirectory,
  TTestRun,
  TTestAverage
} from './utils'

const getNonzeroArray = (array, field) => {
  return array.filter(f => !isNaN(f[field]) && f[field] > 0).map(m => m[field])
}

const getAverage = (array, field) => {
  const numArray = getNonzeroArray(array, field)
  return numArray.length > 0
    ? numArray.reduce((previous, current) => (current += previous)) /
        numArray.length
    : 0
}

const getMedian = (array, field) => {
  const numArray = getNonzeroArray(array, field)
  const lowMiddle = Math.floor((numArray.length - 1) / 2)
  const highMiddle = Math.ceil((numArray.length - 1) / 2)
  return (numArray[lowMiddle] + numArray[highMiddle]) / 2
}

const processTestDir = async (reportName: string, testPath: string) => {
  const runs: Array<TTestRun> = []
  let aggregate: TTestAverage

  // console.log('reportName/testPath:', { reportName, testPath })
  const filenames = fs.readdirSync(testPath)

  for (let filename of filenames) {
    if (filename.includes('.json')) {
      const filepath = path.join(testPath, filename)
      const jsonFile = GetJsonFile(filepath)
      const jsonContent = JSON.parse(jsonFile)
      const nameArray = filename.split('--')
      const testName =
        Array.isArray(nameArray) && nameArray.length > 0 ? nameArray[0] : ''
      const speedIndexScore = parseFloat(
        idx(jsonContent, _ => _.audits['speed-index'].score)
      )
      const speedIndexMs = parseFloat(
        idx(jsonContent, _ => _.audits['speed-index'].numericValue)
      )

      const run: TTestRun = {
        report: reportName,
        test: testName,
        speedIndexScore: isNaN(speedIndexScore) ? 0 : speedIndexScore,
        speedIndexMs: isNaN(speedIndexMs) ? 0 : speedIndexMs
      }

      runs.push(run)
    }
  }

  aggregate = {
    test: testPath.split('/')[2],
    numRuns: runs.length,
    speedIndexScoreAvg: (getAverage(runs, 'speedIndexScore') * 100).toFixed(2),
    speedIndexMsAvg: getAverage(runs, 'speedIndexMs').toFixed(2),
    speedIndexScoreMed: (getMedian(runs, 'speedIndexScore') * 100).toFixed(2),
    speedIndexMsMed: getMedian(runs, 'speedIndexMs').toFixed(2)
  }

  return aggregate
}

const RunReport = async (reportName: string) => {
  try {
    console.log(`Processing lighthouse tests for report "${reportName}"`)
    const report: Array<TTestAverage> = []

    const groupPath = GetTestPath(reportName)
    
    const testFolders = fs
      .readdirSync(groupPath)
      .map(name => path.join(groupPath, name))
      .filter(IsDirectory)

    // component aggregate test runs
    for (let testPath of testFolders) {
      const aggregate = await processTestDir(reportName, testPath)
      report.push(aggregate)
    }

    // console.log(report)
    fs.writeFileSync(`${groupPath}/report.json`, JSON.stringify(report))
  } catch (error) {
    console.log('[RunReport] Uncaught Exception:', error)
  }
}

export default RunReport
