import logger from './logger'
import { CreateDir, GetTestDir, GetTestConfigJson, ITestUrl, WriteTestConfigJson } from './utils'

const getTestConfigJson = (test: string): ITestUrl[] => {
  try {
    const dir = GetTestDir(test)
    // console.log('CreateTest', dir)
    CreateDir(dir)
    return GetTestConfigJson(test)
  } catch (error) {
    throw error
  }
}

interface ITest {
  test: string
  urlName: string
  url: string
}

export const AddTest = ({ test, urlName = 'home', url }: ITest) => {
  const configJson: ITestUrl[] = getTestConfigJson(test)
  // console.log('configJson:', configJson)
  let testUrl = configJson.find(t => t.name === urlName)
  if (testUrl) {
    testUrl.url = url
  } else {
    configJson.push({ name: urlName, url })
  }
  // console.log(`Adding test to "${test}":`, testUrl)
  // console.log('content:', configJson)
  WriteTestConfigJson(test, configJson)
  logger.info(`[AddTest] Test "${test}" Succesfully Updated with: `, configJson)
}
