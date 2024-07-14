# Basic Deployment

The following set of Kubernetes manifests will deploy ddolk to a new namespace called `ddolk`, using a sample configuration. ddolk will be deployed to `https://ddolk.localhost.direct` which points to `127.0.0.1`, so ensure your ingress controller is accessible on localhost.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ddolk
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ddolk
  namespace: ddolk
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: ddolk
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ddolk # (1)
subjects:
  - kind: ServiceAccount
    name: ddolk
    namespace: ddolk
---
apiVersion: v1
kind: Secret
metadata:
  name: ddolk
  namespace: ddolk
type: Opaque
data: # (2)
  config.yaml: Y2hhbGxlbmdlRG9tYWluOiBsb2NhbGhvc3QuZGlyZWN0Cmt1YmVDb25maWc6IGNsdXN0ZXIKcHVibGljVXJsOiBodHRwczovL2tsb2RkLmxvY2FsaG9zdC5kaXJlY3QKcmN0ZlVybDogaHR0cHM6Ly9jdGYudGpjdGYub3JnCnRyYWVmaWs6CiAgaHR0cEVudHJ5cG9pbnQ6IHdlYnNlY3VyZQogIHRjcEVudHJ5cG9pbnQ6IHRjcAogIHRjcFBvcnQ6IDEzMzcKaW5ncmVzczoKICBuYW1lc3BhY2VTZWxlY3RvcjoKICAgIG1hdGNoTGFiZWxzOgogICAgICBrdWJlcm5ldGVzLmlvL21ldGFkYXRhLm5hbWU6IHRyYWVmaWsKICBwb2RTZWxlY3RvcjoKICAgIG1hdGNoTGFiZWxzOgogICAgICBhcHAua3ViZXJuZXRlcy5pby9uYW1lOiB0cmFlZmlrCnNlY3JldEtleTogInJhbmRvbWx5IGdlbmVyYXRlZCBzZWNyZXQga2V5IgpyZWNhcHRjaGE6CiAgc2l0ZUtleTogNkxlSXhBY1RBQUFBQUpjWlZScXlIaDcxVU1JRUdOUV9NWGppWktoSQogIHNlY3JldEtleTogNkxlSXhBY1RBQUFBQUdHLXZGSTFUblJXeE1aTkZ1b2pKNFdpZkpXZQo=
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ddolk
  namespace: ddolk
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: ddolk
  template:
    metadata:
      labels:
        app.kubernetes.io/name: ddolk
    spec:
      serviceAccountName: ddolk # (3)
      volumes:
        - name: config
          secret:
            secretName: ddolk
      containers:
        - name: ddolk
          image: ghcr.io/tjcsec/ddolk:master # (4)
          volumeMounts:
            - name: config
              mountPath: /app/config/
              readOnly: true
          ports:
            - name: public
              containerPort: 5000
---
apiVersion: v1
kind: Service
metadata:
  name: ddolk
  namespace: ddolk
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: ddolk
  ports:
    - name: public
      port: 5000
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ddolk
  namespace: ddolk
spec:
  rules:
    - host: ddolk.localhost.direct
      http:
        paths:
          - backend:
              service:
                name: ddolk
                port:
                  number: 5000
            path: /
            pathType: ImplementationSpecific
```

1. You must first apply the ddolk [ClusterRole](https://raw.githubusercontent.com/TJCSec/ddolk/master/manifests/ddolk-rbac.yaml)—instructions for how to do this are provided [here](../install-guide/installation.md#crd-and-clusterrole).
2. The decoded contents are provided [below](#configyaml).
3. This allows ddolk to access the cluster using the ServiceAccount with ClusterRole created above.
4. Using a more specific tag or SHA256 digest is recommended.

## config.yaml

Here are the contents of `config.yaml`:

```yaml
challengeDomain: localhost.direct # (1)
kubeConfig: cluster
publicUrl: https://ddolk.localhost.direct
rctfUrl: https://ctf.tjctf.org # (2)
traefik: # (3)
  httpEntrypoint: websecure
  tcpEntrypoint: tcp
  tcpPort: 1337
ingress: # (4)
  namespaceSelector:
    matchLabels:
      kubernetes.io/metadata.name: traefik
  podSelector:
    matchLabels:
      app.kubernetes.io/name: traefik
secretKey: "randomly generated secret key"
recaptcha: # (5)
  siteKey: 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
  secretKey: 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

1. A wildcard TLS certificate for `localhost.direct` is publicly available [here](https://get.localhost.direct/).
2. At the time of writing, `https://ctf.tjctf.org/auth` allows redirecting to `https://ddolk.localhost.direct/auth`, but this is subject to change in the future.
3. Ensure this configuration matches your Traefik installation. See [Configuration](../install-guide/configuration.md#traefik) for more information.
4. Ensure this configuration matches your Traefik installation. See [Configuration](../install-guide/configuration.md#traefik) for more information.
5. These are the [reCAPTCHA v2 test keys](https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do).
