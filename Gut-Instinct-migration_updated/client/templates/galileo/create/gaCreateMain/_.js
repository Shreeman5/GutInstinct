import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {
    Session
} from 'meteor/session';

let maxDisplay = 12;

let phases = [{
        id: 0,
        text: "0",
        description: "Introduction",
        beginCard: 1
    },
    {
        id: 1,
        text: "1",
        description: "Provide your hypothesis",
        beginCard: 3
    },
    {
        id: 2,
        text: "2",
        description: "Design an experiment",
        beginCard: 8
    },
    {
        id: 3,
        text: "3",
        description: "Pilot your experiment",
        beginCard: 13
    },
    {
        id: 4,
        text: "4",
        description: "Experiment logistics",
        beginCard: 20
    }
];

Reload._onMigrate(function() {
    return [false];
});

Template.gaCreateMain.onRendered(function() {
    showNextCard(this);
});

Template.gaCreateMain.onCreated(function() {

    Session.setDefault('isDemo', false);

    var inst = this;

    // Basic UI element variables
    this.currentDisplay = new ReactiveVar(0);
    this.progress = new ReactiveVar(0.0);
    this.showStep = new ReactiveVar(true);
    Meteor.call("galileo.tour.isTouring", function(err, is) {
        inst.showStep.set(is);
    });

    // Experiment Variables
    this.exp = {};
    this.exp.expId = new ReactiveVar(undefined);
    this.exp.designId = new ReactiveVar(undefined);
    this.exp.intuition = new ReactiveVar(undefined);
    this.exp.cause = new ReactiveVar(undefined);
    this.exp.relation = new ReactiveVar(undefined);
    this.exp.effect = new ReactiveVar(undefined);

    this.exp.variablesIdentified = new ReactiveVar(false);

    this.exp.causeMeasureType = new ReactiveVar(undefined);
    this.exp.causeMeasureFrequency = new ReactiveVar(undefined);
    this.exp.causeMeasureTime = new ReactiveVar(undefined);

    this.exp.effectMeasureType = new ReactiveVar(undefined);
    this.exp.effectMeasureFrequency = new ReactiveVar(undefined);
    this.exp.effectMeasureTime = new ReactiveVar(undefined);

    this.exp.hasInclusionCriteria = new ReactiveVar(false);
    this.exp.inclusionCriteria = new ReactiveVar([]);
    this.exp.hasExclusionCriteria = new ReactiveVar(false);
    this.exp.exclusionCriteria = new ReactiveVar([]);

    this.exp.controlCondition = new ReactiveVar(undefined);
    this.exp.experimentalCondition = new ReactiveVar(undefined);
    this.exp.controlSteps = new ReactiveVar([]);
    this.exp.experimentalSteps = new ReactiveVar([]);

    // If there's intuition specified
    if (this.data && this.data.intuitionId) {

        // Load intuition by id
        Meteor.call("galileo.intuition.getIntuitionById", this.data.intuitionId, function(err, intuition) {
            inst.exp.intuition.set(intuition.intuition);
        });
    } else if (this.data && this.data.expId) {

        // If there's experiment id specified
        Meteor.call("galileo.experiments.getExperiment", this.data.expId, function(err, exp) {

            if (exp) {

                // First setup IDs
                inst.exp.expId.set(exp._id);
                inst.exp.designId.set(exp.curr_design_id);

                // Then setup experiment design data
                var d = exp.design;

                inst.exp.intuition.set(d.intuition);
                inst.exp.cause.set(d.cause);
                inst.exp.relation.set(d.relation);
                inst.exp.effect.set(d.effect);
                inst.exp.variablesIdentified.set(d.variables_identified);
                inst.exp.causeMeasureType.set(d.cause_measure && d.cause_measure.type);
                inst.exp.causeMeasureFrequency.set(d.cause_measure && d.cause_measure.frequency);
                inst.exp.causeMeasureTime.set(d.cause_measure && d.cause_measure.time);
                inst.exp.effectMeasureType.set(d.effect_measure && d.effect_measure.type);
                inst.exp.effectMeasureFrequency.set(d.effect_measure && d.effect_measure.frequency);
                inst.exp.effectMeasureTime.set(d.effect_measure && d.effect_measure.time);
                inst.exp.inclusionCriteria.set(d.criteria && d.criteria.inclusion);
                inst.exp.exclusionCriteria.set(d.criteria && d.criteria.exclusion);
                inst.exp.controlCondition.set(d.condition && d.condition.control && d.condition.control.description);
                inst.exp.experimentalCondition.set(d.condition && d.condition.experimental && d.condition.experimental.description);
                inst.exp.controlSteps.set(d.condition && d.condition.control && d.condition.control.steps);
                inst.exp.experimentalSteps.set(d.condition && d.condition.experimental && d.condition.experimental.steps);

                // Then move the user to the progress group
                Meteor.call("galileo.experiments.getDesignProgress", exp._id, function(err, progress) {
                    if (progress != undefined) {
                        refreshDisplay(inst, progress);
                        Materialize.toast('Progress Loaded', 1500, 'toast rounded');
                    }
                });
            } else {
                alert("Experiment doesn't exists");
                window.location.href = "/galileo/create"
            }
        });
    }
});

Template.gaCreateMain.helpers({

    /**
     * Page Elem Helpers
     */
    phases: function() {
        return phases;
    },
    isCurrentPhase: function(phase) {
        var curr = Template.instance().currentDisplay.get();
        if (phase.id + 1 == phases.length) {
            return curr >= phase.beginCard;
        } else {
            return curr >= phase.beginCard && curr < phases[phase.id + 1].beginCard;
        }
    },
    isLaterPhase: function(phase) {
        var curr = Template.instance().currentDisplay.get();
        return phase.beginCard > curr;
    },
    showStep: function() {
        return Template.instance().showStep.get();
    },
    progress: function() {
        return Template.instance().progress.get();
    },

    /**
     * Experiment Variable Helpers.
     * All of these
     */
    expId: function() {
        return Template.instance().exp.expId;
    },
    designId: function() {
        return Template.instance().exp.designId;
    },
    intuition: function() {
        return Template.instance().exp.intuition;
    },
    hypothesis: function() {
        var inst = Template.instance();
        return inst.exp.cause.get() + " " + inst.exp.relation.get() + " " + inst.exp.effect.get();
    },
    cause: function() {
        return Template.instance().exp.cause;
    },
    relation: function() {
        return Template.instance().exp.relation;
    },
    effect: function() {
        return Template.instance().exp.effect;
    },
    variablesIdentified: function() {
        return Template.instance().exp.variablesIdentified;
    },
    causeMeasureType: function() {
        return Template.instance().exp.causeMeasureType;
    },
    causeMeasureFrequency: function() {
        return Template.instance().exp.causeMeasureFrequency;
    },
    causeMeasureTime: function() {
        return Template.instance().exp.causeMeasureTime;
    },
    effectMeasureType: function() {
        return Template.instance().exp.effectMeasureType;
    },
    effectMeasureFrequency: function() {
        return Template.instance().exp.effectMeasureFrequency;
    },
    effectMeasureTime: function() {
        return Template.instance().exp.effectMeasureTime;
    },
    inclusionCriteria: function() {
        return Template.instance().exp.inclusionCriteria;
    },
    exclusionCriteria: function() {
        return Template.instance().exp.exclusionCriteria;
    },
    controlCondition: function() {
        return Template.instance().exp.controlCondition;
    },
    experimentalCondition: function() {
        return Template.instance().exp.experimentalCondition;
    },
    controlSteps: function() {
        return Template.instance().exp.controlSteps;
    },
    experimentalSteps: function() {
        return Template.instance().exp.experimentalSteps;
    }
});

Template.gaCreateMain.events({
    'click .helpbtn': function(event) {
        let btnId = event.currentTarget.id;
        let res = btnId.split('-');
        let helpcardId = '#helpcard-' + res[1] + '-' + res[2];
        let $helpCard = $(helpcardId);
        if ($helpCard.hasClass("active")) {
            $helpCard.removeClass("active").slideToggle(200);
        } else {
            $helpCard.addClass("active").slideToggle(200);
        }
    },
    'click .helpclose': function(event) {
        let cardId = event.target;
        $(cardId).closest('.card').removeClass("active").slideToggle(200);
    },
    'click .next-action': function(event) {

        // Cache the instance
        var inst = Template.instance();

        // Check if this is the last display
        if (inst.currentDisplay.get() == maxDisplay) {

            // Then mark the experiment as finished
            Meteor.call("galileo.experiments.setDesigned", inst.exp.expId.get());

            // Alert the user
            alert("You have successfully designed an experiment! You will be redirected to your experiment view so you can complete the next steps and run your experiment!");

            // If the user is still touring, then let him finish the create
            Meteor.call("galileo.tour.isTouring", function(err, is) {
                if (is) {
                    Meteor.call("galileo.tour.finishCreate");

                    window.location.href = "/galileo/browse";
                } else {
                    window.location.href = "/galileo/me/created_experiments";
                }
            });

            // Return
            return;
        }

        // If not, show the next card
        showNextCard(inst);

        // Save the progress
        Meteor.call("galileo.experiments.setDesignProgress", inst.exp.expId.get(), inst.currentDisplay.get());
    },
    'click .back-action': function(event) {

        // Cache the instance
        var inst = Template.instance();

        // Check if this is the first display
        if (inst.currentDisplay.get() == 1) {
            alert("This is the first step. Please provide required details to proceed");
            return;
        }

        // Go to the previous card
        showPrevCard(inst);

        // Save the progress
        Meteor.call("galileo.experiments.setDesignProgress", inst.exp.expId.get(), inst.currentDisplay.get());
    }
});

function showNextCard(inst) {

    // Get the current display value
    var curr = parseInt(inst.currentDisplay.get());

    // First hide the previous one
    $("#card-" + curr).hide();

    // Then move on to the next one
    curr = curr + 1;
    inst.currentDisplay.set(curr);
    $("#card-" + curr).show().trigger("show");

    // Update progress and scroll
    updateProgress(inst);
    scrollToTop();
}

function showPrevCard(inst) {

    // Get the current display value
    var curr = parseInt(inst.currentDisplay.get());

    // First hide the original one
    $("#card-" + curr).hide();

    // Then move on to the previous display
    curr = curr - 1;
    inst.currentDisplay.set(curr);
    $("#card-" + curr).show().trigger("show");

    // Update and scroll
    updateProgress(inst);
    scrollToTop();
}

function refreshDisplay(inst, target) {

    // First hide the current display
    $("#card-" + inst.currentDisplay.get()).hide();

    // Then show the target display
    inst.currentDisplay.set(target);
    $("#card-" + target).show().trigger("show");

    // Then update the progress and scroll
    updateProgress(inst);
    scrollToTop();
}

function updateProgress(inst) {
    var curr = inst.currentDisplay.get();
    var phase = getPhaseIndex(curr);
    let p = ((curr - phases[phase].beginCard) / getPhaseLength(phase)) * 100;
    inst.progress.set(p);
}

function getPhaseIndex(cardId) {
    for (var i = 0; i < phases.length; i++) {
        if (i < phases.length - 1) {
            if (cardId >= phases[i].beginCard && cardId < phases[i + 1].beginCard) {
                return i;
            }
        } else {
            if (cardId >= phases[i].beginCard) {
                return i;
            }
        }
    }
    return -1;
}

function getPhaseLength(phase) {
    if (phase < phases.length - 1) {
        return phases[phase + 1].beginCard - phases[phase].beginCard;
    } else {
        return maxDisplay - phases[phase].beginCard;
    }
}

function scrollToTop() {
    $("html, body").animate({
        scrollTop: 0
    }, 300);
}