import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';


import {
    UserEmail,
    UserTestResponse
} from '../../../../imports/api/models.js';

Template.telluswhatyouknownow.rendered = function() {};

Template.telluswhatyouknownow.onCreated(function() {});

Template.telluswhatyouknownow.helpers({
    isEmailAsked: function() {
        var currentUser = Meteor.userAsync().username;

        var fetchResult = UserEmail.findOne({
            "username": currentUser
        });

        if (fetchResult == undefined) {
            return false;
        } else {
            return true;
        }
    },
});

Template.telluswhatyouknownow.events({

    'click #submitTest': function(event) {
        event.preventDefault();

        if ($('#userAnswerText').val() === '') {
            alert("Please enter your understanding about the gut microbiome");
            return;
        }

        const userRes = $('#userAnswerText').val().trim();

        var checkExist = (typeof UserTestResponse.findOne({
            "username": Meteor.userAsync().username
        }) !== 'undefined');

        if (checkExist) {
            var targetID = UserTestResponse.findOne({
                "username": Meteor.userAsync().username
            })._id;
            UserTestResponse.update({
                _id: targetID
            }, {
                $set: {
                    "posttest_response": userRes
                }
            });

        } else {
            UserTestResponse.insert({
                "username": Meteor.userAsync().username,
                "posttest_response": userRes
            });
        }

        window.location.href = '/gutboard';
    }
});