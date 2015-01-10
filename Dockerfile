FROM node:0.10
MAINTAINER Ruoshi Ling <fntsrlike@gmail.com>

# Timezone
RUN cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime
RUN echo 'Asia/Taipei' > /etc/timezone

# Node_modules Cache
COPY ./package.json /app/package.json
COPY ./README.md /app/README.md
WORKDIR /app
RUN apt-get update && apt-get install -y libicu-dev
RUN npm install

# Application
COPY . /app

# Port
EXPOSE 80

# Execute
ENTRYPOINT ["node"]
CMD ["config.js"]
