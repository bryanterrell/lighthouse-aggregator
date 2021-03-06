import fs from 'fs'
import idx from 'idx'
import path from 'path'
import logger from './logger'
import {
  GetJsonFile,
  GetReportFilePath,
  GetTestDir,
  IsDirectory,
  ITestAverage,
  ITestRun,
  WriteAndFormatJsonFile,
} from './utils'

const getNonzeroArray = (array, field) => {
  return array.filter(f => !isNaN(f[field]) && f[field] > 0).map(m => m[field])
}

const getAverage = (array, field) => {
  const numArray = getNonzeroArray(array, field)
  return numArray.length > 0 ? numArray.reduce((previous, current) => (current += previous)) / numArray.length : 0
}

const getMedian = (array, field) => {
  const numArray = getNonzeroArray(array, field)
  const lowMiddle = Math.floor((numArray.length - 1) / 2)
  const highMiddle = Math.ceil((numArray.length - 1) / 2)
  return (numArray[lowMiddle] + numArray[highMiddle]) / 2
}

const processTestDir = async (reportName: string, testPath: string) => {
  const runs: ITestRun[] = []
  let aggregate: ITestAverage

  // console.log('reportName/testPath:', { reportName, testPath })
  const filenames = fs.readdirSync(testPath)

  for (const filename of filenames) {
    if (filename.includes('.json')) {
      const filePath = path.join(testPath, filename)
      const jsonFile = GetJsonFile(filePath)
      const jsonContent = JSON.parse(jsonFile)
      const nameArray = filename.split('--')
      const testName = Array.isArray(nameArray) && nameArray.length > 0 ? nameArray[0] : ''
      const speedIndexScore = parseFloat(idx(jsonContent, _ => _.audits['speed-index'].score))
      const speedIndexMs = parseFloat(idx(jsonContent, _ => _.audits['speed-index'].numericValue))

      const run: ITestRun = {
        report: reportName,
        speedIndexMs: isNaN(speedIndexMs) ? 0 : speedIndexMs,
        speedIndexScore: isNaN(speedIndexScore) ? 0 : speedIndexScore,
        test: testName,
      }

      runs.push(run)
    }
  }

  aggregate = {
    numRuns: runs.length,
    speedIndexMsAvg: getAverage(runs, 'speedIndexMs').toFixed(2),
    speedIndexMsMed: getMedian(runs, 'speedIndexMs').toFixed(2),
    speedIndexScoreAvg: (getAverage(runs, 'speedIndexScore') * 100).toFixed(2),
    speedIndexScoreMed: (getMedian(runs, 'speedIndexScore') * 100).toFixed(2),
    test: testPath.split('/')[2],
  }

  return aggregate
}

const RunReport = async (reportName: string) => {
  try {
    // logger.info(`Generating aggregate lighthouse report "${reportName}"`)
    const report: ITestAverage[] = []

    const testDirPath = GetTestDir(reportName)

    const testFolders = fs
      .readdirSync(testDirPath)
      .map(name => path.join(testDirPath, name))
      .filter(IsDirectory)

    // component aggregate test runs
    for (const testPath of testFolders) {
      const aggregate = await processTestDir(reportName, testPath)
      report.push(aggregate)
    }

    const reportFilePath = GetReportFilePath(reportName)
    WriteAndFormatJsonFile(reportFilePath, report)
    logger.info(`Generated report: ${reportFilePath}`)
  } catch (error) {
    logger.error('[RunReport] Uncaught Exception:', error)
  }
}

export default RunReport
