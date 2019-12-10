import fs from 'fs'
import logger from './logger'
import RunReport from './runReport'
import {
  CreateDir,
  GetAllDirs,
  GetDisplayDate,
  GetJsonFile,
  GetReportFilePath,
  GetTestDir,
  ITestAverage,
  MergeArrays,
} from './utils'

interface IReportTest {
  testName: string
  reports: ITestAverage[]
}

interface IComparison {
  tests: string[]
  reports: string[]
}

const getComparisonFilePath = (comparisonName: string) => `./comps/${comparisonName}.json`

const getComparisonFile = (comparisonName: string) => GetJsonFile(getComparisonFilePath(comparisonName))

const getComparisonJson = (comparisonName: string): IComparison => JSON.parse(getComparisonFile(comparisonName))

const getComparisonConfigFromFile = (comparisonName: string): IComparison => getComparisonJson(comparisonName)

export const runComparison = async (comparisonName: string, comparisonConfig: IComparison) => {
  try {
    const testReports: IReportTest[] = []

    // ensure comparison directory exists
    CreateDir('./comps/')

    const date = GetDisplayDate()
    const csvPath = `./comps/${comparisonName}--${date}.csv`
    const csv = fs.createWriteStream(csvPath, {
      flags: 'a', // 'a' means appending (old data will be preserved
    })

    // Always regenerate report to ensure latest data is reflected
    logger.info('Regenerating each report in comparison...')
    for (const report of comparisonConfig.reports) {
      await RunReport(report)
      logger.info(`Report regenerated: ${report}`)
    }

    for (const test of comparisonConfig.tests) {
      const reports = []
      comparisonConfig.reports.forEach(report => {
        // now process the report
        const reportPath = GetReportFilePath(report)
        let reportFile: string
        try {
          reportFile = GetJsonFile(reportPath)
        } catch (error) {
          throw new Error(
            `[RunComparison] Report is missing.\nTo generate report run command:\n\nyarn run report ${report}\n`,
          )
        }

        const reportJson = JSON.parse(reportFile)
        const reportTest = reportJson.find(r => r.test === test) || {
          numRuns: 0,
          test,
        }
        // console.log('reportTest:', reportTest)
        if (reportTest) {
          reportTest.reportName = report
          reports.push(reportTest)
        }
      })

      testReports.push({
        reports,
        testName: test,
      })
    }

    for (const rt of testReports) {
      const writeLine = (label: string, field: string) => {
        csv.write(label + ',' + rt.reports.map(r => r[field] || '---').join(',') + '\n')
      }

      writeLine(rt.testName.toUpperCase(), 'reportName')
      writeLine('# of Test Runs', 'numRuns')
      writeLine('Avg Speed Score', 'speedIndexScoreAvg')
      writeLine('Avg Speed (ms)', 'speedIndexMsAvg')
      writeLine('Median Speed Score', 'speedIndexScoreMed')
      writeLine('Median Speed (ms)', 'speedIndexMsMed')
      csv.write('\n\n')
    }

    csv.end()
    logger.info(`Output comparison to:\n${csvPath}\n`)
  } catch (error) {
    logger.error('[CompareReports] Uncaught Exception:', error)
  }
}

export const RunComparisonConfig = (comparisonName: string) => {
  const comparisonConfig = getComparisonConfigFromFile(comparisonName)
  runComparison(comparisonName, comparisonConfig)
}

export const RunCompareTests = (tests: string[]) => {
  const comparisonName = tests.join('-')
  const compFilePath = getComparisonFilePath(comparisonName)

  if (fs.existsSync(compFilePath)) {
    // if comparison JSON exists run it
    const comparisonConfig = getComparisonConfigFromFile(comparisonName)
    runComparison(comparisonName, comparisonConfig)
  } else {
    // otherwise run adhoc comparison
  const comparisonConfig = {
    reports: [],
    tests: [],
  }
    let allTestDirs = []
    for (const test of tests) {
      const testRootPath = GetTestDir(test)
      const testDirs = GetAllDirs(testRootPath)
      if (testDirs.length <= 0) {
        logger.error(`[runComparison] Test path not found. Ensure this test exists:`)
        logger.info(testRootPath)
        throw new Error('[runComparison] Error')
      }
      allTestDirs = MergeArrays(allTestDirs, testDirs)
      comparisonConfig.reports.push(test)
    }
    comparisonConfig.tests = allTestDirs

    // console.log('runComparison:', { comparisonName, comparisonConfig })
    runComparison(comparisonName, comparisonConfig)
  }
}
