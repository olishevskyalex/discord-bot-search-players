# discord-bot-search-players
**[node](https://nodejs.org/):** 14.15.4  
**[discord.js](https://discord.js.org/):** 12.5.1

## Overview
Discord bot for finding someone to play games with.

## List of command
**[prefix]help** - Displays information about the bot and a list of available commands.  
**[prefix]start** - Starts player search.  
**[prefix]list** - Displays the number of players who are currently looking for someone to play with.  
**[prefix]report** - Command for sending a message about a found bug.  

## Installation
First you need to create file **config.json**  
**config.json** - This is config file.

#### file structure config.json
    {  
      "token": <your token>,  
      "admin-id": <your discord id>,  
      "games": <your array of games>,  
      "command-prefix": <your prefix>  
    }
