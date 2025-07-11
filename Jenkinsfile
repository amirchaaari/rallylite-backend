pipeline {
    agent any

    tools {
        nodejs 'NodeJS' // Make sure this is configured in Jenkins Tools
    }

    environment {
        GHCR_CREDENTIALS_ID = 'GHCR_PAT'  // GitHub Personal Access Token ID
        GHCR_REPO = 'ghcr.io/amirchaaari/rallylite-backend'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', credentialsId: "${GHCR_CREDENTIALS_ID}", url: 'https://github.com/amirchaaari/rallylite-backend.git'
            }
        }

        stage('Install Dependencies') {
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

        stage('Push Image to GHCR') {
            steps {
                script {
                    docker.withRegistry('https://ghcr.io', "${GHCR_CREDENTIALS_ID}") {
                        dockerImage.push('latest')
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build and push completed successfully!'
        }
        failure {
            echo '❌ Build or push failed. Check the logs.'
        }
    }
}
