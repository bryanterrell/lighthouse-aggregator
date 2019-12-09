import fs from 'fs'
import { CreateDir, GetTestDir, GetTestFile, IsDirectory } from './utils'

export const CreateTest = (testGroupName: string) => {
  try {
    const dir = GetTestDir(testGroupName)
    console.log('CreateTest', dir)
    CreateDir(dir)

    const filePath = GetTestFile(testGroupName)

    if (fs.existsSync(filePath)) {
      console.error('Test already exists:', testGroupName)
    } else {
      fs.writeFileSync(filePath, JSON.stringify([]))
    }

    console.log(`---> Successfully Created Test: ${filePath}`)
  } catch (error) {
    throw error
  }
}

interface IUpdateTest {
  testGroupName: string
  testName: string
  testUrl: string
}

export const AddTest = ({ testGroupName, testName, testUrl }: IUpdateTest) => {
  const testConfigFile = GetTestFile(testGroupName)
  if (!IsDirectory(testConfigFile)) {
    console.error('Expected test does not exist:', testConfigFile)
  }
  console.log('AddTest', { testGroupName, testName, testUrl })
}
