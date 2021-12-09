/*globals define, WebGMEGlobal*/
/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Sun Dec 05 2021 19:59:25 GMT+0000 (Coordinated Universal Time).
 */

 define([
    'js/Constants',
    'js/Utils/GMEConcepts',
    'js/NodePropertyNames'
], function (
    CONSTANTS,
    GMEConcepts,
    nodePropertyNames
) {

    'use strict';

    function PetriVisControl(options) {

        this._logger = options.logger.fork('Control');

        this._client = options.client;

        // Initialize core collections and variables
        this._widget = options.widget;

        this._currentNodeId = null;

        this._networkRootLoaded = false;

        this._fireableEvents = null;

        this._initWidgetEventHandlers();

        this.setFireableEvents = this.setFireableEvents.bind(this);

        // we need to fix the context of this function as it will be called from the widget directly
        // this.setFireableEvents = this.setFireableEvents.bind(this);

        this._logger.debug('ctor finished');
    }

    PetriVisControl.prototype._initWidgetEventHandlers = function () {
        this._widget.onNodeClick = function (id) {
            // Change the current active object
            WebGMEGlobal.State.registerActiveObject(id);
        };
    };

    /* * * * * * * * Visualizer content update callbacks * * * * * * * */
    // One major concept here is with managing the territory. The territory
    // defines the parts of the project that the visualizer is interested in
    // (this allows the browser to then only load those relevant parts).
    PetriVisControl.prototype.selectedObjectChanged = function (nodeId) {
        var self = this;

        // Remove current territory patterns
        if (self._currentNodeId) {
            self._client.removeUI(self._territoryId);
            self._networkRootLoaded = false;
        }

        self._currentNodeId = nodeId;

        if (typeof self._currentNodeId === 'string') {
            // Put new node's info into territory rules
            self._selfPatterns = {};
            self._selfPatterns[nodeId] = {children: 1};  // Territory "rule"

            self._territoryId = self._client.addUI(self, function (events) {
                self._eventCallback(events);
            });

            // Update the territory
            self._client.updateTerritory(self._territoryId, self._selfPatterns);
        }
    };

    /* * * * * * * * Node Event Handling * * * * * * * */
    PetriVisControl.prototype._eventCallback = function (events) {
        const self = this;
        console.log(events);
        events.forEach(event => {
            if (event.eid && 
                event.eid === self._currentNodeId ) {
                    if (event.etype == 'load' || event.etype == 'update') {
                        self._networkRootLoaded = true;
                    } else {
                        self.clearSM();
                        return;
                    }
                }
                
        });

        if (events.length && events[0].etype === 'complete' && self._networkRootLoaded) {
            // complete means we got all requested data and we do not have to wait for additional load cycles
            self._initSM();
        }
    };

    PetriVisControl.prototype._stateActiveObjectChanged = function (model, activeObjectId) {
        if (this._currentNodeId === activeObjectId) {
            // The same node selected as before - do not trigger
        } else {
            this.selectedObjectChanged(activeObjectId);
        }
    };

    /* * * * * * * * Machine manipulation functions * * * * * * * */
    PetriVisControl.prototype._initSM = function () {
        const self = this;
        //just for the ease of use, lets create a META dictionary
        const rawMETA = self._client.getAllMetaNodes();
        const META = {};
        rawMETA.forEach(node => {
            META[node.getAttribute('name')] = node.getId(); //we just need the id...
        });
        //now we collect all data we need for network visualization
        //we need our states (names, position, type), need the set of next state (with event names)
        const smNode = self._client.getNode(self._currentNodeId);
        const elementIds = smNode.getChildrenIds();
        const pn = {init: {places:{}, transitions:{}}, places:{}, transitions:{}, setFireableEvents: null};
        elementIds.forEach(elementId => {
            const node = self._client.getNode(elementId);
            // the simple way of checking type
            if (node.isTypeOf(META['Place'])) {
                //right now we only interested in states...
                const place = {name: node.getAttribute('name'), next:{}, position: node.getRegistry('position'), tokens: node.getAttribute('token')};

                // this is in no way optimal, but shows clearly what we are looking for when we collect the data
                elementIds.forEach(nextId => {
                    const nextNode = self._client.getNode(nextId);
                    if(nextNode.isTypeOf(META['Arc']) && nextNode.getPointerId('src') === elementId) {
                        place.next[nextNode.getPointerId('dst')] = nextNode.getPointerId('dst');
                    }
                });
                pn.places[elementId] = place;
            }
            if (node.isTypeOf(META['Transition'])) {
                const trans = {name: node.getAttribute('name'), next:{}, position: node.getRegistry('position'), inPlaces:{}};

                // this is in no way optimal, but shows clearly what we are looking for when we collect the data
                elementIds.forEach(nextId => {
                    const nextNode = self._client.getNode(nextId);
                    if(nextNode.isTypeOf(META['Arc']) && nextNode.getPointerId('src') === elementId) {
                        trans.next[nextNode.getPointerId('dst')] = nextNode.getPointerId('dst');
                    }
                });
                pn.transitions[elementId] = trans;
            }
        });
        Object.keys(pn.places).forEach(placeId => {
            Object.keys(pn.places[placeId].next).forEach(t_id => {
                pn.transitions[t_id].inPlaces[placeId] = placeId;
            });
        });
        pn.setFireableEvents = this.setFireableEvents;
        pn.init.places = JSON.parse(JSON.stringify(pn.places));
        pn.init.transitions = JSON.parse(JSON.stringify(pn.transitions));
        self._widget.initPetriNet(pn);
    };

    PetriVisControl.prototype.clearSM = function () {
        const self = this;
        self._networkRootLoaded = false;
        self._widget.destroyMachine();
    };

    PetriVisControl.prototype.setFireableEvents = function (events) {
        this._fireableEvents = events;
        if (events && Object.keys(events).length > 1) {
            // we need to fill the dropdow button with options
            this.$btnEventSelector.clear();
            Object.keys(events).forEach(event => {
                this.$btnEventSelector.addButton({
                    text: events[event],
                    title: 'fire event: '+ events[event],
                    data: {event: event},
                    clickFn: data => {
                        this._widget.fireEvent(data.event);
                    }
                });
            });
        } else if (events && Object.keys(events).length === 0) {
            this._fireableEvents = null;
            setTimeout(function(){
                window.alert("Deadlock or All tokens reached destinations (No enabled transitions). Please reset or change the Petri net to continue.");
            }, 550); 
        }

        this._displayToolbarItems();
    };


    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    PetriVisControl.prototype.destroy = function () {
        this._detachClientEventListeners();
        this._removeToolbarItems();
    };

    PetriVisControl.prototype._attachClientEventListeners = function () {
        this._detachClientEventListeners();
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
    };

    PetriVisControl.prototype._detachClientEventListeners = function () {
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
    };

    PetriVisControl.prototype.onActivate = function () {
        this._attachClientEventListeners();
        this._displayToolbarItems();

        if (typeof this._currentNodeId === 'string') {
            WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {suppressVisualizerFromNode: true});
        }
    };

    PetriVisControl.prototype.onDeactivate = function () {
        this._detachClientEventListeners();
        this._hideToolbarItems();
    };

    /* * * * * * * * * * Updating the toolbar * * * * * * * * * */
    PetriVisControl.prototype._displayToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].show();
            }
            if (this._fireableEvents === null) {
                this.$btnEventSelector.hide();
                this.$btnSingleEvent.hide();
            } else if (Object.keys(this._fireableEvents).length == 1) {
                this.$btnEventSelector.hide();
            } else {
                this.$btnSingleEvent.hide();
            }
        } else {
            this._initializeToolbar();
        }
    };


    PetriVisControl.prototype._hideToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].hide();
            }
        }
    };

    PetriVisControl.prototype._removeToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].destroy();
            }
        }
    };

    PetriVisControl.prototype._initializeToolbar = function () {
        var self = this,
            toolBar = WebGMEGlobal.Toolbar;

        this._toolbarItems = [];

        this._toolbarItems.push(toolBar.addSeparator());

        /************** Go to hierarchical parent button ****************/
        this.$btnReachCheck = toolBar.addButton({
            title: 'Check Petri Net Type',
            icon: 'glyphicon glyphicon-question-sign',
            clickFn: function (/*data*/) {
                const context = self._client.getCurrentPluginContext('PetriNetVerify', self._currentNodeId, []);
                // !!! it is important to fill out or pass an empty object as the plugin config otherwise we might get errors...
                context.pluginConfig = {};
                self._client.runServerPlugin(
                    'PetriNetVerify', 
                    context, 
                    function(err, result){
                        // here comes any additional processing of results or potential errors.
                        console.log('plugin err:', err);
                        console.log('plugin result:', result);
                    });
                }
            
        });
        this._toolbarItems.push(this.$btnReachCheck);

        this.$btnResetMachine = toolBar.addButton({
            title: 'Reset simulator',
            icon: 'glyphicon glyphicon-fast-backward',
            clickFn: function (/*data*/) {
                self._widget.resetMachine();
            }
        });
        this._toolbarItems.push(this.$btnResetMachine);

        // when there are multiple events to choose from we offer a selector
        this.$btnEventSelector = toolBar.addDropDownButton({
            text: 'event'
        });
        this._toolbarItems.push(this.$btnEventSelector);
        this.$btnEventSelector.hide();

        // if there is only one event we just show a play button
        this.$btnSingleEvent = toolBar.addButton({
            title: 'Fire event',
            icon: 'glyphicon glyphicon-play',
            clickFn: function (/*data*/) {
                self._widget.fireEvent(Object.keys(self._fireableEvents)[0]);
            }
        });
        this._toolbarItems.push(this.$btnSingleEvent);


        this._toolbarInitialized = true;
    };

    return PetriVisControl;
});
