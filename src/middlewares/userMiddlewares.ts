import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import userService from '~/services/userServices'
import validate from '~/utils/validation'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body
  if (username && password) {
    next()
  } else {
    res.status(404).json({ message: 'Missing username or password' })
  }
}

export const registerValidator = validate(
  checkSchema({
    name: {
      errorMessage: 'Name is not empty',
      notEmpty: true,
      isString: true,
      trim: true,
      isLength: {
        errorMessage: 'Name is require min 1 and max 100 character',
        options: {
          min: 1,
          max: 100
        }
      }
    },
    email: {
      errorMessage: 'Email is not valid',
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await userService.checkExistEmail(value)
          if (isExistEmail) {
            throw new ErrorWithStatus({ message: 'Email has already exist', status: HTTP_STATUS.UNAUTHORIZED })
          }
          return Promise.resolve(true)
        }
      }
    },
    password: {
      errorMessage: 'Password is not valid',
      notEmpty: true,
      isString: true,
      isStrongPassword: {
        errorMessage:
          'Password require length is 6 characters, including at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character.',
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1,
          minNumbers: 1
        }
      },
      isLength: {
        options: {
          min: 6,
          max: 50
        }
      }
    },
    confirm_password: {
      errorMessage: 'Confirm password is not empty',
      notEmpty: true,
      isString: true,
      isStrongPassword: {
        errorMessage:
          'Password require length is 6 characters, including at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character.',
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1,
          minNumbers: 1
        }
      },
      custom: {
        errorMessage: 'Confirm password is not matched to password',
        options: (value, { req }) => {
          if (value !== req.body.password) {
            return false
          }
          return true
        }
      }
    },
    date_of_birth: {
      errorMessage: 'Date of birth is not empty',
      notEmpty: true,
      isISO8601: {
        errorMessage: 'Date of birth is not valid',
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)
