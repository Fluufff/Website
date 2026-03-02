# Building the site

## VS Code with DevContainers

Open this repository `F1 > Dev Containers: Reopen in Container`.

In a shell, run

```shell
$ deno task devhost
```

## Docker

```shell
docker run -it --mount=type=bind,src=$(pwd),target=/mnt --workdir=/mnt -p4321:4321 denoland/deno:2.7.1 task devhost
```

## Other

You will need [deno v2.5.3 or higher](https://github.com/denoland/deno).

```shell
$ deno task dev
```
