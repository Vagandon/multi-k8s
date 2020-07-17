# Build the client image
docker build -t vagandon/multi_app_fib_client:latest -t vagandon/multi_app_fib_client:$SHA -f ./client/Dockerfile ./client
docker build -t vagandon/multi_app_fib_server:latest -t vagandon/multi_app_fib_server:$SHA -f ./server/Dockerfile ./server
docker build -t vagandon/multi_app_fib_worker:latest -t vagandon/multi_app_fib_worker:$SHA -f ./worker/Dockerfile ./worker

# Push "latest" to dockerhub
docker push vagandon/multi_app_fib_client:latest
docker push vagandon/multi_app_fib_server:latest
docker push vagandon/multi_app_fib_worker:latest

# Push "SHA" to dockerhub
docker push vagandon/multi_app_fib_client:$SHA
docker push vagandon/multi_app_fib_server:$SHA
docker push vagandon/multi_app_fib_worker:$SHA

# Apply the kubernetes config files
kubectl apply -f k8s

# Force kubectl to deploy the newly built images
kubectl set image deployments/server-deployment server=vagandon/multi_app_fib_server:$SHA
kubectl set image deployments/client-deployment client=vagandon/multi_app_fib_client:$SHA
kubectl set image deployments/worker-deployment worker=vagandon/multi_app_fib_worker:$SHA
