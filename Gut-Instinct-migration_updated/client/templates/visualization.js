import { Template } from 'meteor/templating';
import './visualization.html';

Template.emperorVisualization.onCreated(function() {
  console.log('Emperor visualization template created');
});

Template.emperorVisualization.onRendered(function() {
  console.log('Emperor visualization template rendered');
});
