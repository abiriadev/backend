import {
	Router,
	Request,
	Response,
	NextFunction,
} from 'express'
import ResponseError from '../class/ResponseError'

export default Router().use(
	(req: Request, _res: Response, next: NextFunction) =>
		next(
			new ResponseError({
				status: 400,
				message: `there is no endpoint avaliable for ${req.method} ${req.originalUrl}`,
				errorName: 'WrongEndpoint',
			}),
		),
)
