@ECHO OFF

start cmd -new_console:s /k "cd ./client & npm i"

cd ./server 
npm i

