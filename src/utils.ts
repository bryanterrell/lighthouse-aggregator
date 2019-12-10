import fs from 'fs'
import path from 'path'

export interface ITestUrl {
  name: string
  url: string
}

export interface ITestRun {
  report: string
  test: string
  speedIndexScore: number
  speedIndexMs: number
}

export interface ITestAverage {
  test: string
  numRuns: number
  speedIndexScoreAvg: string
  speedIndexMsAvg: string
  speedIndexScoreMed: string
  speedIndexMsMed: string
}

export const WriteJsonFile = (path: string, json: object) => fs.writeFileSync(path, json)

export const WriteAndFormatJsonFile = (path: string, json: object) =>
  fs.writeFileSync(path, JSON.stringify(json, null, 2))

export const CreateDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export const GetTestDir = (testName: string) => `./tests/${testName}`

export const GetTestFilePath = (testName: string) => `${GetTestDir(testName)}/tests.json`

export const GetReportFilePath = (testName: string) => `${GetTestDir(testName)}/report.json`

export const IsDirectory = (source: string) => {
  if (fs.existsSync(source)) {
    return fs.lstatSync(source).isDirectory()
  } else {
    return false
  }
}

export const GetJsonFile = (filePath: string) => fs.readFileSync(filePath, 'utf8')

export const GetTestConfigJson = (test: string): ITestUrl[] => {
  const filePath = GetTestFilePath(test)
  const content = fs.existsSync(filePath) ? GetJsonFile(filePath) : null
  // const json: ITestUrl[] = content ? JSON.parse(content) : []
  // return json
  return content ? JSON.parse(content) : []
}

export const WriteTestConfigJson = (test: string, json: ITestUrl[]) => {
  const filePath = GetTestFilePath(test)
  WriteJsonFile(filePath, json)
}

export const GetDisplayDate = (date?: Date) => {
  const now = date || new Date()
  // Date toISOString() generates this format: 2019-11-19T03:30:12.113Z
  return now
    .toISOString()
    .slice(0, 19)
    .replace(/:/g, '-')
}

export const GetAllDirs = (rootPath: string): string[] => {
  const dirs = []
  if (IsDirectory(rootPath)) {
    fs.readdirSync(rootPath).forEach(dir => {
      const dirPath = path.join(rootPath, dir)
      if (IsDirectory(dirPath)) {
        dirs.push(dir)
      }
    })
  }
  return dirs
}

// https://scotch.io/courses/the-ultimate-guide-to-javascript-algorithms/combining-arrays-without-duplicates
export const MergeArrays = (...arrays) => {
  let jointArray = []

  arrays.forEach(array => {
    jointArray = [...jointArray, ...array]
  })
  const uniqueArray = jointArray.filter((item, index) => jointArray.indexOf(item) === index)
  return uniqueArray
}
