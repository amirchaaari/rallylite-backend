pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        GHCR_REPO = 'ghcr.io/amirchaaari/rallylite-backend'
        GHCR_CREDENTIALS_ID = 'GHCR_PAT' // GitHub PAT stored in Jenkins credentials
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                deleteDir()
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

        stage('Build Application') {
            steps {
                sh 'npm run build'
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
                withCredentials([usernamePassword(
                    credentialsId: "${GHCR_CREDENTIALS_ID}",
                    usernameVariable: 'GHCR_USER',
                    passwordVariable: 'GHCR_PAT'
                )]) {
                    script {
                        sh '''
                            echo $GHCR_PAT | docker login ghcr.io -u $GHCR_USER --password-stdin
                            docker push ghcr.io/amirchaaari/rallylite-backend:latest
                            docker logout ghcr.io
                        '''
                    }
                }
            }
        }


        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG_FILE
                        kubectl apply -f k8s/
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
