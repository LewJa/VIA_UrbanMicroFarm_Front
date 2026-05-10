## How to run as a Docker Container?
To build and run the Docker container, click the play button below:

```bash
    docker build -t via_microfarm_front:latest .
    docker run -d -p 3000:3000 --name via_urban_microfarm_front_container via_microfarm_front:latest
```

## How to stop the Docker Container?
```bash
    docker stop urban-frontend-container
```

## How to remove the stopped container
```bash
    docker rm urban-frontend-container
```
## How to remove the image blueprint? (to free up disk space)
```bash
    docker rmi urban-frontend:latest
```