# ORBIT — 개인 AI 비서 웹앱

Windows + VS Code에서 실행하는 Flask 기반 웹앱입니다. 이 프로젝트는 **실행 가능한 시작 버전**이며, 실제 AI 응답을 사용하려면 OpenAI API 키와 인터넷 연결이 필요합니다. API 요금은 계정/모델/사용량에 따라 발생할 수 있습니다.

## 포함 기능

- SF 스타일 반응형 대시보드
- 회원가입 / 로그인 / 로그아웃
- SQLite 사용자 계정 및 계정별 데이터 분리
- 비밀번호 해시 저장, CSRF 토큰 보호, 로그인 시도 제한의 기본 구현
- 실제 OpenAI API 연결(서버에서만 API 키 사용)
- 대화 저장 및 최근 대화 목록
- 브라우저 음성 인식(지원 브라우저 필요), AI 답변 음성 재생
- 할 일 추가/완료/삭제, 메모 추가/삭제
- 기본 통계와 테마 설정
- `.env` 환경변수 설정과 `.env.example` 제공

## 1. 준비물

1. Windows 10/11 PC
2. Python 3.11 이상 권장
3. VS Code
4. VS Code의 Python 확장
5. 실제 AI 사용 시 OpenAI API 키와 API 사용 권한

## 2. 압축 풀기 및 VS Code에서 열기

1. `ORBIT_완성프로젝트.zip`을 다운로드하고 압축을 풉니다.
2. VS Code를 실행합니다.
3. **파일 → 폴더 열기**에서 압축을 푼 `ORBIT_완성프로젝트` 폴더를 선택합니다.
4. VS Code 터미널을 엽니다: **터미널 → 새 터미널**.

## 3. 가상환경 및 패키지 설치 (PowerShell)

프로젝트 폴더의 루트에서 아래 명령을 한 줄씩 실행합니다.

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

PowerShell에서 스크립트 실행이 차단되면 현재 터미널에서 아래 명령을 실행한 다음 활성화 명령을 다시 시도하세요.

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

`py -3` 명령을 찾을 수 없다면 python.org에서 Python을 설치하고 설치 과정에서 **Add Python to PATH**를 선택한 뒤 VS Code를 다시 엽니다.

## 4. 환경 설정

```powershell
Copy-Item .env.example .env
```

`.env` 파일을 VS Code에서 열고 다음 항목을 설정합니다.

- `SECRET_KEY`: 긴 무작위 비밀 문자열로 변경
- `OPENAI_API_KEY`: 본인의 API 키 입력
- `OPENAI_MODEL`: 계정에서 사용 가능한 모델명 설정(기본값 `gpt-4.1-mini`)

**중요:** API 키를 `static/script.js`, HTML, GitHub 저장소 또는 다른 프런트엔드 파일에 넣지 마세요. `.env`는 `.gitignore`에 포함되어 있습니다. API 키를 공유하거나 공개 저장소에 올리지 마세요. ChatGPT 구독과 API 사용 요금은 별개일 수 있습니다.

## 5. 실행

```powershell
python app.py
```

브라우저에서 `http://127.0.0.1:5000`을 엽니다. 실행을 중지하려면 터미널에서 `Ctrl+C`를 누릅니다.

처음에는 회원가입을 한 뒤 로그인하세요. 대화/할 일/메모는 로그인한 계정에 연결됩니다.

## 6. 7단계별 진행 및 테스트

### 1단계 — 기본 화면
- 로그인 후 대시보드, 사이드 메뉴, 반응형 레이아웃을 확인합니다.
- 모바일 폭에서는 메뉴 버튼을 눌러 사이드바를 열고 닫습니다.

### 2단계 — 인증/데이터베이스
- 새 계정을 만듭니다.
- 로그아웃 후 다시 로그인합니다.
- 다른 계정을 만들어 서로의 메모/할 일/대화가 섞이지 않는지 확인합니다.
- SQLite 파일은 첫 실행 때 `instance/orbit.db`에 생성됩니다.

### 3단계 — 실제 AI
- `.env`의 `OPENAI_API_KEY`가 올바른지 확인합니다.
- 채팅으로 질문을 보내고 응답이 저장되는지 확인합니다.
- 키/모델/할당량/네트워크 문제가 있으면 화면에 오류 안내가 표시됩니다. API가 설정되지 않았으면 실제 응답을 꾸며내지 않고 설정 안내를 표시합니다.

### 4단계 — 음성
- 지원되는 브라우저(일반적으로 데스크톱 Chrome/Edge)에서 마이크 권한을 허용합니다.
- 마이크 버튼으로 음성을 텍스트로 입력합니다. 음성 인식은 브라우저 지원 및 네트워크에 따라 달라집니다.
- 답변의 스피커 버튼으로 브라우저 음성 합성을 실행합니다. 음성 합성은 기기/브라우저의 음성 엔진을 사용합니다.

### 5단계 — 개인 비서
- 할 일 추가/완료/삭제와 메모 추가/삭제를 시험합니다.
- 데이터는 로그인한 사용자 ID로 분리됩니다.

### 6단계 — 통계/테마
- 대시보드의 통계 숫자를 확인합니다.
- 테마 전환을 누르고 새로고침해도 선택이 유지되는지 확인합니다(브라우저 로컬 저장소).

### 7단계 — 테스트/배포 준비
- `python app.py`는 로컬 개발용 서버입니다.
- 인터넷에 공개하려면 HTTPS, 운영용 WSGI 서버, 환경변수 설정, 데이터베이스 백업, 로그/오류 처리 등을 별도로 준비해야 합니다.
- 이 ZIP은 **클라우드에 자동 배포하지 않습니다**. 배포는 호스팅 서비스 계정과 설정이 필요합니다.

## 문제 해결

- `python` 또는 `py`가 인식되지 않음: Python 설치 및 PATH를 확인합니다.
- `ModuleNotFoundError`: 가상환경 활성화 후 `pip install -r requirements.txt`를 실행합니다.
- 로그인 세션이 유지되지 않음: `.env`의 `SECRET_KEY`를 설정했는지 확인하고 브라우저 쿠키 설정을 확인합니다.
- AI 응답 오류: API 키, 사용 가능한 모델명, API 결제/사용량, 네트워크를 확인합니다. 키 전체를 다른 사람에게 보내지 마세요.
- 마이크 버튼이 작동하지 않음: 브라우저 지원 여부와 마이크 권한을 확인하고, 텍스트 입력을 사용합니다.

## 프로젝트 구조

```text
ORBIT_완성프로젝트/
├─ app.py
├─ requirements.txt
├─ .env.example
├─ .gitignore
├─ README.md
└─ orbit/
   ├─ __init__.py
   ├─ templates/
   │  ├─ base.html
   │  ├─ login.html
   │  ├─ register.html
   │  └─ dashboard.html
   └─ static/
      ├─ style.css
      └─ script.js
```

## 보안 관련 참고

이 코드는 개인 학습용 출발점입니다. 공개 서비스로 운영하기 전에는 보안 검토, HTTPS, CSRF 전 범위 검증, 로그인 제한 강화, 개인정보 처리방침, 백업 및 운영 로그 정책 등을 점검하세요.
