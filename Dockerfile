FROM harperdb/harperdb:latest
USER root

RUN  apt-get update && apt-get install -y \
  python3-pip \
  && rm -rf /var/lib/apt/lists/*

RUN pip install harperdb
RUN pip install jupyterlab
RUN pip install numpy
RUN pip install tensorflow
RUN pip install tensorflow-recommenders
RUN pip install tensorflowjs[wizard]
RUN pip install -U jupyter_console

USER ubuntu

RUN mkdir /home/ubuntu/notebooks
RUN mkdir /home/ubuntu/data
