@ECHO OFF

start cmd -new_console:s /k "cd ./client & npm run dev"

cd ./server 
npm run dev

