import * as chromeLauncher from 'chrome-launcher'
import fs from 'fs'
import lighthouse from 'lighthouse/lighthouse-core'
import ReportGenerator from 'lighthouse/lighthouse-core/report/report-generator'
import logger from './logger'
import { CreateDir, GetDisplayDate, GetJsonFile, GetTestDir, GetTestFilePath, WriteJsonFile } from './utils'

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
  logger.info('Chrome has been launched.')
}

const killChrome = async () => {
  if (chrome) {
    await chrome.kill()
    logger.info('Chrome has been killed.')
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
    logger.info(`Running lighthouse test on URL: ${url}`)
    const results = await lighthouse(url, config)
    const jsonReport = ReportGenerator.generateReport(results.lhr, 'json')

    const dir = `${groupPath}/${testName}`
    const filename = GetDisplayDate()

    CreateDir(dir)

    // fs.writeFileSync(`${dir}/${filename}.json`, jsonReport)
    WriteJsonFile(`${dir}/${filename}.json`, jsonReport)
    logger.info(`---> Successfully Wrote to File: ${dir}/${filename}.json`)
  } catch (error) {
    throw error
  }
}

export async function RunSingleTest(test: string, filterTest?: string[]) {
  try {
    const groupPath = GetTestDir(test)
    const jsonFile = GetJsonFile(GetTestFilePath(test))
    const jsonContent = JSON.parse(jsonFile)

    // https://www.darraghoriordan.com/2019/08/04/looping-await-each-item/
    for (const test of jsonContent) {
      const shouldRunTest = !filterTest || filterTest.includes(test.name)
      if (shouldRunTest) {
        await runTest({ groupPath, testName: test.name, url: test.url })
      }
    }
  } catch (error) {
    logger.error('[RunTests] Uncaught Exception:', error)
  }
}

interface IRunTests {
  tests: string[]
  loop: string
  filter: string[]
}

export async function RunTests({ tests, loop, filter }: IRunTests) {
  const validTestGroups = []
  for (const test of tests) {
    const testJsonPath = GetTestFilePath(test)
    if (fs.existsSync(testJsonPath)) {
      validTestGroups.push(test)
    } else {
      logger.warn(`Test not found - Skipping: ${testJsonPath}`)
    }
  }

  if (validTestGroups.length > 0) {
    await launchChrome()

    // console.log('RunTests:', { loop, tests, filter })
    const loopNbr: number = parseInt(loop)
    for (let i = 0; i < loopNbr; i++) {
      logger.info(`[RunSetOfTests] Test Run # ${i + 1}`)
      for (const test of validTestGroups) {
        await RunSingleTest(test, filter)
      }
    }

    killChrome()
  }
}
