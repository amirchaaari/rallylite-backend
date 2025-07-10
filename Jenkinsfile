pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        GHCR_CREDENTIALS_ID = 'ghcr-pat'
        GHCR_REPO = 'ghcr.io/amirchaaari/rallylite-backend'
    }

    stages {
        stage('Checkout Github') {
            steps {
                git branch: 'main', credentialsId: 'GHCR_PAT', url: 'https://github.com/amirchaaari/rallylite-backend.git'
            }
        }

        stage('Install node dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test Code') {
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

        stage('Trivy Scan') {
            steps {
                sh 'trivy --severity HIGH,CRITICAL --no-progress image --format table -o trivy-scan-report.txt ${GHCR_REPO}:latest'
            }
        }

        stage('Push Image to GHCR') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${GHCR_CREDENTIALS_ID}", usernameVariable: 'GHCR_USER', passwordVariable: 'GHCR_PAT')]) {
                    sh '''
                        echo "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
                        docker push ${GHCR_REPO}:latest
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Build and push completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}
