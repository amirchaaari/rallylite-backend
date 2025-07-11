pipeline {
    agent any

    tools {
        nodejs 'NodeJS' // Make sure NodeJS is installed in Jenkins tools
    }

    environment {
        // GitHub Container Registry (GHCR) config
        GHCR_IMAGE = 'ghcr.io/amirchaaari/rallylite-backend:latest'
        GHCR_CREDENTIALS_ID = 'GHCR_PAT' // This should be a Personal Access Token stored in Jenkins credentials
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                git branch: 'main',
                    credentialsId: "${GHCR_CREDENTIALS_ID}",
                    url: 'https://github.com/amirchaaari/rallylite-backend.git'
            }
        }

        stage('Install Node.js Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${GHCR_REPO}:latest")
                }
            }
        }


        stage('Login to GHCR and Push') {
            steps {
                withCredentials([string(credentialsId: "${GHCR_CREDENTIALS_ID}", variable: 'GHCR_PAT')]) {
                    sh '''
                    echo $GHCR_PAT | docker login ghcr.io -u amirchaaari --password-stdin
                    docker push $GHCR_IMAGE
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully.'
        }
        failure {
            echo '❌ Pipeline failed. Check logs.'
        }
    }
}
