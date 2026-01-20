# 무중단 배포 (Zero-Downtime Deployment) 학습 가이드

## 개요

이 문서는 무중단 배포의 개념부터 실제 구현까지를 다루는 종합 학습 가이드입니다.

## 학습 목표

1. 무중단 배포가 **왜 필요한지** 이해한다
2. 다양한 배포 전략의 **장단점**을 비교할 수 있다
3. Blue-Green 배포를 **직접 구현**할 수 있다
4. 배포 실패 시 **즉시 롤백**할 수 있다

## 문서 구조

| 순서 | 파일 | 내용 |
|------|------|------|
| 1 | [01-concepts.md](./01-concepts.md) | 무중단 배포 기본 개념 |
| 2 | [02-deployment-strategies.md](./02-deployment-strategies.md) | 배포 전략 비교 |
| 3 | [03-blue-green-deep-dive.md](./03-blue-green-deep-dive.md) | Blue-Green 상세 분석 |
| 4 | [04-implementation-guide.md](./04-implementation-guide.md) | 프로젝트 적용 가이드 |
| 5 | [05-ec2-setup-guide.md](./05-ec2-setup-guide.md) | EC2 초기 설정 및 검증 |

## 학습 순서

```mermaid
flowchart LR
    A[개념 이해] --> B[전략 비교]
    B --> C[Blue-Green 심화]
    C --> D[실제 구현]
    D --> E[검증 & 테스트]
```

## 현재 프로젝트 상태

### Before (다운타임 발생)
```
배포 시작 → 기존 컨테이너 종료 → 새 컨테이너 시작 → 배포 완료
                    │                    │
                    └──── 10~30초 중단 ────┘
```

### After (무중단)
```
배포 시작 → 새 컨테이너 시작 → 헬스체크 → 트래픽 전환 → 배포 완료
                                              │
                                        중단 시간: 0초
```

## 관련 파일

- `Jenkinsfile` - CI/CD 파이프라인
- `docker-compose-app.yml` - Blue-Green 컨테이너 구성
- `nginx-conf/` - 트래픽 전환 설정
- `scripts/` - 배포 자동화 스크립트
