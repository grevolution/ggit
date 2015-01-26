#!/usr/bin/env node

/*
 * Copyright 2015, All Rights Reserved.
 *
 * Code licensed under the MIT License:
 * https://github.com/grevolution/ugit/blob/master/LICENSE.md
 *
 * @author Shan Ul Haq <eduardo.lundgren@gmail.com>
 */

'use strict';
var inquirer = require("inquirer");
var exec = require("child_process").exec;

function find_and_commit(keyword) {
  exec('ruby $NODE_PATH/ugit/unfuddler/upload.rb'.concat(" ").concat(keyword), print_tickets_to_select);
}

function print_tickets_to_select(err, stdout, stderr){
    inquirer.prompt([
      {
        type: "list",
        name: "ticket",
        message: "Ticket:",
        choices: stdout.split("\n")
      },
      {
        type: "input",
        name: "message",
        message: "Your message?"
      }
    ], function( answers ) {
        var commit_message = answers.ticket.concat(" - ").concat(answers.message)
        console.log(commit_message)
        exec('git commit -am \"'.concat(commit_message).concat("\""), git_commit_callback)
      });
}

function git_commit_callback(err, stdout, stderr){
  console.log(stdout)
  console.log(stderr)  
}

find_and_commit(process.argv[2])