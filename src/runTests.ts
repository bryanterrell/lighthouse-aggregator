import * as chromeLauncher from 'chrome-launcher'
import fs from 'fs'
import lighthouse from 'lighthouse/lighthouse-core'
import ReportGenerator from 'lighthouse/lighthouse-core/report/report-generator'
import { CreateDir, IsDirectory, GetDisplayDate, GetJsonFile, GetTestDir, GetTestFile } from './utils'

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
  chromeFlags: [],
}

const launchChrome = async (options: chromeLauncher.Options = DEFAULT_CHROME_OPTIONS) => {
  chrome = await chromeLauncher.launch({
    chromeFlags: options.chromeFlags,
  })
  console.log('Chrome has been launched.')
}

const killChrome = async () => {
  if (chrome) {
    await chrome.kill()
    console.log('Chrome has been killed.')
  }
}

const runTest = async ({ groupPath, testName, url, options = DEFAULT_CHROME_OPTIONS }: IRunTest) => {
  options.port = chrome.port

  try {
    // https://github.com/GoogleChrome/lighthouse/blob/master/types/config.d.ts
    const config = Object.assign(options, {
      emulatedFormFactor: 'none',
      onlyCategories: ['performance'],
      settings: { useThrottling: false },
      throttlingMethod: 'provided',
    })

    // console.log('Running lighthouse test on URL:', { url, config })
    console.log(`Running lighthouse test on URL: ${url}`)
    const results = await lighthouse(url, config)
    const jsonReport = ReportGenerator.generateReport(results.lhr, 'json')

    const dir = `${groupPath}/${testName}`
    const filename = GetDisplayDate()

    CreateDir(dir)

    fs.writeFileSync(`${dir}/${filename}.json`, jsonReport)
    console.log(`---> Successfully Wrote to File: ${dir}/${filename}.json`)
  } catch (error) {
    throw error
  }
}

export async function RunSingleTest(testGroup: string, filterTest?: string[]) {
  try {
    const groupPath = GetTestDir(testGroup)
    const jsonFile = GetJsonFile(GetTestFile(testGroup))
    const jsonContent = JSON.parse(jsonFile)

    // https://www.darraghoriordan.com/2019/08/04/looping-await-each-item/
    for (const test of jsonContent) {
      const shouldRunTest = !filterTest || filterTest.includes(test.name)
      if (shouldRunTest) {
        await runTest({ groupPath, testName: test.name, url: test.url })
      }
    }
  } catch (error) {
    console.log('[RunTests] Uncaught Exception:', error)
  }
}

interface IRunTests {
  count: string
  testGroups: string[]
  filter: string[]
}

export async function RunTests({ testGroups, count, filter }: IRunTests) {
  const validTestGroups = []
  for (const testGroup of testGroups) {
    const testJsonPath = GetTestFile(testGroup)
    if (fs.existsSync(testJsonPath)) {
      validTestGroups.push(testGroup)
    } else {
      console.log(`Test not found - Skipping: ${testJsonPath}`)
    }
  }

  if (validTestGroups.length > 0) {
    await launchChrome()

    // console.log('RunTests:', { count, testGroups, filter })
    const countNbr: number = parseInt(count)
    for (let i = 0; i < countNbr; i++) {
      console.log('[RunSetOfTests] Test Run # ', i + 1)
      for (const testGroup of validTestGroups) {
        await RunSingleTest(testGroup)
      }
    }

    killChrome()
  }
}
