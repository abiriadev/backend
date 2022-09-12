# Usgae:
# 
# make compile:
# 	compile typescript code into javascript
# 
# make watch:
# 	watch source directory for changes and compile it automatically
# 
# make watch-oas:
# 	watch openapi documentation file and build it again whenever it changes
# 
# make clean:
# 	cleans up build artifacts

.PHONY: \
	all \
	watch \
	watch-oas \
	compile \
	lint \
	bundle \
	bundle-oas \
	out \
	clean \
	test \
	prisma-init \
	prisma-push \
	compose-up \
	compose-down \
	compose-dev \
	compose-prod \
	docker-lint \
	pre-commit

SOURCE_DIR := src
OPENAPI_DIR := schemas
TEST_RUNNER := jest
COMPILER := swc
OPENAPI_DOC := ${OPENAPI_DIR}/openapi.yaml
OUT_DIR := dist
OAS_BUNDLE_FILE_EXT := yaml
OAS_BUNDLE_FILE := bundle.${OAS_BUNDLE_FILE_EXT}
MODULE_PATH := node_modules
WATCHER := chokidar
LINTER := @redocly/cli
LINTER_OPTIONS := --format codeframe # stylish
BUNDLER := esbuild
PROJECT_NAME := eco3s

all:

out: # ${OUT_DIR}
	mkdir -p ${OUT_DIR}

watch-oas: \
	${OPENAPI_DOC} \
	${MODULE_PATH}/${WATCHER} \
	${MODULE_PATH}/${LINTER}

	npx ${WATCHER} ${OPENAPI_DIR} \
		-i ${OPENAPI_DIR}/${OAS_BUNDLE_FILE} \
		--verbose \
		-c "make push"

lint: \
	${OPENAPI_DOC} \
	${MODULE_PATH}/${LINTER}

	npx ${LINTER} lint ${OPENAPI_DOC} ${LINTER_OPTIONS}

bundle-oas: \
	${OPENAPI_DOC} \
	${MODULE_PATH}/${LINTER} \
	out

	npx ${LINTER} bundle ${OPENAPI_DOC} \
		--output ${OUT_DIR}/${OAS_BUNDLE_FILE} \
		--ext ${OAS_BUNDLE_FILE_EXT} \
		--lint # optional

pre-commit: \
	lint \
	docker-lint \
	test \
	compose-prod \
	compose-down

	true

clean:
	rm -r ${OUT_DIR}

generate: \
	${OUT_DIR}/${OAS_BUNDLE_FILE}

	bin/generate.sh

compile: \
	${MODULE_PATH}/@${COMPILER}

	npx ${COMPILER} ${SOURCE_DIR} -d ${OUT_DIR}

watch: \
	${MODULE_PATH}/${WATCHER} \
	${MODULE_PATH}/@${COMPILER}

	npx ${COMPILER} ${SOURCE_DIR} -wd ${OUT_DIR}

test: \
	${MODULE_PATH}/${TEST_RUNNER} \
	compose-up

	docker compose -p ${PROJECT_NAME} run \
		--tty=false \
		--interactive=false \
		app npx ${TEST_RUNNER}

bundle: \
	${MODULE_PATH}/${BUNDLER}

	npx ${BUNDLER} ${SOURCE_DIR}/index.ts \
		--bundle \
		--outfile=${OUT_DIR}/bundle.js \
		--platform=node \
		--minify

prisma-init:

	npx prisma init --datasource-provider mongodb

prisma-push:

	npx prisma db push

compose-up:

	docker compose -p ${PROJECT_NAME} up -d --build

compose-down:
	
	docker compose -p ${PROJECT_NAME} down -t 1

compose-dev:

	docker compose -p ${PROJECT_NAME} \
		-f ./docker-compose.yaml \
		-f ./dev.yaml \
		up -d --build

compose-prod:

	docker compose -p ${PROJECT_NAME} \
		-f ./docker-compose.yaml \
		-f ./production.yaml \
		up -d --build

docker-lint:

	npx dockerfilelint Dockerfile ./mongodb.Dockerfile
	docker run --rm -i hadolint/hadolint < Dockerfile
