
# Инструкция по развертыванию проекта

Эта инструкция описывает шаги по развертыванию проекта, включая трекер ошибок Glitchtip, основное приложение, базу данных PostgreSQL, хранилище Minio S3 и задачи cron. Также описывается настройка Nginx с автоматическим обновлением SSL-сертификатов, добавление первого администратора.

## Требования

-   **Операционная система**: Ubuntu 22-24 LTS или новее (или другой дистрибутив Linux с поддержкой Docker и Nginx).
    
-   **Необходимые инструменты**:
    
    -   Установленные Docker и Docker Compose.
        
    -   Установленный Nginx.
        
    -   Certbot для получения SSL-сертификатов Let’s Encrypt.
        
    -   Утилиты curl и jq для работы с API.
        
-   **Доменные имена**: Три домена или поддомена (например, app.example.com для основного проекта, s3.example.com для Minio, glitchtip.example.com для Glitchtip).
    
-   **Электронная почта**: Для регистрации SSL-сертификатов Let’s Encrypt.
    
-   **Доступ**: Права root или sudo на сервере.

-   **Минимальные системные требования**:
    
    -   6 ядер.
        
    -   8Gb оперативной памяти.
        
    -   50Gb памяти на диске.

## Шаг 1: Клонирование репозитория

Склонируйте репозиторий проекта на сервер:
```
git clone <URL-репозитория>
cd <директория-репозитория>
```

## Шаг 2: Настройка переменных окружения

1.  Скопируйте файл .env.example для создания файла .env:
```
cp .env.example .env
```
    
2. Отредактируйте файл .env, указав ваши значения. Пример конфигурации на основе .env.example:
```
NODE_ENV=production
NEXT_PUBLIC_URL=https://app.example.com

AUTH_SECRET="ваш-ключ-аутентификации" # Сгенерируйте с помощью например: npx auth secret
AUTH_URL="https://app.example.com/api/auth"
AUTH_YANDEX_ID="ваш-yandex-id"
AUTH_YANDEX_SECRET="ваш-yandex-secret"
AUTH_GOOGLE_ID="ваш-google-id"
AUTH_GOOGLE_SECRET="ваш-google-secret"

# Отключение настроек для Vercel при локальном развертывании
IS_VERCEL=false 
NEXT_PUBLIC_IS_VERCEL=false

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=ваш-надежный-пароль
DB_NAME=gms-proj
DB_PORT=5433

DATABASE_URL="postgresql://postgres:ваш-надежный-пароль@localhost:5433/gms-proj"

CONTROL_KEY=ваш-надежный-пароль
CRON_SECRET=ваш-надежный-пароль

S3_ENDPOINT="gms-proj-minio"
S3_PORT="9000"
S3_USE_SSL=false
S3_ACCESS_KEY="ваш-ключ-доступа-minio" # Получить можно после настройки Minio 
S3_SECRET_KEY="ваш-секретный-ключ-minio" # Получить можно после настройки Minio
S3_BUCKET_NAME="images"
NEXT_PUBLIC_S3_PATH="https://s3.example.com"

# Данные для входа в Minio
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=ваш-пароль-для-minio
MINIO_SCHEME=https

# # Glitchtip
NEXT_PUBLIC_ENABLE_REPORTS="true"
NEXT_PUBLIC_SENTRY_DSN="https://some-key@glitchtip.example.com/1"  # Получить можно после настройки Glitchtip
SENTRY_URL="glitchtip.example.com"
SENTRY_DSN="https://some-key@glitchtip.example.com/1 # Получить можно после настройки Glitchtip"
SENTRY_ORG=org  # Получить можно после настройки Glitchtip"
SENTRY_PROJECT=gms-proj  # Получить можно после настройки Glitchtip"

GLITCHTIP_DB_HOST=localhost
GLITCHTIP_DB_USER=postgres
GLITCHTIP_DB_PASSWORD=ваш-надежный-пароль
GLITCHTIP_DB_NAME=glitchtip
GLITCHTIP_DB_PORT=5432
GLITCHTIP_DATABASE_URL=postgresql://postgres:ваш-надежный-пароль@postgres:5432/glitchtip
GLITCHTIP_SECRET_KEY=ваш-надежный-пароль-glitchtip
GLITCHTIP_PORT=8000
GLITCHTIP_EMAIL_URL=smtp://user@gmail.com:пароль@smtp.gmail.com:465
GLITCHTIP_DOMAIN=https://glitchtip.example.com
GLITCHTIP_DEFAULT_FROM_EMAIL=email@example.com
GLITCHTIP_CELERY_WORKER_AUTOSCALE="1,3"
```
Замените заполнители (ваш-надежный-пароль, ваш-ключ-аутентификации, и т.д.) на безопасные значения. Поля `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` будут обновлены после настройки **Minio** и **Glitchtip**.
    
 ## Шаг 3: Настройка хоста для Minio

Чтобы обеспечить доступ к сервису Minio S3, добавьте следующую запись в файл /etc/hosts:
```
sudo sh -c 'echo "127.0.0.1       gms-proj-minio" >> /etc/hosts'
```
Это сопоставляет псевдоним контейнера Minio с адресом 127.0.0.1 для локального доступа.

## Шаг 4: Развертывание и настройка Minio

1.  Запустите только сервис Minio из файла docker-compose.yml, чтобы создать ключи доступа:
```
docker-compose -f docker-compose.yml up -d gms-proj-minio
```
2. Проверьте, что контейнер `gms-proj-minio` запущен:
```
docker ps
```
3. Подключитесь к интерфейсу Minio через браузер или curl по адресу https://s3.example.com:9001 после настройки Nginx. Используйте учетные данные из .env:
-   Логин: `MINIO_ROOT_USER` (например, admin)
-   Пароль: `MINIO_ROOT_PASSWORD` (например, ваш-пароль-для-minio)

4.  **Создание бакета в Minio**:
    -   Войдите в веб-интерфейс Minio.
    -   Перейдите в раздел **Buckets** (Бакеты).
    -   Нажмите **Create Bucket** (Создать бакет).
    -   Введите имя бакета, указанное в переменной S3_BUCKET_NAME в файле .env (например, images).
    -   Настройте доступ - **ограниченный**.
    -   Нажмите **Create** (Создать) для подтверждения.

5. **Создание ключей доступа в Minio**:
-   Перейдите в раздел **Access Keys** (Ключи доступа).
-   Нажмите **Create Access Key** (Создать ключ доступа).
-   Сохраните сгенерированные `Access Key` и `Secret Key`.

6. Обновите файл `.env` с новыми ключами:
```
S3_ACCESS_KEY="ваш-новый-ключ-доступа"
S3_SECRET_KEY="ваш-новый-секретный-ключ"
```
## Шаг 5: Развертывание и настройка Glitchtip

1.  Запустите сервисы Glitchtip с помощью файла docker-compose.glitchtip.yml:
```
docker-compose -f docker-compose.glitchtip.yml up -d
```
2. Проверьте, что сервисы (postgres, redis, web, worker, migrate) запущены:
```
docker-compose -f docker-compose.glitchtip.yml ps
```
3. **Создание учетной записи администратора в Glitchtip**:
-   Откройте браузер и перейдите по адресу https://glitchtip.example.com после настройки Nginx.
-   Зарегистрируйте нового пользователя, указав email (например, admin@example.com) и пароль. Это будет учетная запись администратора Glitchtip.
-   После регистрации войдите в систему.

4. **Получение DSN для Glitchtip**:
-   В интерфейсе Glitchtip перейдите в **Settings** > **Projects**.
-   Создайте организацию и проект (например: org и gms-proj).
-   Перейдите в раздел **DSN** (Data Source Name).
-   Скопируйте DSN (например, https://<ключ>@glitchtip.example.com/1).
5. Обновите файл .env с полученным DSN:
```
NEXT_PUBLIC_SENTRY_DSN="https://<ключ>@glitchtip.example.com/1"
SENTRY_DSN="https://<ключ>@glitchtip.example.com/1"
SENTRY_ORG=org
SENTRY_PROJECT=gms-proj
```

## Шаг 6: Развертывание основного проекта

1.  Убедитесь, что сеть gms-proj-net существует (она помечена как внешняя в docker-compose.yml):
```
docker network create gms-proj-net
```
2. Запустите все сервисы основного проекта:
```
docker-compose -f docker-compose.yml up -d
```
3. Проверьте, что сервисы (gms-proj-postgres, gms-proj, gms-proj-cron, gms-proj-minio) запущены:
```
docker-compose -f docker-compose.yml ps
```
## Шаг 7: Настройка Nginx с SSL

1.  Установите Nginx и Certbot:
```
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```
2. Создайте файл конфигурации Nginx для основного проекта, Glitchtip и Minio в /etc/nginx/conf.d/project.conf:
```
server { 
	listen 80; 
	server_name app.example.com;
	location / {
	    proxy_pass http://localhost:3000;
	    proxy_set_header Host $host;
	    proxy_set_header X-Real-IP $remote_addr;
	    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	    proxy_set_header X-Forwarded-Proto $scheme;
	}
}

server { 
	listen 80; 
	server_name glitchtip.example.com;
	access_log  /var/log/nginx/access.log;
    client_max_body_size 40M;
    
	location / {
	    proxy_pass http://localhost:8000;
	    proxy_set_header Host $host;
	    proxy_set_header X-Real-IP $remote_addr;
	    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	    proxy_set_header X-Forwarded-Proto $scheme;
	}
}

# Подробнее стоит ознакомиться на https://min.io/docs/minio/linux/integrations/setup-nginx-proxy-with-minio.html
server { 
	listen 80; 
	server_name s3.example.com;
	location / {
	    proxy_pass http://localhost:9000;
	    proxy_set_header Host $host;
	    proxy_set_header X-Real-IP $remote_addr;
	    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	    proxy_set_header X-Forwarded-Proto $scheme;
	}

	location /minio/ {
	    proxy_pass http://localhost:9001;
	    proxy_set_header Host $host;
	    proxy_set_header X-Real-IP $remote_addr;
	    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	    proxy_set_header X-Forwarded-Proto $scheme;
	}
}
```
Замените app.example.com, glitchtip.example.com и s3.example.com на ваши реальные доменные имена.

3. Проверьте конфигурацию Nginx:
```
sudo nginx -t
```
4. Перезагрузите Nginx для применения конфигурации:
```
sudo systemctl reload nginx
```
5. Получите и установите SSL-сертификаты Let’s Encrypt:
```
sudo certbot --nginx -d app.example.com -d glitchtip.example.com -d s3.example.com
```
Следуйте инструкциям, чтобы указать адрес электронной почты и согласиться с условиями. Certbot автоматически настроит SSL и включит автоматическое обновление сертификатов.

6. Проверьте настройку автоматического обновления сертификатов:
```
sudo certbot renew --dry-run
```
Подробнее: https://timeweb.cloud/docs/unix-guides/ustanovka-ssl-na-nginx#avtomaticheskoe-obnovlenie-ssl-sertifikatov

## Шаг 8: Добавление первого администратора

1.  Подключитесь к контейнеру gms-proj-postgres для получения ID пользователя:
```
docker exec -it gms-proj-postgres psql -U postgres -d gms-proj
```

2. Просмотрите пользователей в таблице users:
```
SELECT id, name, email FROM users;
```
Запомните id пользователя, которого вы хотите сделать администратором.

3. Выйдите из PostgreSQL:
```
\q
```
4. Используйте curl для обновления роли пользователя до super-admin через указанный API-эндпоинт:

```
curl -X PUT https://app.example.com/api/protected-users/<user-id> \
  -H "Control-Key: ваш-контрольный-ключ" \
  -F "role=super-admin"
```
Замените `<user-id>` на ID пользователя из базы данных, а ваш-контрольный-ключ — на значение `CONTROL_KEY` из файла `.env`.

## Устранение неполадок

-   **Проблемы с Docker**: Проверьте логи контейнеров с помощью `docker logs <имя-контейнера>`.
-   **Ошибки Nginx**: Проверьте конфигурацию с помощью `sudo nginx -t` и логи в `/var/log/nginx/error.log`.
-   **Проблемы с подключением к базе данных**: Убедитесь, что `DB_HOST` и `GLITCHTIP_DB_HOST` соответствуют именам сервисов в файлах Docker Compose.
-   **Доступ к Minio**: Проверьте правильность записи в `/etc/hosts` и учетных данных Minio в файле `.env`. Убедитесь, что бакет создан.
-   **Проблемы с Glitchtip**: Проверьте, что DSN корректен и что переменные `SENTRY_URL`, `NEXT_PUBLIC_SENTRY_DSN` и `SENTRY_DSN` правильно настроены.