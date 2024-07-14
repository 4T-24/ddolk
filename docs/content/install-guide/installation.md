# Installation

Once you have completed all the [prerequisites](./prerequisites.md), you are ready to install and run ddolk.

!!! summary "Deployment Steps"
    - Install the ddolk [Challenge CRD](https://raw.githubusercontent.com/TJCSec/ddolk/master/manifests/ddolk-crd.yaml) and [ClusterRole](https://raw.githubusercontent.com/TJCSec/ddolk/master/manifests/ddolk-rbac.yaml)
    - Deploy ddolk
    - Add challenges

## CRD and ClusterRole

!!! example "Installing CRD and ClusterRole"
    ```bash
    # Install ddolk Challenge CRD
    kubectl apply -f https://raw.githubusercontent.com/TJCSec/ddolk/master/manifests/ddolk-crd.yaml

    # Install ddolk ClusterRole
    kubectl apply -f https://raw.githubusercontent.com/TJCSec/ddolk/master/manifests/ddolk-rbac.yaml
    ```

Use the commands above to install the ddolk Challenge CRD and ClusterRole.

## Deployment

ddolk is available as a [Docker image](https://github.com/TJCSec/ddolk/pkgs/container/ddolk). ddolk can run outside of a cluster, as long as a kubeconfig is available. However, it is designed to run in the Kubernetes cluster where it will deploy challenges.

Create a ServiceAccount and bind the ddolk ClusterRole to it. Then, create a Deployment for ddolk, and expose it using a Service and Ingress. To configure ddolk, you can store configuration in a Secret, then mount the Secret to the Deployment. An example of all of this is provided [here](../examples/basic.md).

!!! warning "Ratelimiting is recommended"
    Serving ddolk requests can potentially be quite expensive. Though an effort is made to prevent automated requests (using reCAPTCHA), a strict ratelimit is still recommended. Configuring a RateLimit middleware using Traefik is very easy—you can learn how to do this [here](https://doc.traefik.io/traefik/middlewares/http/ratelimit/).

More detailed instructions on configuration are provided [here](./configuration.md).

## Challenges

Each challenge is configured using a custom resource. You can apply these manually, but using a tool like [Terraform](https://www.terraform.io/) is highly recommended. More detailed instructions on challenge configuration are provided [here](./challenges.md).
