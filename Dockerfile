FROM node:12

WORKDIR /opt/usermanagement

#copy package.json file
COPY package.json /opt/usermanagement

#install node packges
RUN npm install

#copy all files 
COPY . /opt/usermanagement

#expose the application port
EXPOSE 4101

#start the application
CMD node app.js