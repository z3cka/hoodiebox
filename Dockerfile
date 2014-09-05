FROM debian
RUN apt-get update
# install couchDB & git
RUN apt-get install -y couchdb git
# install curl and nodejs
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get update
RUN apt-get install -y nodejs
# install hoodie
RUN npm install -g hoodie-cli