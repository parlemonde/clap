BUILD_DIR=${PWD}

install:
	rm -rf node_modules/.bin
	rm -rf $(BUILD_DIR)/dist
	node --version
	npm install --target_arch=arm64 --target_platform=linux --target_libc=glibc
	npm rebuild argon2 --target_arch=arm64 --target_platform=linux --target_libc=glibc --update-binary

build:
	npm run build

artifacts:
	# Copy artifacts for deployment
	rm .next/standalone/.env
	mv .next/standalone/.env.production .next/standalone/.env
	cp -r .next/standalone/. $(ARTIFACTS_DIR)
	cp run.sh $(ARTIFACTS_DIR)

	# Copy static resources to dist to upload to S3 later
	mkdir -p $(BUILD_DIR)/dist
	cp -r .next/static/. $(BUILD_DIR)/dist

build-LambdaFunction: install build artifacts
