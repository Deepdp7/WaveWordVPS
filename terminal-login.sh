#!/bin/bash
clear
echo -e "\e[1;32mWelcome to Home Server Terminal!\e[0m"
echo -e "\e[0;36mAuthentication required.\e[0m"
read -s -p "Password: " pass
echo

if [ "$pass" == "1414" ]; then
  export TMOUT=300
  export readonly TMOUT
  echo -e "\e[1;32mAccess granted. Type 'exit' or leave idle for 5m to logout.\e[0m"
  exec bash
else
  echo -e "\e[1;31mAccess denied.\e[0m"
  sleep 2
  exit 1
fi
