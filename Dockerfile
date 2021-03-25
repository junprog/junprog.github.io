FROM ruby:latest

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN bundle install

CMD ["/bin/bash"]