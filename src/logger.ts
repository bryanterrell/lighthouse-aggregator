import chalk from 'chalk'

const log = (color: chalk.Chalk, message: string, arg?: any) => {
  console.info(color(message))
  if (typeof arg === 'object') {
    console.info(color(JSON.stringify(arg)))
  }
  if (typeof arg === 'string') {
    console.info(color(arg))
  }
}

export const logger = {
  debug: (message: string, arg?: any) => {
    log(chalk.gray, message, arg)
  },
  error: (message: string, err?: any) => {
    console.error(chalk.redBright(message))
    if (err) {
      console.log(err)
    }
  },
  info: (message: string, arg?: any) => {
    log(chalk.cyan, message, arg)
  },
  warn: (message: string, arg?: any) => {
    console.warn(chalk.cyan(message))
    if (typeof arg === 'object') {
      console.warn(chalk.yellow(JSON.stringify(arg)))
    }
    if (typeof arg === 'string') {
      console.warn(chalk.yellow(arg))
    }
  },
}

export default logger
