import chalk from 'chalk'

const log = (color: chalk.Chalk, message: string, arg?: any) => {
  console.info(color(message))
  typeof arg === 'object' && console.info(color(JSON.stringify(arg)))
  typeof arg === 'string' && console.info(color(arg))
}

export const logger = {
  error: (message: string, err?: any) => {
    console.error(chalk.redBright(message))
    err && console.log(err)
  },
  warn: (message: string, arg?: any) => {
    console.warn(chalk.cyan(message))
    typeof arg === 'object' && console.warn(chalk.yellow(JSON.stringify(arg)))
    typeof arg === 'string' && console.warn(chalk.yellow(arg))
  },
  info: (message: string, arg?: any) => {
    log(chalk.cyan, message, arg)
  },
  debug: (message: string, arg?: any) => {
    log(chalk.gray, message, arg)
  },
}

export default logger
