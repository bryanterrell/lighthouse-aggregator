import * as fs from 'fs'
import path from 'path'
import { GetDisplayDate, GetJsonFile, GetTestPath, TTestAverage } from './utils'
import RunReport from './runReport'

type TReportTest = {
  testName: string
  reports: Array<TTestAverage>
}

type TComparison = {
  tests: Array<string>
  reports: Array<string>
}

const RunComparison = async (comparisonName: string) => {
  try {
    const comparisonFile = GetJsonFile(`./comps/${comparisonName}.json`)
    const comparison: TComparison = JSON.parse(comparisonFile)
    const testReports: Array<TReportTest> = []

    const date = GetDisplayDate()
    const csvPath = `./comps/${comparisonName}--${date}.csv`
    const csv = fs.createWriteStream(csvPath, {
      flags: 'a' // 'a' means appending (old data will be preserved
    })

    // Always regenerate report to ensure latest data is reflected
    console.log('Regenerating each report in comparison...')
    for (let report of comparison.reports) {
      await RunReport(report)
      console.log(`Report regenerated: ${report}`)
    }

    comparison.tests.forEach(test => {
      const reports = []
      comparison.reports.forEach(report => {
        // now process the report
        const reportPath = path.join(GetTestPath(report), 'report.json')
        let reportFile: string
        try {
          reportFile = GetJsonFile(reportPath)
        } catch (error) {
          throw new Error(
            `[RunComparison] Report is missing.\nTo generate report run command:\n\nyarn run report ${report}\n`
          )
        }

        const reportJson = JSON.parse(reportFile)
        const reportTest = reportJson.find(r => r.test === test) || {
          test,
          numRuns: 0
        }
        // console.log('reportTest:', reportTest)
        if (reportTest) {
          reportTest.reportName = report
          reports.push(reportTest)
        }
      })

      testReports.push({
        testName: test,
        reports: reports
      })
    })

    testReports.forEach((rt: TReportTest) => {
      const writeLine = (label: string, field: string) => {
        csv.write(
          label + ',' + rt.reports.map(r => r[field] || '---').join(',') + '\n'
        )
      }

      writeLine(rt.testName.toUpperCase(), 'reportName')
      writeLine('# of Test Runs', 'numRuns')
      writeLine('Avg Speed Score', 'speedIndexScoreAvg')
      writeLine('Avg Speed (ms)', 'speedIndexMsAvg')
      writeLine('Median Speed Score', 'speedIndexScoreMed')
      writeLine('Median Speed (ms)', 'speedIndexMsMed')
      csv.write('\n\n')
    })

    csv.end()
    console.log(`Output comparison to:\n${csvPath}\n`)
  } catch (error) {
    console.log('[CompareReports] Uncaught Exception:', error)
  }
}

export default RunComparison
