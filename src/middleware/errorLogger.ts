import { Request, Response, NextFunction } from 'express'
import ResponseError from '../class/ResponseError'
import log from '../logger'

export default async (
	err: Error,
	_req: Request,
	_res: Response,
	next: NextFunction,
) => {
	if (err instanceof ResponseError) {
		const format = `[${err.status}] (${err.errorName}) ${err.action} -> ${err.message}`

		log.error(format)
	}

	next(err)
}
