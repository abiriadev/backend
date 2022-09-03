#!/bin/sh
npx openapi-generator-cli generate \
	--generator-name nodejs-express-server
	--input-spec ./schemas/bundle.yaml
	--output .
	--verbose
	--skip-overwrite
	# --dry-run
