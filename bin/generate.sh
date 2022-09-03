#!/bin/sh
npx openapi-generator-cli generate \
	--generator-name nodejs-express-server \
	--input-spec ./dist/bundle.yaml \
	--output . \
	--verbose \
	--skip-overwrite
	# --dry-run
