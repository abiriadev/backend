# Eco3S Backend API & Spec

> **Warning**
> 현재 이 저장소는 API 문서(`swagger-ui`)를 제공하지 않습니다.
> 당분간은 [https://github.com/abiriadev](미러 저장소)의 [깃헙 페이지](https://abiriadev.github.io/hackathon-backend)에서 실행 불가능한 문서를 확인하실 수 있습니다.

## 개요

`eco3s` 서비스에서 사용할, API명세와 백엔드 로직을 관리하는 레포지토리입니다.

## 빌드 방법

### Linux & MacOS

1. 이 저장소를 로컬로 클론합니다.

```sh
$ git clone https://github.com/eco3s/backend
```

2. 필요한 패키지를 설치합니다.

> **Note**
> `node`가 필요합니다.

```sh
$ npm install
```

2. OAS 문서를 번들링합니다.

> **Note**
> `make`가 필요합니다.

```sh
$ make bundle
```

`dist/bundle.yaml` 에서 번들링된 OAS 문서를 찾을 수 있습니다.

### Windows

_(현재 미지원)_

## 오류 해결

만약 해당 저장소에서 오류를 발견했거나 위 코드를 실행하던 중 정상적인 빌드가 되지 않으면 언제든지 관련 에러 메시지와 함께 저를 호출해 주세요.

## 작성자

- Abiria

## 라이선스

![Licence](https://img.shields.io/github/license/Ileriayo/markdown-badges?style=for-the-badge)]
