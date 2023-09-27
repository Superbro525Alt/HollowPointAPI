sudo apt remove nodejs -y
sudo apt purge nodejs -y

sudo apt install npm -y

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

source ~/.bashrc

nvm install v16.14.0 -y

npm install -y

node ./src/index.js
