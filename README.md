## How to run for Development using Docker?

This project uses Docker Compose to manage development environments easily. 
You can spin up the application with a single command:

```bash
docker compose up --build
```
> **Note**: This will run the Vite development server in the container, complete with hot-reloading for your local changes! 
> You can stop the server anytime by hitting `CTRL+C` in your terminal. If you want to run it in the background, use `docker compose up -d --build`.

## How to stop and remove Docker Containers?

To **stop and remove** the running container (and its associated default network), run:
```bash
docker compose down
```

To **fully remove** the container, including any orphaned volumes that might linger:
```bash
docker compose down -v
```

## How to remove the image blueprint? (to free up disk space)

```bash
# To manually remove the image:
docker rmi via_urbanmicrofarm_front-frontend
```

## Creating .env file
```bash
cp .env.example .env
```