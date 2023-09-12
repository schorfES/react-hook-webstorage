.PHONY: validate tests build release prerelease

validate:
	./node_modules/.bin/tsc \
		--project tsconfig.src.json \
		--noEmit

	./node_modules/.bin/tsc \
		--project tsconfig.test.jest.json \
		--noEmit

	./node_modules/.bin/eslint \
		. \
		--ext .js \
		--ext .ts \
		--ext .tsx

	./node_modules/.bin/prettier \
		. \
    --check

tests:
	./node_modules/.bin/jest \
		src \
		--coverage \
		--verbose

build:
	echo "Implement this!"

release: validate tests
	echo "Implement this!"

prerelease: validate tests
	echo "Implement this!"
