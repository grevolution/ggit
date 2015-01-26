#!/usr/bin/env node

/*
 * Copyright 2015, All Rights Reserved.
 *
 * Code licensed under the MIT License:
 * https://github.com/grevolution/ugit/blob/master/LICENSE.md
 *
 * @author Shan Ul Haq <g@grevolution.me>
 */

'use strict';
var inquirer = require("inquirer");
var exec = require("child_process").exec;
var json = '';

function findAndCommit(keyword) {
  exec('ruby $NODE_PATH/ugit/unfuddler/upload.rb'.concat(" ").concat(keyword), printTicketsToSelect);
}

function printTicketsToSelect(err, stdout, stderr){
    json = JSON.parse(stdout)
    var summaries = []
    for(var i in json) {
      summaries.push(json[i].title)
    }

    inquirer.prompt([
      {
        type: "list",
        name: "ticket",
        message: "Ticket:",
        choices: summaries,
        default: function() {return "Ticket completed"}
      },
      {
        type: "input",
        name: "message",
        message: "Your message?",
        default: function() {return "Implementation Done"}
      }
    ], function( answers ) {
        var commit_message = answers.ticket.concat(" - ").concat(answers.message)
        exec('git commit -am \"'.concat(commit_message).concat("\""), showAll)

        //if the message contains the word `fixed` in it. mark the ticket as resolved
        //if the ticket contains the word `spent` in it. see the next 
        for(var i in json) {
          var t = json[i]
          if(t.title.valueOf() == answers.ticket.valueOf()) {
            checkFixedAndTime(t, answers.message)
          }
        }
      });
}

function checkFixedAndTime(obj, msg) {
  var resolved = false;
  if(msg.toLowerCase().indexOf("fixed") > -1) {
    //the string contains the word fixed.
    var ticketId = getTicketId(obj)
    var projectId = obj.project_id
    exec('ruby unfuddler/upload.rb -u '.concat(projectId+" ").concat(ticketId+" ").concat("1"), showError);
    resolved = true
  }

  var spIndex = msg.toLowerCase().indexOf("spent")
  if(spIndex > -1){
    var str1 = msg.substring(spIndex + "spent".length)
    var hIndex = str1.toLowerCase().indexOf("h");
    if(hIndex > -1){
      var time1 = str1.substring(0, hIndex);
      time1 = time1.trim();
      var timeSpent = parseFloat(time1)
      if(timeSpent > 0){
          //enter time entry
          var ticketId = getTicketId(obj)
          var projectId = obj.project_id
          if(!resolved){
            exec('ruby unfuddler/upload.rb -u '.concat(projectId+" ").concat(ticketId+" ").concat("0"), showError);            
          }
          exec('ruby unfuddler/upload.rb -a '.concat(projectId+" ").concat(ticketId+" ").concat(""+timeSpent), showError);
      }
    }
  }
}

function getTicketId(obj){
  var location = obj.location
  var arr = location.split("/")
  return arr[arr.length -1]
}

function showAll(err, stdout, stderr) {
  if(stdout) console.log(stdout)
  if(stderr) console.log(stderr)  
}

function showError(err, stdout, stderr) {
  if(err) console.log(err)
  if(stderr) console.log(stderr)  
}

findAndCommit(process.argv[2])