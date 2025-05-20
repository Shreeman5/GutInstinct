import './_.html';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

// Configure Iron Router
Router.configure({
    noRoutesTemplate: null
});

// Define routes
Router.route('/', function() {
    this.render('gaQuestions');
});

Router.route('/galileo/questions', function() {
    this.render('gaQuestions');
});

Template.gaQuestions.onCreated(function() {
    // Initialize any necessary variables
});

Template.gaQuestions.events({
    'click #seeViz': function(event) {
        event.preventDefault();
        // Handle the click event for the visualization link
        alert('Visualization coming soon!');
        // You can replace the alert with actual visualization functionality
    }
});