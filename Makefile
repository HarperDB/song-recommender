default: dev

.PHONY: build

dev: build
	docker run \
		-v $(shell pwd)/src:/opt/harperdb/hdb \
		-v $(shell pwd)/data:/data \
		-e HDB_ADMIN_USERNAME=hdbml \
		-e HDB_ADMIN_PASSWORD=hdbml \
		-e LOG_TO_STDSTREAMS=true \
		-e RUN_IN_FOREGROUND=true \
		-e CUSTOM_FUNCTIONS=true \
		-e SERVER_PORT=9935 \
		-e CUSTOM_FUNCTIONS_PORT=9936 \
		-p 9935:9935 \
		-p 9936:9936 \
		harperdb_pip

bash: build
	docker run \
		-it \
		-p 3000:3000 \
		-v $(shell pwd)/src:/opt/harperdb/hdb \
		-v $(HOME)/hdbml:/home/ubuntu/hdbml \
		harperdb_pip \
		bash

notebook:
	docker run \
		-it \
		-p 8888:8888 \
		-v $(shell pwd)/notebooks:/home/ubuntu/notebooks \
		-v $(shell pwd)/data:/home/ubuntu/data \
		-v $(HOME)/hdbml:/home/ubuntu/hdbml \
		harperdb_pip \
		jupyter-lab --ip='*'

build:
	docker build \
		-t harperdb_pip \
		.

down:
	docker stop $(shell docker ps -q --filter ancestor=harperdb_pip ) || exit 0
