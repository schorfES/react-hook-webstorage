.PHONY: validate tests build release prerelease

validate:
	./node_modules/.bin/tsc --noEmit

	./node_modules/.bin/eslint \
		--ext .ts \
		--ext .tsx \
		.

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
