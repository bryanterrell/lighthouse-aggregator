import chalk from 'chalk'

export const logger = {
  error: (message: string, err?: any) => {
    console.error(chalk.redBright(message))
    err && console.log(err)
  },
  info: (message: string, arg?: any) => {
    console.info(chalk.cyan(message))
    typeof arg === 'object' && console.info(chalk.cyan(JSON.stringify(arg)))
    typeof arg === 'string' && console.info(chalk.cyan(arg))
  },
}

export default logger
