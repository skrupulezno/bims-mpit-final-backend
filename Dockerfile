name: Deploy via SSH - Git pull, npm run build and deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: SSH into server and deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
          password: ${{ secrets.REMOTE_PASSWORD }}
          port: 22
          script: |
            echo "Connecting to $REMOTE_HOST as $REMOTE_USER"
            cd ${{ secrets.PROJECT_DIR }}
            pwd
            git pull origin main
            npm install
            npm run build
            # Удаляем все файлы из каталога /var/www/html
            sudo rm -rf /var/www/html/*
            # Копируем содержимое папки dist в /var/www/html
            sudo cp -r dist/* /var/www/html/
