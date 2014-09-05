## How to use  
install docker  
clone this repo  
`cd hoodiebox`  
`docker build .`  
if everything goes well you should see the line "`Successfully built [containerID]`" where the containerID is the ID of the container you will use  
`docker run -i -t containerID` *use your containerID from above, ofcourse*  
i like to mount a host directory to the docker container so that changes in code i make on the host machine will be synced with the container where the app is running like this:  
`docker run -i -t -v /path/to/host/repo/hoodiebox:/hoodiebox containerID`  
then on the container:  
`cd hoodiebox` and go nuts with hoodie!