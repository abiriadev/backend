import yaml from 'js-yaml'
import path from 'path'
import { promises as fs } from 'fs'

it('fdafsa', async () => {
	const yy = yaml.load(
		(
			await fs.readFile(
				path.join(
					process.env.WORKDIR ?? process.cwd(),
					'dist/bundle.yaml',
				),
			)
		).toString(),
	)

	expect(
		// @ts-ignore
		yy?.paths?.['/login']?.post?.description,
	).toMatch(/#/)
})
