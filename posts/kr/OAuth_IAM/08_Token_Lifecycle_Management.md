# 08. Token Lifecycle Management (토큰의 생명주기 관리)

토큰을 "한 번 받아서 끝"으로 다루면 보안과 UX가 동시에 무너집니다. Access Token을 너무 길게 주면 탈취 피해가 커지고, 너무 짧게 주면 사용자는 잦은 재로그인을 겪습니다. 이 긴장을 풀어주는 장치가 **Refresh Token**과 **Silent Refresh**입니다.

## 1. Access Token: 짧게 사는 작업 열쇠

**Access Token**은 Resource Server를 호출할 때 쓰는 단기 자격 증명입니다.

권장 특성:

- TTL: 수 분 ~ 1시간 전후 (정책에 따라 조정)
- 저장: 가능하면 브라우저 JS가 읽지 못하는 위치(HttpOnly 쿠키 또는 BFF 메모리/서버)
- 포함 정보: `sub`, `scope`, `aud` 등 최소 claim

짧은 수명의 이유:

- 탈취되어도 악용 가능 시간이 짧다
- 권한 변경/로그아웃 정책을 비교적 빠르게 반영할 수 있다
- Stateless JWT의 폐기 문제를 완화한다

## 2. Refresh Token: 길게 사는 재발급 열쇠

**Refresh Token**은 Access Token이 만료되었을 때, 사용자 자격 증명을 다시 묻지 않고 새 토큰을 받기 위한 자격 증명입니다.

```http
POST /token HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token=8xLOxBtZp8&
client_id=my-web-app&
client_secret=SECRET
```

응답 예:

```json
{
  "access_token": "new-access-token",
  "refresh_token": "rotated-refresh-token",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

Refresh Token 특성:

- 수명이 길다 (수 시간~수 주, 정책에 따라)
- **더 민감**하다 → 탈취 시 지속적 접근 가능
- 가능하면 **Rotation**(사용할 때마다 새 refresh 발급, 이전 값 무효화)
- 재사용 탐지(Reuse Detection)로 탈취를 탐지할 수 있음

## 3. 왜 두 토큰으로 나누는가?

한 장의 장기 토큰만 쓰면:

- UX는 좋지만 탈취 피해가 큼
- 또는 보안을 위해 자주 로그인해야 함

두 토큰 모델은 역할을 분리합니다.

- Access Token: 자주 노출되는 API 경로에 사용 (짧고 교체 용이)
- Refresh Token: 드물게, 더 보호된 채널에서만 사용 (재발급 전용)

```text
[Login] -> Access(short) + Refresh(long)
   |
   +--> API calls with Access
   |
   +--> Access expired -> Silent Refresh with Refresh
           |
           +--> new Access (+ optional rotated Refresh)
```

## 4. Silent Refresh 로직

**Silent Refresh**는 사용자에게 로그인 UI를 다시 보여주지 않고 토큰을 갱신하는 기법입니다.

### 패턴 A: Refresh Token Grant

프론트엔드(또는 BFF)가 Access Token 만료 임박을 감지하고 refresh를 호출합니다.

```javascript
// Angular 인터셉터 개념 예시
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.auth.getValidAccessToken().pipe(
      switchMap((token) => {
        const authReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next.handle(authReq);
      }),
      catchError((err) => {
        if (err.status === 401) {
          return this.auth.refresh().pipe(
            switchMap((newToken) => {
              const retry = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next.handle(retry);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
```

```javascript
// AuthService.refresh() 개념
async refresh() {
  const res = await fetch("/auth/refresh", {
    method: "POST",
    credentials: "include" // HttpOnly refresh cookie 전송
  });
  if (!res.ok) throw new Error("REFRESH_FAILED");
  const data = await res.json();
  this.accessToken = data.access_token;
  return this.accessToken;
}
```

### 패턴 B: Hidden iframe / prompt=none (구 SPA 방식)

OIDC에서 `prompt=none`으로 숨은 iframe을 열어 세션이 살아 있으면 code를 받는 방식도 있었습니다. 다만 브라우저 3rd-party cookie 제한으로 오늘날 신뢰성이 떨어지며, **BFF + Same-site cookie refresh**가 더 선호됩니다.

## 5. 만료 임박 갱신 vs 401 후 갱신

- **Proactive**: `exp` 60초 전에 미리 refresh → UX가 매끄러움
- **Reactive**: API가 401을 주면 refresh 후 재시도 → 구현 단순, 순간 지연 가능

실무에서는 둘을 결합하는 경우가 많습니다. 동시에 여러 API가 401을 맞을 때를 대비해 **refresh in-flight 단일화(single-flight)**가 필요합니다.

```javascript
let refreshPromise = null;

function refreshSingleFlight() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
```

## 6. 수명 설계 가이드라인

| 토큰 | 권장 방향 | 보호 포인트 |
|------|-----------|-------------|
| Access Token | 짧게 | 탈취 피해 최소화 |
| Refresh Token | 길게 + rotate | 저장/전송 강력 보호, reuse 탐지 |
| ID Token | 로그인 세션 생성용 | API 전송 금지, nonce/aud 검증 |

다음 강의에서는 Angular & Node.js 기준으로 **토큰을 어디에 저장하고 어떻게 통신할지** 보안 관점에서 구체화합니다.

---

### Chapter Summary (챕터 요약)

- Access Token은 짧은 수명의 API 자격 증명이고, Refresh Token은 재발급용 장기 자격 증명이다.
- Silent Refresh는 사용자 재로그인 없이 토큰을 갱신해 UX와 보안(짧은 access TTL)을 동시에 만족시킨다.
- Refresh Token rotation과 single-flight 갱신은 실무 필수 패턴에 가깝다.
- 토큰 종류별 목적과 보관 위치를 분리하는 것이 생명주기 관리의 핵심이다.
