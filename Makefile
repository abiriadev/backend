# Usgae:
# make watch:
# 	watch openapi documentation file and build it again whenever it changes

.PHONY: all watch lint bundle

OPENAPI_DIR := ./schemas
OPENAPI_DOC := ${OPENAPI_DIR}/openapi.yaml
bundleFileExt := yaml
bundledDocName := bundle.${bundleFileExt}
MODULE_PATH := node_modules
WATCHER := chokidar
LINTER := @redocly/cli
LINTER_OPTIONS := --format codeframe # stylish

all:

watch: \
	${OPENAPI_DOC} \
	${MODULE_PATH}/${WATCHER} \
	${MODULE_PATH}/${LINTER}

	npx ${WATCHER} ${OPENAPI_DIR} -i ${OPENAPI_DIR}/${bundledDocName} --verbose -c "make push"

push: bundle #lint

lint: \
	${OPENAPI_DOC} \
	${MODULE_PATH}/${LINTER}

	npx ${LINTER} lint ${OPENAPI_DOC} ${LINTER_OPTIONS}

bundle: \
	${OPENAPI_DOC} \
	${MODULE_PATH}/${LINTER}

	npx ${LINTER} bundle ${OPENAPI_DOC} -o ${OPENAPI_DIR}/${bundledDocName} --ext yaml --lint

pre-commit: \
	lint

	true
