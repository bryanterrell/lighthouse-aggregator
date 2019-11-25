import * as fs from 'fs'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse/lighthouse-core'
import ReportGenerator from 'lighthouse/lighthouse-core/report/report-generator'
import { GetDisplayDate, GetJsonFile, GetTestPath } from './utils'

interface IRunTest {
  groupPath: string
  testName: string
  url: string
  options?: chromeLauncher.Options
}

let chrome: chromeLauncher.LaunchedChrome
// NOTE: some tests failed with headless option - not sure why
// const DEFAULT_CHROME_OPTIONS = {
//   chromeFlags: ['--headless']
// }
const DEFAULT_CHROME_OPTIONS = {
  chromeFlags: []
}

export const launchChrome = async (
  options: chromeLauncher.Options = DEFAULT_CHROME_OPTIONS
) => {
  chrome = await chromeLauncher.launch({
    chromeFlags: options.chromeFlags
  })
  console.log('Chrome has been launched.')
}

export const killChrome = async () => {
  if (chrome) {
    await chrome.kill()
    console.log('Chrome has been killed.')
  }
}

export const runTest = async ({
  groupPath,
  testName,
  url,
  options = DEFAULT_CHROME_OPTIONS
}: IRunTest) => {
  options.port = chrome.port

  try {
    // https://github.com/GoogleChrome/lighthouse/blob/master/types/config.d.ts
    const config = Object.assign(options, {
      onlyCategories: ['performance'],
      throttlingMethod: 'provided',
      emulatedFormFactor: 'none',
      settings: { useThrottling: false }
    })

    // console.log('Running lighthouse test on URL:', { url, config })
    console.log(`Running lighthouse test on URL: ${url}`)
    const results = await lighthouse(url, config)
    const jsonReport = ReportGenerator.generateReport(results.lhr, 'json')

    const dir = `${groupPath}/${testName}`
    const filename = GetDisplayDate()

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }

    fs.writeFileSync(`${dir}/${filename}.json`, jsonReport)
    console.log(`---> Successfully Wrote to File: /${dir}/${filename}.json`)
  } catch (error) {
    throw error
  }
}

async function RunTests(groupName: string, filterTest?: Array<string>) {
  await launchChrome()

  try {
    const groupPath  = GetTestPath(groupName)
    const jsonFile = GetJsonFile(`${groupPath}/tests.json`)
    const jsonContent = JSON.parse(jsonFile)

    // https://www.darraghoriordan.com/2019/08/04/looping-await-each-item/
    for (let test of jsonContent) {
      const shouldRunTest = !filterTest || filterTest.includes(test.name)
      if (shouldRunTest) {
        await runTest({ groupPath , testName: test.name, url: test.url })
      }
    }
  } catch (error) {
    console.log('[RunTests] Uncaught Exception:', error)
  }

  killChrome()
}

export default RunTests
