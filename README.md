# HarperDB Song Recommender
The HarperDB Song Recommender is a Custom Function for [HarperDB](https://harperdb.io/) that produces song recommendations using [TensorFlow](https://www.tensorflow.org).

The user selects three of their favorite songs, and the recommender returns other titles that the user is likely to enjoy.

## Summary
This is a [TensorFlow Recommendation System](https://www.tensorflow.org/recommenders) project that uses the data from the [The Million Song Dataset](http://millionsongdataset.com/) to create an example song recommendation application using [HarperDB Custom Functions](https://harperdb.io/docs/custom-functions/).

There's a nice subset of that data called [The Echo Nest Taste Profile Subset](http://millionsongdataset.com/tasteprofile/) which is a list of users, songs, and play counts. Each row in the data contains a userid, songid, and playcount. This is what we used to build the model for this project.


## How to Use
Visit the [HarperDB Song Recommender UI](http://localhost:9936/song-recommender/ui) and use the three search boxes to find three of your favorite songs, then click the Recommend button to see the top results.

## How to Setup
This project uses a local instance of the HarperDB database contained in a Dockerfile. To setup the environment you will need a free [HarperDB Account](https://studio.harperdb.io/sign-up) and Docker installed on your system.
1. In the project directory (where this repo is located on your machine) run `make`. This will download and start the database container. Check back here to view the logs.
2. In another window, once the database has started, run `curl http://localhost:9936/song-recommender/setup` to begin the HDBML environment setup (creating the schema and loading the training data). This will take about five minutes, and you can run this command again to check on the status of the setup.
3. Once the setup has completed, visit the UI in your browser at [http://localhost:9936/song-recommender/ui/](http://localhost:9936/song-recommender/ui/).

## Training Notebooks
Run `make notebook` to launch Jupyter Lab and access the training notebooks at [http://localhost:8888](http://localhost:8888).

1. notebooks/csv_cleaner.ipynb will clean the Echo Nest data and prepare it for training
2. notebooks/song_recommender.ipynb will train the model
