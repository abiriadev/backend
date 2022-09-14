# Eco3S Backend API & Spec

> **Warning** \
> 현재 이 저장소는 API 문서(`swagger-ui`)를 제공하지 않습니다. \
> 당분간은 [미러 저장소](https://github.com/abiriadev)의 [깃헙 페이지](https://abiriadev.github.io/hackathon-backend)에서 실행 불가능한 문서를 확인하실 수 있습니다.

## 개요

`eco3s` 서비스에서 사용할, API명세와 백엔드 로직을 관리하는 레포지토리입니다.

## Stack

| Name         | Position            | Note                                                      | Link                                                                                                     |
| ------------ | ------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `Docker`     | container manager   | DB와 웹 서버 컨테이너 실행 및 관리                        | [`homepage`](https://docker.com/) [`github org`](https://github.com/docker)                              |
| `ESbuild`    | bundler             | 배포시 코드 bundling, minifying, tree shacking (DCE)      | [`homepage`](https://esbuild.github.io/) [`github`](https://github.com/evanw/esbuild)                    |
| `ESlint`     | lint                | 코드 품질 검사 및 강제화 도구                             | [`homepage`](https://eslint.org/) [`github`](https://github.com/eslint/eslint)                           |
| `Express`    | backend framework   | API 구현 담당                                             | [`homepage`](https://expressjs.com/) [`github`](https://github.com/expressjs/express)                    |
| `FNM`        | node manager        | 개발에 필요한 Node 환경을 파일을 통해 재현                | [`github`](https://github.com/Schniz/fnm)                                                                |
| `Git`        | version manager     | `git flow`와 유사한 워크플로 적용                         | [`homepage`](https://git-scm.com/) [`repository`](https://git.kernel.org/pub/scm/git/git.git)            |
| `Husky`      | git hook manager    | `pre-commit` 훅 관리                                      | [`homepage`](https://typicode.github.io/husky/) [`github`](https://github.com/typicode/husky)            |
| `Jest`       | unit test runner    | 유닛 테스트 검증(assert) 및 실행(runner)                  | [`homepage`](https://jestjs.io/) [`github`](https://github.com/facebook/jest)                            |
| `JWT`        | http authentication | Stateless 한 인증 시스템 구현                             | [`homepage`](https://jwt.io) [`github`](https://github.com/auth0/node-jsonwebtoken)                      |
| `Make` (GNU) | build system        | 여러 빌드 명령어를 그룹화하고 종속성을 묘사하기 위해 사용 | [`homepage`](https://gnu.org/software/make/)                                                             |
| `Mongodb`    | database            | 메인 데이터베이스                                         | [`homepage`](https://mongodb.com) [`github`](https://github.com/mongodb/mongo)                           |
| `Nginx`      | web server / proxy  | API서버 프록시 및 프런트엔드 서빙                         | [`homepage`](https://nginx.com/) [`repository`](http://hg.nginx.org/nginx/)                              |
| `Node`       | runtime             | 개발 / 배포시 코드 및 기타 툴 실행                        | [`homepage`](https://nodejs.org) [`github`](https://github.com/nodejs/node)                              |
| `OpenAPI`    | API specification   | 획일화된 API문서화 담당. `yaml`파일로 문서 작성.          | [`homepage`](https://openapis.org/) [`github`](https://github.com/OAI/OpenAPI-Specification)             |
| `Prettier`   | code formatter      | `git diff`관리를 위한 일관적인 코드 포맷터                | [`homepage`](https://prettier.io/) [`github`](https://github.com/prettier/prettier)                      |
| `Prisma`     | ORM / ODM           | 스키마 정의 및 관리, `MongoDB`와의 통신에 사용            | [`homepage`](https://prisma.io/) [`github`](https://github.com/prisma/prisma)                            |
| `Redocly`    | OAS doc bundler     | `yaml`로 된 `OpenAPI` 문서를 검증하고 단일 파일로 번들링  | [`homepage`](https://redocly.com/) [`github`](https://github.com/Redocly/redocly-cli)                    |
| `Supertest`  | integrated test     | 제작된 API를 실제와 유사한 환경으로 통합 테스트           | [`homepage`](https://github.com/visionmedia/supertest)                                                   |
| `Swagger UI` | API document UI     | 프런트엔드 개발자들을 위한 API 엔드포인트 시각화          | [`homepage`](https://swagger.io/tools/swagger-ui/) [`github`](https://github.com/swagger-api/swagger-ui) |
| `SWC`        | compiler            | `Rust`로 작성된 빠르고 확장 가능한 컴파일러이자 번들러    | [`homepage`](https://swc.rs/) [`github`](https://github.com/swc-project/swc)                             |
| `Typescript` | language            | 컴파일 타임에 스키마와 타입을 검증 가능한 상위 레이어     | [`homepage`](https://typescriptlang.org/) [`github`](https://github.com/microsoft/TypeScript/)           |
| `Winston`    | logger              | 각종 예기치 못한 에러에 대응하기 위한 로거 프레임워크     | [`github`](https://github.com/winstonjs/winston)                                                         |

## 빌드 방법

### Linux & MacOS

1. 이 저장소를 로컬로 클론합니다.

```sh
$ git clone https://github.com/eco3s/backend
```

2. 필요한 패키지를 설치합니다.

> **Note** \
> `node`가 필요합니다

```sh
$ npm install
```

2. OAS 문서를 번들링합니다.

> **Note** \
> `make`가 필요합니다

```sh
$ make bundle
```

`dist/bundle.yaml` 에서 번들링된 OAS 문서를 찾을 수 있습니다.

### Windows

_(현재 미지원)_

## 실행 방법

> **Warning** \
> 아래의 모든 방법은 `x86_64(amd64)`아키텍처의 `Arch Linux 5.19.4` 커널 위에서만 테스트되었습니다. \
> 다른 환경을 사용할 경우 실행시 예기치 못한 결과가 발생할 수 있습니다. \
> 만약 특정 환경에서만 발생하는 에러를 발견하셨다면, 언제든지 구체적인 에러 메시지와 함께 저를 호출해 주세요.

### 도커 컴포즈 사용

#### 도커 설치

컴포즈를 사용하기 위해서는 먼저 도커를 설치해야 합니다.

만약 자신의 OS가 리눅스라면 `docker`를, 그렇지 않다면 [`docker desktop`](https://www.docker.com/products/docker-desktop/)을 설치하길 권장합니다.

##### 설치 확인

```sh
$ docker -v
```

아래와 비슷한 결과가 나오면 설치를 확신할 수 있습니다.

```
Docker version 20.10.17, build 100c70180f
```

#### 도커 컴포즈 설치

[Compose V2](https://docs.docker.com/compose/#compose-v2-and-the-new-docker-compose-command)를 사용합니다.

> **Note** \
> 도커 데스크톱을 설치하셨다면 이미 docker compose를 사용하실 수 있습니다.

##### Arch Linux

별다른 공식 지원이 없기에 [수동으로 compose 플러그인을 설치합니다.](https://docs.docker.com/compose/install/linux/#install-the-plugin-manually)

아래의 예제에서는 `2.10.2` 버전을 사용합니다.

```sh
$ DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
$ mkdir -p $DOCKER_CONFIG/cli-plugins
$ curl -SL https://github.com/docker/compose/releases/download/v2.10.2/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
```

##### 설치 확인

도커 데스크톱을 설치하셨더라도 확인을 위해 해 주세요

```sh
$ docker compose version
```

아래와 비슷한 결과가 나오면 설치를 확신할 수 있습니다.

```
Docker Compose version v2.10.2
```

수동으로 설치한 경우, 입력한 플러그인 버전이 일치하는지 확인해 주세요. \
(이 경우 `2.10.2`)

#### 실행

다음 명령으로 모든 컨테이너를 활성화시킬 수 있습니다.

```sh
$ docker compose up -d
```

> **Warning** \
> 이 명령어는 `bind mount`를 사용합니다. \
> 반드시 이 프로젝트의 루트에서 해당 명령어를 실행해 주세요.

##### DB

DB로는 `mongodb`를 사용합니다.

###### 연결

기본적으로 27017포트를 사용합니다.

데이터베이스명은 eco3s를 사용합니다.

```sh
mongosh 'mongodb://localhost:27017/eco3s'
```

###### 데이터 관리

한번 초기화된 이상, 모든 데이터는 `data` 볼륨에 영구히 저장됩니다.

데이터를 삭제하고 깨끗한 새 DB를 만들기 위해서는 다음 명령어를 입력해 주세요.

```sh
$ docker compose down -v
```

> **Warning** \
> 이 명령어는 hot reload를 하지 않습니다. \
> 이 명령어는 **현재 실행중인 모든 컨테이너를 종료시킵니다.** \
> 지워진 DB에 다시 연결하고 싶다면 다시 한번 `docker compose up -d`가 필요합니다.

> **Warning** \
> 이 명령어는 현재까지 저장된 볼륨을 모두 삭제합니다. \
> 중요한 데이터가 있다면 백업을 먼저 진행해 주세요.

만약 해당 볼륨이 사용중이라 지울 수 없다는 오류가 자꾸 발생하면 최후의 수단으로 다음 명령어를 사용하실 수 있습니다.

```sh
$docker container prune -f && docker volume prune -f
```

> **Warning** \
> 이 명령어는 현재까지 저장된 모든 컨테이너와 볼륨을 삭제합니다. \
> 완전한 초기화가 필요한 것이 아니라면 해당 명령어를 사용하지 마세요.

#### 종료

해당 앱을 종료하고 싶으시다면 다음 명령어를 사용해 주세요.

```sh
$ docker compose stop
```

종료와 함께 모든 컨테이너를 지우고 싶으시다면 다음 명령어를 사용해 주세요.

```sh
$ docker compose down
```

## 오류 해결

만약 해당 저장소에서 오류를 발견했거나 위 코드를 실행하던 중 정상적인 빌드가 되지 않으면 언제든지 관련 에러 메시지와 함께 저를 호출해 주세요.

## 작성자

-   Abiria

## 라이선스

![Licence](https://img.shields.io/github/license/Ileriayo/markdown-badges?style=for-the-badge)
