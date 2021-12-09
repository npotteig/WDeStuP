# Petri Nets
Petri Nets are a type of model that allow users to view complex systems. The main componenets of a petri net are places (as circles), transitions (as rectangles), arcs (as directed arrows), and tokens (as black circles inside of places). The arcs connect places to transitions and vice-versa allowing for the tokens to move from place to place through arcs and transisions. In one time step, transisions with inPlaces (the places with arcs directed towards the transition) that have more than zero tokens are considered enabled and can be fired. When fired the amount of tokens in the inPlaces are decremented by one and the amount of tokens in the outPlaces (the places with arcs that are directed from the transision to them) are incremented by 1. If the number of enabled transitions is zero then we have either transported all the tokens to the sink place or we have reached deadlock. In either case we would have to reset the network to continue.

## Use Cases
There are multiple disciplines that use petri nets to model their system. One example is modelling the process of biological systems. Biologists use petri nets to study different ecological or evolutionary processes, experimenting with different modes of evolution. Also, this in distributed systems when we want to model the parallelism of a particular workflow and the splitting of various tasks. The data could then be visualized traveling down the workflow using the petri net. Furthermore, communication protocols can be modelled by petri nets by modelling the flow of a message through a network via network nodes.  

A petri net can be divided into four types:  
- Free Choice Petri Net (example in FreeChoice.simple): In this network, each transition has its own unique set of inPlaces, such that, the intersection of two inPlace sets of two different transitions is empty.
- State Machine (example in StateMachine.simple): If every transision has one inPlace and one outPlace then this is considered a state machine
- Marked Graph (example in MarkedGraph.simple): If every place has one inTransition and one outTransition then it is a Marked Graph
- Workflow Net (example in WorkflowNet.simple): If the network has one source with no inTransitions, one destination with no outTransitions, and every place and transition is on a path from the source to the destination then this is workflow net.

You can also find an example of a simple communication network with send/receive and ackowlegements in Messaging.example. The places represent various intermediary locations between the processes running, sending/receiving data, or acknowlegements. The transitions are the actions that we just described being performed on the token/message being passed through it.

## Installation
- install [Docker-Desktop](https://www.docker.com/products/docker-desktop)
- clone the repository
- edit the '.env' file so that the BASE_DIR variable points to the main repository directory
- `docker-compose up -d`
- connect to your server at http://localhost:8888

## Main docker commands
All of the following commands should be used from your main project directory (where this file also should be):
- To **rebuild** the complete solution `docker-compose build` (and follow with the `docker-compose up -d` to restart the server)
- To **debug** using the logs of the WebGME service `docker-compose logs webgme`
- To **stop** the server just use `docker-compose stop`

## Steps to create a model
Once you are in the localhost webpage for webgme, please create a new project using a seed. Choose the `PetriNetSeed` seed to start creating your petri net. Now you will see an examples folder that you can double click on to view a few examples of working petri nets. To create a new petri net follow these steps:
- Drag and drop a  `PetriNet` object from the bottom left corner onto the screen
- Now you can name the PetriNet by clicking on it and going to the bottom right corner to edit attributes
- Double click on the PetriNet to start editing the model
- Inside the PetriNet you can drag and drop places and transitions from the bottom left corner as well as name them and change token values in the attirbutes section in the bottom right. Make sure you click on the Place/Transition you want to edit before editing attributes.
- You can also create arcs by holding down the mouse on the white square that shows up when you hover over a transition or place. You can drag the arc to another white square on a place or transition.

## Simulation
To simulate the model, click on the `PetriVis` tab right under Composition in the top left. 
A few visual notes to go over:
- The numbers inside each place are the number of tokens it currently has
- All enabled transitions are highlighted blue

Now there will be three buttons in the toolbar at the top to take notice of:
- The question mark button will tell you what type of PetriNet yours falls into. It will send a notification to tell you this. It could be multiple depending on your formulation.
- The rewind button will reset your network and tokens. This is useful in the case that you reach deadlock/completion (A message will appear telling you that you have reached this state) or you just want to go back to the beginning.
- The play button will allow you to simulated firing and enabled transition when there is only one in your network. If there are multiple enabled transitions, then a dropdown menu will appear at that place where you can click which transition to fire based on its name.
