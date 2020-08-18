run:
	npm start

build:
	ng build --prod --deploy-url "https://blog.c0nrad.io/interference" --base-href "https://blog.c0nrad.io/interference"
	mv ./dist/interference/* ./docs

deploy: build
	cd ../..; git add -A .;	git commit -m "release"; git push origin master
