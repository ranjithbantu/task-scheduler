FROM node:14
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y postgresql-client tzdata
ENV TZ=UTC
COPY package*.json ./
RUN npm install
COPY . .
COPY entrypoint.sh ./
COPY wait-for-it.sh ./
RUN chmod +x entrypoint.sh
RUN chmod +x wait-for-it.sh
EXPOSE 5000
ENTRYPOINT ["./entrypoint.sh"]