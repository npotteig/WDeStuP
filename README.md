# Petri Nets
Petri Nets are a type of model that allow users to represent complex distributed systems. The main componenets of a petri net are places (as circles), transisions (as rectangles), arcs (as directed arrows), and tokens (as black circles inside of places). The arcs connect places to transitions and vice-versa allowing for the tokens to move from place to place through arcs and transisions. In one time step, transisions with inPlaces (the places with arcs directed towards the transition) that have more than zero tokens are considered enabled and can be fired. When fired the amount of tokens in the inPlaces are decremented by one and the amount of tokens in the outPlaces (the places with arcs that are directed from the transision to them) are incremented by 1. If the number of enabled transitions is zero then we have either transported all the tokens to the sink place or we have reached deadlock. In either case we would have to reset the network to continue.

## Use Cases
There are multiple disciplines that use petri nets to model their system. One example is modelling the process of biological systems. Biologists use petri nets to study different ecological or evolutionary processes, experimenting with different modes of evolution. Also, this in distributed systems when we want to model the parallelism of a particular workflow and the splitting of various tasks. The data could then be visualized traveling down the workflow using the petri net. Furthermore, communication protocols can be modelled by petri nets by modelling the flow of a message through a network via network nodes.  

A petri net can be divided into four types:  
- Free Choice Petri Net (example in FreeChoice.ex): In this network, each transition has its own unique set of inPlaces, such that, the intersection of two inPlace sets of two different transitions is empty.
- State Machine (example in StateMachine.ex): If every transision has one inPlace and one outPlace then this is considered a state machine
- Marked Graph (example in MarkedGraph.ex): If every place has one inTransition and one outTransition then it is a Marked Graph
- Workflow Net (example in WorkflowNet.ex): If the network has one source with no inTransitions, one destination with no outTransitions, and every place and transition is on a path from the source to the destination then this is workflow net.


## Initialization
The easiest way to start using this project is to fork it in git. Alternatively, you can create your empty repository, copy the content and just rename all instances of 'WDeStuP' to your liking. Assuming you fork, you can start-up following this few simple steps:
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
- To **enter** the WebGME container and use WebGME commands `docker-compose exec webgme bash` (you can exit by simply closing the command line with linux command 'exit') 
- To **clean** the host machine of unused (old version) images `docker system prune -f`
## Using WebGME commands to add components to your project
In general, you can use any WebGME commands after you successfully entered the WebGME container. It is important to note that only the src directory is shared between the container and the host machine, so you need to additionally synchronize some files after finishing your changes inside the container! The following is few scenarios that frequently occur:
### Adding new npm dependency
When you need to install a new library you should follow these steps:
- enter the container
- `npm i -s yourNewPackageName`
- exit the container
- copy the package.json file `docker-compose cp webgme:/usr/app/package.json package.json`
### Adding new interpreter/plugin to your DS
Follow these steps to add a new plugin:
- enter the container
- for JS plugin: `npm run webgme new plugin MyPluginName`
- for Python plugin: `npm run webgme new plugin -- --language Python MyPluginName`
- exit container
- copy webgme-setup.json `docker-compose cp webgme:/usr/app/webgme-setup.json webgme-setup.json`
- copy webgme-config `docker-compose cp webgme:/usr/app/config/config.webgme.js config/config.webgme.js`
### Adding new visualizer to your DS
Follow these steps to add a new visualizer:
- enter the container
- `npm run webgme new viz MyVisualizerName`
- exit container
- copy webgme-setup.json `docker-compose cp webgme:/usr/app/webgme-setup.json webgme-setup.json`
- copy webgme-config `docker-compose cp webgme:/usr/app/config/config.webgme.js config/config.webgme.js`
### Adding new seed to your DS
Follow these steps to add a new seed based on an existing project in your server:
- enter the container
- `npm run webgme new seed MyProjectName -- --seed-name MySeedName`
- exit container
- copy webgme-setup.json `docker-compose cp webgme:/usr/app/webgme-setup.json webgme-setup.json`
- copy webgme-config `docker-compose cp webgme:/usr/app/config/config.webgme.js config/config.webgme.js`
